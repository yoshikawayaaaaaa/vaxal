'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/forms/file-upload'

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
  const router = useRouter()
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/vaxal/projects/${id}/detail`)
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

  useEffect(() => {
    fetchProject()
  }, [id])

  const handleDelete = async (fileId: string) => {
    if (!confirm('このファイルを削除しますか？')) return

    setDeleting(fileId)

    try {
      const response = await fetch(
        `/api/vaxal/projects/${id}/files?fileId=${fileId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      await fetchProject()
      alert('ファイルを削除しました')
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>プロジェクトが見つかりません</p>
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
        <ProjectDetailTabs projectId={id} activeTab="detail" userType="vaxal" />

        <div className="space-y-4 md:space-y-6">
          {/* 現場フォルダ */}
          <Card>
            <CardHeader>
              <CardTitle>現場フォルダ（地図等）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                projectId={id}
                category="SITE_FOLDER"
                onUploadSuccess={fetchProject}
              />

              {siteFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {siteFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2 relative">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.mimeType.startsWith('image/') ? (
                          <div className="relative w-full h-32">
                            <Image
                              src={file.fileUrl}
                              alt={file.fileName}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover rounded cursor-pointer hover:opacity-80"
                            />
                          </div>
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
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={deleting === file.id}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting === file.id ? '...' : '×'}
                      </button>
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
              <CardTitle>手配フォルダ（図面、施主が撮った現場写真等）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                projectId={id}
                category="ARRANGEMENT_FOLDER"
                onUploadSuccess={fetchProject}
              />

              {arrangementFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {arrangementFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-2 relative">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.mimeType.startsWith('image/') ? (
                          <div className="relative w-full h-32">
                            <Image
                              src={file.fileUrl}
                              alt={file.fileName}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover rounded cursor-pointer hover:opacity-80"
                            />
                          </div>
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
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={deleting === file.id}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting === file.id ? '...' : '×'}
                      </button>
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
        </div>
      </div>
    </div>
  )
}
