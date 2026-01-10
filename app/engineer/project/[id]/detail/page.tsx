'use client'

import { use, useEffect, useState } from 'react'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectFile {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  category: string
  createdAt: string
}

interface Project {
  id: string
  projectNumber: string
  files: ProjectFile[]
}

export default function DetailInfoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/engineer/projects/${id}/detail`)
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました')
        }
        const data = await response.json()
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm md:text-base">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm md:text-base">プロジェクトが見つかりません</p>
        </div>
      </div>
    )
  }

  const siteFiles = project.files.filter((f) => f.category === 'SITE_FOLDER')
  const arrangementFiles = project.files.filter(
    (f) => f.category === 'ARRANGEMENT_FOLDER'
  )

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">詳細情報</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">案件番号: {project.projectNumber}</p>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={id} activeTab="detail" userType="engineer" />

        <div className="space-y-4 md:space-y-6">
          {/* 現場フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">現場フォルダ（地図等）</CardTitle>
            </CardHeader>
            <CardContent>
              {siteFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {siteFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.mimeType.startsWith('image/') ? (
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-sm text-gray-500">
                              {file.fileName}
                            </span>
                          </div>
                        )}
                      </a>
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
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
              <CardTitle className="text-lg md:text-xl">手配フォルダ（図面、施主が撮った現場写真等）</CardTitle>
            </CardHeader>
            <CardContent>
              {arrangementFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {arrangementFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.mimeType.startsWith('image/') ? (
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-sm text-gray-500">
                              {file.fileName}
                            </span>
                          </div>
                        )}
                      </a>
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {file.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
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
              この画面はVAXAL社員がファイルをアップロードする画面です。エンジニアは閲覧のみ可能です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
