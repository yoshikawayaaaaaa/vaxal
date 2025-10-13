import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RelatedInfoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      files: true,
      assignedEngineer: {
        include: {
          company: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // エンジニアは自分に割り当てられた案件のみ閲覧可能
  if (
    session.user.role !== 'VAXAL_ADMIN' &&
    project.assignedEngineerId !== session.user.id
  ) {
    redirect('/dashboard')
  }

  // ファイルをカテゴリ別に分類
  const surveyReportFiles = project.files.filter(
    (f) => f.category === 'SURVEY_REPORT'
  )
  const pickupReportFiles = project.files.filter(
    (f) => f.category === 'PICKUP_REPORT'
  )
  const checkinReportFiles = project.files.filter(
    (f) => f.category === 'CHECKIN_REPORT'
  )
  const completionReportFiles = project.files.filter(
    (f) => f.category === 'COMPLETION_REPORT'
  )
  const unloadingReportFiles = project.files.filter(
    (f) => f.category === 'UNLOADING_REPORT'
  )

  // マスターアカウントかどうかを判定
  const isMasterAccount =
    session.user.role === 'VAXAL_ADMIN' ||
    (session.user.role === 'ENGINEER_MASTER' &&
      project.assignedEngineer?.company?.masterCompanyId === session.user.id)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="related" />

        <div className="space-y-6">
          {/* 現場調査報告フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>現場調査報告フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {surveyReportFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {surveyReportFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  現場調査報告がまだアップロードされていません
                </p>
              )}
            </CardContent>
          </Card>

          {/* 集荷報告フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>集荷報告フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {pickupReportFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pickupReportFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  集荷報告がまだアップロードされていません
                </p>
              )}
            </CardContent>
          </Card>

          {/* check in報告フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>check in報告フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {checkinReportFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {checkinReportFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  check in報告がまだアップロードされていません
                </p>
              )}
            </CardContent>
          </Card>

          {/* 工事完了報告フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>工事完了報告フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {completionReportFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {completionReportFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  工事完了報告がまだアップロードされていません
                </p>
              )}
            </CardContent>
          </Card>

          {/* 荷卸し報告フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>荷卸し報告フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {unloadingReportFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {unloadingReportFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  荷卸し報告がまだアップロードされていません
                </p>
              )}
            </CardContent>
          </Card>

          {/* 請負金額（マスターアカウントのみ） */}
          {isMasterAccount && (
            <Card>
              <CardHeader>
                <CardTitle>請負金額</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">請負金額:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {project.contractAmount
                        ? `¥${project.contractAmount.toLocaleString()}`
                        : '未設定'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    ※ この情報はマスターアカウントのみ閲覧可能です
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 事故品登録（今後実装予定） */}
          <Card>
            <CardHeader>
              <CardTitle>事故品登録</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">※ この機能は今後実装予定です</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
