/**
 * デバッグ用: parseJSTToUTCの動作確認
 */

import { parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Asia/Tokyo'

export function parseJSTToUTCDebug(dateString: string): { input: string; parsed: string; jst: string; utc: string; result: Date } {
  console.log('=== parseJSTToUTC Debug ===')
  console.log('Input:', dateString)
  
  // 文字列をパースしてDateオブジェクトを作成
  const parsedDate = parseISO(dateString)
  console.log('Parsed Date:', parsedDate.toISOString())
  
  // JSTタイムゾーンとして解釈
  const jstDate = toZonedTime(parsedDate, TIMEZONE)
  console.log('JST Date:', jstDate.toISOString())
  
  // UTCに変換
  const utcDate = fromZonedTime(jstDate, TIMEZONE)
  console.log('UTC Date:', utcDate.toISOString())
  console.log('===========================')
  
  return {
    input: dateString,
    parsed: parsedDate.toISOString(),
    jst: jstDate.toISOString(),
    utc: utcDate.toISOString(),
    result: utcDate
  }
}

// テスト実行
if (require.main === module) {
  const testDate = '2026-01-20'
  const result = parseJSTToUTCDebug(testDate)
  console.log('\nResult:', result)
}
