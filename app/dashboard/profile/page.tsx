import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員のみアクセス可能
  if (session.user.userType !== 'vaxal') {
    redirect('/dashboard')
  }

  // ユーザー情報を取得
  const user = await prisma.vaxalUser.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect('/dashboard')
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">プロフィール</h1>

        {/* 基本情報 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報</h2>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">氏名</p>
              <p className="text-base font-medium">{user.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">メールアドレス</p>
              <p className="text-base font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">役割</p>
              <p className="text-base font-medium">VAXAL社員</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">電話番号</p>
              <p className="text-base font-medium">{user.phoneNumber}</p>
            </div>
          </div>
        </Card>

        {/* アカウント情報 */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">アカウント情報</h2>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">ユーザーID</p>
              <p className="text-base font-medium font-mono text-sm">{user.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">登録日</p>
              <p className="text-base font-medium">
                {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">最終更新日</p>
              <p className="text-base font-medium">
                {new Date(user.updatedAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
