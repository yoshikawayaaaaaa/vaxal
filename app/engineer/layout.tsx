import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { requireEngineerAuth } from '@/lib/auth-helpers'

export default async function EngineerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireEngineerAuth()

  const companyName = session.user.masterCompanyId 
    ? 'MIAMU TIGERS' // TODO: 実際の会社名を取得
    : 'エンジニア'

  const userRole = session.user.role === 'ENGINEER_MASTER'
    ? 'マスター'
    : 'スタッフ'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar 
        companyName={companyName} 
        userRole={userRole} 
        isVaxalAdmin={false}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Project Honeycomb" 
          userName={session.user.name}
          userType="engineer"
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
