import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function EngineerDashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?type=engineer')
  }

  if (session.user.userType !== 'engineer') {
    redirect('/dashboard')
  }

  // 自分に割り振られた案件を取得（ステータス2以降のみ）
  // インデックスを活用するため、assignedEngineerIdとstatusの複合条件を使用
  const projects = await prisma.project.findMany({
    where: {
      assignedEngineerId: parseInt(session.user.id),
      status: {
        in: ['ASSIGNED', 'REPORTED', 'COMPLETED', 'REMAINING_WORK'],
      },
    },
    select: {
      id: true,
      projectNumber: true,
      siteName: true,
      siteAddress: true,
      customerName: true,
      workDate: true,
      status: true,
      createdByVaxal: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      workDate: 'asc',
    },
  })

  // ステータスごとに分類
  const assignedProjects = projects.filter(p => p.status === 'ASSIGNED')
  const reportedProjects = projects.filter(p => p.status === 'REPORTED')
  const remainingWorkProjects = projects.filter(p => p.status === 'REMAINING_WORK')
  const completedProjects = projects.filter(p => p.status === 'COMPLETED')

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          エンジニアダッシュボード
        </h1>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                注文依頼
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {assignedProjects.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                報告済み
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {reportedProjects.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                残工事あり
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {remainingWorkProjects.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                完了
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {completedProjects.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">件</p>
            </CardContent>
          </Card>
        </div>

        {/* 案件一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>割り振られた案件</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600">
                  現在、割り振られた案件はありません
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/engineer/project/${project.id}`}
                    className="block"
                  >
                    <div className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-0">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                            <h3 className="font-semibold text-base md:text-lg">
                              {project.siteName}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full self-start ${
                                project.status === 'ASSIGNED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : project.status === 'REPORTED'
                                  ? 'bg-purple-100 text-purple-800'
                                  : project.status === 'REMAINING_WORK'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {project.status === 'ASSIGNED'
                                ? '注文依頼'
                                : project.status === 'REPORTED'
                                ? '報告済み'
                                : project.status === 'REMAINING_WORK'
                                ? '残工事あり'
                                : '完了'}
                            </span>
                          </div>
                          <div className="text-xs md:text-sm text-gray-600 space-y-1">
                            <p>案件番号: {project.projectNumber}</p>
                            <p>現場住所: {project.siteAddress}</p>
                            <p>お客様: {project.customerName}</p>
                            {project.workDate && (
                              <p>
                                工事日:{' '}
                                {new Date(project.workDate).toLocaleDateString(
                                  'ja-JP'
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="text-xs md:text-sm text-gray-500">
                            担当: {project.createdByVaxal.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
