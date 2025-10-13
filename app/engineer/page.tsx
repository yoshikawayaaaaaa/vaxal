import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'

export default async function EngineerDashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?type=engineer')
  }

  if (session.user.userType !== 'engineer') {
    redirect('/dashboard')
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          エンジニアダッシュボード
        </h1>

        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              開発中
            </h2>
            <p className="text-gray-600">
              エンジニア向けの機能は現在開発中です
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
