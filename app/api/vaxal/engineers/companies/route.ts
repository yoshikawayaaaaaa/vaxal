import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // VAXAL社員のみアクセス可能
    if (session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // エンジニア会社一覧を取得
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    })

    return NextResponse.json({
      companies,
      total: companies.length,
    })
  } catch (error) {
    console.error('会社一覧取得エラー:', error)
    return NextResponse.json(
      { error: '会社一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
