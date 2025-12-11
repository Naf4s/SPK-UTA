import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.kriteria.findMany({
    orderBy: { id: 'asc' } // Urutkan biar rapi
  });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const body = await request.json(); // Menerima array kriteria baru dengan bobot baru
  
  // Update bobot secara massal (Transaction)
  await prisma.$transaction(
    body.map((k: any) => 
      prisma.kriteria.update({
        where: { id: k.id },
        data: { bobot: k.bobot }
      })
    )
  );
  
  return NextResponse.json({ message: "Bobot berhasil diupdate!" });
}