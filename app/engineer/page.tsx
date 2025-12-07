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

  // 自分に割り振られた案件を取得
  const projects = await prisma.project.findMany({
    where: {
      assignedEngineerId: session.user.id,
    },
    include: {
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
  const pendingProjects = projects.filter(p => p.status === 'PENDING')
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS')
  const completedProjects = projects.filter(p => p.status === 'COMPLETED')

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          エンジニアダッシュボード
        </h1>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                未着手
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {pendingProjects.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                進行中
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {inProgressProjects.length}
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
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/engineer/project/${project.id}`}
                    className="block"
                  >
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {project.siteName}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                project.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : project.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {project.status === 'PENDING'
                                ? '未着手'
                                : project.status === 'IN_PROGRESS'
                                ? '進行中'
                                : '完了'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
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
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
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
