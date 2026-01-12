import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// エンジニア詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { id } = await params

    const engineer = await prisma.engineerUser.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: {
          select: {
            companyName: true,
          },
        },
      },
    })

    if (!engineer) {
      return NextResponse.json(
        { error: 'エンジニアが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(engineer)
  } catch (error) {
    console.error('エンジニア取得エラー:', error)
    return NextResponse.json(
      { error: 'エンジニアの取得に失敗しました' },
      { status: 500 }
    )
  }
}
