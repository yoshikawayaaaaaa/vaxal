import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultInventoryItems = [
  { name: 'キャンパス', unitPrice: 100 },
  { name: 'エコユニ0.5m', unitPrice: 225 },
  { name: 'PF管0.5m', unitPrice: 47 },
  { name: 'ユニ継手', unitPrice: 1500 },
  { name: 'VVF0.5m', unitPrice: 103 },
  { name: 'アース0.5m', unitPrice: 49 },
  { name: 'リモコン線0.5m', unitPrice: 36 },
  { name: 'アンカー', unitPrice: 126 },
  { name: '保温0.5m', unitPrice: 37 },
  { name: 'ドレン0.5m', unitPrice: 30 },
  { name: '20フレキ0.5m', unitPrice: 339 },
  { name: '16フレキ0.5m', unitPrice: 189 },
  { name: '20ニップル', unitPrice: 309 },
  { name: '16ニップル', unitPrice: 199 },
  { name: '20ナット', unitPrice: 145 },
  { name: '16ナット', unitPrice: 97 },
  { name: '異形ナット', unitPrice: 429 },
  { name: '異形ニップル', unitPrice: 500 },
  { name: '10カポリ配管0.5m', unitPrice: 265 },
  { name: '13カポリ配管0.5m', unitPrice: 310 },
  { name: '16カポリ配管0.5m', unitPrice: 395 },
  { name: '20カポリ配管0.5m', unitPrice: 725 },
  { name: '10カポリ継手', unitPrice: 1800 },
  { name: '13カポリ継手', unitPrice: 1400 },
  { name: '16カポリ継手', unitPrice: 1800 },
  { name: '20カポリ継手', unitPrice: 2500 },
  { name: '10ポリブデン継手', unitPrice: 1800 },
  { name: '13ポリブデン継手', unitPrice: 2000 },
  { name: '16ポリブデン継手', unitPrice: 2500 },
  { name: '20ポリブデン継手', unitPrice: 4700 },
  { name: '10エルメックス継手', unitPrice: 3300 },
  { name: '13エルメックス継手', unitPrice: 2830 },
  { name: '16エルメックス継手', unitPrice: 3910 },
  { name: '20エルメックス継手', unitPrice: 6300 },
  { name: '銅10', unitPrice: 2400 },
  { name: '銅15', unitPrice: 400 },
  { name: '銅20', unitPrice: 3300 },
  { name: 'ステンレス15', unitPrice: 1400 },
  { name: 'ステンレス20', unitPrice: 1700 },
  { name: '鉄管15', unitPrice: 1200 },
  { name: '鉄管20', unitPrice: 1500 },
  { name: 'HI13', unitPrice: 77 },
  { name: 'HI16', unitPrice: 93 },
  { name: 'HI20', unitPrice: 93 },
  { name: 'HT13', unitPrice: 559 },
  { name: 'HT16', unitPrice: 719 },
  { name: 'HT20', unitPrice: 949 },
  { name: 'バルブ', unitPrice: 2656 },
  { name: 'パテ（0.5）', unitPrice: 60 },
]

async function main() {
  console.log('在庫データの投入を開始します...')

  for (const item of defaultInventoryItems) {
    // 既存のアイテムを検索
    const existing = await prisma.inventoryItem.findFirst({
      where: { name: item.name },
    })

    if (existing) {
      console.log(`- ${item.name} は既に登録されています`)
    } else {
      await prisma.inventoryItem.create({
        data: {
          name: item.name,
          unitPrice: item.unitPrice,
          currentStock: 0,
          threshold: 10, // デフォルトの閾値を10に設定
        },
      })
      console.log(`✓ ${item.name} を登録しました`)
    }
  }

  console.log('在庫データの投入が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
