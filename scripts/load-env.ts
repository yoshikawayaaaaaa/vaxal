/**
 * 環境変数を読み込むヘルパー
 * .env.local → .env の順で読み込む
 */

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

// .env.local を優先的に読み込む
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

if (existsSync(envLocalPath)) {
  console.log('📄 .env.local を読み込みました')
  config({ path: envLocalPath })
} else if (existsSync(envPath)) {
  console.log('📄 .env を読み込みました')
  config({ path: envPath })
} else {
  console.warn('⚠️  環境変数ファイルが見つかりません')
}
