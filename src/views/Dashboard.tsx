import { useState } from 'react'
import { ChevronDown, Wallet, TrendingUp, DollarSign, CreditCard } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'

type OverviewCard = {
  label: string
  value: string
  change: string
  positive: boolean
  icon: typeof Wallet
  gradient: string
}

const overview: OverviewCard[] = [
  { label: 'Portfolio value', value: '$0.00', change: '+0.0%', positive: true, icon: Wallet, gradient: 'from-indigo-500 to-purple-500' },
  { label: 'Total balance', value: '$0.00', change: '+0.0%', positive: true, icon: CreditCard, gradient: 'from-cyan-500 to-blue-500' },
  { label: 'Total spent', value: '$0.00', change: '-0.0%', positive: false, icon: DollarSign, gradient: 'from-rose-500 to-orange-500' },
]

const assets = [
  { name: 'Primary Residence', category: 'Real Estate', value: '$0.00', change: '+0.0%' },
  { name: 'Investment Portfolio', category: 'Stocks & Funds', value: '$0.00', change: '+0.0%' },
]

const transactions = [
  { date: 'May 5, 2026', description: 'Example', status: 'Completed', amount: '+$0.00' },
]

export function Dashboard() {
  const [action, setAction] = useState<'deposit' | 'withdraw'>('withdraw')
  const { userName } = useDiscordAuth()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-in-up page">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="glow-text text-4xl font-extrabold tracking-tight text-white">
            {greeting}, <span className="gradient-text">{userName ?? 'dert'}</span>
          </h1>
          <p className="mt-2 text-sm text-[#8b92a8]">
            Welcome back to the UAG portal. Here's what's happening with your portfolio today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-[#1c2335] bg-[#0b0f19]/80 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setAction('deposit')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                action === 'deposit'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-[#8b92a8] hover:text-white'
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setAction('withdraw')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                action === 'withdraw'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-[#8b92a8] hover:text-white'
              }`}
            >
              Withdraw
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[#1c2335] bg-[#0b0f19]/80 px-3 py-2.5 text-sm font-medium text-[#8b92a8] transition hover:border-[#2a344e] hover:text-white"
          >
            Last month
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#5d6a87]">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {overview.map((card) => {
            const Icon = card.icon
            return (
              <Panel key={card.label} className="relative overflow-hidden">
                <div className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                  <Icon size={20} />
                </div>
                <p className="text-xs font-medium text-[#8b92a8]">{card.label}</p>
                <div className="mt-2 text-3xl font-bold tracking-tight text-white">{card.value}</div>
                <div
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                    card.positive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <TrendingUp size={12} />
                  {card.change} from last month
                </div>
              </Panel>
            )
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-white">Assets</h2>
        <Panel className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0b0f19]/80 text-[#8b92a8]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Asset</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-left font-medium">Value</th>
                <th className="px-5 py-3 text-left font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2335] bg-[#080b12]/40">
              {assets.map((asset) => (
                <tr key={asset.name} className="transition hover:bg-[#0b0f19]/70">
                  <td className="px-5 py-4 font-medium text-white">{asset.name}</td>
                  <td className="px-5 py-4 text-[#8b92a8]">{asset.category}</td>
                  <td className="px-5 py-4 text-white">{asset.value}</td>
                  <td className="px-5 py-4 text-emerald-400">{asset.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Recent transactions</h2>
        <Panel className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0b0f19]/80 text-[#8b92a8]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Description</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2335] bg-[#080b12]/40">
              {transactions.map((tx) => (
                <tr
                  key={`${tx.date}-${tx.description}`}
                  className="transition hover:bg-[#0b0f19]/70"
                >
                  <td className="px-5 py-4 text-[#8b92a8]">{tx.date}</td>
                  <td className="px-5 py-4 text-white">{tx.description}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>
    </div>
  )
}
