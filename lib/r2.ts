import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// R2クライアントの初期化
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

/**
 * プリサインドURLを生成（クライアントから直接R2にアップロード用）
 * @param key R2内のファイルパス（例: "reports/123456_image.webp"）
 * @param contentType ファイルのMIMEタイプ
 * @returns プリサインドURLと公開URL
 */
export async function generatePresignedUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })

  // 5分間有効なプリサインドURLを生成
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 })
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

  return { uploadUrl, publicUrl }
}

/**
 * R2にファイルをアップロード（サーバーサイド用・後方互換性のため残す）
 * @param file アップロードするファイル
 * @param key R2内のファイルパス（例: "projects/123456_image.png"）
 * @returns 公開URL
 */
export async function uploadToR2(
  file: File,
  key: string
): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  })

  await r2Client.send(command)

  // 公開URLを返す
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * R2からファイルを削除
 * @param key R2内のファイルパス
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * URLからR2のキーを抽出
 * @param url 公開URL
 * @returns R2のキー
 */
export function extractKeyFromUrl(url: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL!
  return url.replace(`${publicUrl}/`, '')
}
