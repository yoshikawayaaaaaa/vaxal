import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function EngineerReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login?type=engineer')
  }

  if (session.user.userType !== 'engineer') {
    redirect('/dashboard')
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      reports: {
        where: {
          engineerUserId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          files: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // 自分に割り振られた案件かチェック
  if (project.assignedEngineerId !== session.user.id) {
    redirect('/engineer')
  }

  // 報告タイプの日本語名
  const reportTypeNames: Record<string, string> = {
    SITE_SURVEY: '現場調査報告',
    PICKUP: '集荷報告',
    CHECK_IN: 'check in報告',
    COMPLETION: '工事完了報告',
    UNLOADING: '荷卸し報告',
  }

  // ステータスの日本語名
  const statusNames: Record<string, string> = {
    PENDING: '未着手',
    COMPLETED: '完了',
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/engineer"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">報告</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="report" userType="engineer" />

        <div className="space-y-6">
          {/* 新規報告作成ボタン */}
          <div className="flex justify-end">
            <Link href={`/engineer/project/${id}/report/new`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                新規報告作成
              </Button>
            </Link>
          </div>

          {/* 報告一覧 */}
          {project.reports.length > 0 ? (
            <div className="grid gap-4">
              {project.reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {reportTypeNames[report.reportType]}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {statusNames[report.status]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* メモ */}
                      {report.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600 mt-1">{report.notes}</p>
                        </div>
                      )}

                      {/* 持ち出し部材（集荷報告の場合） */}
                      {report.reportType === 'PICKUP' && report.pickupMaterials && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">持ち出し部材</p>
                          <p className="text-sm text-gray-600 mt-1">{report.pickupMaterials}</p>
                        </div>
                      )}

                      {/* エンジニア入力情報 */}
                      {(report.existingManufacturer ||
                        report.yearsOfUse ||
                        report.replacementType ||
                        report.replacementManufacturer ||
                        report.tankCapacity ||
                        report.tankType ||
                        report.hasSpecialSpec ||
                        report.materialUnitPrice ||
                        report.highwayFee ||
                        report.gasolineFee ||
                        report.saleType ||
                        report.saleFee) && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            エンジニア入力情報
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {report.existingManufacturer && (
                              <div>
                                <span className="text-gray-500">既設メーカー:</span>{' '}
                                {report.existingManufacturer}
                              </div>
                            )}
                            {report.yearsOfUse && (
                              <div>
                                <span className="text-gray-500">使用年数:</span>{' '}
                                {report.yearsOfUse}年
                              </div>
                            )}
                            {report.replacementType && (
                              <div>
                                <span className="text-gray-500">交換種別:</span>{' '}
                                {report.replacementType}
                              </div>
                            )}
                            {report.replacementManufacturer && (
                              <div>
                                <span className="text-gray-500">交換メーカー:</span>{' '}
                                {report.replacementManufacturer}
                              </div>
                            )}
                            {report.tankCapacity && (
                              <div>
                                <span className="text-gray-500">タンク容量:</span>{' '}
                                {report.tankCapacity}
                              </div>
                            )}
                            {report.tankType && (
                              <div>
                                <span className="text-gray-500">タンクタイプ:</span>{' '}
                                {report.tankType === 'THIN' ? '薄型' : '角型'}
                              </div>
                            )}
                            {report.hasSpecialSpec && (
                              <div>
                                <span className="text-gray-500">特殊仕様:</span> あり
                              </div>
                            )}
                            {report.materialUnitPrice && (
                              <div>
                                <span className="text-gray-500">部材単価:</span> ¥
                                {report.materialUnitPrice.toLocaleString()}
                              </div>
                            )}
                            {report.highwayFee && (
                              <div>
                                <span className="text-gray-500">高速代:</span> ¥
                                {report.highwayFee.toLocaleString()}
                              </div>
                            )}
                            {report.gasolineFee && (
                              <div>
                                <span className="text-gray-500">ガソリン代:</span> ¥
                                {report.gasolineFee.toLocaleString()}
                              </div>
                            )}
                            {report.saleType && (
                              <div>
                                <span className="text-gray-500">売却種別:</span>{' '}
                                {report.saleType === 'ECO_CUTE' ? 'エコキュート' :
                                 report.saleType === 'GAS_WATER_HEATER' ? 'ガス給湯器' :
                                 report.saleType === 'ELECTRIC_HEATER' ? '電気温水器' : 'その他'}
                              </div>
                            )}
                            {report.saleFee && (
                              <div>
                                <span className="text-gray-500">売却費:</span> ¥
                                {report.saleFee.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 添付ファイル */}
                      {report.files.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            添付ファイル ({report.files.length}件)
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {report.files.map((file) => (
                              <div key={file.id} className="border rounded p-2">
                                {file.mimeType.startsWith('image/') ? (
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
                                ) : (
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full h-24 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                                  >
                                    <span className="text-xs text-gray-500">
                                      {file.fileName}
                                    </span>
                                  </a>
                                )}
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {file.fileName}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-400 mb-4">まだ報告が作成されていません</p>
                <Link href={`/engineer/project/${id}/report/new`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    最初の報告を作成
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
