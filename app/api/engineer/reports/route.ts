import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'
import { notifyReportSubmitted, notifyInventoryLowStock, notifyInventoryOutOfStock } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.userType !== 'engineer') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // プロジェクトIDを取得
    const projectId = formData.get('projectId') as string
    
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
    const pickupMaterialsDataStr = formData.get('pickupMaterialsData') as string
    const pickupMaterialsData = pickupMaterialsDataStr ? JSON.parse(pickupMaterialsDataStr) : []

    // エンジニア入力情報を取得
    const engineerInfo = {
      notes: formData.get('notes') as string || null,
      isWorkCompleted: formData.get('isWorkCompleted') === 'true' ? true : formData.get('isWorkCompleted') === 'false' ? false : null,
      remainingWorkDate: formData.get('remainingWorkDate') as string || null,
      existingManufacturer: formData.get('existingManufacturer') as string || null,
      yearsOfUse: formData.get('yearsOfUse') ? parseInt(formData.get('yearsOfUse') as string) : null,
      replacementType: formData.get('replacementType') as string || null,
      replacementManufacturer: formData.get('replacementManufacturer') as string || null,
      tankCapacity: formData.get('tankCapacity') as string || null,
      tankType: formData.get('tankType') as string || null,
      hasSpecialSpec: formData.get('hasSpecialSpec') === 'true',
      materialUnitPrice: formData.get('materialUnitPrice') ? parseInt(formData.get('materialUnitPrice') as string) : null,
      highwayFee: formData.get('highwayFee') ? parseInt(formData.get('highwayFee') as string) : null,
      gasolineFee: formData.get('gasolineFee') ? parseInt(formData.get('gasolineFee') as string) : null,
      saleType: formData.get('saleType') as string || null,
      saleFee: formData.get('saleFee') ? parseInt(formData.get('saleFee') as string) : null,
    }

    // 報告タイプのリスト
    const reportTypes: ('SITE_SURVEY' | 'PICKUP' | 'CHECK_IN' | 'COMPLETION' | 'UNLOADING')[] = [
      'SITE_SURVEY',
      'PICKUP',
      'CHECK_IN',
      'COMPLETION',
      'UNLOADING',
    ]
    
    // 各報告タイプの処理
    const createdReports = []
    let hasAnyData = false

    for (const reportType of reportTypes) {
      const imageCount = parseInt(formData.get(`${reportType}_count`) as string || '0')
      
      // 画像がある場合のみ報告を作成
      if (imageCount > 0) {
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
                  inventoryItemId: material.inventoryItemId,
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
                where: { id: material.inventoryItemId },
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
              // 要発注レベル（閾値の30%以下）の場合
              else if (newStock <= threshold * 0.3) {
                await notifyInventoryLowStock(updatedItem.name, newStock, threshold)
              }
            }
          }
        }

        // 画像を保存
        for (let i = 0; i < imageCount; i++) {
          const file = formData.get(`${reportType}_${i}`) as File
          
          if (file) {
            // ファイル名を生成（タイムスタンプ + インデックス + オリジナル名）
            const timestamp = Date.now()
            const fileName = `${timestamp}_${i}_${file.name}`
            const key = `reports/${fileName}`

            // R2にアップロード
            const fileUrl = await uploadToR2(file, key)

            // データベースに記録
            await prisma.reportFile.create({
              data: {
                reportId: report.id,
                fileName: file.name,
                fileUrl: fileUrl,
                fileSize: file.size,
                mimeType: file.type,
              },
            })
          }
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

    // プロジェクトのステータスを更新
    // 残工事日がある場合はREMAINING_WORK、それ以外はREPORTED
    const newStatus = engineerInfo.remainingWorkDate ? 'REMAINING_WORK' : 'REPORTED'
    
    await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        status: newStatus,
      },
    })

    // 通知を作成
    await notifyReportSubmitted(parseInt(projectId), project.projectNumber)

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
