/**
 * 日時ユーティリティ関数
 * UTC保存/JST表示の統一的な管理
 */

import { format, parseISO, startOfDay as startOfDayFns, endOfDay as endOfDayFns } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Asia/Tokyo'

/**
 * UTC DateをJST文字列に変換
 * @param date UTC Date オブジェクト
 * @param formatString フォーマット文字列（デフォルト: yyyy/MM/dd）
 * @returns JST表示の文字列
 */
export function formatToJST(date: Date | string | null | undefined, formatString: string = 'yyyy/MM/dd'): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const jstDate = toZonedTime(dateObj, TIMEZONE)
  
  return format(jstDate, formatString)
}

/**
 * JST文字列をUTC Dateに変換
 * @param dateString JST日時文字列（例: "2024-01-15" or "2024-01-15T10:00:00"）
 * @returns UTC Date オブジェクト
 */
export function parseJSTToUTC(dateString: string): Date {
  // 時刻がない場合は00:00:00を追加
  const dateTimeString = dateString.includes('T') ? dateString : `${dateString}T00:00:00`
  
  // JSTの日時文字列をDateオブジェクトに変換（ローカルタイムゾーンとして解釈される）
  const localDate = new Date(dateTimeString)
  
  // JSTからUTCに変換（9時間引く）
  const utcDate = new Date(localDate.getTime() - 9 * 60 * 60 * 1000)
  
  return utcDate
}

/**
 * JST日付の開始時刻（00:00:00）をUTCで取得
 * @param date JST日付文字列 or Date
 * @returns UTC Date オブジェクト（JST 00:00:00に相当）
 */
export function startOfDayJSTinUTC(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // JSTタイムゾーンで日付を解釈
  const jstDate = toZonedTime(dateObj, TIMEZONE)
  
  // JSTで日の開始時刻を取得
  const startOfDayJST = startOfDayFns(jstDate)
  
  // UTCに変換
  return fromZonedTime(startOfDayJST, TIMEZONE)
}

/**
 * JST日付の終了時刻（23:59:59.999）をUTCで取得
 * @param date JST日付文字列 or Date
 * @returns UTC Date オブジェクト（JST 23:59:59.999に相当）
 */
export function endOfDayJSTinUTC(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // JSTタイムゾーンで日付を解釈
  const jstDate = toZonedTime(dateObj, TIMEZONE)
  
  // JSTで日の終了時刻を取得
  const endOfDayJST = endOfDayFns(jstDate)
  
  // UTCに変換
  return fromZonedTime(endOfDayJST, TIMEZONE)
}

/**
 * 現在のJST日時を取得
 * @returns JST Date オブジェクト
 */
export function nowInJST(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}
