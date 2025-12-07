'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ProjectDetailTabsProps {
  projectId: string
  activeTab?: string
  userType?: 'vaxal' | 'engineer'
}

export function ProjectDetailTabs({ 
  projectId, 
  activeTab = 'basic',
  userType = 'vaxal'
}: ProjectDetailTabsProps) {
  const basePath = userType === 'engineer' ? '/engineer/project' : '/vaxal/project'
  
  const tabs = userType === 'engineer' 
    ? [
        { id: 'basic', label: '基本情報', href: `${basePath}/${projectId}` },
        { id: 'main-info', label: '主要情報', href: `${basePath}/${projectId}/main-info` },
        { id: 'detail', label: '詳細情報', href: `${basePath}/${projectId}/detail` },
        { id: 'report', label: '報告', href: `${basePath}/${projectId}/report` },
      ]
    : [
        { id: 'basic', label: '基本情報', href: `${basePath}/${projectId}` },
        { id: 'main-info', label: '主要情報', href: `${basePath}/${projectId}/main-info` },
        { id: 'related', label: '関連情報', href: `${basePath}/${projectId}/related` },
        { id: 'detail', label: '詳細情報', href: `${basePath}/${projectId}/detail` },
      ]

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
