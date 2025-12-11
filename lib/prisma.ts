// lib/prisma.ts
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client' 

// 1. Setup koneksi Pool ke Postgres
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })

// 2. Setup Adapter
const adapter = new PrismaPg(pool)

// 3. Setup Global Variable (untuk mencegah multiple instance saat hot-reload Next.js)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 4. Inisialisasi Prisma Client dengan Adapter
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma