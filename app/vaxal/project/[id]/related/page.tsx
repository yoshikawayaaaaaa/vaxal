import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { STATUS_LABELS } from '@/lib/constants'

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
    where: { id: parseInt(id) },
    include: {
      reports: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          files: true,
          pickupMaterialsList: {
            include: {
              inventoryItem: true,
            },
          },
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
    SUBSIDY_PHOTO: '補助金申請写真',
  }

  // 報告タイプごとにグループ化
  const reportsByType = {
    SITE_SURVEY: project.reports.filter((r) => r.reportType === 'SITE_SURVEY'),
    PICKUP: project.reports.filter((r) => r.reportType === 'PICKUP'),
    CHECK_IN: project.reports.filter((r) => r.reportType === 'CHECK_IN'),
    COMPLETION: project.reports.filter((r) => r.reportType === 'COMPLETION'),
    UNLOADING: project.reports.filter((r) => r.reportType === 'UNLOADING'),
    SUBSIDY_PHOTO: project.reports.filter((r) => r.reportType === 'SUBSIDY_PHOTO'),
    APPEARANCE_PHOTO: project.reports.filter((r) => r.reportType === 'APPEARANCE_PHOTO'),
    BEFORE_WORK_PHOTO: project.reports.filter((r) => r.reportType === 'BEFORE_WORK_PHOTO'),
    REGULATION_PHOTO: project.reports.filter((r) => r.reportType === 'REGULATION_PHOTO'),
    FREE_PHOTO: project.reports.filter((r) => r.reportType === 'FREE_PHOTO'),
  }

  // エンジニア入力情報を取得（最新の報告から）
  const latestReport = project.reports[0]

  // マスターアカウントかどうかを判定
  const isMasterAccount = session.user.role === 'VAXAL_ADMIN'

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link
            href="/vaxal"
            className="text-sm md:text-base text-blue-600 hover:text-blue-800 mb-3 md:mb-4 inline-block"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">関連情報</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="related" userType="vaxal" />

        {/* ステータス表示と完了ボタン */}
        {(project.status === 'REPORTED' || project.status === 'REMAINING_WORK') && (
          <Card className="bg-blue-50 border-blue-200 mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-blue-900 mb-2">
                    報告確認待ち
                  </h3>
                  <p className="text-sm md:text-base text-blue-800">
                    エンジニアから報告が提出されました。内容を確認して問題なければ完了してください。
                  </p>
                  {project.status === 'REMAINING_WORK' && (
                    <p className="text-sm md:text-base text-orange-800 mt-2 font-medium">
                      ⚠️ 残工事があります
                    </p>
                  )}
                </div>
                <form action={`/api/vaxal/projects/${id}/complete`} method="POST">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 w-full md:w-auto text-sm md:text-base whitespace-nowrap"
                  >
                    案件を完了する
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        {project.status === 'COMPLETED' && (
          <Card className="bg-green-50 border-green-200 mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl md:text-3xl">✓</div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-green-900">案件完了</h3>
                  <p className="text-sm md:text-base text-green-800">
                    この案件は完了しました。
                    {project.completionDate && (
                      <span className="ml-2">
                        完了日: {new Date(project.completionDate).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 md:space-y-6">
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
                                <div className="relative w-full h-24">
                                  <Image
                                    src={file.fileUrl}
                                    alt={file.fileName}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover rounded cursor-pointer hover:opacity-80"
                                  />
                                </div>
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
                      
                      {/* 集荷部材リスト */}
                      {(report as any).pickupMaterialsList && (report as any).pickupMaterialsList.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">使用部材</p>
                          
                          {/* PC版テーブル */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full text-sm border">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left border">部材名</th>
                                  <th className="px-3 py-2 text-left border">商品名</th>
                                  <th className="px-3 py-2 text-left border">メーカー</th>
                                  <th className="px-3 py-2 text-left border">品番</th>
                                  <th className="px-3 py-2 text-right border">使用数量</th>
                                  <th className="px-3 py-2 text-right border">単価</th>
                                  <th className="px-3 py-2 text-right border">小計</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(report as any).pickupMaterialsList.map((material: any) => (
                                  <tr key={material.id} className="border-t">
                                    <td className="px-3 py-2 border">{material.inventoryItemName}</td>
                                    <td className="px-3 py-2 border">{material.productName || '-'}</td>
                                    <td className="px-3 py-2 border">{material.manufacturer || '-'}</td>
                                    <td className="px-3 py-2 border">{material.partNumber || '-'}</td>
                                    <td className="px-3 py-2 text-right border">
                                      {material.quantity} {material.unitType === 'PIECE' ? '個' : 'メートル'}
                                    </td>
                                    <td className="px-3 py-2 text-right border">
                                      ¥{material.unitPrice.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right border font-medium">
                                      ¥{(material.quantity * material.unitPrice).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-50 font-bold">
                                  <td colSpan={6} className="px-3 py-2 text-right border">合計</td>
                                  <td className="px-3 py-2 text-right border">
                                    ¥{(report as any).pickupMaterialsList.reduce(
                                      (sum: number, m: any) => sum + (m.quantity * m.unitPrice),
                                      0
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* スマートフォン版カードレイアウト */}
                          <div className="md:hidden space-y-3">
                            {(report as any).pickupMaterialsList.map((material: any) => (
                              <div key={material.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="font-medium text-gray-900 mb-2">{material.inventoryItemName}</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-600">商品名:</span>
                                    <span className="ml-1 text-gray-900">{material.productName || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">メーカー:</span>
                                    <span className="ml-1 text-gray-900">{material.manufacturer || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">品番:</span>
                                    <span className="ml-1 text-gray-900">{material.partNumber || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">使用数量:</span>
                                    <span className="ml-1 text-gray-900">
                                      {material.quantity} {material.unitType === 'PIECE' ? '個' : 'メートル'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">単価:</span>
                                    <span className="ml-1 text-gray-900">¥{material.unitPrice.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">小計:</span>
                                    <span className="ml-1 text-gray-900 font-medium">
                                      ¥{(material.quantity * material.unitPrice).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="border-t-2 border-gray-300 pt-2 text-right">
                              <span className="text-sm font-bold text-gray-900">
                                合計: ¥{(report as any).pickupMaterialsList.reduce(
                                  (sum: number, m: any) => sum + (m.quantity * m.unitPrice),
                                  0
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {report.notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">メモ</p>
                          <p className="text-sm text-gray-600">{report.notes}</p>
                        </div>
                      )}
                      {report.files.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
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

          {/* 補助金申請写真フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>補助金申請写真フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsByType.SUBSIDY_PHOTO.length > 0 ? (
                <div className="space-y-4">
                  {reportsByType.SUBSIDY_PHOTO.map((report) => (
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
                  補助金申請写真がまだアップロードされていません
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  {latestReport.saleType && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">売却種別</p>
                      <p className="font-medium">
                        {latestReport.saleType === 'ECO_CUTE' && 'エコキュート'}
                        {latestReport.saleType === 'GAS_WATER_HEATER' && 'ガス給湯器'}
                        {latestReport.saleType === 'ELECTRIC_HEATER' && '電気温水器'}
                        {latestReport.saleType === 'OTHER' && 'その他'}
                      </p>
                    </div>
                  )}
                  {latestReport.saleFee && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">売却費</p>
                      <p className="font-medium">¥{latestReport.saleFee.toLocaleString()}</p>
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
                  !latestReport.gasolineFee &&
                  !latestReport.saleType &&
                  !latestReport.saleFee && (
                    <p className="text-gray-400">エンジニア入力情報がまだ登録されていません</p>
                  )}
              </CardContent>
            </Card>
          )}

          {/* 任意写真フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>任意写真フォルダ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 身だしなみ写真 */}
                {reportsByType.APPEARANCE_PHOTO.length > 0 && (
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-3">身だしなみ写真</h3>
                    {reportsByType.APPEARANCE_PHOTO.map((report) => (
                      <div key={report.id} className="space-y-2">
                        <p className="text-sm text-gray-500">
                          作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                        {report.files.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {report.files.map((file) => (
                              <div key={file.id} className="border rounded p-2">
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={file.fileUrl}
                                    alt={file.fileName}
                                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                  />
                                </a>
                                <p className="text-xs text-gray-600 mt-1 truncate">{file.fileName}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 工事前写真 */}
                {reportsByType.BEFORE_WORK_PHOTO.length > 0 && (
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-3">工事前写真</h3>
                    {reportsByType.BEFORE_WORK_PHOTO.map((report) => (
                      <div key={report.id} className="space-y-2">
                        <p className="text-sm text-gray-500">
                          作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                        {report.files.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {report.files.map((file) => (
                              <div key={file.id} className="border rounded p-2">
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={file.fileUrl}
                                    alt={file.fileName}
                                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                  />
                                </a>
                                <p className="text-xs text-gray-600 mt-1 truncate">{file.fileName}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 規定写真 */}
                {reportsByType.REGULATION_PHOTO.length > 0 && (
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-3">規定写真</h3>
                    {reportsByType.REGULATION_PHOTO.map((report) => (
                      <div key={report.id} className="space-y-2">
                        <p className="text-sm text-gray-500">
                          作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                        {report.files.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {report.files.map((file) => (
                              <div key={file.id} className="border rounded p-2">
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={file.fileUrl}
                                    alt={file.fileName}
                                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                  />
                                </a>
                                <p className="text-xs text-gray-600 mt-1 truncate">{file.fileName}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* フリー写真 */}
                {reportsByType.FREE_PHOTO.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">フリー写真</h3>
                    {reportsByType.FREE_PHOTO.map((report) => (
                      <div key={report.id} className="space-y-2">
                        <p className="text-sm text-gray-500">
                          作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                        {report.files.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {report.files.map((file) => (
                              <div key={file.id} className="border rounded p-2">
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={file.fileUrl}
                                    alt={file.fileName}
                                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                  />
                                </a>
                                <p className="text-xs text-gray-600 mt-1 truncate">{file.fileName}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {reportsByType.APPEARANCE_PHOTO.length === 0 &&
                  reportsByType.BEFORE_WORK_PHOTO.length === 0 &&
                  reportsByType.REGULATION_PHOTO.length === 0 &&
                  reportsByType.FREE_PHOTO.length === 0 && (
                    <p className="text-gray-400">任意写真がまだアップロードされていません</p>
                  )}
              </div>
            </CardContent>
          </Card>

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
