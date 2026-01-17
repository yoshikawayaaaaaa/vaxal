import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // データベース接続をウォームアップ
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      status: 'warm',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Warmup error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
