import { useEffect, useState } from 'react'
import { Building2, CreditCard, Inbox, Landmark, MapPin, Users } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  getAccessibleAccountBooks,
  getBankConnectionsForUser,
  getBanks,
  getRequests,
  type AccountBook,
  type Bank,
  type BankConnection,
  type ServiceRequest,
} from '../lib/data'

type Listing = {
  id: string
  name: string
  location: string
  type: string
  value: string
  status: string
}

const REALTY_KEY = 'uag_realty_listings'

function statusBadge(status: ServiceRequest['status']) {
  const styles: Record<ServiceRequest['status'], string> = {
    Open: 'bg-amber-500/10 text-amber-400',
    'In Progress': 'bg-indigo-500/10 text-indigo-400',
    Closed: 'bg-emerald-500/10 text-emerald-400',
  }
  return styles[status] || 'bg-[#111827] text-[#8b92a8]'
}

function bookBalance(book: AccountBook): number {
  return book.entries.reduce(
    (sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount),
    0
  )
}

export function ClientDashboard() {
  const { userName, login } = useDiscordAuth()
  const [tickets, setTickets] = useState<ServiceRequest[]>([])
  const [books, setBooks] = useState<AccountBook[]>([])
  const [plots, setPlots] = useState<Listing[]>([])
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [banks, setBanks] = useState<Bank[]>([])

  useEffect(() => {
    if (!userName) return
    const target = userName.toLowerCase().trim()
    setTickets(getRequests().filter((r) => r.clientName.toLowerCase().trim() === target))
    setBooks(getAccessibleAccountBooks(userName))
    setConnections(getBankConnectionsForUser(userName))
    setBanks(getBanks())
    try {
      const raw = localStorage.getItem(REALTY_KEY)
      if (raw) setPlots(JSON.parse(raw))
    } catch {}
  }, [userName])

  if (!userName) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Panel className="text-center">
          <h2 className="text-xl font-bold text-white">Client Dashboard</h2>
          <p className="mt-2 text-sm text-[#8b92a8]">
            Log in with Discord to view your tickets, accounts, plots, and bank connections.
          </p>
          <button
            type="button"
            onClick={login}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Users size={16} />
            Login with Discord
          </button>
        </Panel>
      </div>
    )
  }

  const openTickets = tickets.filter((t) => t.status !== 'Closed')

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Client Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Your tickets, accounts, plots, and bank connections in one place.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Open Tickets', value: openTickets.length, icon: Inbox },
          { label: 'Accounts', value: books.length, icon: CreditCard },
          { label: 'Plots', value: plots.length, icon: Building2 },
          { label: 'Bank Connections', value: connections.length, icon: Landmark },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Panel key={s.label}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8b92a8]">{s.label}</p>
                <Icon size={16} className="text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{s.value}</div>
            </Panel>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <Inbox size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">My Tickets</h2>
          </div>
          {tickets.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">
              No tickets yet. Submit a request from Legal, Investigators, Accounting, or Real Estate.
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-lg bg-[#111827] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{t.serviceType}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#8b92a8]">{t.description}</p>
                  <p className="mt-1 text-xs text-[#5d6a87]">
                    {new Date(t.createdAt).toLocaleDateString()}
                    {t.assignedTo ? ` • Assigned to ${t.assignedTo}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">My Accounts</h2>
          </div>
          {books.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">No accounts linked to your name yet.</p>
          ) : (
            <div className="space-y-3">
              {books.map((b) => {
                const bal = bookBalance(b)
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-lg bg-[#111827] p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{b.name}</div>
                      <div className="text-xs text-[#5d6a87]">{b.entries.length} entries</div>
                    </div>
                    <span className={`text-sm font-semibold ${bal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${bal.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Plots & Properties</h2>
          </div>
          {plots.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">No plots on record.</p>
          ) : (
            <div className="space-y-3">
              {plots.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-[#111827] p-3">
                  <div>
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[#5d6a87]">
                      <MapPin size={10} />
                      {p.location} • {p.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{p.value}</div>
                    <div className="text-xs text-[#8b92a8]">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <Landmark size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Bank Connections</h2>
          </div>
          {connections.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">
              No bank connections. Connect one from the Banking page.
            </p>
          ) : (
            <div className="space-y-3">
              {connections.map((c) => {
                const bank = banks.find((b) => b.id === c.bankId)
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-[#111827] p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{bank?.name ?? c.bankId}</div>
                      <div className="text-xs text-[#5d6a87]">
                        {c.accountName || 'Account'}
                        {c.accountNumber ? ` • ${c.accountNumber}` : ''}
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                      {bank?.status ?? 'Connected'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
