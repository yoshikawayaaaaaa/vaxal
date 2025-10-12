import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProjectPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 施工主基本情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">施工主基本情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              {/* 左列 */}
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">現場名</p>
                  <p className="text-base font-medium">田中邸給湯器交換工事</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">名前</p>
                  <p className="text-base font-medium">田中 太郎</p>
                </div>
              </div>

              {/* 右列 */}
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">案件番号</p>
                  <p className="text-base font-medium">HC-2025-0721-001</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">住所</p>
                  <p className="text-base font-medium">東京都渋谷区神宮前1-1-1</p>
                </div>
              </div>
            </div>

            {/* マップ表示エリア */}
            <div className="mt-6 bg-gray-100 rounded-lg p-8 text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">マップ表示エリア</span>
              </div>
            </div>
          </div>
        </section>

        {/* 商品 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">商品</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">セット品番</p>
                <p className="text-base">RUF-E2405AW(A)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">タンク</p>
                <p className="text-base">標準タンク 24号</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">リモコン</p>
                <p className="text-base">MBC-240V(T)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">脚部カバー</p>
                <p className="text-base">あり</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">転倒防止</p>
                <p className="text-base">設置済み</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ウルブロ</p>
                <p className="text-base">なし</p>
              </div>
            </div>
          </div>
        </section>

        {/* 工事・保証・金額 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">工事・保証・金額</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">工事内容</p>
                <p className="text-base">給湯器交換工事（既設撤去含む）</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">商品保証</p>
                <p className="text-base">メーカー保証10年</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
