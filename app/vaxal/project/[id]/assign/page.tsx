import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AssignProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id: parseInt(id) },
    include: {
      mainInfo: true,
      assignedEngineer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // 主要情報の必須項目チェック
  const mainInfo = project.mainInfo
  const missingFields: string[] = []

  // 元請け情報
  if (!mainInfo?.contractorName) missingFields.push('元請け担当者名')
  if (!mainInfo?.contractorPhone) missingFields.push('元請け電話番号')

  // VAXAL担当者情報
  if (!mainInfo?.receptionStaff) missingFields.push('受付担当者')
  if (!mainInfo?.salesStaff) missingFields.push('営業担当者')
  if (!mainInfo?.constructionStaff) missingFields.push('工務担当者')

  // 建築情報（基本情報のbuildingTypeもチェック）
  if (!mainInfo?.buildingType && !project.buildingType) missingFields.push('建物区分')
  if (!mainInfo?.installationFloor) missingFields.push('設置階数')

  // 商品情報
  if (!mainInfo?.productCategory) missingFields.push('機種区分')
  if (!mainInfo?.productSeries) missingFields.push('シリーズ名')

  // 配送情報
  if (!mainInfo?.deliveryTime) missingFields.push('配送時間')
  if (!mainInfo?.deliverySpecification) missingFields.push('配送指定')

  // 施工情報
  if (!mainInfo?.constructionDate) missingFields.push('施工日')
  if (!mainInfo?.constructionCompany) missingFields.push('施工会社')

  // エンジニア割り振り
  if (!project.assignedEngineerId) missingFields.push('担当エンジニア')

  const canAssign = missingFields.length === 0

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/vaxal/project/${id}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← 案件詳細に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">案件割り振り確定</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">案件情報</h2>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">現場名:</span>
                <span className="ml-2 text-gray-900">{project.siteName}</span>
              </div>
              <div>
                <span className="text-gray-600">お客様名:</span>
                <span className="ml-2 text-gray-900">{project.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600">工事日:</span>
                <span className="ml-2 text-gray-900">
                  {project.workDate ? new Date(project.workDate).toLocaleDateString('ja-JP') : '未設定'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">担当エンジニア:</span>
                <span className="ml-2 text-gray-900">
                  {project.assignedEngineer?.name || '未割り振り'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {!canAssign && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ 必須項目が未入力です</h2>
            <p className="text-red-800 mb-4">
              以下の項目を入力してから、案件割り振り確定を行ってください。
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-800">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <Link href={`/vaxal/project/${id}`}>
                <Button variant="outline">基本情報を編集</Button>
              </Link>
              <Link href={`/vaxal/project/${id}/main-info`}>
                <Button variant="outline">主要情報を編集</Button>
              </Link>
            </div>
          </Card>
        )}

        {canAssign && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <h2 className="text-xl font-bold text-green-900 mb-4">✓ 全ての必須項目が入力されています</h2>
            <p className="text-green-800 mb-4">
              案件割り振り確定を行うと、エンジニアに案件が表示されます。
            </p>
            <form action={`/api/vaxal/projects/${id}/assign`} method="POST">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                案件割り振り確定
              </Button>
            </form>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">注意事項</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>案件割り振り確定後、ステータスが「注文依頼」に変更されます</li>
            <li>エンジニアが案件を閲覧できるようになります</li>
            <li>確定後も案件情報の編集は可能です</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
