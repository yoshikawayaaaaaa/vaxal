import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import Link from 'next/link'
import { ConstructionInstructionsCard } from '@/components/engineer/main-info/ConstructionInstructionsCard'
import { ContractorInfoCard } from '@/components/engineer/main-info/ContractorInfoCard'
import { VaxalStaffCard } from '@/components/engineer/main-info/VaxalStaffCard'
import { BuildingInfoCard } from '@/components/engineer/main-info/BuildingInfoCard'
import { ProductInfoCard } from '@/components/engineer/main-info/ProductInfoCard'
import { DeliveryInfoCard } from '@/components/engineer/main-info/DeliveryInfoCard'
import { SurveyInfoCard } from '@/components/engineer/main-info/SurveyInfoCard'
import { ConstructionInfoCard } from '@/components/engineer/main-info/ConstructionInfoCard'

export default async function EngineerMainInfoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/engineer')
  
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
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link
            href="/engineer"
            className="text-blue-600 hover:text-blue-800 mb-3 md:mb-4 inline-block text-sm md:text-base"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="main-info" userType="engineer" />

        {!mainInfo ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 text-center">
            <p className="text-sm md:text-base text-yellow-800">主要情報はまだ登録されていません。</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <ConstructionInstructionsCard constructionNotes={mainInfo.constructionNotes} />
            
            <ContractorInfoCard
              contractorName={mainInfo.contractorName}
              contractorPhone={mainInfo.contractorPhone}
              contractorNotes={mainInfo.contractorNotes}
            />
            
            <VaxalStaffCard
              receptionStaff={mainInfo.receptionStaff}
              receptionStaffPhone={mainInfo.receptionStaffPhone}
              salesStaff={mainInfo.salesStaff}
              salesStaffPhone={mainInfo.salesStaffPhone}
              constructionStaff={mainInfo.constructionStaff}
              constructionStaffPhone={mainInfo.constructionStaffPhone}
              staffNotes={mainInfo.staffNotes}
            />
            
            <BuildingInfoCard
              roofingDate={mainInfo.roofingDate}
              demolitionDate={mainInfo.demolitionDate}
              buildingType={mainInfo.buildingType}
              installationFloor={mainInfo.installationFloor}
              keyboxNumber={mainInfo.keyboxNumber}
              storageLocation={mainInfo.storageLocation}
              installationLocation={mainInfo.installationLocation}
              parkingSpace={mainInfo.parkingSpace}
              buildingNotes={mainInfo.buildingNotes}
            />
            
            <ProductInfoCard
              productCategory={mainInfo.productCategory}
              productSeries={mainInfo.productSeries}
              deliveryDate={mainInfo.deliveryDate}
              shipmentDate={mainInfo.shipmentDate}
              productNotes={mainInfo.productNotes}
            />
            
            <DeliveryInfoCard
              deliveryTime={mainInfo.deliveryTime}
              deliverySpecification={mainInfo.deliverySpecification}
              deliveryLocation={mainInfo.deliveryLocation}
              deliveryNotes={mainInfo.deliveryNotes}
            />
            
            <SurveyInfoCard
              surveyRequestDate={mainInfo.surveyRequestDate}
              surveyDate={mainInfo.surveyDate}
              surveyTime={mainInfo.surveyTime}
              surveyCompany={mainInfo.surveyCompany}
              surveyStaff={mainInfo.surveyStaff}
              reSurveyDate={mainInfo.reSurveyDate}
              surveyNotes={mainInfo.surveyNotes}
            />
            
            <ConstructionInfoCard
              constructionDate={mainInfo.constructionDate}
              constructionCompany={mainInfo.constructionCompany}
              constructionStaffName={mainInfo.constructionStaffName}
              constructionPhone={mainInfo.constructionPhone}
              constructionEmail={mainInfo.constructionEmail}
              remainingWorkDate={mainInfo.remainingWorkDate}
              constructionInfoNotes={mainInfo.constructionInfoNotes}
            />
          </div>
        )}
      </div>
    </div>
  )
}
