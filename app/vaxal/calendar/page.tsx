import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員は全ての案件を取得、エンジニアは自分に割り当てられた案件のみ
  const where = session.user.role === 'VAXAL_ADMIN'
    ? {}
    : { assignedEngineerId: session.user.id }

  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      projectNumber: true,
      siteName: true,
      customerName: true,
      workDate: true,
      workContent: true,
      workType: true,
      siteAddress: true,
      status: true,
    },
    orderBy: {
      workDate: 'asc',
    },
  })

  // 工事日が設定されている案件のみをカレンダーイベントに変換
  const events = projects
    .filter(project => project.workDate)
    .map(project => ({
      id: project.id,
      title: `${project.siteName} - ${project.customerName}`,
      start: new Date(project.workDate!),
      end: new Date(project.workDate!),
      resource: {
        projectNumber: project.projectNumber,
        workContent: project.workContent,
        workType: project.workType,
        siteAddress: project.siteAddress,
        status: project.status,
      },
    }))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-gray-600 mt-2">工事予定を確認できます</p>
        </div>

        <CalendarView events={events} />
      </div>
    </div>
  )
}
