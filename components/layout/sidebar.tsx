'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Link as LinkIcon, 
  Image, 
  ClipboardList,
  Bell,
  Settings,
  Users,
  X,
  Calendar
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SidebarProps {
  companyName?: string
  userRole?: string
  isVaxalAdmin?: boolean
  accountType?: string
  isEngineerMaster?: boolean
}

export function Sidebar({ companyName = 'MIAMU TIGERS', userRole = 'エンジニア', isVaxalAdmin = false, accountType, isEngineerMaster = false }: SidebarProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 未読通知数を取得
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const notifications = await response.json()
          const unread = notifications.filter((n: any) => !n.isRead).length
          setUnreadCount(unread)
        }
      } catch (error) {
        console.error('通知取得エラー:', error)
      }
    }

    fetchUnreadCount()
    
    // pathnameが変わるたびに再取得
  }, [pathname])

  // メニュー項目
  const menuItems = isVaxalAdmin ? (
    accountType === 'CALL_CENTER' ? [
      // コールセンターユーザーは注文受付のみ
      {
        title: '注文受付',
        href: '/vaxal/orders/new',
        icon: LayoutDashboard,
      },
    ] : [
      // VAXAL社員は全メニュー
      {
        title: '通知',
        href: '/vaxal/notifications',
        icon: Bell,
        badge: unreadCount,
      },
      {
        title: 'カレンダー',
        href: '/vaxal/calendar',
        icon: LayoutDashboard,
      },
      {
        title: '注文受付',
        href: '/vaxal/orders/new',
        icon: LayoutDashboard,
      },
      {
        title: '顧客検索',
        href: '/vaxal/customers',
        icon: FileText,
      },
      {
        title: 'エンジニア検索',
        href: '/vaxal/engineers',
        icon: LinkIcon,
      },
      {
        title: '在庫管理',
        href: '/vaxal/inventory',
        icon: Image,
      },
      {
        title: '月次管理',
        href: '/vaxal/monthly',
        icon: ClipboardList,
      },
      {
        title: '売価タイプ管理',
        href: '/vaxal/settings/selling-price-types',
        icon: Settings,
      },
      {
        title: 'エンジニア評価',
        href: '/vaxal/evaluations',
        icon: Users,
      },
    ]
  ) : [
    {
      title: '通知',
      href: '/engineer/notifications',
      icon: Bell,
      badge: unreadCount,
    },
    {
      title: 'ダッシュボード',
      href: '/engineer',
      icon: LayoutDashboard,
    },
    {
      title: 'カレンダー',
      href: '/engineer/calendar',
      icon: FileText,
    },
    // マスターアカウントのみスタッフ管理とスタッフ状況を表示
    ...(isEngineerMaster ? [
      {
        title: 'スタッフ状況',
        href: '/engineer/staff-status',
        icon: Calendar,
      },
      {
        title: 'スタッフ管理',
        href: '/engineer/staff',
        icon: Users,
      }
    ] : []),
  ]

  const SidebarContent = () => (
    <>
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded flex items-center justify-center",
              isVaxalAdmin ? "bg-purple-600" : "bg-green-600"
            )}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{companyName}</h2>
              <p className="text-xs text-gray-400">{userRole}</p>
            </div>
          </div>
          {/* モバイル用閉じるボタン */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* メニュー */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            // 完全一致のみアクティブにする
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? isVaxalAdmin ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )

  return (
    <>
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:flex w-60 bg-gradient-to-b from-gray-800 to-gray-900 text-white min-h-screen flex-col">
        <SidebarContent />
      </div>

      {/* モバイル用オーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* モバイル用スライドメニュー */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-gray-800 to-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  )
}

// モバイルメニューを開くためのエクスポート関数
export function useSidebarToggle() {
  return { setIsMobileMenuOpen: (open: boolean) => {} }
}
