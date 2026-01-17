'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import imageCompression from 'browser-image-compression'

interface FileUploadProps {
  projectId: string
  category: 'SITE_FOLDER' | 'ARRANGEMENT_FOLDER'
  onUploadSuccess: () => void
}

const MAX_FILES = 20 // 1回のアップロードで最大20枚まで

export function FileUpload({ projectId, category, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (files.length > MAX_FILES) {
        setError(`一度にアップロードできるファイルは最大${MAX_FILES}枚までです`)
        setSelectedFiles([])
        e.target.value = '' // inputをリセット
        return
      }
      setSelectedFiles(files)
    }
  }

  const compressImage = async (file: File): Promise<File> => {
    // 画像ファイルでない場合はそのまま返す
    if (!file.type.startsWith('image/')) {
      return file
    }

    const options = {
      maxSizeMB: 1, // 最大1MBに圧縮
      maxWidthOrHeight: 1920, // 最大幅/高さ
      useWebWorker: true, // Web Workerを使用してパフォーマンス向上
      fileType: 'image/webp', // WebP形式に変換
    }

    try {
      const compressedFile = await imageCompression(file, options)
      // ファイル名を.webpに変更
      const newFileName = file.name.replace(/\.[^/.]+$/, '.webp')
      return new File([compressedFile], newFileName, { type: 'image/webp' })
    } catch (error) {
      console.error('画像圧縮エラー:', error)
      // 圧縮に失敗した場合は元のファイルを返す
      return file
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setCompressing(true)

    try {
      // 全ての画像を圧縮
      const compressedFiles = await Promise.all(
        selectedFiles.map((file) => compressImage(file))
      )
      
      setCompressing(false)

      const formData = new FormData()
      formData.append('category', category)
      compressedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/vaxal/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('アップロードエラー:', errorData)
        throw new Error(errorData.error || 'アップロードに失敗しました')
      }

      setSelectedFiles([])
      setError('')
      onUploadSuccess()
      alert('アップロードが完了しました')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setUploading(false)
      setCompressing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {error && (
          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        )}
        {selectedFiles.length > 0 && !error && (
          <p className="text-sm text-gray-600 mt-2">
            {selectedFiles.length}個のファイルを選択中（最大{MAX_FILES}枚まで）
          </p>
        )}
      </div>
      <Button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {compressing ? '画像を圧縮中...' : uploading ? 'アップロード中...' : 'アップロード'}
      </Button>
    </div>
  )
}
