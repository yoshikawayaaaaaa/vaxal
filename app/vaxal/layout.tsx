import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { requireVaxalAuth } from '@/lib/auth-helpers'

export default async function VaxalDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireVaxalAuth()

  const companyName = session.user.masterCompanyId 
    ? 'MIAMU TIGERS' // TODO: 実際の会社名を取得
    : 'VAXAL'

  const userRole = session.user.role === 'VAXAL_ADMIN' 
    ? 'VAXAL社員' 
    : session.user.role === 'ENGINEER_MASTER'
    ? 'エンジニア'
    : 'スタッフ'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar 
        companyName={companyName} 
        userRole={userRole} 
        isVaxalAdmin={session.user.role === 'VAXAL_ADMIN'}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Project Honeycomb" 
          userName={session.user.name}
          userType="vaxal"
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
