import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { requireEngineerAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export default async function EngineerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireEngineerAuth()

  // 会社名を取得
  const engineerUser = await prisma.engineerUser.findUnique({
    where: { id: parseInt(session.user.id) },
    include: {
      company: true,
      masterCompany: true,
    },
  })
  
  const company = engineerUser?.masterCompany || engineerUser?.company
  const companyName = company?.companyName || 'エンジニア'

  const userRole = session.user.role === 'ENGINEER_MASTER'
    ? 'マスター'
    : 'スタッフ'

  // 未読通知数を取得
  const unreadCount = await prisma.notification.count({
    where: {
      engineerUserId: parseInt(session.user.id),
      isRead: false,
    },
  })

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
          userName={session.user.name}
          userType="engineer"
          companyName={companyName}
          engineerRole={session.user.engineerRole}
          unreadCount={unreadCount}
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
