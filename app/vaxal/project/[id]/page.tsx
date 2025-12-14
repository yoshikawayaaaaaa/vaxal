import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'

export default async function ProjectDetailPage({
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
      createdByVaxal: {
        select: {
          name: true,
          email: true,
        },
      },
      assignedEngineer: {
        select: {
          name: true,
          email: true,
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

  const workContentLabels: Record<string, string> = {
    ECO_CUTE: 'エコキュート',
    GAS_WATER_HEATER: 'ガス給湯器',
    ELECTRIC_HEATER: '電気温水器',
    BATHROOM_DRYER: '浴室乾燥機',
    SOLAR_PANEL: '太陽光パネル',
    OTHER: 'その他',
  }

  const workTypeLabels: Record<string, string> = {
    NEW_INSTALLATION: '新設',
    REFORM: 'リフォーム',
    REPLACEMENT: '交換',
  }

  const paymentMethodLabels: Record<string, string> = {
    CASH: '現金',
    CARD: 'カード',
    LOAN: 'ローン',
    BANK_TRANSFER: '銀行振込',
    ELECTRONIC_MONEY: '電子マネー',
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="basic" />

        {/* 施工主基本情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">施工主基本情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">現場名</p>
                  <p className="text-base font-medium">{project.siteName}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">名前</p>
                  <p className="text-base font-medium">{project.customerName}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">電話番号</p>
                  <p className="text-base font-medium">{project.customerPhone}</p>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">案件番号</p>
                  <p className="text-base font-medium">{project.projectNumber}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">現場住所</p>
                  <p className="text-base font-medium">{project.siteAddress}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">住所</p>
                  <p className="text-base font-medium">{project.customerAddress}</p>
                </div>
              </div>
            </div>

            {project.overview && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-1">概要</p>
                <p className="text-base">{project.overview}</p>
              </div>
            )}
          </div>
        </section>

        {/* 工事情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">工事情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">工事内容</p>
              <p className="text-base">{workContentLabels[project.workContent]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">用途</p>
              <p className="text-base">{workTypeLabels[project.workType]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">施工時間</p>
              <p className="text-base">{project.workTime}</p>
            </div>
            {project.buildingType && (
              <div>
                <p className="text-sm text-gray-600 mb-1">建物区分名</p>
                <p className="text-base">
                  {project.buildingType === 'DETACHED_HOUSE' && '戸建て'}
                  {project.buildingType === 'MANSION' && 'マンション'}
                  {project.buildingType === 'APARTMENT' && 'アパート'}
                  {project.buildingType === 'OTHER' && 'その他'}
                </p>
              </div>
            )}
          </div>
          </div>
        </section>

        {/* 商品情報 */}
        {project.workContent === 'ECO_CUTE' && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">商品情報</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {project.productSetNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">セット品番</p>
                    <p className="text-base">{project.productSetNumber}</p>
                  </div>
                )}
                {project.productTankNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">タンク品番</p>
                    <p className="text-base">{project.productTankNumber}</p>
                  </div>
                )}
                {project.productHeatPumpNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ヒートポンプ品番</p>
                    <p className="text-base">{project.productHeatPumpNumber}</p>
                  </div>
                )}
                {project.productRemoteNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">リモコン品番</p>
                    <p className="text-base">{project.productRemoteNumber}</p>
                  </div>
                )}
                {project.productBaseNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">脚部カバー品番</p>
                    <p className="text-base">{project.productBaseNumber}</p>
                  </div>
                )}
                {project.productFallNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">転倒防止品番</p>
                    <p className="text-base">{project.productFallNumber}</p>
                  </div>
                )}
                {project.productUlbroNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ウルブロ品番</p>
                    <p className="text-base">{project.productUlbroNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* お支払い情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">お支払い情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              {project.paymentAmount && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">金額</p>
                  <p className="text-base">¥{project.paymentAmount.toLocaleString()}</p>
                </div>
              )}
              {project.contractAmount !== null && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">請負金額</p>
                  <p className="text-base font-bold text-blue-600">¥{project.contractAmount.toLocaleString()}</p>
                </div>
              )}
              {project.hasRemoteTravelFee && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">遠方出張費</p>
                    <p className="text-base">あり</p>
                  </div>
                  {project.remoteTravelDistance && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">距離</p>
                      <p className="text-base">{project.remoteTravelDistance}km</p>
                    </div>
                  )}
                  {project.remoteTravelFee && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">遠方出張費金額</p>
                      <p className="text-base">¥{project.remoteTravelFee.toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}
              {project.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">支払い方法</p>
                  <p className="text-base">{paymentMethodLabels[project.paymentMethod]}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">商品保証</p>
                <p className="text-base">{project.productWarranty ? 'あり' : 'なし'}</p>
              </div>
              {project.sellingPrice !== null && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">売価：交換できるくん</p>
                  <p className="text-base">¥{project.sellingPrice.toLocaleString()}</p>
                </div>
              )}
              {project.sellingPrice2 !== null && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">売価：キンライサー</p>
                  <p className="text-base">¥{project.sellingPrice2.toLocaleString()}</p>
                </div>
              )}
              {project.sellingPrice3 !== null && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">売価：cools</p>
                  <p className="text-base">¥{project.sellingPrice3.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">身分証</p>
                <p className="text-base">
                  {project.idCardRequired ? '現場で頂く必要あり' : '不要'}
                  {project.idCardObtained && ' (取得済)'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">通帳</p>
                <p className="text-base">
                  {project.bankbookRequired ? '現場で頂く必要あり' : '不要'}
                  {project.bankbookObtained && ' (取得済)'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* メモ */}
        {(project.additionalWork || project.existingProductInfo || project.constructionNotes) && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">メモ</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              {project.additionalWork && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">追加工事</p>
                  <p className="text-base whitespace-pre-wrap">{project.additionalWork}</p>
                </div>
              )}
              {project.existingProductInfo && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">既存商品情報</p>
                  <p className="text-base whitespace-pre-wrap">{project.existingProductInfo}</p>
                </div>
              )}
              {project.constructionNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">施工指示</p>
                  <p className="text-base whitespace-pre-wrap">{project.constructionNotes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 日程 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">日程</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              {project.workDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">工事日</p>
                  <p className="text-base">{new Date(project.workDate).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
              {project.receptionDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">受付日</p>
                  <p className="text-base">{new Date(project.receptionDate).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
              {project.orderDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">受注日</p>
                  <p className="text-base">{new Date(project.orderDate).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
              {project.expectedCompletionDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">完了予定日</p>
                  <p className="text-base">{new Date(project.expectedCompletionDate).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
              {project.completionDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">完了日</p>
                  <p className="text-base">{new Date(project.completionDate).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 社内メモ（VAXAL専用） */}
        {session.user.role === 'VAXAL_ADMIN' && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">社内メモ（VAXAL専用）</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                {project.firstContactMethod && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ファーストコンタクトの連絡手段</p>
                    <p className="text-base">{project.firstContactMethod}</p>
                  </div>
                )}
                {project.communicationTool && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">連絡ツール</p>
                    <p className="text-base whitespace-pre-wrap">{project.communicationTool}</p>
                  </div>
                )}
                {project.internalNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">備考欄</p>
                    <p className="text-base whitespace-pre-wrap">{project.internalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
