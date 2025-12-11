import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // 1. Ambil semua data yang dibutuhkan
  const kriteria = await prisma.kriteria.findMany();
  const alternatif = await prisma.alternatif.findMany({
    include: { matriks: true } // Ambil sekalian nilai spek-nya
  });

  // Jika data kosong, balikin array kosong biar gak error
  if (alternatif.length === 0) return NextResponse.json([]);

  // 2. Cari Nilai MAX dan MIN untuk setiap Kriteria (Penting untuk rumus UTA)
  // Kita buat object 'stats' untuk menyimpan Max/Min per kriteria
  const stats: Record<number, { max: number; min: number }> = {};

  kriteria.forEach((k) => {
    // Ambil semua nilai untuk kriteria ini dari semua laptop
    const values = alternatif.map((alt) => {
      const mat = alt.matriks.find((m) => m.kriteriaId === k.id);
      return mat ? mat.nilai : 0; // Kalau kosong anggap 0
    });

    stats[k.id] = {
      max: Math.max(...values),
      min: Math.min(...values)
    };
  });

  // 3. Proses Perhitungan Utama (Looping setiap laptop)
  const hasilRanking = alternatif.map((alt) => {
    let nilaiPreferensi = 0;
    const detailPerhitungan: any = {}; // Opsional: Buat debug/tampil detail

    // Hitung skor per kriteria
    kriteria.forEach((k) => {
      const mat = alt.matriks.find((m) => m.kriteriaId === k.id);
      const nilaiAsli = mat ? mat.nilai : 0;
      
      let nilaiNormalisasi = 0;
      const { max, min } = stats[k.id];

      // RUMUS UTA SESUAI BLUEPRINT
      if (k.tipe === "benefit") {
        // Benefit: Nilai / Max
        nilaiNormalisasi = max === 0 ? 0 : nilaiAsli / max; 
      } else {
        // Cost: Min / Nilai
        nilaiNormalisasi = nilaiAsli === 0 ? 0 : min / nilaiAsli;
      }

      // Akumulasi Nilai Preferensi (Bobot * Normalisasi)
      nilaiPreferensi += nilaiNormalisasi * k.bobot;
      
      // Simpan detail buat ditampilkan kalau mau (opsional)
      detailPerhitungan[k.nama] = nilaiNormalisasi.toFixed(3);
    });

    return {
      id: alt.id,
      nama: alt.nama,
      detail: alt.detail,
      skor: nilaiPreferensi, // Skor Akhir
      rincian: detailPerhitungan
    };
  });

  // 4. Urutkan dari Skor Tertinggi ke Terendah (Ranking)
  hasilRanking.sort((a, b) => b.skor - a.skor);

  return NextResponse.json(hasilRanking);
}