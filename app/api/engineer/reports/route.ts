import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'プロジェクトが見つかりません' }, { status: 404 })
    }

    // 自分に割り振られた案件かチェック
    if (project.assignedEngineerId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })
    }

    // エンジニア入力情報を取得
    const engineerInfo = {
      pickupMaterials: formData.get('pickupMaterials') as string || null,
      notes: formData.get('notes') as string || null,
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
    }

    // 報告タイプのリスト
    const reportTypes: ('SITE_SURVEY' | 'PICKUP' | 'CHECK_IN' | 'COMPLETION' | 'UNLOADING')[] = [
      'SITE_SURVEY',
      'PICKUP',
      'CHECK_IN',
      'COMPLETION',
      'UNLOADING',
    ]
    
    // アップロードディレクトリの作成
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reports')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

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
            projectId,
            reportType: reportType as any,
            status: 'COMPLETED',
            engineerUserId: session.user.id,
            notes: engineerInfo.notes,
            pickupMaterials: reportType === 'PICKUP' ? engineerInfo.pickupMaterials : null,
            // エンジニア入力情報（すべての報告に同じ情報を保存）
            existingManufacturer: engineerInfo.existingManufacturer,
            yearsOfUse: engineerInfo.yearsOfUse,
            replacementType: engineerInfo.replacementType,
            replacementManufacturer: engineerInfo.replacementManufacturer,
            tankCapacity: engineerInfo.tankCapacity,
            tankType: engineerInfo.tankType,
            hasSpecialSpec: engineerInfo.hasSpecialSpec,
            materialUnitPrice: engineerInfo.materialUnitPrice,
            highwayFee: engineerInfo.highwayFee,
            gasolineFee: engineerInfo.gasolineFee,
          },
        })

        // 画像を保存
        for (let i = 0; i < imageCount; i++) {
          const file = formData.get(`${reportType}_${i}`) as File
          
          if (file) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // ファイル名を生成（タイムスタンプ + オリジナル名）
            const timestamp = Date.now()
            const fileName = `${timestamp}_${i}_${file.name}`
            const filePath = join(uploadDir, fileName)

            // ファイルを保存
            await writeFile(filePath, buffer)

            // データベースに記録
            await prisma.reportFile.create({
              data: {
                reportId: report.id,
                fileName: file.name,
                fileUrl: `/uploads/reports/${fileName}`,
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
      engineerInfo.gasolineFee

    if (!hasAnyData && hasEngineerInfo) {
      // エンジニア入力情報のみの報告を作成（SITE_SURVEYタイプで保存）
      const report = await prisma.report.create({
        data: {
          projectId,
          reportType: 'SITE_SURVEY',
          status: 'COMPLETED',
          engineerUserId: session.user.id,
          notes: engineerInfo.notes,
          existingManufacturer: engineerInfo.existingManufacturer,
          yearsOfUse: engineerInfo.yearsOfUse,
          replacementType: engineerInfo.replacementType,
          replacementManufacturer: engineerInfo.replacementManufacturer,
          tankCapacity: engineerInfo.tankCapacity,
          tankType: engineerInfo.tankType,
          hasSpecialSpec: engineerInfo.hasSpecialSpec,
          materialUnitPrice: engineerInfo.materialUnitPrice,
          highwayFee: engineerInfo.highwayFee,
          gasolineFee: engineerInfo.gasolineFee,
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

    return NextResponse.json({
      message: '報告を作成しました',
      reports: createdReports,
    })
  } catch (error) {
    console.error('報告作成エラー:', error)
    return NextResponse.json(
      { error: '報告の作成に失敗しました' },
      { status: 500 }
    )
  }
}
