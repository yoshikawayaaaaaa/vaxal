import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員はカレンダー画面にリダイレクト
  if (session.user.role === 'VAXAL_ADMIN') {
    redirect('/dashboard/calendar')
  }
  
  // エンジニアは開発中画面を表示
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">開発中</h1>
        <p className="text-gray-600 mb-4">エンジニア向けの機能は現在開発中です</p>
        <p className="text-sm text-gray-500">しばらくお待ちください</p>
      </div>
    </div>
  )
}
