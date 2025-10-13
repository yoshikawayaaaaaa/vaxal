'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProjectDetailTabsProps {
  projectId: string
  activeTab?: string
}

export function ProjectDetailTabs({ projectId, activeTab = 'basic' }: ProjectDetailTabsProps) {
  const tabs = [
    { id: 'basic', label: '施工主基本情報', href: `/dashboard/project/${projectId}` },
    { id: 'main', label: '主要情報', href: `/dashboard/project/${projectId}/main-info` },
    { id: 'related', label: '関連情報', href: `/dashboard/project/${projectId}/related` },
    { id: 'detail', label: '詳細情報', href: `/dashboard/project/${projectId}/detail` },
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
