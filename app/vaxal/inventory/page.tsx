'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface InventoryItem {
  id: string
  name: string
  productName: string | null
  manufacturer: string | null
  partNumber: string | null
  unitPrice: number
  unitType: 'PIECE' | 'METER'
  currentStock: number
  threshold: number
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    name: string
    productName: string
    manufacturer: string
    partNumber: string
    unitPrice: number
    unitType: 'PIECE' | 'METER'
    currentStock: number
    threshold: number
  }>({ 
    name: '',
    productName: '', 
    manufacturer: '', 
    partNumber: '', 
    unitPrice: 0, 
    unitType: 'PIECE',
    currentStock: 0, 
    threshold: 0 
  })
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState<{
    name: string
    productName: string
    manufacturer: string
    partNumber: string
    unitPrice: number
    unitType: 'PIECE' | 'METER'
    currentStock: number
    threshold: number
  }>({ 
    name: '', 
    productName: '', 
    manufacturer: '', 
    partNumber: '', 
    unitPrice: 0, 
    unitType: 'PIECE',
    currentStock: 0, 
    threshold: 0 
  })

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
      name: item.name,
      productName: item.productName || '',
      manufacturer: item.manufacturer || '',
      partNumber: item.partNumber || '',
      unitPrice: item.unitPrice,
      unitType: item.unitType,
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      return
    }

    try {
      const response = await fetch(`/api/vaxal/inventory/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchInventory()
        alert('削除しました')
      } else {
        const data = await response.json()
        alert(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/vaxal/inventory/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, direction }),
      })

      if (response.ok) {
        await fetchInventory()
      } else {
        alert('並び替えに失敗しました')
      }
    } catch (error) {
      console.error('並び替えエラー:', error)
      alert('並び替えに失敗しました')
    }
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
        setNewItem({ 
          name: '', 
          productName: '', 
          manufacturer: '', 
          partNumber: '', 
          unitPrice: 0, 
          unitType: 'PIECE',
          currentStock: 0, 
          threshold: 0 
        })
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
    setNewItem({ 
      name: '', 
      productName: '', 
      manufacturer: '', 
      partNumber: '', 
      unitPrice: 0, 
      unitType: 'PIECE',
      currentStock: 0, 
      threshold: 0 
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
          <h1 className="text-3xl font-bold text-gray-900">在庫管理</h1>
          <p className="text-gray-600 mt-2">部材の在庫数と閾値を管理できます</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">総部材数</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{items.length}<span className="text-sm md:text-base">種類</span></div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">正常</div>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {items.filter((item) => item.currentStock > item.threshold).length}<span className="text-sm md:text-base">種類</span>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">要発注</div>
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">
              {items.filter((item) => item.currentStock > 0 && item.currentStock <= item.threshold).length}<span className="text-sm md:text-base">種類</span>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">在庫切れ</div>
            <div className="text-2xl md:text-3xl font-bold text-red-600">
              {items.filter((item) => item.currentStock === 0).length}<span className="text-sm md:text-base">種類</span>
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
          <Card className="p-4 md:p-6 mb-4">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">新しい部材を追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
              <div>
                <Label htmlFor="newName">部材名 *</Label>
                <Input
                  id="newName"
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="例: 配管部材"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newProductName">商品名</Label>
                <Input
                  id="newProductName"
                  type="text"
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  placeholder="例: エコキュート用配管"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newManufacturer">メーカー</Label>
                <Input
                  id="newManufacturer"
                  type="text"
                  value={newItem.manufacturer}
                  onChange={(e) => setNewItem({ ...newItem, manufacturer: e.target.value })}
                  placeholder="例: パナソニック"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPartNumber">品番</Label>
                <Input
                  id="newPartNumber"
                  type="text"
                  value={newItem.partNumber}
                  onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                  placeholder="例: ABC-123"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <Label htmlFor="newUnitPrice">単価 *</Label>
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
                <Label htmlFor="newUnitType">単位 *</Label>
                <select
                  id="newUnitType"
                  className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                  value={newItem.unitType}
                  onChange={(e) => setNewItem({ ...newItem, unitType: e.target.value as 'PIECE' | 'METER' })}
                >
                  <option value="PIECE">個数</option>
                  <option value="METER">メートル</option>
                </select>
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
                <Label htmlFor="newThreshold">閾値 *</Label>
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
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    部材名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メーカー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    品番
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    在庫数
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
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => handleReorder(item.id, 'up')}
                          disabled={index === 0}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 text-xs disabled:opacity-30"
                        >
                          上へ移動
                        </Button>
                        <Button
                          onClick={() => handleReorder(item.id, 'down')}
                          disabled={index === items.length - 1}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 text-xs disabled:opacity-30"
                        >
                          下へ移動
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === item.id ? (
                        <Input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          placeholder="部材名"
                          className="w-32"
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {editingId === item.id ? (
                        <Input
                          type="text"
                          value={editValues.productName}
                          onChange={(e) => setEditValues({ ...editValues, productName: e.target.value })}
                          placeholder="商品名"
                          className="w-32"
                        />
                      ) : (
                        <span>{item.productName || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {editingId === item.id ? (
                        <Input
                          type="text"
                          value={editValues.manufacturer}
                          onChange={(e) => setEditValues({ ...editValues, manufacturer: e.target.value })}
                          placeholder="メーカー"
                          className="w-32"
                        />
                      ) : (
                        <span>{item.manufacturer || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {editingId === item.id ? (
                        <Input
                          type="text"
                          value={editValues.partNumber}
                          onChange={(e) => setEditValues({ ...editValues, partNumber: e.target.value })}
                          placeholder="品番"
                          className="w-32"
                        />
                      ) : (
                        <span>{item.partNumber || '-'}</span>
                      )}
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
                        <select
                          className="w-24 h-8 px-2 rounded-md border border-gray-300"
                          value={editValues.unitType}
                          onChange={(e) => setEditValues({ ...editValues, unitType: e.target.value as 'PIECE' | 'METER' })}
                        >
                          <option value="PIECE">個数</option>
                          <option value="METER">メートル</option>
                        </select>
                      ) : (
                        <span>{item.unitType === 'PIECE' ? '個数' : 'メートル'}</span>
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
                      ) : item.currentStock <= item.threshold ? (
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                          >
                            編集
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                          >
                            削除
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </div>

        {/* スマートフォン用カードレイアウト */}
        <div className="md:hidden space-y-3">
          {items.map((item, index) => (
            <Card key={item.id} className="p-4">
              {editingId === item.id ? (
                // 編集モード
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 mb-3">{item.name}を編集</h3>
                  
                  <div>
                    <Label htmlFor={`edit-name-${item.id}`} className="text-xs">部材名</Label>
                    <Input
                      id={`edit-name-${item.id}`}
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      placeholder="部材名"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`edit-productName-${item.id}`} className="text-xs">商品名</Label>
                    <Input
                      id={`edit-productName-${item.id}`}
                      type="text"
                      value={editValues.productName}
                      onChange={(e) => setEditValues({ ...editValues, productName: e.target.value })}
                      placeholder="商品名"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`edit-manufacturer-${item.id}`} className="text-xs">メーカー</Label>
                      <Input
                        id={`edit-manufacturer-${item.id}`}
                        type="text"
                        value={editValues.manufacturer}
                        onChange={(e) => setEditValues({ ...editValues, manufacturer: e.target.value })}
                        placeholder="メーカー"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-partNumber-${item.id}`} className="text-xs">品番</Label>
                      <Input
                        id={`edit-partNumber-${item.id}`}
                        type="text"
                        value={editValues.partNumber}
                        onChange={(e) => setEditValues({ ...editValues, partNumber: e.target.value })}
                        placeholder="品番"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`edit-unitPrice-${item.id}`} className="text-xs">単価</Label>
                      <Input
                        id={`edit-unitPrice-${item.id}`}
                        type="number"
                        value={editValues.unitPrice === 0 ? '' : editValues.unitPrice}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            unitPrice: e.target.value === '' ? 0 : parseInt(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="mt-1"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-unitType-${item.id}`} className="text-xs">単位</Label>
                      <select
                        id={`edit-unitType-${item.id}`}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                        value={editValues.unitType}
                        onChange={(e) => setEditValues({ ...editValues, unitType: e.target.value as 'PIECE' | 'METER' })}
                      >
                        <option value="PIECE">個数</option>
                        <option value="METER">メートル</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`edit-currentStock-${item.id}`} className="text-xs">在庫数</Label>
                      <Input
                        id={`edit-currentStock-${item.id}`}
                        type="number"
                        value={editValues.currentStock === 0 ? '' : editValues.currentStock}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            currentStock: e.target.value === '' ? 0 : parseInt(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="mt-1"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-threshold-${item.id}`} className="text-xs">閾値</Label>
                      <Input
                        id={`edit-threshold-${item.id}`}
                        type="number"
                        value={editValues.threshold === 0 ? '' : editValues.threshold}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            threshold: e.target.value === '' ? 0 : parseInt(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="mt-1"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave(item.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      保存
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{item.productName || '-'}</p>
                    </div>
                    <div>
                      {item.currentStock === 0 ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          在庫切れ
                        </span>
                      ) : item.currentStock <= item.threshold ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          要発注
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          正常
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-600">メーカー:</span>
                      <span className="ml-1 text-gray-900">{item.manufacturer || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">品番:</span>
                      <span className="ml-1 text-gray-900">{item.partNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">単価:</span>
                      <span className="ml-1 text-gray-900">¥{item.unitPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">単位:</span>
                      <span className="ml-1 text-gray-900">{item.unitType === 'PIECE' ? '個数' : 'メートル'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">在庫数:</span>
                      <span className="ml-1 text-gray-900 font-bold">{item.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">閾値:</span>
                      <span className="ml-1 text-gray-900">{item.threshold}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReorder(item.id, 'up')}
                        disabled={index === 0}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs disabled:opacity-30"
                      >
                        上へ移動
                      </Button>
                      <Button
                        onClick={() => handleReorder(item.id, 'down')}
                        disabled={index === items.length - 1}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs disabled:opacity-30"
                      >
                        下へ移動
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        編集
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
