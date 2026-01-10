import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { WORK_CONTENT_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { requireVaxalAdminAuth } from '@/lib/auth-helpers'

export default async function CalendarDatePage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  // VAXAL管理者権限チェック
  await requireVaxalAdminAuth()

  const { date } = await params
  const selectedDate = new Date(date)
  
  // 日付の範囲を設定
  const startOfDay = new Date(selectedDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(selectedDate)
  endOfDay.setHours(23, 59, 59, 999)

  // 指定日の案件を取得
  const projects = await prisma.project.findMany({
    where: {
      workDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      assignedEngineer: {
        select: {
          id: true,
          name: true,
          email: true,
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
      createdByVaxal: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // エンジニアごとに案件をグループ化
  const projectsByEngineer = projects.reduce((acc, project) => {
    if (!project.assignedEngineer) return acc
    
    const engineerId = project.assignedEngineer.id
    if (!acc[engineerId]) {
      acc[engineerId] = {
        engineer: project.assignedEngineer,
        projects: [],
      }
    }
    acc[engineerId].projects.push(project)
    return acc
  }, {} as Record<string, { engineer: any; projects: any[] }>)



  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/vaxal/calendar"
            className="text-blue-600 hover:text-blue-700 mb-3 md:mb-4 inline-block text-sm md:text-base"
          >
            ← カレンダーに戻る
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">
            {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })} の案件一覧
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            全{projects.length}件の案件 / {Object.keys(projectsByEngineer).length}名のエンジニアが稼働
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="p-3 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">総案件数</div>
            <div className="text-xl md:text-3xl font-bold text-gray-900">{projects.length}<span className="text-sm md:text-base">件</span></div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">稼働エンジニア数</div>
            <div className="text-xl md:text-3xl font-bold text-gray-900">
              {Object.keys(projectsByEngineer).length}<span className="text-sm md:text-base">名</span>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">平均案件数/人</div>
            <div className="text-xl md:text-3xl font-bold text-gray-900">
              {Object.keys(projectsByEngineer).length > 0
                ? (projects.length / Object.keys(projectsByEngineer).length).toFixed(1)
                : 0}<span className="text-sm md:text-base">件</span>
            </div>
          </Card>
        </div>

        {/* エンジニアごとの案件一覧 */}
        {Object.keys(projectsByEngineer).length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {Object.values(projectsByEngineer).map(({ engineer, projects }) => {
              const companyName = engineer.masterCompany?.companyName || engineer.company?.companyName || '不明'
              
              return (
                <Card key={engineer.id} className="p-4 md:p-6">
                  <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-200">
                    <h2 className="text-base md:text-xl font-bold text-gray-900">
                      {companyName} - {engineer.name}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {projects.length}件の案件を担当
                    </p>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    {projects.map((project, index) => (
                      <Link
                        key={project.id}
                        href={`/vaxal/project/${project.id}`}
                        className="block p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                              <span className="text-sm md:text-base font-semibold text-gray-900">
                                案件{index + 1}: {project.siteName}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  STATUS_COLORS[project.status]
                                } w-fit`}
                              >
                                {STATUS_LABELS[project.status]}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs md:text-sm">
                              <div>
                                <span className="text-gray-600">案件番号:</span>
                                <span className="ml-2 text-gray-900">{project.projectNumber}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">工事内容:</span>
                                <span className="ml-2 text-gray-900">
                                  {WORK_CONTENT_LABELS[project.workContent]}
                                </span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-600">現場住所:</span>
                                <span className="ml-2 text-gray-900">{project.siteAddress}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">お客様:</span>
                                <span className="ml-2 text-gray-900">{project.customerName}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">施工時間:</span>
                                <span className="ml-2 text-gray-900">{project.workTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">この日の案件はありません</p>
          </Card>
        )}
      </div>
    </div>
  )
}
