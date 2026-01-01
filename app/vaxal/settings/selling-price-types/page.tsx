'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SellingPriceType {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SellingPriceTypesPage() {
  const [types, setTypes] = useState<SellingPriceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTypeName, setNewTypeName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/vaxal/selling-price-types')
      if (response.ok) {
        const data = await response.json()
        setTypes(data)
      } else {
        setError('売価タイプの取得に失敗しました')
      }
    } catch (err) {
      setError('売価タイプの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newTypeName.trim()) {
      setError('売価タイプ名を入力してください')
      return
    }

    setIsAdding(true)
    setError('')

    try {
      const response = await fetch('/api/vaxal/selling-price-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTypeName,
          displayOrder: types.length + 1,
        }),
      })

      if (response.ok) {
        setNewTypeName('')
        await fetchTypes()
      } else {
        const data = await response.json()
        setError(data.error || '売価タイプの追加に失敗しました')
      }
    } catch (err) {
      setError('売価タイプの追加に失敗しました')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/vaxal/selling-price-types/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        await fetchTypes()
      } else {
        setError('ステータスの更新に失敗しました')
      }
    } catch (err) {
      setError('ステータスの更新に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この売価タイプを削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/vaxal/selling-price-types/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTypes()
      } else {
        setError('売価タイプの削除に失敗しました')
      }
    } catch (err) {
      setError('売価タイプの削除に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">売価タイプ管理</h1>
        <p className="text-gray-600 mt-2">
          注文フォームで使用する売価タイプを管理します
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* 新規追加フォーム */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新しい売価タイプを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="newTypeName">売価タイプ名</Label>
              <Input
                id="newTypeName"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="例: 新しい販売チャネル"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAdd()
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAdd}
                disabled={isAdding}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAdding ? '追加中...' : '追加'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 売価タイプ一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>登録済み売価タイプ</CardTitle>
        </CardHeader>
        <CardContent>
          {types.length === 0 ? (
            <p className="text-gray-500">売価タイプが登録されていません</p>
          ) : (
            <div className="space-y-3">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 w-8">
                      #{type.displayOrder}
                    </div>
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-gray-500">
                        {type.isActive ? (
                          <span className="text-green-600">✓ 有効</span>
                        ) : (
                          <span className="text-gray-400">無効</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleActive(type.id, type.isActive)}
                      variant="outline"
                      size="sm"
                    >
                      {type.isActive ? '無効化' : '有効化'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(type.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
