import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { NotificationCard } from '@/components/notifications/NotificationCard'

export default async function VaxalNotificationsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?type=vaxal')
  }

  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/dashboard')
  }

  // 通知を取得
  const notifications = await prisma.notification.findMany({
    where: {
      vaxalUserId: session.user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          projectNumber: true,
          siteName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 未読通知数
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">通知</h1>
          <p className="text-gray-600 mt-2">
            未読: {unreadCount}件 / 全{notifications.length}件
          </p>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">通知はありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                baseUrl="/vaxal"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
