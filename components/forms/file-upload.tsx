'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  projectId: string
  category: 'SITE_FOLDER' | 'ARRANGEMENT_FOLDER'
  onUploadSuccess: () => void
}

export function FileUpload({ projectId, category, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('category', category)
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/vaxal/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('アップロードに失敗しました')
      }

      setSelectedFiles([])
      onUploadSuccess()
      alert('アップロードが完了しました')
    } catch (error) {
      console.error('Upload error:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
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
        {selectedFiles.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {selectedFiles.length}個のファイルを選択中
          </p>
        )}
      </div>
      <Button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {uploading ? 'アップロード中...' : 'アップロード'}
      </Button>
    </div>
  )
}
