'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface InventoryItem {
  id: string
  name: string
  unitPrice: number
  currentStock: number
  threshold: number
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    unitPrice: number
    currentStock: number
    threshold: number
  }>({ unitPrice: 0, currentStock: 0, threshold: 0 })
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState<{
    name: string
    unitPrice: number
    currentStock: number
    threshold: number
  }>({ name: '', unitPrice: 0, currentStock: 0, threshold: 0 })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/vaxal/inventory')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('在庫取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditValues({
      unitPrice: item.unitPrice,
      currentStock: item.currentStock,
      threshold: item.threshold,
    })
  }

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/vaxal/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editValues),
      })

      if (response.ok) {
        await fetchInventory()
        setEditingId(null)
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleAddNew = async () => {
    if (!newItem.name.trim()) {
      alert('部材名を入力してください')
      return
    }

    try {
      const response = await fetch('/api/vaxal/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      })

      if (response.ok) {
        await fetchInventory()
        setIsAdding(false)
        setNewItem({ name: '', unitPrice: 0, currentStock: 0, threshold: 0 })
      } else {
        alert('追加に失敗しました')
      }
    } catch (error) {
      console.error('追加エラー:', error)
      alert('追加に失敗しました')
    }
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewItem({ name: '', unitPrice: 0, currentStock: 0, threshold: 0 })
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
          <h1 className="text-3xl font-bold text-gray-900">在庫管理</h1>
          <p className="text-gray-600 mt-2">部材の在庫数と閾値を管理できます</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">総部材数</div>
            <div className="text-3xl font-bold text-gray-900">{items.length}種類</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">正常</div>
            <div className="text-3xl font-bold text-green-600">
              {items.filter((item) => item.currentStock > item.threshold * 0.3).length}種類
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">要発注</div>
            <div className="text-3xl font-bold text-yellow-600">
              {items.filter((item) => item.currentStock > 0 && item.currentStock <= item.threshold * 0.3).length}種類
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">在庫切れ</div>
            <div className="text-3xl font-bold text-red-600">
              {items.filter((item) => item.currentStock === 0).length}種類
            </div>
          </Card>
        </div>

        {/* 新規追加ボタン */}
        <div className="mb-4">
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              + 新しい部材を追加
            </Button>
          )}
        </div>

        {/* 新規追加フォーム */}
        {isAdding && (
          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">新しい部材を追加</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="newName">部材名</Label>
                <Input
                  id="newName"
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="例: 新部材"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newUnitPrice">単価</Label>
                <Input
                  id="newUnitPrice"
                  type="number"
                  value={newItem.unitPrice === 0 ? '' : newItem.unitPrice}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      unitPrice: e.target.value === '' ? 0 : parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="newCurrentStock">現在の在庫数</Label>
                <Input
                  id="newCurrentStock"
                  type="number"
                  value={newItem.currentStock === 0 ? '' : newItem.currentStock}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      currentStock: e.target.value === '' ? 0 : parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="newThreshold">閾値</Label>
                <Input
                  id="newThreshold"
                  type="number"
                  value={newItem.threshold === 0 ? '' : newItem.threshold}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      threshold: e.target.value === '' ? 0 : parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleAddNew}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                追加
              </Button>
              <Button
                onClick={handleCancelAdd}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                キャンセル
              </Button>
            </div>
          </Card>
        )}

        {/* 在庫一覧 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    部材名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    現在の在庫数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    閾値
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={editValues.unitPrice === 0 ? '' : editValues.unitPrice}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              unitPrice: e.target.value === '' ? 0 : parseInt(e.target.value),
                            })
                          }
                          placeholder="0"
                          className="w-24"
                          min="0"
                        />
                      ) : (
                        <span>¥{item.unitPrice.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={editValues.currentStock === 0 ? '' : editValues.currentStock}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              currentStock: e.target.value === '' ? 0 : parseInt(e.target.value),
                            })
                          }
                          placeholder="0"
                          className="w-24"
                          min="0"
                        />
                      ) : (
                        <span>{item.currentStock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={editValues.threshold === 0 ? '' : editValues.threshold}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              threshold: e.target.value === '' ? 0 : parseInt(e.target.value),
                            })
                          }
                          placeholder="0"
                          className="w-24"
                          min="0"
                        />
                      ) : (
                        <span>{item.threshold}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.currentStock === 0 ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          在庫切れ
                        </span>
                      ) : item.currentStock <= item.threshold * 0.3 ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          要発注
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(item.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                          >
                            保存
                          </Button>
                          <Button
                            onClick={handleCancel}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-xs"
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                        >
                          編集
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
