import './load-env'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('テストユーザーを作成中...')

  // VAXAL社員を作成
  const hashedPasswordVaxal = await bcrypt.hash('password123', 10)
  
  const vaxalUser = await prisma.vaxalUser.upsert({
    where: { email: 'admin@vaxal.com' },
    update: {},
    create: {
      email: 'admin@vaxal.com',
      password: hashedPasswordVaxal,
      name: 'VAXAL管理者',
      phoneNumber: '03-1234-5678',
    },
  })

  console.log('✓ VAXAL社員を作成しました:', vaxalUser.email)

  // エンジニア（マスターアカウント）を作成
  const hashedPasswordEngineer = await bcrypt.hash('password123', 10)

  // まず会社を作成
  const company = await prisma.company.upsert({
    where: { email: 'company@example.com' },
    update: {},
    create: {
      companyNumber: 'C-001',
      companyName: 'テスト工務店',
      address: '東京都渋谷区',
      representativeName: '山田太郎',
      phoneNumber: '03-9876-5432',
      email: 'company@example.com',
    },
  })

  console.log('✓ 会社を作成しました:', company.companyName)

  // エンジニアマスターアカウントを作成
  const engineerMaster = await prisma.engineerUser.upsert({
    where: { email: 'engineer@example.com' },
    update: {},
    create: {
      email: 'engineer@example.com',
      password: hashedPasswordEngineer,
      role: 'MASTER',
      name: '山田太郎',
      phoneNumber: '090-1234-5678',
      address: '東京都渋谷区',
      masterCompanyId: company.id,
    },
  })

  console.log('✓ エンジニア（マスター）を作成しました:', engineerMaster.email)

  // エンジニアスタッフアカウントを作成
  const engineerStaff = await prisma.engineerUser.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: hashedPasswordEngineer,
      role: 'STAFF',
      name: '佐藤花子',
      phoneNumber: '090-9876-5432',
      address: '東京都新宿区',
      companyId: company.id,
    },
  })

  console.log('✓ エンジニア（スタッフ）を作成しました:', engineerStaff.email)

  console.log('\n=== テストユーザー作成完了 ===')
  console.log('\nログイン情報:')
  console.log('\n【VAXAL社員】')
  console.log('Email: admin@vaxal.com')
  console.log('Password: password123')
  console.log('\n【エンジニア（マスター）】')
  console.log('Email: engineer@example.com')
  console.log('Password: password123')
  console.log('\n【エンジニア（スタッフ）】')
  console.log('Email: staff@example.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
