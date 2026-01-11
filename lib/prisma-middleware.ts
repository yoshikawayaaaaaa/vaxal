// JSTとUTCの時差（9時間）
const JST_OFFSET = 9 * 60 * 60 * 1000

/**
 * 日時をJSTからUTCに変換（保存時）
 */
function convertJSTtoUTC(date: Date): Date {
  return new Date(date.getTime() - JST_OFFSET)
}

/**
 * 日時をUTCからJSTに変換（取得時）
 */
function convertUTCtoJST(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET)
}

/**
 * オブジェクト内の全てのDateフィールドを変換
 */
function convertDatesInObject(obj: any, converter: (date: Date) => Date): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Date) {
    return converter(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesInObject(item, converter))
  }

  if (typeof obj === 'object') {
    const converted: any = {}
    for (const key in obj) {
      converted[key] = convertDatesInObject(obj[key], converter)
    }
    return converted
  }

  return obj
}

/**
 * Prismaミドルウェア: JSTで保存・取得するための変換処理
 */
export const jstMiddleware = async (params: any, next: any) => {
  // 保存時: JSTからUTCに変換
  if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
    if (params.args.data) {
      params.args.data = convertDatesInObject(params.args.data, convertJSTtoUTC)
    }
  }

  if (params.action === 'createMany' || params.action === 'updateMany') {
    if (params.args.data) {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((item: any) =>
          convertDatesInObject(item, convertJSTtoUTC)
        )
      } else {
        params.args.data = convertDatesInObject(params.args.data, convertJSTtoUTC)
      }
    }
  }

  // クエリ実行
  const result = await next(params)

  // 取得時: UTCからJSTに変換
  if (result) {
    return convertDatesInObject(result, convertUTCtoJST)
  }

  return result
}
