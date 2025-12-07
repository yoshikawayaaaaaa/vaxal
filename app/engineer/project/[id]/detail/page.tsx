import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function EngineerDetailInfoPage({
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
      files: true,
    },
  })

  if (!project) {
    notFound()
  }

  // 自分に割り振られた案件かチェック
  if (project.assignedEngineerId !== session.user.id) {
    redirect('/engineer')
  }

  // ファイルをカテゴリ別に分類
  const siteFiles = project.files.filter((f) => f.category === 'SITE_FOLDER')
  const arrangementFiles = project.files.filter(
    (f) => f.category === 'ARRANGEMENT_FOLDER'
  )

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
        <ProjectDetailTabs projectId={id} activeTab="detail" userType="engineer" />

        <div className="space-y-6">
          {/* 現場フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>現場フォルダ（地図等）</CardTitle>
            </CardHeader>
            <CardContent>
              {siteFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {siteFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => window.open(file.fileUrl, '_blank')}
                        />
                      ) : (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-32 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                        >
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </a>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    現場フォルダにファイルがまだアップロードされていません
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 手配フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>手配フォルダ（図面、施主が撮った現場写真等）</CardTitle>
            </CardHeader>
            <CardContent>
              {arrangementFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {arrangementFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => window.open(file.fileUrl, '_blank')}
                        />
                      ) : (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-32 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200"
                        >
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </a>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    手配フォルダにファイルがまだアップロードされていません
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>注意:</strong>{' '}
              この画面はVAXAL社員がアップロードしたファイルを閲覧する画面です。画像をクリックすると拡大表示されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
