import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DetailInfoPage({
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
      files: true,
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

  // ファイルをカテゴリ別に分類
  const siteFiles = project.files.filter((f) => f.category === 'SITE_FOLDER')
  const arrangementFiles = project.files.filter(
    (f) => f.category === 'ARRANGEMENT_FOLDER'
  )

  // VAXAL社員かどうかを判定
  const isVaxalAdmin = session.user.role === 'VAXAL_ADMIN'

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">案件詳細</h1>
          <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="detail" />

        <div className="space-y-6">
          {/* 現場フォルダ */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>現場フォルダ（地図等）</CardTitle>
              {isVaxalAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="bg-gray-100"
                >
                  アップロード（今後実装予定）
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {siteFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {siteFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2 relative">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                      {isVaxalAdmin && (
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          disabled
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">
                    現場フォルダにファイルがまだアップロードされていません
                  </p>
                  {isVaxalAdmin && (
                    <p className="text-sm text-gray-500">
                      ※ ファイルアップロード機能は今後実装予定です
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 手配フォルダ */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>手配フォルダ（図面、施主が撮った現場写真等）</CardTitle>
              {isVaxalAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="bg-gray-100"
                >
                  アップロード（今後実装予定）
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {arrangementFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {arrangementFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2 relative">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.fileName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                      {isVaxalAdmin && (
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          disabled
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">
                    手配フォルダにファイルがまだアップロードされていません
                  </p>
                  {isVaxalAdmin && (
                    <p className="text-sm text-gray-500">
                      ※ ファイルアップロード機能は今後実装予定です
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {!isVaxalAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>注意:</strong>{' '}
                この画面はVAXAL社員がファイルをアップロードする画面です。エンジニアは閲覧のみ可能です。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
