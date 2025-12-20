import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const orderedItems = [
  'キャンパス',
  'エコユニ0.5m',
  'PF管0.5m',
  'ユニ継手',
  'VVF0.5m',
  'アース0.5m',
  'リモコン線0.5m',
  'アンカー',
  '保温0.5m',
  'ドレン0.5m',
  '20フレキ0.5m',
  '16フレキ0.5m',
  '20ニップル',
  '16ニップル',
  '20ナット',
  '16ナット',
  '異形ナット',
  '異形ニップル',
  '10カポリ配管0.5m',
  '13カポリ配管0.5m',
  '16カポリ配管0.5m',
  '20カポリ配管0.5m',
  '10カポリ継手',
  '13カポリ継手',
  '16カポリ継手',
  '20カポリ継手',
  '10ポリブデン継手',
  '13ポリブデン継手',
  '16ポリブデン継手',
  '20ポリブデン継手',
  '10エルメックス継手',
  '13エルメックス継手',
  '16エルメックス継手',
  '20エルメックス継手',
  '銅10',
  '銅15',
  '銅20',
  'ステンレス15',
  'ステンレス20',
  '鉄管15',
  '鉄管20',
  'HI13',
  'HI16',
  'HI20',
  'HT13',
  'HT16',
  'HT20',
  'バルブ',
  'パテ（0.5）',
]

async function main() {
  console.log('在庫の表示順序を更新します...')

  for (let i = 0; i < orderedItems.length; i++) {
    const itemName = orderedItems[i]
    const displayOrder = i + 1

    const updated = await prisma.inventoryItem.updateMany({
      where: { name: itemName },
      data: { displayOrder },
    })

    if (updated.count > 0) {
      console.log(`✓ ${itemName} の表示順序を ${displayOrder} に設定しました`)
    } else {
      console.log(`⚠ ${itemName} が見つかりませんでした`)
    }
  }

  console.log('表示順序の更新が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
