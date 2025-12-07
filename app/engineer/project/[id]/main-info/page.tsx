import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EngineerMainInfoPage({
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
      mainInfo: true,
    },
  })

  if (!project) {
    notFound()
  }

  // 自分に割り振られた案件かチェック
  if (project.assignedEngineerId !== session.user.id) {
    redirect('/engineer')
  }

  const mainInfo = project.mainInfo

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
          <h1 className="text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="main-info" userType="engineer" />

        {!mainInfo ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">主要情報はまだ登録されていません。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 施工指示 */}
            {mainInfo.constructionNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>施工指示</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{mainInfo.constructionNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* 元請け情報 */}
            {(mainInfo.contractorName || mainInfo.contractorPhone || mainInfo.contractorNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle>元請け情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mainInfo.contractorName && (
                    <div>
                      <p className="text-sm text-gray-600">担当者</p>
                      <p className="font-medium">{mainInfo.contractorName}</p>
                    </div>
                  )}
                  {mainInfo.contractorPhone && (
                    <div>
                      <p className="text-sm text-gray-600">TEL</p>
                      <p className="font-medium">{mainInfo.contractorPhone}</p>
                    </div>
                  )}
                  {mainInfo.contractorNotes && (
                    <div>
                      <p className="text-sm text-gray-600">備考欄</p>
                      <p className="whitespace-pre-wrap">{mainInfo.contractorNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VAXAL担当者情報 */}
            {(mainInfo.receptionStaff || mainInfo.salesStaff || mainInfo.constructionStaff) && (
              <Card>
                <CardHeader>
                  <CardTitle>VAXAL担当者情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 受付担当者 */}
                  {(mainInfo.receptionStaff || mainInfo.receptionStaffPhone) && (
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold mb-3">受付担当者</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {mainInfo.receptionStaff && (
                          <div>
                            <p className="text-sm text-gray-600">担当者名</p>
                            <p className="font-medium">{mainInfo.receptionStaff}</p>
                          </div>
                        )}
                        {mainInfo.receptionStaffPhone && (
                          <div>
                            <p className="text-sm text-gray-600">TEL</p>
                            <p className="font-medium">{mainInfo.receptionStaffPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 営業担当者 */}
                  {(mainInfo.salesStaff || mainInfo.salesStaffPhone) && (
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold mb-3">営業担当者</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {mainInfo.salesStaff && (
                          <div>
                            <p className="text-sm text-gray-600">担当者名</p>
                            <p className="font-medium">{mainInfo.salesStaff}</p>
                          </div>
                        )}
                        {mainInfo.salesStaffPhone && (
                          <div>
                            <p className="text-sm text-gray-600">TEL</p>
                            <p className="font-medium">{mainInfo.salesStaffPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 工務担当者 */}
                  {(mainInfo.constructionStaff || mainInfo.constructionStaffPhone) && (
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold mb-3">工務担当者</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {mainInfo.constructionStaff && (
                          <div>
                            <p className="text-sm text-gray-600">担当者名</p>
                            <p className="font-medium">{mainInfo.constructionStaff}</p>
                          </div>
                        )}
                        {mainInfo.constructionStaffPhone && (
                          <div>
                            <p className="text-sm text-gray-600">TEL</p>
                            <p className="font-medium">{mainInfo.constructionStaffPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {mainInfo.staffNotes && (
                    <div>
                      <p className="text-sm text-gray-600">備考欄</p>
                      <p className="whitespace-pre-wrap">{mainInfo.staffNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 建築情報 */}
            <Card>
              <CardHeader>
                <CardTitle>建築情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.roofingDate && (
                    <div>
                      <p className="text-sm text-gray-600">上棟日</p>
                      <p className="font-medium">
                        {new Date(mainInfo.roofingDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                  {mainInfo.demolitionDate && (
                    <div>
                      <p className="text-sm text-gray-600">解体日</p>
                      <p className="font-medium">
                        {new Date(mainInfo.demolitionDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.buildingType && (
                    <div>
                      <p className="text-sm text-gray-600">建物区分名</p>
                      <p className="font-medium">
                        {mainInfo.buildingType === 'MANSION' ? 'マンション' :
                         mainInfo.buildingType === 'DETACHED_HOUSE' ? '戸建て' :
                         mainInfo.buildingType === 'APARTMENT' ? 'アパート' : 'その他'}
                      </p>
                    </div>
                  )}
                  {mainInfo.installationFloor && (
                    <div>
                      <p className="text-sm text-gray-600">設置階数</p>
                      <p className="font-medium">{mainInfo.installationFloor}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.keyboxNumber && (
                    <div>
                      <p className="text-sm text-gray-600">キーボックスNo</p>
                      <p className="font-medium">{mainInfo.keyboxNumber}</p>
                    </div>
                  )}
                  {mainInfo.storageLocation && (
                    <div>
                      <p className="text-sm text-gray-600">保管場所</p>
                      <p className="font-medium">{mainInfo.storageLocation}</p>
                    </div>
                  )}
                </div>

                {mainInfo.installationLocation && (
                  <div>
                    <p className="text-sm text-gray-600">設置場所</p>
                    <p className="whitespace-pre-wrap">{mainInfo.installationLocation}</p>
                  </div>
                )}

                {mainInfo.parkingSpace && (
                  <div>
                    <p className="text-sm text-gray-600">駐車スペース</p>
                    <p className="whitespace-pre-wrap">{mainInfo.parkingSpace}</p>
                  </div>
                )}

                {mainInfo.buildingNotes && (
                  <div>
                    <p className="text-sm text-gray-600">備考欄</p>
                    <p className="whitespace-pre-wrap">{mainInfo.buildingNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 商品情報 */}
            {(mainInfo.productCategory || mainInfo.productSeries || mainInfo.deliveryDate || mainInfo.shipmentDate) && (
              <Card>
                <CardHeader>
                  <CardTitle>商品情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {mainInfo.productCategory && (
                      <div>
                        <p className="text-sm text-gray-600">機種区分</p>
                        <p className="font-medium">{mainInfo.productCategory}</p>
                      </div>
                    )}
                    {mainInfo.productSeries && (
                      <div>
                        <p className="text-sm text-gray-600">シリーズ名</p>
                        <p className="font-medium">{mainInfo.productSeries}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {mainInfo.deliveryDate && (
                      <div>
                        <p className="text-sm text-gray-600">荷受け日</p>
                        <p className="font-medium">
                          {new Date(mainInfo.deliveryDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    )}
                    {mainInfo.shipmentDate && (
                      <div>
                        <p className="text-sm text-gray-600">出荷日</p>
                        <p className="font-medium">
                          {new Date(mainInfo.shipmentDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    )}
                  </div>

                  {mainInfo.productNotes && (
                    <div>
                      <p className="text-sm text-gray-600">備考欄</p>
                      <p className="whitespace-pre-wrap">{mainInfo.productNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 配送情報 */}
            {(mainInfo.deliveryTime || mainInfo.deliverySpecification || mainInfo.deliveryLocation) && (
              <Card>
                <CardHeader>
                  <CardTitle>配送情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {mainInfo.deliveryTime && (
                      <div>
                        <p className="text-sm text-gray-600">配送時間</p>
                        <p className="font-medium">{mainInfo.deliveryTime}</p>
                      </div>
                    )}
                    {mainInfo.deliverySpecification && (
                      <div>
                        <p className="text-sm text-gray-600">配送指定</p>
                        <p className="font-medium">{mainInfo.deliverySpecification}</p>
                      </div>
                    )}
                    {mainInfo.deliveryLocation && (
                      <div>
                        <p className="text-sm text-gray-600">搬入場所指定</p>
                        <p className="font-medium">{mainInfo.deliveryLocation}</p>
                      </div>
                    )}
                  </div>

                  {mainInfo.deliveryNotes && (
                    <div>
                      <p className="text-sm text-gray-600">備考欄</p>
                      <p className="whitespace-pre-wrap">{mainInfo.deliveryNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 現場調査情報 */}
            <Card>
              <CardHeader>
                <CardTitle>現場調査情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.surveyRequestDate && (
                    <div>
                      <p className="text-sm text-gray-600">現場調査希望日</p>
                      <p className="font-medium">
                        {new Date(mainInfo.surveyRequestDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                  {mainInfo.surveyDate && (
                    <div>
                      <p className="text-sm text-gray-600">現場調査日（完了後）</p>
                      <p className="font-medium">
                        {new Date(mainInfo.surveyDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.surveyTime && (
                    <div>
                      <p className="text-sm text-gray-600">現場調査時間（完了後）</p>
                      <p className="font-medium">{mainInfo.surveyTime}</p>
                    </div>
                  )}
                  {mainInfo.surveyCompany && (
                    <div>
                      <p className="text-sm text-gray-600">管理業者名</p>
                      <p className="font-medium">{mainInfo.surveyCompany}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.surveyStaff && (
                    <div>
                      <p className="text-sm text-gray-600">現場調査実施者</p>
                      <p className="font-medium">{mainInfo.surveyStaff}</p>
                    </div>
                  )}
                  {mainInfo.reSurveyDate && (
                    <div>
                      <p className="text-sm text-gray-600">再現場調査日</p>
                      <p className="font-medium">
                        {new Date(mainInfo.reSurveyDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                </div>

                {mainInfo.surveyNotes && (
                  <div>
                    <p className="text-sm text-gray-600">備考欄</p>
                    <p className="whitespace-pre-wrap">{mainInfo.surveyNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 施工情報 */}
            <Card>
              <CardHeader>
                <CardTitle>施工情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.constructionDate && (
                    <div>
                      <p className="text-sm text-gray-600">施工日</p>
                      <p className="font-medium">
                        {new Date(mainInfo.constructionDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                  {mainInfo.constructionCompany && (
                    <div>
                      <p className="text-sm text-gray-600">施工会社</p>
                      <p className="font-medium">{mainInfo.constructionCompany}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.constructionStaffName && (
                    <div>
                      <p className="text-sm text-gray-600">施工担当者名</p>
                      <p className="font-medium">{mainInfo.constructionStaffName}</p>
                    </div>
                  )}
                  {mainInfo.constructionPhone && (
                    <div>
                      <p className="text-sm text-gray-600">TEL</p>
                      <p className="font-medium">{mainInfo.constructionPhone}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainInfo.constructionEmail && (
                    <div>
                      <p className="text-sm text-gray-600">E-mail</p>
                      <p className="font-medium">{mainInfo.constructionEmail}</p>
                    </div>
                  )}
                  {mainInfo.remainingWorkDate && (
                    <div>
                      <p className="text-sm text-gray-600">残工事日</p>
                      <p className="font-medium">
                        {new Date(mainInfo.remainingWorkDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                </div>

                {mainInfo.constructionInfoNotes && (
                  <div>
                    <p className="text-sm text-gray-600">備考欄</p>
                    <p className="whitespace-pre-wrap">{mainInfo.constructionInfoNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
