'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface NotificationCardProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: Date
    project?: {
      id: string
      projectNumber: string
      siteName: string
    } | null
  }
  baseUrl: string
}

export function NotificationCard({ notification, baseUrl }: NotificationCardProps) {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    // 未読の場合は既読にする
    if (!notification.isRead) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId: notification.id,
          }),
        })
      } catch (error) {
        console.error('既読エラー:', error)
      }
    }

    // 在庫関連の通知の場合は在庫管理ページへ移動
    if (notification.type === 'INVENTORY_LOW_STOCK' || notification.type === 'INVENTORY_OUT_OF_STOCK') {
      router.push(`${baseUrl}/inventory`)
      router.refresh()
    }
    // 案件詳細へ移動
    else if (notification.project) {
      router.push(`${baseUrl}/project/${notification.project.id}`)
      router.refresh()
    }
  }

  return (
    <Card
      onClick={handleClick}
      className={`cursor-pointer transition-all hover:shadow-md ${
        !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {!notification.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
              {notification.title}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(notification.createdAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {notification.type === 'REPORT_SUBMITTED' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              報告提出
            </span>
          )}
          {notification.type === 'ORDER_RECEIVED' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              注文受付
            </span>
          )}
          {notification.type === 'PROJECT_ASSIGNED' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              案件割り振り
            </span>
          )}
          {notification.type === 'PROJECT_COMPLETED' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              案件完了
            </span>
          )}
          {notification.type === 'INVENTORY_LOW_STOCK' && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              要発注
            </span>
          )}
          {notification.type === 'INVENTORY_OUT_OF_STOCK' && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              在庫切れ
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{notification.message}</p>
        {notification.project && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {notification.project.projectNumber}
            </p>
            <p className="text-sm text-gray-600">
              {notification.project.siteName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
