import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { MainInfoForm } from '@/components/forms/main-info-form'

export default async function MainInfoPage({
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
      mainInfo: true,
      assignedEngineer: {
        include: {
          company: true,
          masterCompany: true,
        },
      },
      createdByVaxal: true,
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="main" />

        {/* 主要情報フォーム */}
        <MainInfoForm
          projectId={id}
          projectNumber={project.projectNumber}
          initialData={project.mainInfo}
          constructionNotesFromProject={project.constructionNotes || undefined}
          contractAmount={project.contractAmount}
          userRole={session.user.role}
          engineerRole={session.user.role === 'ENGINEER' ? session.user.engineerRole : undefined}
          assignedEngineer={project.assignedEngineer}
          createdByVaxal={project.createdByVaxal}
          workDate={project.workDate}
        />
      </div>
    </div>
  )
}
