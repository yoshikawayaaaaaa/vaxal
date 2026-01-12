import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// 会社一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('会社取得エラー:', error)
    return NextResponse.json(
      { error: '会社の取得に失敗しました' },
      { status: 500 }
    )
  }
}
