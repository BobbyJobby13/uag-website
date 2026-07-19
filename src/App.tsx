import { useState, type ComponentType } from 'react'
import {
  Home,
  Info,
  Landmark,
  Building2,
  CreditCard,
  Gavel,
  Wrench,
  Briefcase,
  Dice5,
  Wheat,
  BarChart3,
  ShoppingBag,
  Code,
  DollarSign,
  ChevronDown,
} from 'lucide-react'

type NavItem = {
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home },
  { label: 'About Us', icon: Info },
  { label: 'Banking', icon: Landmark },
  { label: 'Real Estate', icon: Building2 },
  { label: 'Accounts', icon: CreditCard },
  { label: 'Legal', icon: Gavel },
  { label: 'Construction', icon: Wrench },
  { label: 'Escrow', icon: Briefcase },
  { label: 'Casino', icon: Dice5 },
  { label: 'Commodities', icon: Wheat },
  { label: 'Stock Exchanges', icon: BarChart3 },
  { label: 'DC Store', icon: ShoppingBag },
  { label: 'Dev Services', icon: Code },
  { label: 'Capital & Funds', icon: DollarSign },
]

type OverviewCard = {
  label: string
  value: string
  change: string
  positive: boolean
}

const overview: OverviewCard[] = [
  { label: 'Portfolio value', value: '$0.00', change: '+0.0%', positive: true },
  { label: 'Total balance', value: '$0.00', change: '+0.0%', positive: true },
  { label: 'Total spent', value: '$0.00', change: '-0.0%', positive: false },
]

const assets = [
  { name: 'Primary Residence', category: 'Real Estate', value: '$0.00', change: '+0.0%' },
  { name: 'Investment Portfolio', category: 'Stocks & Funds', value: '$0.00', change: '+0.0%' },
]

const transactions = [
  { date: 'May 5, 2026', description: 'Example', status: 'Completed', amount: '+$0.00' },
]

function App() {
  const [activeNav, setActiveNav] = useState('Home')
  const [action, setAction] = useState<'deposit' | 'withdraw'>('withdraw')

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0c0f] text-[#f3f4f6]">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-[#1e2028] bg-[#111217]">
        <div className="p-6">
          <div className="text-lg font-bold tracking-tight text-white">Utterly Amazing Group</div>
          <div className="mt-1 text-xs font-medium text-[#6b7280]">Dashboard</div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeNav === item.label
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setActiveNav(item.label)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#1f2129] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:bg-[#181a20] hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-[#1e2028] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#181a20] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              d
            </div>
            <div>
              <div className="text-sm font-semibold text-white">dert</div>
              <div className="text-xs text-[#6b7280]">@donutsmp123123</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Good morning, dert</h1>
              <p className="mt-1 text-sm text-[#9ca3af]">Here's what's happening with your portfolio today.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAction('deposit')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  action === 'deposit'
                    ? 'bg-[#3b82f6] text-white shadow'
                    : 'bg-[#181a20] text-[#9ca3af] hover:text-white'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setAction('withdraw')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  action === 'withdraw'
                    ? 'bg-[#3b82f6] text-white shadow'
                    : 'bg-[#181a20] text-[#9ca3af] hover:text-white'
                }`}
              >
                Withdraw
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#181a20] px-3 py-2 text-sm font-medium text-[#9ca3af] transition hover:text-white"
              >
                Last month
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Overview
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {overview.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#1e2028] bg-[#15161b] p-5 transition hover:border-[#2a2d37]"
                >
                  <p className="text-xs text-[#9ca3af]">{card.label}</p>
                  <div className="mt-1 text-2xl font-semibold text-white">{card.value}</div>
                  <div
                    className={`mt-1 text-xs font-medium ${
                      card.positive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {card.change} from last month
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Assets</h2>
            <div className="overflow-hidden rounded-xl border border-[#1e2028]">
              <table className="w-full text-sm">
                <thead className="bg-[#15161b] text-[#9ca3af]">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Asset</th>
                    <th className="px-5 py-3 text-left font-medium">Category</th>
                    <th className="px-5 py-3 text-left font-medium">Value</th>
                    <th className="px-5 py-3 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2028] bg-[#111217]">
                  {assets.map((asset) => (
                    <tr key={asset.name} className="transition hover:bg-[#181a20]">
                      <td className="px-5 py-4 font-medium text-white">{asset.name}</td>
                      <td className="px-5 py-4 text-[#9ca3af]">{asset.category}</td>
                      <td className="px-5 py-4 text-white">{asset.value}</td>
                      <td className="px-5 py-4 text-emerald-400">{asset.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Recent transactions</h2>
            <div className="overflow-hidden rounded-xl border border-[#1e2028]">
              <table className="w-full text-sm">
                <thead className="bg-[#15161b] text-[#9ca3af]">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Date</th>
                    <th className="px-5 py-3 text-left font-medium">Description</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2028] bg-[#111217]">
                  {transactions.map((tx) => (
                    <tr key={`${tx.date}-${tx.description}`} className="transition hover:bg-[#181a20]">
                      <td className="px-5 py-4 text-[#9ca3af]">{tx.date}</td>
                      <td className="px-5 py-4 text-white">{tx.description}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white">{tx.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
