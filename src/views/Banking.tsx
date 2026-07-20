import { useEffect, useState } from 'react'
import { Landmark, Building, ArrowRightLeft, RefreshCw, Plus, Trash2, Wallet, Settings } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  getBanks,
  addBank,
  removeBank,
  getBankConnectionsForUser,
  addBankConnection,
  removeBankConnection,
  isBankAdmin,
  type Bank,
  type BankConnection,
} from '../lib/data'

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
  const { userName, isAdmin } = useDiscordAuth()
  const canManage = isAdmin || isBankAdmin(userName)

  const [banks, setBanks] = useState<Bank[]>([])
  const [myConnections, setMyConnections] = useState<BankConnection[]>([])
  const [fromBank, setFromBank] = useState('')
  const [toBank, setToBank] = useState('')
  const [amount, setAmount] = useState('')
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)

  const [bankForm, setBankForm] = useState({
    name: '',
    code: '',
    region: '',
    apiEndpoint: '',
    apiKey: '',
    status: 'Connected' as Bank['status'],
  })

  const [connectionForm, setConnectionForm] = useState({
    bankId: '',
    accountName: '',
    accountNumber: '',
    apiKey: '',
  })

  useEffect(() => {
    const loadedBanks = getBanks()
    setBanks(loadedBanks)
    if (loadedBanks[0]) {
      setFromBank((prev) => (prev && loadedBanks.some((b) => b.id === prev) ? prev : loadedBanks[0].id))
      setToBank((prev) =>
        prev && loadedBanks.some((b) => b.id === prev)
          ? prev
          : loadedBanks[1]?.id || loadedBanks[0].id
      )
    }
    setMyConnections(getBankConnectionsForUser(userName))
  }, [userName])

  const refreshBanks = () => {
    const list = getBanks()
    setBanks(list)
    if (list.length) {
      setFromBank((prev) => (list.some((b) => b.id === prev) ? prev : list[0].id))
      setToBank((prev) => (list.some((b) => b.id === prev) ? prev : list[1]?.id || list[0].id))
    }
  }

  const refreshConnections = () => {
    setMyConnections(getBankConnectionsForUser(userName))
  }

  const handleAddBank = () => {
    if (!bankForm.name.trim() || !bankForm.code.trim()) return
    addBank({
      name: bankForm.name.trim(),
      code: bankForm.code.trim().toUpperCase(),
      region: bankForm.region.trim() || 'Global',
      status: bankForm.status,
      apiKey: bankForm.apiKey.trim() || undefined,
      apiEndpoint: bankForm.apiEndpoint.trim() || undefined,
    })
    refreshBanks()
    setBankForm({ name: '', code: '', region: '', apiEndpoint: '', apiKey: '', status: 'Connected' })
  }

  const handleDeleteBank = (id: string) => {
    removeBank(id)
    refreshBanks()
    refreshConnections()
  }

  const handleAddConnection = () => {
    if (!userName || !connectionForm.bankId.trim()) return
    const bank = banks.find((b) => b.id === connectionForm.bankId)
    if (!bank) return
    addBankConnection({
      userName,
      bankId: bank.id,
      accountName: connectionForm.accountName.trim() || undefined,
      accountNumber: connectionForm.accountNumber.trim() || undefined,
      apiKey: connectionForm.apiKey.trim() || undefined,
    })
    refreshConnections()
    setConnectionForm({ bankId: '', accountName: '', accountNumber: '', apiKey: '' })
  }

  const handleTransfer = () => {
    if (!amount || isNaN(Number(amount))) return
    const from = banks.find((b) => b.id === fromBank)
    const to = banks.find((b) => b.id === toBank)
    if (!from || !to) return
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

  const bankById = (id: string) => banks.find((b) => b.id === id)

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
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      bank.status === 'Connected'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : bank.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {bank.status}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBank(bank.id)}
                      className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label="Delete bank"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {banks.length === 0 && (
              <p className="text-sm text-[#6b7280]">No banks configured yet.</p>
            )}
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

      {canManage && (
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Settings size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Manage Banks</h2>
          </div>
          <Panel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <input
                type="text"
                placeholder="Bank name"
                value={bankForm.name}
                onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Code"
                value={bankForm.code}
                onChange={(e) => setBankForm({ ...bankForm, code: e.target.value })}
                className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Region"
                value={bankForm.region}
                onChange={(e) => setBankForm({ ...bankForm, region: e.target.value })}
                className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="API endpoint (optional)"
                value={bankForm.apiEndpoint}
                onChange={(e) => setBankForm({ ...bankForm, apiEndpoint: e.target.value })}
                className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
              <select
                value={bankForm.status}
                onChange={(e) => setBankForm({ ...bankForm, status: e.target.value as Bank['status'] })}
                className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="Connected">Connected</option>
                <option value="Pending">Pending</option>
                <option value="Disabled">Disabled</option>
              </select>
              <input
                type="password"
                placeholder="Bank API key"
                value={bankForm.apiKey}
                onChange={(e) => setBankForm({ ...bankForm, apiKey: e.target.value })}
                className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
              <div className="lg:col-span-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddBank}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  <Plus size={16} />
                  Add Bank
                </button>
              </div>
            </div>
          </Panel>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">My Bank Accounts</h2>
        </div>
        {!userName ? (
          <Panel>
            <p className="text-sm text-[#9ca3af]">Log in with Discord to connect your bank accounts.</p>
          </Panel>
        ) : (
          <div className="space-y-6">
            <Panel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={connectionForm.bankId}
                  onChange={(e) => setConnectionForm({ ...connectionForm, bankId: e.target.value })}
                  className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select a bank</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Account name"
                  value={connectionForm.accountName}
                  onChange={(e) => setConnectionForm({ ...connectionForm, accountName: e.target.value })}
                  className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Account number"
                  value={connectionForm.accountNumber}
                  onChange={(e) => setConnectionForm({ ...connectionForm, accountNumber: e.target.value })}
                  className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Your API key"
                  value={connectionForm.apiKey}
                  onChange={(e) => setConnectionForm({ ...connectionForm, apiKey: e.target.value })}
                  className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddConnection}
                  disabled={!connectionForm.bankId}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Connect Account
                </button>
              </div>
            </Panel>

            <div className="space-y-3">
              {myConnections.map((conn) => {
                const bank = bankById(conn.bankId)
                return (
                  <div
                    key={conn.id}
                    className="flex items-center justify-between rounded-lg border border-[#2a2c35] bg-[#181a20] p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{bank?.name || 'Unknown bank'}</div>
                      <div className="text-xs text-[#6b7280]">
                        {conn.accountName || 'Account'} · {conn.accountNumber || 'No number'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeBankConnection(conn.id)
                        refreshConnections()
                      }}
                      className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label="Remove connection"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
              {myConnections.length === 0 && (
                <p className="text-sm text-[#6b7280]">You have not connected any bank accounts.</p>
              )}
            </div>
          </div>
        )}
      </section>

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
