'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
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
  X,
  Users,
  Calendar
} from 'lucide-react'

interface DashboardHeaderProps {
  userName?: string
  userType?: 'vaxal' | 'engineer'
  isVaxalAdmin?: boolean
  accountType?: string
  unreadCount?: number
  companyName?: string
  engineerRole?: string
}

export function DashboardHeader({ 
  userName,
  userType = 'vaxal',
  isVaxalAdmin = false,
  accountType,
  unreadCount = 0,
  companyName,
  engineerRole
}: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // メニュー項目
  const menuItems = isVaxalAdmin ? (
    accountType === 'CALL_CENTER' ? [
      {
        title: '注文受付',
        href: '/vaxal/orders/new',
        icon: LayoutDashboard,
      },
    ] : [
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
    // マスターアカウントのみスタッフ状況とスタッフ管理を表示
    ...(engineerRole === 'MASTER' ? [
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

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ログアウト
            </Button>

            {userName && (
              <a
                href={userType === 'engineer' ? '/engineer/profile' : '/vaxal/profile'}
                className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors cursor-pointer"
                title="プロフィール"
              >
                <span className="text-sm font-medium text-gray-700">
                  {userName.charAt(0)}
                </span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* サイドバー */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center",
                  userType === 'engineer' ? "bg-green-600" : "bg-purple-600"
                )}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">
                    {userType === 'engineer' && companyName ? companyName : 'VAXAL'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {userType === 'engineer' && engineerRole 
                      ? (engineerRole === 'MASTER' ? 'マスター' : '一般')
                      : 'VAXAL社員'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* メニュー */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                          isActive
                            ? userType === 'engineer' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'
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
          </div>
        </div>
      )}
    </>
  )
}
