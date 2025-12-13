import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sessionId = request.headers.get("x-session-id");
  
  // Logic Filter: Tampilkan jika itu SYSTEM atau milik SESSION ini
  const whereClause: any = {
    OR: [
      { isSystem: true },
      // Jika ada session, ambil juga yang punya session ini. 
      // Jika tidak (akses publik tanpa header), cuma ambil system.
      ...(sessionId ? [{ sessionId: sessionId }] : [])
    ]
  };

  const data = await prisma.kriteria.findMany({
    where: whereClause,
    orderBy: { id: 'asc' }
  });
  
  return NextResponse.json(data);
}

// POST: Tambah Kriteria Custom
export async function POST(request: Request) {
  const sessionId = request.headers.get("x-session-id");
  if (!sessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nama, tipe } = await request.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const lastKriteria = await tx.kriteria.findFirst({ orderBy: { id: 'desc' } });
      const nextId = (lastKriteria?.id || 0) + 1;
      
      const newKriteria = await tx.kriteria.create({
        data: {
          kode: `C${nextId}`,
          nama,
          tipe,
          bobot: 0,
          aktif: true,
          isSystem: false,
          isDropdown: false,
          sessionId: sessionId // <--- TANDAI MILIK SIAPA
        }
      });

      // Backfilling nilai 0 (Hanya ke laptop milik user ini saja biar efisien)
      const userLaptops = await tx.alternatif.findMany({ 
        where: { sessionId },
        select: { id: true } 
      });
      
      if (userLaptops.length > 0) {
        await tx.matriks.createMany({
          data: userLaptops.map((laptop) => ({
            alternatifId: laptop.id,
            kriteriaId: newKriteria.id,
            nilai: 0
          }))
        });
      }
      return newKriteria;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat kriteria" }, { status: 500 });
  }
}

// DELETE: Hapus
export async function DELETE(request: Request) {
  const sessionId = request.headers.get("x-session-id");
  const { id } = await request.json();

  // Pastikan cuma bisa hapus kriteria sendiri
  const target = await prisma.kriteria.findFirst({ 
    where: { id: Number(id), sessionId: sessionId! } 
  });

  if (!target) return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });

  await prisma.kriteria.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Deleted" });
}

// PUT: Update tidak lagi mengubah status aktif global, mungkin hanya nama/tipe custom
// Kita bisa hapus logic update bobot/aktif dari sini karena sudah pindah ke client-side.
export async function PUT() {
    return NextResponse.json({ message: "Deprecated. Use LocalStorage." });
}