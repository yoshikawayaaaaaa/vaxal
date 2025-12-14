'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Link as LinkIcon, 
  Image, 
  ClipboardList 
} from 'lucide-react'

interface SidebarProps {
  companyName?: string
  userRole?: string
  isVaxalAdmin?: boolean
}

export function Sidebar({ companyName = 'MIAMU TIGERS', userRole = 'エンジニア', isVaxalAdmin = false }: SidebarProps) {
  const pathname = usePathname()

  // メニュー項目
  const menuItems = isVaxalAdmin ? [
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
      title: '月次管理',
      href: '/vaxal/monthly',
      icon: ClipboardList,
    },
  ] : [
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
  ]

  return (
    <div className="w-60 bg-gradient-to-b from-gray-800 to-gray-900 text-white min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{companyName}</h2>
            <p className="text-xs text-gray-400">{userRole}</p>
          </div>
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
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
