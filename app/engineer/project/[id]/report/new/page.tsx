import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ReportForm } from '@/components/forms/report-form'
import Link from 'next/link'

export default async function NewReportPage({
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
  })

  if (!project) {
    notFound()
  }

  // 自分に割り振られた案件かチェック
  if (project.assignedEngineerId !== session.user.id) {
    redirect('/engineer')
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link
            href={`/engineer/project/${id}/report`}
            className="text-blue-600 hover:text-blue-800 mb-3 md:mb-4 inline-block text-sm md:text-base"
          >
            ← 報告一覧に戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">新規報告作成</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">案件番号: {project.projectNumber}</p>
        </div>

        <ReportForm projectId={id} projectNumber={project.projectNumber} />
      </div>
    </div>
  )
}
