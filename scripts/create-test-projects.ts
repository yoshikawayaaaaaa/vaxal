import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // VAXAL管理者を取得
  const admin = await prisma.user.findFirst({
    where: {
      role: 'VAXAL_ADMIN',
    },
  })

  if (!admin) {
    console.error('VAXAL管理者が見つかりません')
    return
  }

  console.log('テストプロジェクトを作成中...')

  // 今日の日付を基準に
  const today = new Date()
  
  const testProjects = [
    {
      projectNumber: 'HC-2025-1013-001',
      siteName: '田中邸エコキュート交換工事',
      siteAddress: '東京都渋谷区神宮前1-1-1',
      customerName: '田中 太郎',
      customerAddress: '東京都渋谷区神宮前1-1-1',
      customerPhone: '03-1234-5678',
      workContent: 'ECO_CUTE',
      workType: 'REPLACEMENT',
      workCategory: 'MAIN_WORK',
      workTime: '09:00~17:00',
      workDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), // 明日
      productSetNumber: 'RUF-E2405AW(A)',
      productTankNumber: '標準タンク 24号',
      paymentAmount: 350000,
      paymentMethod: 'CASH',
      status: 'PENDING',
      createdById: admin.id,
    },
    {
      projectNumber: 'HC-2025-1013-002',
      siteName: '佐藤邸ガス給湯器設置',
      siteAddress: '東京都新宿区西新宿2-2-2',
      customerName: '佐藤 花子',
      customerAddress: '東京都新宿区西新宿2-2-2',
      customerPhone: '03-2345-6789',
      workContent: 'GAS_WATER_HEATER',
      workType: 'NEW_INSTALLATION',
      workCategory: 'MAIN_WORK',
      workTime: '10:00~16:00',
      workDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3), // 3日後
      paymentAmount: 280000,
      paymentMethod: 'CARD',
      status: 'PENDING',
      createdById: admin.id,
    },
    {
      projectNumber: 'HC-2025-1013-003',
      siteName: '鈴木邸太陽光パネル設置',
      siteAddress: '東京都世田谷区三軒茶屋3-3-3',
      customerName: '鈴木 一郎',
      customerAddress: '東京都世田谷区三軒茶屋3-3-3',
      customerPhone: '03-3456-7890',
      workContent: 'SOLAR_PANEL',
      workType: 'NEW_INSTALLATION',
      workCategory: 'MAIN_WORK',
      workTime: '09:00~18:00',
      workDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), // 5日後
      paymentAmount: 1200000,
      paymentMethod: 'LOAN',
      status: 'PENDING',
      createdById: admin.id,
    },
    {
      projectNumber: 'HC-2025-1013-004',
      siteName: '高橋邸浴室乾燥機交換',
      siteAddress: '東京都品川区大崎4-4-4',
      customerName: '高橋 美咲',
      customerAddress: '東京都品川区大崎4-4-4',
      customerPhone: '03-4567-8901',
      workContent: 'BATHROOM_DRYER',
      workType: 'REPLACEMENT',
      workCategory: 'MAIN_WORK',
      workTime: '13:00~17:00',
      workDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), // 7日後
      paymentAmount: 85000,
      paymentMethod: 'BANK_TRANSFER',
      status: 'PENDING',
      createdById: admin.id,
    },
    {
      projectNumber: 'HC-2025-1013-005',
      siteName: '山田邸エコキュート新設',
      siteAddress: '東京都目黒区中目黒5-5-5',
      customerName: '山田 健太',
      customerAddress: '東京都目黒区中目黒5-5-5',
      customerPhone: '03-5678-9012',
      workContent: 'ECO_CUTE',
      workType: 'NEW_INSTALLATION',
      workCategory: 'MAIN_WORK',
      workTime: '09:00~17:00',
      workDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10), // 10日後
      productSetNumber: 'RUF-E3705SAW(A)',
      productTankNumber: '標準タンク 37号',
      paymentAmount: 420000,
      paymentMethod: 'CASH',
      status: 'PENDING',
      createdById: admin.id,
    },
  ]

  for (const projectData of testProjects) {
    const project = await prisma.project.create({
      data: projectData,
    })
    console.log(`✓ プロジェクト作成: ${project.projectNumber} - ${project.siteName}`)
  }

  console.log('\n✅ テストプロジェクトの作成が完了しました！')
  console.log(`合計 ${testProjects.length} 件のプロジェクトを作成しました。`)
}

main()
  .catch((e) => {
    console.error('エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
