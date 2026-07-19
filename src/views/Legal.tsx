import { useState } from 'react'
import { Scale, Briefcase, Building2, Shield } from 'lucide-react'
import { Panel } from '../components/Panel'

type Tab = 'Legal' | 'Finance' | 'Realty'

const tabs: { id: Tab; label: string; icon: typeof Scale }[] = [
  { id: 'Legal', label: 'Legal', icon: Scale },
  { id: 'Finance', label: 'Finance', icon: Briefcase },
  { id: 'Realty', label: 'Realty', icon: Building2 },
]

const services: Record<Tab, string[]> = {
  Legal: ['Contract review', 'Corporate counsel', 'Dispute automation', 'Compliance checks'],
  Finance: ['Tax planning', 'Audit automation', 'Treasury management', 'Invoicing'],
  Realty: ['Title checks', 'Lease management', 'Property compliance', 'Escrow coordination'],
}

export function Legal() {
  const [active, setActive] = useState<Tab>('Legal')

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Legal, Finance & Realty</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Connected service tabs for legal, finance and realty operations.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#1e2028] bg-[#111217] p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-[#2a2c35] text-white shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services[active].map((service) => (
          <Panel key={service}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#181a20]">
              <Shield size={18} className="text-blue-400" />
            </div>
            <div className="text-sm font-semibold text-white">{service}</div>
            <div className="mt-1 text-xs text-[#9ca3af]">Connected to UAG portal</div>
          </Panel>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[#1e2028] bg-[#111217] p-6">
        <h2 className="mb-2 font-semibold text-white">Connected Partners</h2>
        <p className="text-sm text-[#9ca3af]">
          Legal, finance and realty tabs are wired into the UAG backend. Staff can
          request documents, trigger escrow, and manage compliance from one place.
        </p>
      </div>
    </div>
  )
}
