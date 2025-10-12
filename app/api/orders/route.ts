import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // VAXAL社員のみ注文を作成可能
    if (session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 案件番号を自動生成（例: HC-2025-0721-001）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // 今日の案件数を取得
    const todayStart = new Date(year, now.getMonth(), now.getDate())
    const todayEnd = new Date(year, now.getMonth(), now.getDate() + 1)
    
    const todayProjectsCount = await prisma.project.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    })

    const projectNumber = `HC-${year}-${month}${day}-${String(todayProjectsCount + 1).padStart(3, '0')}`

    // プロジェクトを作成
    const project = await prisma.project.create({
      data: {
        projectNumber,
        siteName: body.siteName,
        siteAddress: body.siteAddress,
        overview: body.overview || null,
        customerName: body.customerName,
        customerAddress: body.customerAddress,
        customerPhone: body.customerPhone,
        
        workContent: body.workContent,
        workType: body.workType,
        workCategory: 'MAIN_WORK', // デフォルト値
        workTime: body.workTime,
        
        // 商品情報
        productSetNumber: body.productSetNumber || null,
        productTankNumber: body.productTankNumber || null,
        productHeatPumpNumber: body.productHeatPumpNumber || null,
        productRemoteNumber: body.productRemoteNumber || null,
        productBaseNumber: body.productBaseNumber || null,
        productFallNumber: body.productFallNumber || null,
        productUlbroNumber: body.productUlbroNumber || null,
        
        // 支払い情報
        paymentAmount: body.paymentAmount ? parseInt(body.paymentAmount) : null,
        productWarranty: body.productWarranty,
        paymentMethod: body.paymentMethod || null,
        idCardRequired: body.idCardRequired,
        idCardObtained: false,
        bankbookRequired: body.bankbookRequired,
        bankbookObtained: false,
        
        // メモ
        additionalWork: body.additionalWork || null,
        existingProductInfo: body.existingProductInfo || null,
        constructionNotes: body.constructionNotes || null,
        
        // 日程
        workDate: body.workDate ? new Date(body.workDate) : null,
        receptionDate: body.receptionDate ? new Date(body.receptionDate) : new Date(),
        orderDate: body.orderDate ? new Date(body.orderDate) : null,
        expectedCompletionDate: body.expectedCompletionDate ? new Date(body.expectedCompletionDate) : null,
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        
        // 社内メモ（VAXAL専用）
        firstContactMethod: body.firstContactMethod || null,
        communicationTool: body.communicationTool || null,
        internalNotes: body.internalNotes || null,
        
        // 作成者
        createdById: session.user.id,
        
        status: 'PENDING',
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('注文登録エラー:', error)
    return NextResponse.json(
      { error: '注文の登録に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // VAXAL社員は全ての案件を取得
    // エンジニアは自分に割り当てられた案件のみ取得
    const where = session.user.role === 'VAXAL_ADMIN'
      ? {}
      : { assignedEngineerId: session.user.id }

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedEngineer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('案件取得エラー:', error)
    return NextResponse.json(
      { error: '案件の取得に失敗しました' },
      { status: 500 }
    )
  }
}
