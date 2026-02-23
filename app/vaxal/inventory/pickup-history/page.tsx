'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PickupHistoryItem {
  id: number
  date: string
  engineerName: string
  companyName: string
  projectNumber: string
  projectId: number | null
  materialName: string
  productName: string | null
  quantity: number
  unitType: 'PIECE' | 'METER'
  unitPrice: number
  totalPrice: number
}

interface Pagination {
  currentPage: number
  perPage: number
  totalCount: number
  totalPages: number
}

export default function PickupHistoryPage() {
  const [items, setItems] = useState<PickupHistoryItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: 20,
    totalCount: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory(1)
  }, [])

  const fetchHistory = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/vaxal/inventory/pickup-history?page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('持ち出し履歴取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchHistory(page)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">部材持ち出し履歴</h1>
          <p className="text-gray-600 mt-2">
            エンジニアによる部材の持ち出し履歴を確認できます（全{pagination.totalCount}件）
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">持ち出し履歴はありません</p>
          </Card>
        ) : (
          <>
            {/* ページネーション */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-30"
                >
                  前へ
                </Button>
                <span className="text-sm text-gray-600">
                  {pagination.currentPage} / {pagination.totalPages} ページ
                </span>
                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-30"
                >
                  次へ
                </Button>
              </div>
            )}

            {/* PC用テーブル */}
            <div className="hidden md:block">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          日時
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          エンジニア名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          会社名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          案件番号
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          部材名
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          数量
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          単価
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          合計
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.engineerName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {item.companyName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {item.projectNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {item.materialName}
                            {item.productName && (
                              <span className="text-gray-400 ml-1 text-xs">({item.productName})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.quantity}{item.unitType === 'PIECE' ? '個' : 'm'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            ¥{item.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            ¥{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* SP用カードレイアウト */}
            <div className="md:hidden space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.materialName}</h3>
                      {item.productName && (
                        <p className="text-xs text-gray-500">{item.productName}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ¥{item.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">日時:</span>
                      <span className="ml-1 text-gray-900">{formatDate(item.date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">エンジニア:</span>
                      <span className="ml-1 text-gray-900">{item.engineerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">会社:</span>
                      <span className="ml-1 text-gray-900">{item.companyName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">案件:</span>
                      <span className="ml-1 text-gray-900">{item.projectNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">数量:</span>
                      <span className="ml-1 text-gray-900">
                        {item.quantity}{item.unitType === 'PIECE' ? '個' : 'm'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">単価:</span>
                      <span className="ml-1 text-gray-900">¥{item.unitPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  )
}
