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
    where: { id: parseInt(id) },
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
    project.assignedEngineerId !== parseInt(session.user.id)
  ) {
    redirect('/dashboard')
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">案件番号: {project.projectNumber}</p>
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
          assignedEngineer={project.assignedEngineer ? {
            ...project.assignedEngineer,
            id: String(project.assignedEngineer.id),
            company: project.assignedEngineer.company ? {
              ...project.assignedEngineer.company,
              id: String(project.assignedEngineer.company.id),
            } : null,
            masterCompany: project.assignedEngineer.masterCompany ? {
              ...project.assignedEngineer.masterCompany,
              id: String(project.assignedEngineer.masterCompany.id),
            } : null,
          } : null}
          createdByVaxal={{
            ...project.createdByVaxal,
            id: String(project.createdByVaxal.id),
          }}
          workDate={project.workDate}
        />
      </div>
    </div>
  )
}
