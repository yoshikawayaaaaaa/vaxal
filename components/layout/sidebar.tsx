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
}

export function Sidebar({ companyName = 'MIAMU TIGERS', userRole = 'エンジニア' }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: '注文受付',
      href: '/dashboard/orders/new',
      icon: LayoutDashboard,
      vaxalOnly: true,
    },
    {
      title: '施工主基本情報',
      href: '/dashboard/project',
      icon: LayoutDashboard,
    },
    {
      title: '主要情報',
      href: '/dashboard/main-info',
      icon: FileText,
    },
    {
      title: '関連情報',
      href: '/dashboard/related-info',
      icon: LinkIcon,
    },
    {
      title: '詳細情報',
      href: '/dashboard/detail-info',
      icon: Image,
    },
    {
      title: '報告',
      href: '/dashboard/reports',
      icon: ClipboardList,
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
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            
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
