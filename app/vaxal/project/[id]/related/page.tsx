import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function RelatedInfoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.userType !== 'vaxal') {
    redirect('/dashboard')
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      reports: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          files: true,
        },
      },
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

  // 報告タイプの日本語名
  const reportTypeNames: Record<string, string> = {
    SITE_SURVEY: '現場調査報告',
    PICKUP: '集荷報告',
    CHECK_IN: 'check in報告',
    COMPLETION: '工事完了報告',
    UNLOADING: '荷卸し報告',
  }

  // 報告タイプごとにグループ化
  const reportsByType = {
    SITE_SURVEY: project.reports.filter((r) => r.reportType === 'SITE_SURVEY'),
    PICKUP: project.reports.filter((r) => r.reportType === 'PICKUP'),
    CHECK_IN: project.reports.filter((r) => r.reportType === 'CHECK_IN'),
    COMPLETION: project.reports.filter((r) => r.reportType === 'COMPLETION'),
    UNLOADING: project.reports.filter((r) => r.reportType === 'UNLOADING'),
  }

  // エンジニア入力情報を取得（最新の報告から）
  const latestReport = project.reports[0]

  // マスターアカウントかどうかを判定
  const isMasterAccount = session.user.role === 'VAXAL_ADMIN'

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/vaxal"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">関連情報</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="related" userType="vaxal" />

        <div className="space-y-6">
          {/* 現場調査報告フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>現場調査報告フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsByType.SITE_SURVEY.length > 0 ? (
                <div className="space-y-4">
                  {reportsByType.SITE_SURVEY.map((report) => (
                    <div key={report.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-sm text-gray-500 mb-2">
                        作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {report.notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600">{report.notes}</p>
                        </div>
                      )}
                      {report.files.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {report.files.map((file) => (
                            <div key={file.id} className="border rounded p-2">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName}
                                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                />
                              </a>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {file.fileName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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
              {reportsByType.PICKUP.length > 0 ? (
                <div className="space-y-4">
                  {reportsByType.PICKUP.map((report) => (
                    <div key={report.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-sm text-gray-500 mb-2">
                        作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {report.pickupMaterials && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">持ち出し部材</p>
                          <p className="text-sm text-gray-600">{report.pickupMaterials}</p>
                        </div>
                      )}
                      {report.notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600">{report.notes}</p>
                        </div>
                      )}
                      {report.files.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {report.files.map((file) => (
                            <div key={file.id} className="border rounded p-2">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName}
                                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                />
                              </a>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {file.fileName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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
              {reportsByType.CHECK_IN.length > 0 ? (
                <div className="space-y-4">
                  {reportsByType.CHECK_IN.map((report) => (
                    <div key={report.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-sm text-gray-500 mb-2">
                        作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {report.notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600">{report.notes}</p>
                        </div>
                      )}
                      {report.files.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {report.files.map((file) => (
                            <div key={file.id} className="border rounded p-2">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName}
                                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                />
                              </a>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {file.fileName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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
              {reportsByType.COMPLETION.length > 0 ? (
                <div className="space-y-4">
                  {reportsByType.COMPLETION.map((report) => (
                    <div key={report.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-sm text-gray-500 mb-2">
                        作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {report.notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600">{report.notes}</p>
                        </div>
                      )}
                      {report.files.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {report.files.map((file) => (
                            <div key={file.id} className="border rounded p-2">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName}
                                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                />
                              </a>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {file.fileName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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
              {reportsByType.UNLOADING.length > 0 ? (
                <div className="space-y-4">
                  {reportsByType.UNLOADING.map((report) => (
                    <div key={report.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-sm text-gray-500 mb-2">
                        作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {report.notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600">{report.notes}</p>
                        </div>
                      )}
                      {report.files.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {report.files.map((file) => (
                            <div key={file.id} className="border rounded p-2">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName}
                                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                />
                              </a>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {file.fileName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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

          {/* エンジニア入力情報 */}
          {latestReport && (
            <Card>
              <CardHeader>
                <CardTitle>エンジニア入力情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {latestReport.existingManufacturer && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">既設メーカー</p>
                      <p className="font-medium">{latestReport.existingManufacturer}</p>
                    </div>
                  )}
                  {latestReport.yearsOfUse && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">使用年数</p>
                      <p className="font-medium">{latestReport.yearsOfUse}年</p>
                    </div>
                  )}
                  {latestReport.replacementType && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">交換種別</p>
                      <p className="font-medium">
                        {latestReport.replacementType === 'ECO_TO_ECO' && 'エコキュート→エコキュート'}
                        {latestReport.replacementType === 'GAS_TO_ECO' && 'ガス給湯器→エコキュート'}
                        {latestReport.replacementType === 'ELECTRIC_TO_ECO' && '電気温水器→エコキュート'}
                        {latestReport.replacementType === 'OTHER' && 'その他'}
                      </p>
                    </div>
                  )}
                  {latestReport.replacementManufacturer && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">交換メーカー</p>
                      <p className="font-medium">{latestReport.replacementManufacturer}</p>
                    </div>
                  )}
                  {latestReport.tankCapacity && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">タンク容量</p>
                      <p className="font-medium">{latestReport.tankCapacity}</p>
                    </div>
                  )}
                  {latestReport.tankType && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">薄型or角型</p>
                      <p className="font-medium">
                        {latestReport.tankType === 'THIN' && '薄型'}
                        {latestReport.tankType === 'SQUARE' && '角型'}
                      </p>
                    </div>
                  )}
                  {latestReport.hasSpecialSpec !== null && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">特殊仕様有無</p>
                      <p className="font-medium">{latestReport.hasSpecialSpec ? 'あり' : 'なし'}</p>
                    </div>
                  )}
                  {latestReport.materialUnitPrice && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">部材単価</p>
                      <p className="font-medium">¥{latestReport.materialUnitPrice.toLocaleString()}</p>
                    </div>
                  )}
                  {latestReport.highwayFee && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">高速代</p>
                      <p className="font-medium">¥{latestReport.highwayFee.toLocaleString()}</p>
                    </div>
                  )}
                  {latestReport.gasolineFee && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">ガソリン代</p>
                      <p className="font-medium">¥{latestReport.gasolineFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {!latestReport.existingManufacturer &&
                  !latestReport.yearsOfUse &&
                  !latestReport.replacementType &&
                  !latestReport.replacementManufacturer &&
                  !latestReport.tankCapacity &&
                  !latestReport.tankType &&
                  !latestReport.materialUnitPrice &&
                  !latestReport.highwayFee &&
                  !latestReport.gasolineFee && (
                    <p className="text-gray-400">エンジニア入力情報がまだ登録されていません</p>
                  )}
              </CardContent>
            </Card>
          )}

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
