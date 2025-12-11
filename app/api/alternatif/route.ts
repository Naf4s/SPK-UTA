import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { nama, detail, specs } = await request.json();

  // "Unified Input" Logic: Simpan Laptop -> Simpan Matriks sekaligus
  const result = await prisma.$transaction(async (tx) => {
    // 1. Buat Laptop
    const laptop = await tx.alternatif.create({
      data: { nama, detail }
    });

    // 2. Buat Data Matriks (Looping specs dari frontend)
    // specs format: { "1": 5000000, "2": 16, ... } dimana key adalah ID Kriteria
    const matriksData = Object.keys(specs).map((kriteriaId) => ({
      alternatifId: laptop.id,
      kriteriaId: Number(kriteriaId),
      nilai: parseFloat(specs[kriteriaId])
    }));

    await tx.matriks.createMany({ data: matriksData });

    return laptop;
  });

  return NextResponse.json(result);
}

// app/api/alternatif/route.ts

// ... (kode POST yang lama tetap di atas sini) ...

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); // Ambil ID yang mau dihapus

    await prisma.alternatif.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}