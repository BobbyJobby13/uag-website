import { TrendingUp, BarChart3, ExternalLink } from '../icons'
import { Panel } from '../components/Panel'

const exchanges = [
  { name: 'NER', fullName: 'New Economic Reserve', region: 'North America', status: 'Live', url: '' },
  { name: 'TSE', fullName: 'The Stock Exchange', region: 'DemocracyCraft', status: 'Live', url: 'https://market.installe.us/login' },
]

const tickers = [
  { symbol: 'NER:UAG', price: '$0.00', change: '+0.0%', positive: true },
  { symbol: 'TSE:UAG', price: '$0.00', change: '+0.0%', positive: true },
  { symbol: 'NER:FI', price: '$0.00', change: '-0.0%', positive: false },
  { symbol: 'TSE:TECH', price: '$0.00', change: '+0.0%', positive: true },
]

const holdings = [
  { name: 'UAG Growth Fund', exchange: 'NER', value: '$0.00', change: '+0.0%' },
  { name: 'Global Tech Index', exchange: 'TSE', value: '$0.00', change: '+0.0%' },
]

export function Stocks() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">TSE</h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          The Stock Exchange — live access to NER, TSE and related market positions.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tickers.map((t) => (
          <Panel key={t.symbol}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8b92a8]">{t.symbol}</span>
              <TrendingUp size={16} className={t.positive ? 'text-emerald-400' : 'text-rose-400'} />
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{t.price}</div>
            <div className={`mt-1 text-xs font-medium ${t.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {t.change}
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Connected Exchanges</h2>
          </div>
          <div className="space-y-3">
            {exchanges.map((ex) => (
              <div
                key={ex.name}
                className="flex items-center justify-between rounded-lg bg-[#111827] p-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">{ex.name}</div>
                  <div className="text-xs text-[#5d6a87]">{ex.fullName}</div>
                </div>
                <div className="flex items-center gap-2">
                  {ex.url ? (
                    <a
                      href={ex.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md bg-[#1c2335] px-2 py-1 text-xs font-medium text-indigo-400 transition hover:bg-[#2a344e]"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  ) : null}
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                    {ex.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Holdings</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#1c2335]">
            <table className="w-full text-sm">
              <thead className="bg-[#111827] text-[#8b92a8]">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Asset</th>
                  <th className="px-5 py-3 text-left font-medium">Exchange</th>
                  <th className="px-5 py-3 text-left font-medium">Value</th>
                  <th className="px-5 py-3 text-left font-medium">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2335] bg-[#0b0f19]">
                {holdings.map((h) => (
                  <tr key={h.name} className="transition hover:bg-[#111827]">
                    <td className="px-5 py-4 font-medium text-white">{h.name}</td>
                    <td className="px-5 py-4 text-[#8b92a8]">{h.exchange}</td>
                    <td className="px-5 py-4 text-white">{h.value}</td>
                    <td className="px-5 py-4 text-emerald-400">{h.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  )
}
