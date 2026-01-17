import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

export default async function ProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string; company?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/engineer')
  }

  const params = await searchParams
  const statusFilter = params.status
  const monthFilter = params.month
  const companyFilter = params.company

  // フィルター条件を構築
  const where: any = {}

  if (statusFilter) {
    where.status = statusFilter
  }

  if (monthFilter) {
    const [year, month] = monthFilter.split('-').map(Number)
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)
    
    where.workDate = {
      gte: monthStart,
      lte: monthEnd,
    }
  }

  // 会社フィルターを追加
  if (companyFilter) {
    where.calendarEvents = {
      some: {
        eventType: 'CONFIRMED',
        engineerUser: {
          OR: [
            { companyId: parseInt(companyFilter) },
            { masterCompanyId: parseInt(companyFilter) },
          ],
        },
      },
    }
  }

  // 案件一覧を取得
  const projects = await prisma.project.findMany({
    where,
    include: {
      assignedEngineer: {
        select: {
          name: true,
        },
      },
      calendarEvents: {
        where: {
          eventType: 'CONFIRMED',
        },
        select: {
          engineerUser: {
            select: {
              name: true,
              company: {
                select: {
                  companyName: true,
                },
              },
              masterCompany: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      workDate: 'desc',
    },
  })

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">案件一覧</h1>
          {(statusFilter || monthFilter || companyFilter) && (
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              フィルター: 
              {statusFilter && ` ${STATUS_LABELS[statusFilter]}`}
              {monthFilter && ` (${monthFilter})`}
              {companyFilter && ` - 会社ID: ${companyFilter}`}
            </p>
          )}
        </div>

        {/* 案件一覧 */}
        {projects.length > 0 ? (
          <div className="grid gap-3 md:gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/vaxal/project/${project.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg">{project.siteName}</CardTitle>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                          案件番号: {project.projectNumber}
                        </p>
                      </div>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${STATUS_COLORS[project.status]} self-start`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                      <div>
                        <span className="text-gray-500">お客様:</span> {project.customerName}
                      </div>
                      <div>
                        <span className="text-gray-500">現場住所:</span> {project.siteAddress}
                      </div>
                      {project.workDate && (
                        <div>
                          <span className="text-gray-500">工事日:</span>{' '}
                          {new Date(project.workDate).toLocaleDateString('ja-JP')}
                        </div>
                      )}
                      {project.assignedEngineer && (
                        <div>
                          <span className="text-gray-500">担当エンジニア:</span>{' '}
                          {project.assignedEngineer.name}
                        </div>
                      )}
                      {project.calendarEvents && project.calendarEvents.length > 0 && project.calendarEvents[0].engineerUser && (
                        <div>
                          <span className="text-gray-500">会社:</span>{' '}
                          {project.calendarEvents[0].engineerUser.masterCompany?.companyName || 
                           project.calendarEvents[0].engineerUser.company?.companyName || '-'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-400">該当する案件がありません</p>
              <Link href="/vaxal/calendar" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                ← カレンダーに戻る
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
