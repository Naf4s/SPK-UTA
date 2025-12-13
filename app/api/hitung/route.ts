import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id");
    
    // Cegah crash jika body kosong
    const body = await request.json().catch(() => ({})); 
    const { customBobot } = body;

    if (!sessionId) {
      return NextResponse.json([], { status: 400 });
    }

    // 1. Ambil Data Alternatif milik Session ini
    const alternatif = await prisma.alternatif.findMany({
      where: { sessionId: sessionId },
      include: { matriks: true }
    });

    if (alternatif.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Ambil SEMUA Kriteria yang tersedia (System + Custom milik user)
    // JANGAN filter { aktif: true } di sini, karena status aktif sekarang diatur Frontend.
    const allKriteria = await prisma.kriteria.findMany({
      where: {
        OR: [
          { isSystem: true },
          { sessionId: sessionId }
        ]
      }
    });

    // 3. Tentukan Kriteria Mana yang Dipakai
    let usedKriteria = [];

    if (customBobot && Array.isArray(customBobot) && customBobot.length > 0) {
      // JIKA Frontend kirim bobot: Gunakan HANYA kriteria yang ada di list bobot tersebut.
      // Ini otomatis memfilter kriteria yang dinonaktifkan di Frontend.
      const activeIds = customBobot.map((cb: any) => cb.id);
      
      usedKriteria = allKriteria.filter(k => activeIds.includes(k.id)).map(k => {
        const userPref = customBobot.find((cb: any) => cb.id === k.id);
        return {
          ...k,
          bobot: userPref ? userPref.bobot : 0 // Pakai bobot normalisasi dari frontend
        };
      });
    } else {
      // FALLBACK: Jika tidak ada data dari frontend, baru pakai default DB
      usedKriteria = allKriteria.filter(k => k.aktif).map(k => ({
        ...k,
        bobot: k.bobot
      }));
    }

    // 4. Perhitungan Statistik (Min/Max)
    const stats: Record<number, { max: number; min: number }> = {};

    usedKriteria.forEach((k) => {
      const values = alternatif.map((alt) => {
        const mat = alt.matriks.find((m) => m.kriteriaId === k.id);
        return mat ? mat.nilai : 0;
      });
      
      stats[k.id] = {
        max: values.length ? Math.max(...values) : 0,
        min: values.length ? Math.min(...values) : 0
      };
    });

    // 5. Hitung Skor Akhir
    const hasilRanking = alternatif.map((alt) => {
      let nilaiPreferensi = 0;
      const detailPerhitungan: any = {};

      usedKriteria.forEach((k) => {
        const mat = alt.matriks.find((m) => m.kriteriaId === k.id);
        const nilaiAsli = mat ? mat.nilai : 0;
        
        let nilaiNormalisasi = 0;
        const { max, min } = stats[k.id];

        // Rumus Normalisasi UTA
        if (k.tipe === "benefit") {
          nilaiNormalisasi = max === 0 ? 0 : nilaiAsli / max; 
        } else {
          nilaiNormalisasi = nilaiAsli === 0 ? 0 : min / nilaiAsli;
        }

        nilaiPreferensi += nilaiNormalisasi * k.bobot;
        
        // Simpan rincian agar bisa dipakai di Grafik
        detailPerhitungan[k.nama] = nilaiNormalisasi.toFixed(3);
      });

      return {
        id: alt.id,
        nama: alt.nama,
        detail: alt.detail,
        skor: nilaiPreferensi,
        rincian: detailPerhitungan
      };
    });

    // Sort Descending
    hasilRanking.sort((a, b) => b.skor - a.skor);

    return NextResponse.json(hasilRanking);

  } catch (error) {
    console.error("API Hitung Error:", error);
    return NextResponse.json({ error: "Gagal menghitung" }, { status: 500 });
  }
}