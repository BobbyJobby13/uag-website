import { useState } from 'react'
import { Landmark, Building, ArrowRightLeft, RefreshCw } from '../icons'
import { Panel } from '../components/Panel'

type Bank = {
  id: string
  name: string
  code: string
  status: 'Connected' | 'Pending'
  region: string
}

const banks: Bank[] = [
  { id: 'rvr', name: 'RVR Bank', code: 'RVR', status: 'Connected', region: 'Internal' },
  { id: 'barclays', name: 'Barclays', code: 'BARC', status: 'Connected', region: 'UK' },
  { id: 'rbr', name: 'RBR', code: 'RBR', status: 'Connected', region: 'EU' },
  { id: 'chase', name: 'Chase', code: 'CHAS', status: 'Connected', region: 'US' },
]

type Transfer = {
  id: string
  from: string
  to: string
  amount: string
  status: 'Completed' | 'Processing'
  date: string
}

const initialTransfers: Transfer[] = [
  { id: '1', from: 'RVR Bank', to: 'Barclays', amount: '+$0.00', status: 'Completed', date: 'May 5, 2026' },
]

export function Banking() {
  const [fromBank, setFromBank] = useState(banks[0].id)
  const [toBank, setToBank] = useState(banks[1].id)
  const [amount, setAmount] = useState('')
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)

  const handleTransfer = () => {
    if (!amount || isNaN(Number(amount))) return
    const from = banks.find((b) => b.id === fromBank) || banks[0]
    const to = banks.find((b) => b.id === toBank) || banks[1]
    const newTransfer: Transfer = {
      id: Math.random().toString(36).slice(2),
      from: from.name,
      to: to.name,
      amount: `-$${Number(amount).toFixed(2)}`,
      status: 'Completed',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }
    setTransfers((prev) => [newTransfer, ...prev])
    setAmount('')
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Banking Portal</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Instant transfers across connected banks and institutions.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Landmark size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Connected Banks</h2>
          </div>
          <div className="space-y-3">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center justify-between rounded-lg bg-[#181a20] p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2a2c35]">
                    <Building size={16} className="text-[#9ca3af]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{bank.name}</div>
                    <div className="text-xs text-[#6b7280]">
                      {bank.code} · {bank.region}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                  {bank.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Instant Transfer</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#9ca3af]">From Bank</label>
              <select
                value={fromBank}
                onChange={(e) => setFromBank(e.target.value)}
                className="w-full rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#9ca3af]">To Bank</label>
              <select
                value={toBank}
                onChange={(e) => setToBank(e.target.value)}
                className="w-full rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#9ca3af]">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleTransfer}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                <RefreshCw size={16} />
                Transfer Now
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Transfers</h2>
        <div className="overflow-hidden rounded-xl border border-[#1e2028]">
          <table className="w-full text-sm">
            <thead className="bg-[#15161b] text-[#9ca3af]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">From</th>
                <th className="px-5 py-3 text-left font-medium">To</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2028] bg-[#111217]">
              {transfers.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-[#181a20]">
                  <td className="px-5 py-4 text-[#9ca3af]">{tx.date}</td>
                  <td className="px-5 py-4 text-white">{tx.from}</td>
                  <td className="px-5 py-4 text-white">{tx.to}</td>
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
