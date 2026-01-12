import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // コールドスタート対策: 接続プールの設定
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// コールドスタート対策: 初回接続を確立
if (process.env.NODE_ENV === 'production') {
  prisma.$connect().catch((err) => {
    console.error('Failed to connect to database:', err)
  })
}
