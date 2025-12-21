import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

export default async function ProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string }>
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

  // 案件一覧を取得
  const projects = await prisma.project.findMany({
    where,
    include: {
      assignedEngineer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      workDate: 'desc',
    },
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">案件一覧</h1>
          {statusFilter && (
            <p className="text-gray-600 mt-2">
              フィルター: {STATUS_LABELS[statusFilter]}
              {monthFilter && ` (${monthFilter})`}
            </p>
          )}
        </div>

        {/* 案件一覧 */}
        {projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/vaxal/project/${project.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.siteName}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          案件番号: {project.projectNumber}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
