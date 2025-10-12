import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('テストユーザーを作成しています...')

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10)

  // VAXAL管理者ユーザーを作成
  const vaxalAdmin = await prisma.user.upsert({
    where: { email: 'admin@vaxal.co.jp' },
    update: {},
    create: {
      email: 'admin@vaxal.co.jp',
      password: hashedPassword,
      role: 'VAXAL_ADMIN',
      name: 'VAXAL管理者',
      phoneNumber: '03-1234-5678',
      address: '東京都渋谷区',
    },
  })

  console.log('✓ VAXAL管理者ユーザーを作成しました')
  console.log('  メール: admin@vaxal.co.jp')
  console.log('  パスワード: password123')

  // エンジニアマスターユーザーを作成
  const engineerMaster = await prisma.user.upsert({
    where: { email: 'engineer@example.com' },
    update: {},
    create: {
      email: 'engineer@example.com',
      password: hashedPassword,
      role: 'ENGINEER_MASTER',
      name: 'エンジニアマスター',
      phoneNumber: '090-1234-5678',
      address: '神奈川県横浜市',
      availableServices: 'エコキュート,ガス給湯器',
      hasLicense: true,
      hasQualification: true,
      hasWorkersComp: true,
    },
  })

  console.log('✓ エンジニアマスターユーザーを作成しました')
  console.log('  メール: engineer@example.com')
  console.log('  パスワード: password123')

  console.log('\n✅ テストユーザーの作成が完了しました！')
  console.log('\nログイン方法:')
  console.log('1. http://localhost:3000/login にアクセス')
  console.log('2. 上記のメールアドレスとパスワードでログイン')
}

main()
  .catch((e) => {
    console.error('エラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
