import { useEffect, useState } from 'react'
import {
  Banknote,
  CreditCard,
  Gavel,
  Inbox,
  Landmark,
  Scale,
  Search,
  Send,
  Shield,
  Users,
} from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  getAccountBooks,
  getBankConnections,
  getBanks,
  getEmployees,
  getInvoices,
  getRequests,
  getTasks,
  hasDepartment,
  type AccountBook,
  type Bank,
  type ServiceRequest,
} from '../lib/data'
import { getCourtCases, updateCourtCase, type CourtCase } from '../lib/legal'

const PENDING_STATUSES = new Set(['Open', 'Pending', 'In Progress', 'Adjourned', 'Unknown'])

function bookTotals(book: AccountBook) {
  let income = 0
  let expense = 0
  for (const e of book.entries) {
    if (e.type === 'income') income += e.amount
    else expense += e.amount
  }
  return { income, expense, balance: income - expense }
}

function caseBadge(status: CourtCase['status']) {
  if (status === 'Closed' || status === 'Accepted') return 'bg-emerald-500/10 text-emerald-400'
  if (status === 'Dismissed') return 'bg-rose-500/10 text-rose-400'
  if (status === 'In Progress') return 'bg-indigo-500/10 text-indigo-400'
  return 'bg-amber-500/10 text-amber-400'
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Scale; title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="icon-box" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
        <Icon size={16} />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

function AccountantSection({ books }: { books: AccountBook[] }) {
  return (
    <section className="mb-10">
      <SectionHeader
        icon={Banknote}
        title="Accounting — All Accounts"
        subtitle="Every account book across UAG and its subsidiaries."
      />
      {books.length === 0 ? (
        <Panel>
          <p className="text-sm text-[#5d6a87]">No account books have been created yet.</p>
        </Panel>
      ) : (
        <Panel className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#111827] text-[#8b92a8]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Account</th>
                <th className="px-5 py-3 text-left font-medium">Owner</th>
                <th className="px-5 py-3 text-left font-medium">Income</th>
                <th className="px-5 py-3 text-left font-medium">Expenses</th>
                <th className="px-5 py-3 text-left font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2335] bg-[#0b0f19]">
              {books.map((b) => {
                const t = bookTotals(b)
                return (
                  <tr key={b.id} className="transition hover:bg-[#111827]">
                    <td className="px-5 py-3 font-medium text-white">{b.name}</td>
                    <td className="px-5 py-3 text-[#8b92a8]">{b.owner || '—'}</td>
                    <td className="px-5 py-3 text-emerald-400">${t.income.toFixed(2)}</td>
                    <td className="px-5 py-3 text-rose-400">${t.expense.toFixed(2)}</td>
                    <td className={`px-5 py-3 font-semibold ${t.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                      ${t.balance.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </section>
  )
}

function LawyerSection({ cases }: { cases: CourtCase[] }) {
  const pending = cases.filter((c) => PENDING_STATUSES.has(c.status))
  const done = cases.filter((c) => !PENDING_STATUSES.has(c.status))
  return (
    <section className="mb-10">
      <SectionHeader
        icon={Scale}
        title="Legal — Case Overview"
        subtitle="Cases that need attention versus completed matters."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Gavel size={14} />
            Needs Action ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">No pending cases. All caught up.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((c) => (
                <div key={c.id} className="rounded-lg bg-[#111827] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{c.title}</span>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${caseBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  {c.summary && <p className="mt-1 line-clamp-2 text-xs text-[#8b92a8]">{c.summary}</p>}
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <Gavel size={14} />
            Completed ({done.length})
          </h3>
          {done.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">No completed cases yet.</p>
          ) : (
            <div className="space-y-2">
              {done.map((c) => (
                <div key={c.id} className="rounded-lg bg-[#111827] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{c.title}</span>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${caseBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  )
}

function InvestigatorSection({
  cases,
  userName,
  onEvidenceSubmitted,
}: {
  cases: CourtCase[]
  userName: string | null
  onEvidenceSubmitted: () => void
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<string | null>(null)
  const open = cases.filter((c) => PENDING_STATUSES.has(c.status))

  const submitEvidence = (c: CourtCase) => {
    const text = (drafts[c.id] || '').trim()
    if (!text) return
    const stamp = `[${new Date().toLocaleString()}${userName ? ` — ${userName}` : ''}] ${text}`
    updateCourtCase(c.id, {
      evidence: c.evidence ? `${c.evidence}\n${stamp}` : stamp,
    })
    setDrafts((prev) => ({ ...prev, [c.id]: '' }))
    setSubmitted(c.id)
    setTimeout(() => setSubmitted(null), 3000)
    onEvidenceSubmitted()
  }

  return (
    <section className="mb-10">
      <SectionHeader
        icon={Search}
        title="Investigations — Open Cases"
        subtitle="All open cases. Submit any evidence you have gathered."
      />
      {open.length === 0 ? (
        <Panel>
          <p className="text-sm text-[#5d6a87]">No open cases at the moment.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {open.map((c) => (
            <Panel key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${caseBadge(c.status)}`}>
                  {c.status}
                </span>
              </div>
              {c.summary && <p className="mt-2 text-xs text-[#8b92a8]">{c.summary}</p>}
              {c.evidence && (
                <div className="mt-3 rounded-lg bg-[#111827] p-3">
                  <div className="text-xs font-semibold text-[#8b92a8]">Evidence on file</div>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-[#5d6a87]">{c.evidence}</p>
                </div>
              )}
              <textarea
                placeholder="Describe or link evidence for this case..."
                value={drafts[c.id] || ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                rows={2}
                className="mt-3 w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => submitEvidence(c)}
                disabled={!(drafts[c.id] || '').trim()}
                className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <Send size={12} />
                Submit Evidence
              </button>
              {submitted === c.id && (
                <p className="mt-2 text-xs text-emerald-400">Evidence added to the case file.</p>
              )}
            </Panel>
          ))}
        </div>
      )}
    </section>
  )
}

function AdminSection({
  requests,
  books,
  cases,
  banks,
}: {
  requests: ServiceRequest[]
  books: AccountBook[]
  cases: CourtCase[]
  banks: Bank[]
}) {
  const employees = getEmployees()
  const invoices = getInvoices()
  const tasks = getTasks()
  const connections = getBankConnections()

  const stats = [
    { label: 'Employees', value: employees.length, icon: Users },
    { label: 'Service Requests', value: requests.length, icon: Inbox },
    { label: 'Account Books', value: books.length, icon: CreditCard },
    { label: 'Invoices', value: invoices.length, icon: Banknote },
    { label: 'Court Cases', value: cases.length, icon: Scale },
    { label: 'Tasks', value: tasks.length, icon: Gavel },
    { label: 'Banks', value: banks.length, icon: Landmark },
    { label: 'Bank Connections', value: connections.length, icon: Landmark },
  ]

  return (
    <section className="mb-10">
      <SectionHeader
        icon={Shield}
        title="Admin — Full Oversight"
        subtitle="Everything happening across the portal, including backend integrations."
      />
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Panel key={s.label}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8b92a8]">{s.label}</p>
                <Icon size={14} className="text-indigo-400" />
              </div>
              <div className="mt-1 text-xl font-bold text-white">{s.value}</div>
            </Panel>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3 text-sm font-semibold text-white">All Service Requests</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-[#5d6a87]">No service requests submitted.</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {requests.map((r) => (
                <div key={r.id} className="rounded-lg bg-[#111827] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">
                      {r.clientName} — {r.serviceType}
                    </span>
                    <span className="flex-shrink-0 text-xs text-[#8b92a8]">{r.status}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-[#5d6a87]">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h3 className="mb-3 text-sm font-semibold text-white">Backend Integrations</h3>
          <div className="space-y-2">
            {banks.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-[#111827] p-3">
                <div>
                  <div className="text-sm font-medium text-white">{b.name}</div>
                  <div className="text-xs text-[#5d6a87]">
                    {b.apiEndpoint || 'No API endpoint configured'}
                    {b.apiKey ? ' • API key set' : ' • No API key'}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    b.status === 'Connected'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : b.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
            {books
              .filter((b) => b.economyAccountId || b.economyApiToken || b.economyWebhookToken)
              .map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg bg-[#111827] p-3">
                  <div>
                    <div className="text-sm font-medium text-white">{b.name} (Economy)</div>
                    <div className="text-xs text-[#5d6a87]">
                      {b.economyAccountId ? `Account ${b.economyAccountId}` : 'No account ID'}
                      {b.economyWebhookToken ? ' • Webhook set' : ''}
                      {b.economyApiToken ? ' • API token set' : ''}
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400">
                    Linked
                  </span>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </section>
  )
}

export function StaffDashboard() {
  const { userName, isAdmin } = useDiscordAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [books, setBooks] = useState<AccountBook[]>([])
  const [cases, setCases] = useState<CourtCase[]>([])
  const [banks, setBanks] = useState<Bank[]>([])

  const refresh = () => {
    setRequests(getRequests())
    setBooks(getAccountBooks())
    setCases(getCourtCases())
    setBanks(getBanks())
  }

  useEffect(() => {
    refresh()
  }, [])

  const isAccountant = isAdmin || hasDepartment(userName, 'Accounting')
  const isLawyer = isAdmin || hasDepartment(userName, 'Legal')
  const isInvestigator = isAdmin || hasDepartment(userName, 'Investigations')

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">
          Department overviews tailored to your role{isAdmin ? ' — full admin access enabled' : ''}.
        </p>
      </header>

      {isAdmin && <AdminSection requests={requests} books={books} cases={cases} banks={banks} />}
      {isAccountant && <AccountantSection books={books} />}
      {isLawyer && <LawyerSection cases={cases} />}
      {isInvestigator && (
        <InvestigatorSection cases={cases} userName={userName} onEvidenceSubmitted={refresh} />
      )}

      {!isAdmin && !isAccountant && !isLawyer && !isInvestigator && (
        <Panel>
          <p className="text-sm text-[#5d6a87]">
            Your staff profile isn't assigned to Accounting, Legal, or Investigations yet. Ask an
            admin to set your department in the Role Manager.
          </p>
        </Panel>
      )}
    </div>
  )
}
