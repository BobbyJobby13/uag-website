import { DollarSign, TrendingUp, Wallet } from 'lucide-react'
import { Panel } from '../components/Panel'

const tiers = [
  { name: 'Seed Fund', range: '$10k – $250k', focus: 'Startups & early ventures' },
  { name: 'Growth Fund', range: '$250k – $5M', focus: 'Scaling operations' },
  { name: 'Legacy Fund', range: '$5M+', focus: 'Enterprise & acquisitions' },
]

export function Capital() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Capital & Funds</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Invest with our Capital Fund and manage allocation across portfolios.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Fund Tiers</h2>
          </div>
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="flex items-center justify-between rounded-lg bg-[#181a20] p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{tier.name}</div>
                  <div className="text-xs text-[#9ca3af]">{tier.focus}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{tier.range}</div>
                  <div className="text-xs text-[#6b7280]">Allocation window</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#181a20]">
            <Wallet size={20} className="text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Your Investment</h2>
          <div className="mt-2 text-2xl font-bold text-white">$0.00</div>
          <div className="mt-1 text-xs text-emerald-400">+0.0% this month</div>
          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <DollarSign size={16} />
            Invest Now
          </button>
        </Panel>
      </div>
    </div>
  )
}
