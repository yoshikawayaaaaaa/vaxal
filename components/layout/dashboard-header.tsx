'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardHeaderProps {
  title?: string
  userName?: string
}

export function DashboardHeader({ 
  title = 'Project Honeycomb',
  userName 
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ログアウト
          </Button>

          {userName && (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {userName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
