import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// 評価詳細取得
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

    const evaluation = await prisma.engineerEvaluation.findUnique({
      where: { id: parseInt(id) },
      include: {
        engineerUser: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                companyName: true,
              },
            },
          },
        },
        evaluatedByVaxal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!evaluation) {
      return NextResponse.json(
        { error: '評価が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('評価取得エラー:', error)
    return NextResponse.json(
      { error: '評価の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 評価更新
export async function PUT(
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
    const body = await request.json()

    const evaluation = await prisma.engineerEvaluation.update({
      where: { id: parseInt(id) },
      data: {
        evaluationDate: body.evaluationDate ? new Date(body.evaluationDate) : undefined,
        
        // To VAXAL
        responseToVaxal: body.responseToVaxal || null,
        checkinDelay: body.checkinDelay || null,
        flexibility: body.flexibility || null,
        friendliness: body.friendliness || null,
        attitudeToVaxal: body.attitudeToVaxal || null,
        languageUse: body.languageUse || null,
        reportCooperation: body.reportCooperation || null,
        surveyCooperation: body.surveyCooperation || null,
        documentSubmission: body.documentSubmission || null,
        instructionComprehension: body.instructionComprehension || null,
        busySeasonResponse: body.busySeasonResponse || null,
        ruleCompliance: body.ruleCompliance || null,
        understandingOfVaxal: body.understandingOfVaxal || null,
        improvementProposals: body.improvementProposals || null,
        longTermCooperation: body.longTermCooperation || null,
        educationAttitude: body.educationAttitude || null,
        staffingStability: body.staffingStability || null,
        toVaxalNotes: body.toVaxalNotes || null,
        
        // 現場・品質
        constructionQuality: body.constructionQuality || null,
        photoAccuracy: body.photoAccuracy || null,
        photoQuality: body.photoQuality || null,
        constructionSpeed: body.constructionSpeed || null,
        problemReporting: body.problemReporting || null,
        siteCleanness: body.siteCleanness || null,
        correctionFrequency: body.correctionFrequency || null,
        correctionSpeed: body.correctionSpeed || null,
        complaintFrequency: body.complaintFrequency || null,
        unauthorizedDecisions: body.unauthorizedDecisions || null,
        scheduleCompliance: body.scheduleCompliance || null,
        technicalKnowledge: body.technicalKnowledge || null,
        preparation: body.preparation || null,
        safetyManagement: body.safetyManagement || null,
        siteQualityNotes: body.siteQualityNotes || null,
        
        // To Customer
        customerSurveyRating: body.customerSurveyRating || null,
        attitudeToCustomer: body.attitudeToCustomer || null,
        appearance: body.appearance || null,
        vehicleCleanness: body.vehicleCleanness || null,
        customerFriendliness: body.customerFriendliness || null,
        greetingAndLanguage: body.greetingAndLanguage || null,
        ownerResponse: body.ownerResponse || null,
        protectionAndCleaning: body.protectionAndCleaning || null,
        neighborConsideration: body.neighborConsideration || null,
        toCustomerNotes: body.toCustomerNotes || null,
        
        // 総合メモ
        generalNotes: body.generalNotes || null,
      },
      include: {
        engineerUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('評価更新エラー:', error)
    return NextResponse.json(
      { error: '評価の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 評価削除
export async function DELETE(
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

    await prisma.engineerEvaluation.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '評価を削除しました' })
  } catch (error) {
    console.error('評価削除エラー:', error)
    return NextResponse.json(
      { error: '評価の削除に失敗しました' },
      { status: 500 }
    )
  }
}
