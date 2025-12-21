// 工事内容のラベル
export const WORK_CONTENT_LABELS: Record<string, string> = {
  ECO_CUTE: 'エコキュート',
  GAS_WATER_HEATER: 'ガス給湯器',
  ELECTRIC_HEATER: '電気温水器',
  BATHROOM_DRYER: '浴室乾燥機',
  SOLAR_PANEL: '太陽光パネル',
  OTHER: 'その他',
}

// 工事種別のラベル
export const WORK_TYPE_LABELS: Record<string, string> = {
  NEW_INSTALLATION: '新設',
  REFORM: 'リフォーム',
  REPLACEMENT: '交換',
}

// 建物区分のラベル
export const BUILDING_TYPE_LABELS: Record<string, string> = {
  DETACHED_HOUSE: '戸建て',
  MANSION: 'マンション',
  APARTMENT: 'アパート',
  OTHER: 'その他',
}

// 支払い方法のラベル
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: '現金',
  CARD: 'カード',
  LOAN: 'ローン',
  BANK_TRANSFER: '銀行振込',
  ELECTRONIC_MONEY: '電子マネー',
}

// ステータスのラベル (1=注文仮登録, 2=注文本登録, 3=注文完了確認, 4=完了, 5=残工事あり)
export const STATUS_LABELS: Record<string, string> = {
  PENDING: '注文仮登録',
  ASSIGNED: '注文本登録',
  REPORTED: '注文完了確認',
  COMPLETED: '完了',
  REMAINING_WORK: '残工事あり',
}

// ステータスの色
export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  REPORTED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REMAINING_WORK: 'bg-orange-100 text-orange-800',
}

// ステータスの数値マッピング
export const STATUS_TO_NUMBER: Record<string, number> = {
  PENDING: 1,
  ASSIGNED: 2,
  REPORTED: 3,
  COMPLETED: 4,
  REMAINING_WORK: 5,
}
