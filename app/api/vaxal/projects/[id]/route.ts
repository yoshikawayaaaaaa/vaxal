import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdByVaxal: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedEngineer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    // エンジニアは自分に割り当てられた案件のみ閲覧可能
    if (
      session.user.role !== 'VAXAL_ADMIN' &&
      project.assignedEngineerId !== parseInt(session.user.id)
    ) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('プロジェクト取得エラー:', error)
    return NextResponse.json(
      { error: 'プロジェクトの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // プロジェクトの存在確認
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    // プロジェクトを更新
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        siteName: body.siteName,
        siteAddress: body.siteAddress,
        customerName: body.customerName,
        customerBirthDate: body.customerBirthDate ? new Date(body.customerBirthDate) : existingProject.customerBirthDate,
        applicantRelationship: body.applicantRelationship || null,
        customerAddress: body.customerAddress,
        customerPhone: body.customerPhone,
        firstInquiryDate: body.firstInquiryDate ? new Date(body.firstInquiryDate) : existingProject.firstInquiryDate,
        
        workContent: body.workContent,
        workType: body.workType,
        workTime: body.workTime,
        buildingType: body.buildingType || null,
        overview: body.overview || null,
        
        // 商品情報
        productSetNumber: body.productSetNumber || null,
        productTankNumber: body.productTankNumber || null,
        productHeatPumpNumber: body.productHeatPumpNumber || null,
        productRemoteNumber: body.productRemoteNumber || null,
        productBaseNumber: body.productBaseNumber || null,
        productFallNumber: body.productFallNumber || null,
        productUlbroNumber: body.productUlbroNumber || null,
        productOtherNumber: body.productOtherNumber || null,
        
        // 支払い情報
        paymentAmount: body.paymentAmount ? parseInt(body.paymentAmount) : null,
        contractAmount: body.contractAmount ? parseInt(body.contractAmount) : null,
        productWarranty: body.productWarranty,
        warrantyPeriod: body.warrantyPeriod || null,
        paymentMethod: body.paymentMethod || null,
        subsidyAmount: body.subsidyAmount ? parseInt(body.subsidyAmount) : null,
        sellingPrice: body.sellingPrice1 ? parseInt(body.sellingPrice1) : null,
        sellingPrice2: body.sellingPrice2 ? parseInt(body.sellingPrice2) : null,
        sellingPrice3: body.sellingPrice3 ? parseInt(body.sellingPrice3) : null,
        costPrice: body.costPrice ? parseInt(body.costPrice) : null,
        hasHandMoney: body.hasHandMoney,
        handMoneyAmount: body.handMoneyAmount ? parseInt(body.handMoneyAmount) : null,
        hasRemoteTravelFee: body.hasRemoteTravelFee || false,
        remoteTravelDistance: body.remoteTravelDistance ? parseInt(body.remoteTravelDistance) : null,
        remoteTravelFee: body.remoteTravelFee ? parseInt(body.remoteTravelFee) : null,
        idCardRequired: body.idCardRequired,
        idCardObtained: body.idCardObtained || false,
        bankbookRequired: body.bankbookRequired,
        bankbookObtained: body.bankbookObtained || false,
        
        // メモ
        additionalWork: body.additionalWork || null,
        existingProductInfo: body.existingProductInfo || null,
        constructionNotes: body.constructionNotes || null,
        
        // 日程
        workDate: body.workDate ? new Date(body.workDate) : null,
        receptionDate: body.receptionDate ? new Date(body.receptionDate) : existingProject.receptionDate,
        orderDate: body.orderDate ? new Date(body.orderDate) : null,
        expectedCompletionDate: body.expectedCompletionDate ? new Date(body.expectedCompletionDate) : null,
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        
        // 社内メモ（VAXAL専用）
        firstContactMethod: body.firstContactMethod || null,
        communicationTool: body.communicationTool || null,
        internalNotes: body.internalNotes || null,
        
        // 再訪問情報
        revisitType: body.revisitType || null,
        revisitDateTime: body.revisitDateTime ? new Date(body.revisitDateTime) : null,
        revisitCount: body.revisitCount ? parseInt(body.revisitCount) : null,
        crossSellContent: body.crossSellContent || null,
        
        // エンジニア割り振り
        assignedEngineerId: body.assignedEngineerId || null,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('プロジェクト更新エラー:', error)
    return NextResponse.json(
      { error: 'プロジェクトの更新に失敗しました' },
      { status: 500 }
    )
  }
}
