// prisma/seed.ts
import { prisma } from '../lib/prisma' // <--- IMPORT DARI LIB, JANGAN NEW CLIENT LAGI

async function main() {
  console.log('Menghapus data lama...')
  // Urutan delete penting karena foreign key (Matriks hapus duluan)
  await prisma.matriks.deleteMany()
  await prisma.alternatif.deleteMany()
  await prisma.kriteria.deleteMany()

  // Data Kriteria sesuai Blueprint [cite: 6-15]
  const kriteriaData = [
    { kode: "C1", nama: "Harga (Juta)", tipe: "cost", bobot: 0.25 },
    { kode: "C2", nama: "RAM (GB)", tipe: "benefit", bobot: 0.20 },
    { kode: "C3", nama: "SSD (GB)", tipe: "benefit", bobot: 0.15 },
    { kode: "C4", nama: "Baterai (Jam)", tipe: "benefit", bobot: 0.10 },
    { kode: "C5", nama: "Berat (Kg)", tipe: "cost", bobot: 0.10 },
    { kode: "C6", nama: "Skor Performa (Benchmark)", tipe: "benefit", bobot: 0.20 },
  ]

  console.log('Mulai seeding kriteria...')
  for (const k of kriteriaData) {
    await prisma.kriteria.create({
      data: k
    })
  }
  console.log('✅ Seeding selesai! Database siap digunakan.')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    // Tidak perlu disconnect manual jika pakai adapter pool, 
    // tapi practice yang baik untuk menutup koneksi script.
    // await prisma.$disconnect() 
  })