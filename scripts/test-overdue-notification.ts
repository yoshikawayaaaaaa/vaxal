/**
 * 報告遅延通知のテストスクリプト
 * 
 * 使い方:
 * npx tsx scripts/test-overdue-notification.ts
 */

import './load-env'
import { PrismaClient } from '@prisma/client'
import { notifyReportOverdue } from '../lib/notifications'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 報告遅延通知のテストを開始します...\n')

  // 今日の日付（JST）を取得
  const now = new Date()
  const jstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  
  // 昨日の日付（JST）を取得
  const yesterdayJST = new Date(jstNow)
  yesterdayJST.setDate(yesterdayJST.getDate() - 1)
  yesterdayJST.setHours(0, 0, 0, 0)
  
  // 昨日の0時（JST）をUTCに変換
  const yesterdayUTC = new Date(yesterdayJST.getTime() - 9 * 60 * 60 * 1000)

  console.log(`📅 今日の日付（JST）: ${jstNow.toLocaleString('ja-JP')}`)
  console.log(`📅 昨日の日付（JST）: ${yesterdayJST.toLocaleString('ja-JP')}`)
  console.log(`📅 判定基準日時（UTC）: ${yesterdayUTC.toISOString()}\n`)

  // デバッグ: 全案件を確認
  const allProjects = await prisma.project.findMany({
    where: {
      assignedEngineerId: {
        not: null,
      },
    },
    select: {
      id: true,
      projectNumber: true,
      workDate: true,
      status: true,
      assignedEngineerId: true,
    },
  })

  console.log('🔍 デバッグ: 全案件の状態')
  console.log('─'.repeat(80))
  allProjects.forEach((p) => {
    const workDateStr = p.workDate ? new Date(p.workDate).toISOString() : 'NULL'
    const isYesterday = p.workDate ? 
      new Date(p.workDate) >= yesterdayUTC && 
      new Date(p.workDate) < new Date(yesterdayUTC.getTime() + 24 * 60 * 60 * 1000) : false
    console.log(`${p.projectNumber}: workDate=${workDateStr}, status=${p.status}, isYesterday=${isYesterday}`)
  })
  console.log('─'.repeat(80))
  console.log()

  // 工事日が昨日で、ステータスがASSIGNED（報告未提出）の案件を取得
  const overdueProjects = await prisma.project.findMany({
    where: {
      workDate: {
        gte: yesterdayUTC, // 昨日の0時以降
        lt: new Date(yesterdayUTC.getTime() + 24 * 60 * 60 * 1000), // 昨日の23:59:59まで
      },
      status: 'ASSIGNED', // 報告未提出
      assignedEngineerId: {
        not: null, // エンジニアが割り振られている
      },
    },
    select: {
      id: true,
      projectNumber: true,
      siteName: true,
      workDate: true,
      assignedEngineerId: true,
      assignedEngineer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      workDate: 'desc',
    },
  })

  console.log(`📊 遅延案件数: ${overdueProjects.length}件\n`)

  if (overdueProjects.length === 0) {
    console.log('✅ 遅延案件はありません。')
    console.log('\n💡 テスト用の遅延案件を作成するには:')
    console.log('   1. 工事日を過去の日付に設定')
    console.log('   2. ステータスを「注文依頼（ASSIGNED）」に設定')
    console.log('   3. エンジニアを割り振る')
    return
  }

  // 遅延案件の詳細を表示
  console.log('📋 遅延案件一覧（昨日が工事日の案件）:')
  console.log('─'.repeat(80))
  overdueProjects.forEach((project, index) => {
    console.log(`${index + 1}. 案件番号: ${project.projectNumber}`)
    console.log(`   現場名: ${project.siteName}`)
    console.log(`   工事日: ${new Date(project.workDate!).toLocaleDateString('ja-JP')}`)
    console.log(`   担当エンジニア: ${project.assignedEngineer?.name} (${project.assignedEngineer?.email})`)
    console.log('─'.repeat(80))
  })

  // ユーザーに確認
  console.log('\n⚠️  これらの案件に対して通知を送信しますか？')
  console.log('   (実際に通知が作成され、データベースに保存されます)')
  console.log('\n   続行するには "yes" と入力してください:')

  // 標準入力から確認を取得
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readline.question('> ', async (answer: string) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ キャンセルしました。')
      readline.close()
      await prisma.$disconnect()
      return
    }

    console.log('\n📤 通知を送信中...\n')

    let notificationCount = 0
    for (const project of overdueProjects) {
      if (project.assignedEngineerId) {
        try {
          await notifyReportOverdue(
            project.id,
            project.projectNumber,
            project.assignedEngineerId
          )
          console.log(`✅ ${project.projectNumber} の通知を送信しました`)
          notificationCount++
        } catch (error) {
          console.error(`❌ ${project.projectNumber} の通知送信に失敗:`, error)
        }
      }
    }

    console.log(`\n✨ 完了: ${notificationCount}件の通知を送信しました`)
    console.log('\n💡 通知を確認するには:')
    console.log('   - エンジニア側: http://localhost:3000/engineer/notifications')
    console.log('   - VAXAL側: http://localhost:3000/vaxal/notifications')

    readline.close()
    await prisma.$disconnect()
  })
}

main()
  .catch((error) => {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  })
