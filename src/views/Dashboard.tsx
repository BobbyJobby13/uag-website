import { useState } from 'react'
import { ChevronDown } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'

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

export function Dashboard() {
  const [action, setAction] = useState<'deposit' | 'withdraw'>('withdraw')
  const { userName } = useDiscordAuth()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {userName ?? 'dert'}</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Here's what's happening with your portfolio today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-[#181a20] p-1">
            <button
              type="button"
              onClick={() => setAction('deposit')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                action === 'deposit'
                  ? 'bg-[#2a2c35] text-white shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setAction('withdraw')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                action === 'withdraw'
                  ? 'bg-[#2a2c35] text-white shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Withdraw
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#181a20] px-3 py-2.5 text-sm font-medium text-[#9ca3af] transition hover:text-white"
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
            <Panel key={card.label}>
              <p className="text-xs text-[#9ca3af]">{card.label}</p>
              <div className="mt-1 text-2xl font-semibold text-white">{card.value}</div>
              <div
                className={`mt-1 text-xs font-medium ${
                  card.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {card.change} from last month
              </div>
            </Panel>
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
                <tr
                  key={`${tx.date}-${tx.description}`}
                  className="transition hover:bg-[#181a20]"
                >
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
  )
}
