/**
 * データベースの案件データを確認するスクリプト
 */

import './load-env'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 データベースの案件データを確認します...\n')

  // 全案件を取得（エンジニア割り振りの有無に関わらず）
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      projectNumber: true,
      workDate: true,
      status: true,
      assignedEngineerId: true,
      siteName: true,
    },
    orderBy: {
      id: 'desc',
    },
    take: 20,
  })

  console.log(`📊 全案件数: ${allProjects.length}件\n`)
  console.log('─'.repeat(120))
  console.log('ID | 案件番号 | 工事日（UTC） | 工事日（JST） | ステータス | エンジニアID | 現場名')
  console.log('─'.repeat(120))

  allProjects.forEach((p) => {
    const workDateUTC = p.workDate ? new Date(p.workDate).toISOString() : 'NULL'
    const workDateJST = p.workDate 
      ? new Date(p.workDate).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
      : 'NULL'
    
    console.log(
      `${p.id} | ${p.projectNumber} | ${workDateUTC} | ${workDateJST} | ${p.status} | ${p.assignedEngineerId || 'NULL'} | ${p.siteName}`
    )
  })
  console.log('─'.repeat(120))
  console.log()

  // エンジニアが割り振られている案件のみ
  const projects = allProjects.filter(p => p.assignedEngineerId !== null)

  console.log(`📊 エンジニアが割り振られている案件: ${projects.length}件\n`)

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  })
