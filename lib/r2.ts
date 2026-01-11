import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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
 * R2にファイルをアップロード
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
