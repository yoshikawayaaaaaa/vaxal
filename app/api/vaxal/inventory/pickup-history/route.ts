import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = 20
    const skip = (page - 1) * perPage

    // 総件数を取得
    const totalCount = await prisma.pickupMaterial.count()

    // 持ち出し履歴を取得
    const pickupHistory = await prisma.pickupMaterial.findMany({
      include: {
        report: {
          include: {
            engineerUser: {
              select: {
                id: true,
                name: true,
                company: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
            project: {
              select: {
                id: true,
                projectNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: perPage,
    })

    // レスポンス用にデータを整形
    const items = pickupHistory.map((item) => ({
      id: item.id,
      date: item.createdAt,
      engineerName: item.report.engineerUser.name,
      companyName: item.report.engineerUser.company?.companyName || '-',
      projectNumber: item.report.project?.projectNumber || '-',
      projectId: item.report.project?.id || null,
      materialName: item.inventoryItemName,
      productName: item.productName,
      quantity: item.quantity,
      unitType: item.unitType,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    }))

    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      },
    })
  } catch (error) {
    console.error('持ち出し履歴取得エラー:', error)
    return NextResponse.json(
      { error: '持ち出し履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}
