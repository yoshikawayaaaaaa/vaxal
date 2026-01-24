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
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

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

  // HEIC形式を検出する関数
  const isHEICFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase()
    return fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif'
  }

  // HEIC形式をJPEGに変換する関数
  const convertHEICToJPEG = async (file: File): Promise<File> => {
    try {
      console.log(`HEIC変換開始: ${file.name}`)
      
      // heic2anyを動的にインポート
      const heic2any = (await import('heic2any')).default
      
      // heic2anyでJPEGに変換
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      })

      // 配列の場合は最初の要素を使用
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
      
      // 新しいファイル名を生成
      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
      const convertedFile = new File([blob], newFileName, { type: 'image/jpeg' })
      
      console.log(`HEIC変換完了: ${file.name} → ${newFileName} (${(convertedFile.size / 1024 / 1024).toFixed(2)}MB)`)
      
      return convertedFile
    } catch (error) {
      console.error('HEIC変換エラー:', error)
      throw new Error('HEIC形式の変換に失敗しました。別の形式の画像をお試しください。')
    }
  }

  const compressImage = async (file: File): Promise<File> => {
    // HEIC形式の場合は先に変換
    let processFile = file
    if (isHEICFile(file)) {
      try {
        processFile = await convertHEICToJPEG(file)
      } catch (error) {
        throw error // HEIC変換エラーを上位に伝播
      }
    }

    // 画像ファイルでない場合はそのまま返す
    if (!processFile.type.startsWith('image/')) {
      return processFile
    }

    const options = {
      maxSizeMB: 0.3, // 最大300KBに圧縮
      maxWidthOrHeight: 1920, // 最大幅/高さ
      useWebWorker: true, // Web Workerを使用してパフォーマンス向上
      fileType: 'image/webp', // WebP形式に変換
      initialQuality: 0.8, // 初期品質を80%に設定
    }

    try {
      const compressedFile = await imageCompression(processFile, options)
      // ファイル名を.webpに変更
      const newFileName = processFile.name.replace(/\.[^/.]+$/, '.webp')
      const result = new File([compressedFile], newFileName, { type: 'image/webp' })
      
      console.log(`圧縮完了: ${processFile.name} (${(processFile.size / 1024 / 1024).toFixed(2)}MB) → ${newFileName} (${(result.size / 1024 / 1024).toFixed(2)}MB)`)
      
      return result
    } catch (error) {
      console.error('画像圧縮エラー:', error)
      // 圧縮に失敗した場合は元のファイルを返す
      return processFile
    }
  }

  // R2に直接アップロードする関数
  const uploadToR2Direct = async (file: File): Promise<string> => {
    // プリサインドURLを取得
    const presignedResponse = await fetch('/api/vaxal/projects/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    })

    if (!presignedResponse.ok) {
      throw new Error('プリサインドURLの取得に失敗しました')
    }

    const { uploadUrl, publicUrl } = await presignedResponse.json()

    // R2に直接アップロード
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error('画像のアップロードに失敗しました')
    }

    return publicUrl
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setCompressing(true)

    try {
      // 全ての画像を圧縮（HEIC変換を含む）
      const compressedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          try {
            return await compressImage(file)
          } catch (error) {
            if (error instanceof Error) {
              setError(error.message)
            }
            throw error
          }
        })
      )
      
      setCompressing(false)

      // R2に直接アップロード
      const urls = await Promise.all(
        compressedFiles.map(async (file) => {
          try {
            return await uploadToR2Direct(file)
          } catch (error) {
            console.error('R2アップロードエラー:', error)
            throw error
          }
        })
      )

      setUploadedUrls(urls)

      // データベースに保存
      const response = await fetch(`/api/vaxal/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          fileUrls: urls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('アップロードエラー:', errorData)
        throw new Error(errorData.error || 'アップロードに失敗しました')
      }

      setSelectedFiles([])
      setUploadedUrls([])
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
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              {selectedFiles.length}個のファイルを選択中（最大{MAX_FILES}枚まで）
            </p>
            <p className="text-xs text-gray-500">
              ※1回のアップロードは合計4MB以下を推奨
            </p>
          </div>
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
