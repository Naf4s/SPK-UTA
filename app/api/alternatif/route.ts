import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


// GET: Ambil Data Mentah (Untuk ditampilkan di Tabel Admin/Edit)
export async function GET(request: Request) {
  const sessionId = request.headers.get("x-session-id");

  if (!sessionId) return NextResponse.json([]);
  
  const data = await prisma.alternatif.findMany({
    where: { sessionId: sessionId},
    include: {
      matriks: true // Kita butuh nilai matriks aslinya buat diedit
    },
    orderBy: { id: 'desc' }
  });
  return NextResponse.json(data);
}

// POST: Tambah Baru (Kode Lama - Tidak Berubah)
export async function POST(request: Request) {
  const sessionId = request.headers.get("x-session-id");
  if (!sessionId) return NextResponse.json({ error: "No Session" }, { status: 400 });

  const { nama, detail, specs } = await request.json();
  
  const result = await prisma.$transaction(async (tx) => {
    const laptop = await tx.alternatif.create({
      data: { 
        nama, 
        detail,
        sessionId // <--- Simpan ID sesi
      }
    });
    
    if (specs) {
      const matriksData = Object.keys(specs).map((kriteriaId) => ({
        alternatifId: laptop.id,
        kriteriaId: Number(kriteriaId),
        nilai: parseFloat(specs[kriteriaId])
      }));
      await tx.matriks.createMany({ data: matriksData });
    }
    return laptop;
  });
  return NextResponse.json(result);
}

// PUT: Update Data (BARU)
export async function PUT(request: Request) {
  const sessionId = request.headers.get("x-session-id");
  const { id, nama, detail, specs } = await request.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Data Dasar Laptop
      const laptop = await tx.alternatif.update({
        where: { id: Number(id), sessionId: sessionId! },
        data: { nama, detail }
      });

      await tx.matriks.deleteMany({
        where: { alternatifId: Number(id) }
      });

      if (specs && Object.keys(specs).length > 0) {
        const matriksData = Object.keys(specs).map((kriteriaId) => ({
          alternatifId: laptop.id,
          kriteriaId: Number(kriteriaId),
          nilai: parseFloat(specs[kriteriaId])
        }));
        await tx.matriks.createMany({ data: matriksData });
      }

      return laptop;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE: Hapus Data (Kode Lama - Tidak Berubah)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.alternatif.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}