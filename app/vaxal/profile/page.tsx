import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // ユーザー情報を取得
  let user = null
  let company = null
  
  if (session.user.userType === 'vaxal') {
    user = await prisma.vaxalUser.findUnique({
      where: { id: session.user.id },
    })
  } else {
    const engineerUser = await prisma.engineerUser.findUnique({
      where: { id: session.user.id },
      include: {
        company: true,
        masterCompany: true,
      },
    })
    user = engineerUser
    company = engineerUser?.masterCompany || engineerUser?.company
  }

  if (!user) {
    redirect('/dashboard')
  }

  const isVaxal = session.user.userType === 'vaxal'
  const isEngineer = session.user.userType === 'engineer'

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">プロフィール</h1>

        {/* 基本情報 */}
        <Card className="p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">基本情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
              <p className="text-base font-medium">
                {isVaxal ? 'VAXAL社員' : session.user.role === 'ENGINEER_MASTER' ? 'エンジニア（マスター）' : 'エンジニア（スタッフ）'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">電話番号</p>
              <p className="text-base font-medium">{user.phoneNumber}</p>
            </div>

            {isEngineer && 'address' in user && user.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">住所</p>
                <p className="text-base font-medium">{user.address}</p>
              </div>
            )}
          </div>
        </Card>

        {/* エンジニア固有情報 */}
        {isEngineer && 'bloodType' in user && (
          <>
            {/* 個人情報 */}
            <Card className="p-4 md:p-6 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">個人情報</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {user.bloodType && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">血液型</p>
                    <p className="text-base font-medium">
                      {user.bloodType === 'A' ? 'A型' : 
                       user.bloodType === 'B' ? 'B型' : 
                       user.bloodType === 'O' ? 'O型' : 
                       user.bloodType === 'AB' ? 'AB型' : '不明'}
                    </p>
                  </div>
                )}

                {user.birthDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">生年月日</p>
                    <p className="text-base font-medium">
                      {new Date(user.birthDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                )}

                {user.emergencyContact && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">緊急連絡先</p>
                    <p className="text-base font-medium">{user.emergencyContact}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">資格</p>
                  <p className="text-base font-medium">{user.hasQualification ? 'あり' : 'なし'}</p>
                </div>

                {user.availableServices && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">対応可能業種</p>
                    <p className="text-base font-medium">{user.availableServices}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* 会社情報 */}
            {company && (
              <Card className="p-4 md:p-6 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">会社情報</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">会社名</p>
                    <p className="text-base font-medium">{company.companyName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">業者番号</p>
                    <p className="text-base font-medium">{company.companyNumber}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">所在地</p>
                    <p className="text-base font-medium">{company.address}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">代表者名</p>
                    <p className="text-base font-medium">{company.representativeName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">会社電話番号</p>
                    <p className="text-base font-medium">{company.phoneNumber}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">会社メールアドレス</p>
                    <p className="text-base font-medium">{company.email}</p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* アカウント情報 */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">アカウント情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
