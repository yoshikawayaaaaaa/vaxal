'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Company {
  id: string
  companyName: string
}

interface CompanyFilterProps {
  companies: Company[]
}

export function CompanyFilter({ companies }: CompanyFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyFilter = searchParams.get('company') || ''

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompany = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (newCompany) {
      params.set('company', newCompany)
    } else {
      params.delete('company')
    }
    
    router.push(`/vaxal/calendar?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="company-select" className="text-sm font-medium text-gray-700">
        会社:
      </label>
      <select
        id="company-select"
        value={companyFilter}
        onChange={handleCompanyChange}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">全社</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.companyName}
          </option>
        ))}
      </select>
    </div>
  )
}
