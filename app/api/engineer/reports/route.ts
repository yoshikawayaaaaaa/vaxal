import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { notifyReportSubmitted, notifyInventoryLowStock, notifyInventoryOutOfStock } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.userType !== 'engineer') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    
    // プロジェクトIDを取得
    const projectId = body.projectId as string
    
    if (!projectId) {
      return NextResponse.json({ error: 'プロジェクトIDが必要です' }, { status: 400 })
    }

    // プロジェクトの確認
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    })

    if (!project) {
      return NextResponse.json({ error: 'プロジェクトが見つかりません' }, { status: 404 })
    }

    // 自分に割り振られた案件かチェック
    if (project.assignedEngineerId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })
    }

    // 集荷部材データを取得
    const pickupMaterialsData = body.pickupMaterialsData || []

    // 画像URLデータを取得
    const imageUrls = body.imageUrls || {}

    // エンジニア入力情報を取得
    const engineerInfo = {
      notes: body.notes || null,
      isWorkCompleted: body.isWorkCompleted === 'true' ? true : body.isWorkCompleted === 'false' ? false : null,
      remainingWorkDate: body.remainingWorkDate || null,
      existingManufacturer: body.existingManufacturer || null,
      yearsOfUse: body.yearsOfUse ? parseInt(body.yearsOfUse) : null,
      replacementType: body.replacementType || null,
      replacementManufacturer: body.replacementManufacturer || null,
      tankCapacity: body.tankCapacity || null,
      tankType: body.tankType || null,
      hasSpecialSpec: body.hasSpecialSpec === true,
      materialUnitPrice: body.materialUnitPrice ? parseInt(body.materialUnitPrice) : null,
      highwayFee: body.highwayFee ? parseInt(body.highwayFee) : null,
      gasolineFee: body.gasolineFee ? parseInt(body.gasolineFee) : null,
      saleType: body.saleType || null,
      saleFee: body.saleFee ? parseInt(body.saleFee) : null,
    }

    // 報告タイプのリスト
    const reportTypes: ('SITE_SURVEY' | 'PICKUP' | 'CHECK_IN' | 'COMPLETION' | 'UNLOADING' | 'SUBSIDY_PHOTO' | 'APPEARANCE_PHOTO' | 'BEFORE_WORK_PHOTO' | 'REGULATION_PHOTO' | 'FREE_PHOTO')[] = [
      'SITE_SURVEY',
      'PICKUP',
      'CHECK_IN',
      'COMPLETION',
      'UNLOADING',
      'SUBSIDY_PHOTO',
      'APPEARANCE_PHOTO',
      'BEFORE_WORK_PHOTO',
      'REGULATION_PHOTO',
      'FREE_PHOTO',
    ]
    
    // 各報告タイプの処理
    const createdReports = []
    let hasAnyData = false

    for (const reportType of reportTypes) {
      const urls = imageUrls[reportType] || []
      
      // 画像がある場合のみ報告を作成
      if (urls.length > 0) {
        hasAnyData = true
        
        // 報告を作成
        const report = await prisma.report.create({
          data: {
            projectId: parseInt(projectId),
            reportType: reportType as any,
            status: 'COMPLETED',
            engineerUserId: parseInt(session.user.id),
            notes: engineerInfo.notes,
            // 工事完了報告用
            isWorkCompleted: reportType === 'COMPLETION' ? engineerInfo.isWorkCompleted : null,
            remainingWorkDate: reportType === 'COMPLETION' && engineerInfo.remainingWorkDate ? new Date(engineerInfo.remainingWorkDate) : null,
            // エンジニア入力情報（すべての報告に同じ情報を保存）
            existingManufacturer: engineerInfo.existingManufacturer,
            yearsOfUse: engineerInfo.yearsOfUse,
            replacementType: engineerInfo.replacementType as any,
            replacementManufacturer: engineerInfo.replacementManufacturer,
            tankCapacity: engineerInfo.tankCapacity,
            tankType: engineerInfo.tankType as any,
            hasSpecialSpec: engineerInfo.hasSpecialSpec,
            materialUnitPrice: engineerInfo.materialUnitPrice,
            highwayFee: engineerInfo.highwayFee,
            gasolineFee: engineerInfo.gasolineFee,
            saleType: engineerInfo.saleType as any,
            saleFee: engineerInfo.saleFee,
          },
        })

        // 集荷報告の場合、集荷部材を保存し在庫を減算
        if (reportType === 'PICKUP' && pickupMaterialsData.length > 0) {
          for (const material of pickupMaterialsData) {
            if (material.inventoryItemId && material.quantity > 0) {
              // 集荷部材を保存
              await prisma.pickupMaterial.create({
                data: {
                  reportId: report.id,
                  inventoryItemId: parseInt(material.inventoryItemId),
                  inventoryItemName: material.inventoryItemName,
                  productName: material.productName || null,
                  manufacturer: material.manufacturer || null,
                  partNumber: material.partNumber || null,
                  quantity: material.quantity,
                  unitType: material.unitType,
                  unitPrice: material.unitPrice,
                },
              })

              // 在庫数を減算
              const updatedItem = await prisma.inventoryItem.update({
                where: { id: parseInt(material.inventoryItemId) },
                data: {
                  currentStock: {
                    decrement: material.quantity,
                  },
                },
              })

              // 在庫チェックと通知
              const newStock = updatedItem.currentStock
              const threshold = updatedItem.threshold

              // 在庫切れの場合
              if (newStock <= 0) {
                await notifyInventoryOutOfStock(updatedItem.name)
              }
              // 要発注レベル（閾値以下）の場合
              else if (newStock <= threshold) {
                await notifyInventoryLowStock(updatedItem.name, newStock, threshold)
              }
            }
          }
        }

        // 画像URLをデータベースに保存
        for (const fileUrl of urls) {
          // URLからファイル名を抽出
          const fileName = fileUrl.split('/').pop() || 'unknown'
          
          await prisma.reportFile.create({
            data: {
              reportId: report.id,
              fileName: fileName,
              fileUrl: fileUrl,
              fileSize: 0, // クライアント側でアップロード済みのためサイズ不明
              mimeType: 'image/webp', // 圧縮後はwebp形式
            },
          })
        }

        createdReports.push(report)
      }
    }

    // エンジニア入力情報がある場合は、画像がなくても保存
    const hasEngineerInfo = 
      engineerInfo.existingManufacturer ||
      engineerInfo.yearsOfUse ||
      engineerInfo.replacementType ||
      engineerInfo.replacementManufacturer ||
      engineerInfo.tankCapacity ||
      engineerInfo.tankType ||
      engineerInfo.hasSpecialSpec ||
      engineerInfo.materialUnitPrice ||
      engineerInfo.highwayFee ||
      engineerInfo.gasolineFee ||
      engineerInfo.saleType ||
      engineerInfo.saleFee

    if (!hasAnyData && hasEngineerInfo) {
      // エンジニア入力情報のみの報告を作成（SITE_SURVEYタイプで保存）
      const report = await prisma.report.create({
        data: {
          projectId: parseInt(projectId),
          reportType: 'SITE_SURVEY',
          status: 'COMPLETED',
          engineerUserId: parseInt(session.user.id),
          notes: engineerInfo.notes,
          existingManufacturer: engineerInfo.existingManufacturer,
          yearsOfUse: engineerInfo.yearsOfUse,
          replacementType: engineerInfo.replacementType as any,
          replacementManufacturer: engineerInfo.replacementManufacturer,
          tankCapacity: engineerInfo.tankCapacity,
          tankType: engineerInfo.tankType as any,
          hasSpecialSpec: engineerInfo.hasSpecialSpec,
          materialUnitPrice: engineerInfo.materialUnitPrice,
          highwayFee: engineerInfo.highwayFee,
          gasolineFee: engineerInfo.gasolineFee,
          saleType: engineerInfo.saleType as any,
          saleFee: engineerInfo.saleFee,
        },
      })
      createdReports.push(report)
      hasAnyData = true
    }

    if (!hasAnyData) {
      return NextResponse.json(
        { error: '報告内容または画像を入力してください' },
        { status: 400 }
      )
    }

    // 報告済みステータスの判定
    // 4つの必須報告タイプ全てに画像があるかチェック
    const requiredReportTypes: ('PICKUP' | 'CHECK_IN' | 'COMPLETION' | 'SUBSIDY_PHOTO')[] = ['PICKUP', 'CHECK_IN', 'COMPLETION', 'SUBSIDY_PHOTO']
    const existingReports = await prisma.report.findMany({
      where: {
        projectId: parseInt(projectId),
        reportType: {
          in: requiredReportTypes,
        },
      },
      include: {
        files: true,
      },
    })

    // 各必須報告タイプに画像があるかチェック
    const reportTypesWithImages = new Set(
      existingReports
        .filter(report => report.files.length > 0)
        .map(report => report.reportType)
    )

    const allRequiredReportsComplete = requiredReportTypes.every(type => 
      reportTypesWithImages.has(type)
    )

    // プロジェクトのステータスを更新
    let newStatus = project.status // 現在のステータスを維持
    let shouldNotify = false
    let finalRemainingWorkDate: string | undefined = undefined

    if (allRequiredReportsComplete) {
      // 4つ全ての必須報告が完了している場合
      // 工事完了報告の最新のものをチェック
      const latestCompletionReport = await prisma.report.findFirst({
        where: {
          projectId: parseInt(projectId),
          reportType: 'COMPLETION',
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // 最新の工事完了報告が未完了の場合は残工事
      if (latestCompletionReport && latestCompletionReport.isWorkCompleted === false && latestCompletionReport.remainingWorkDate) {
        newStatus = 'REMAINING_WORK'
        finalRemainingWorkDate = latestCompletionReport.remainingWorkDate.toISOString()
      } else {
        newStatus = 'REPORTED'
      }
      shouldNotify = true
    }
    
    await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        status: newStatus,
      },
    })

    // 報告済みステータスになった場合のみ通知を作成
    if (shouldNotify) {
      await notifyReportSubmitted(
        parseInt(projectId), 
        project.projectNumber,
        finalRemainingWorkDate
      )
    }

    return NextResponse.json({
      message: '報告を作成しました',
      reports: createdReports,
      projectStatus: newStatus,
    })
  } catch (error) {
    console.error('報告作成エラー:', error)
    return NextResponse.json(
      { error: '報告の作成に失敗しました' },
      { status: 500 }
    )
  }
}
