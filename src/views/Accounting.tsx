import { useEffect, useMemo, useState } from 'react'
import { Banknote, BookOpen, Plus, Trash2, TrendingUp, UserPlus, Users } from '../icons'
import { AIAssistant } from '../components/AIAssistant'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  addAccountBook,
  addAccountBookMember,
  addLedgerEntry,
  getAccessibleAccountBooks,
  hasDepartment,
  removeAccountBook,
  removeAccountBookMember,
  removeLedgerEntry,
  type AccountBook,
  type LedgerEntry,
} from '../lib/data'

type Tab = 'books' | 'ledger' | 'reports'

export function Accounting() {
  const { userName, isAdmin } = useDiscordAuth()
  const isAccountingStaff = hasDepartment(userName, 'Accounting')

  const [books, setBooks] = useState<AccountBook[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('books')
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [newBookName, setNewBookName] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null)
  const [entryForm, setEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    type: 'expense' as LedgerEntry['type'],
    amount: '',
  })

  const refreshBooks = () => {
    const loaded = getAccessibleAccountBooks(userName, isAdmin)
    setBooks(loaded)
    if (selectedBookId && !loaded.find((b) => b.id === selectedBookId)) {
      setSelectedBookId(loaded[0]?.id || '')
    }
  }

  useEffect(() => {
    refreshBooks()
  }, [userName, isAdmin])

  const allowed = isAdmin || isAccountingStaff || getAccessibleAccountBooks(userName, isAdmin).length > 0

  const selectedBook = books.find((b) => b.id === selectedBookId)

  const totals = useMemo(() => {
    if (!selectedBook) return { income: 0, expenses: 0, net: 0 }
    let income = 0
    let expenses = 0
    selectedBook.entries.forEach((e) => {
      if (e.type === 'income') income += e.amount
      else expenses += e.amount
    })
    return { income, expenses, net: income - expenses }
  }, [selectedBook])

  const canEditBook = (book: AccountBook | undefined) => {
    if (!book || !userName) return false
    if (isAdmin || book.owner === userName) return true
    return (book.members || []).some((m) => m.toLowerCase().trim() === userName.toLowerCase().trim())
  }

  const canManageBook = (book: AccountBook | undefined) => {
    if (!book || !userName) return false
    return isAdmin || book.owner === userName
  }

  const handleAddBook = () => {
    const name = newBookName.trim()
    if (!name || !userName) return
    const book = addAccountBook(name, userName)
    refreshBooks()
    setSelectedBookId(book.id)
    setNewBookName('')
    setActiveTab('ledger')
  }

  const handleRemoveBook = (id: string) => {
    removeAccountBook(id)
    refreshBooks()
  }

  const handleAddMember = (bookId: string) => {
    const name = newMemberName.trim()
    if (!name) return
    addAccountBookMember(bookId, name)
    refreshBooks()
    setNewMemberName('')
  }

  const handleRemoveMember = (bookId: string, member: string) => {
    removeAccountBookMember(bookId, member)
    refreshBooks()
  }

  const handleAddEntry = () => {
    if (!selectedBook || !canEditBook(selectedBook) || !entryForm.description.trim() || !entryForm.amount) return
    addLedgerEntry(selectedBook.id, {
      date: entryForm.date,
      description: entryForm.description.trim(),
      category: entryForm.category.trim(),
      type: entryForm.type,
      amount: Number(entryForm.amount),
    })
    refreshBooks()
    setEntryForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      type: 'expense',
      amount: '',
    })
  }

  const handleRemoveEntry = (entryId: string) => {
    if (!selectedBook || !canEditBook(selectedBook)) return
    removeLedgerEntry(selectedBook.id, entryId)
    refreshBooks()
  }

  const inputClass =
    'rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-[#e8eaf2] outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20'

  if (!allowed) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Panel>
          <h1 className="text-xl font-bold text-[#e8eaf2]">Access Denied</h1>
          <p className="mt-2 text-sm text-[#8b92a8]">
            This workspace is for UAG Accounting staff or invited members only.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#e8eaf2]">Accounting Department</h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Multi-company books, ledgers, reports, and AI-assisted bookkeeping.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'books', label: 'Companies / Books', icon: BookOpen },
          { id: 'ledger', label: 'Ledger', icon: Banknote },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
        ].map((t) => {
          const Icon = t.icon
          const active = activeTab === (t.id as Tab)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as Tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#111827] text-[#8b92a8] hover:bg-[#1c2335] hover:text-[#e8eaf2]'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'books' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Panel className="sm:col-span-2 lg:col-span-3">
            <h2 className="mb-4 text-sm font-semibold text-[#e8eaf2]">Create a new company book</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Company / book name (e.g. UAG Operating Account)"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBook()}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={handleAddBook}
                disabled={!newBookName.trim() || !userName}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <Plus size={16} />
                Create Book
              </button>
            </div>
            <p className="mt-2 text-xs text-[#5d6a87]">
              You will be the owner and can invite others to view or edit the ledger.
            </p>
          </Panel>

          {books.length === 0 && (
            <Panel className="sm:col-span-2 lg:col-span-3">
              <p className="text-sm text-[#8b92a8]">No company books yet. Create one above to get started.</p>
            </Panel>
          )}

          {books.map((book) => {
            const balance = book.entries.reduce(
              (acc, e) => (e.type === 'income' ? acc + e.amount : acc - e.amount),
              0
            )
            const isExpanded = expandedBookId === book.id
            return (
              <Panel key={book.id} className="flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e8eaf2]">{book.name}</h3>
                    <p className="text-xs text-[#5d6a87]">
                      {book.entries.length} entries • {book.members?.length || 1} member
                      {(book.members?.length || 1) > 1 ? 's' : ''}
                    </p>
                  </div>
                  {canManageBook(book) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBook(book.id)}
                      className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label="Delete book"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-[#8b92a8]">Net balance</p>
                  <p className={`text-xl font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {balance >= 0 ? '+' : ''}
                    {balance.toLocaleString()} DC
                  </p>
                </div>

                <div className="mt-4 rounded-lg border border-[#1c2335] bg-[#0b0f19] p-3">
                  <div className="flex items-center gap-2 text-xs text-[#5d6a87]">
                    <Users size={14} />
                    <span>Owner:</span>
                    <span className="text-[#8b92a8]">{book.owner || 'Unknown'}</span>
                  </div>
                  {book.members && book.members.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {book.members.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 rounded-full bg-[#1c2335] px-2 py-0.5 text-xs text-[#8b92a8]"
                        >
                          {m}
                          {canManageBook(book) && m.toLowerCase().trim() !== (book.owner || '').toLowerCase().trim() && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(book.id, m)}
                              className="text-[#5d6a87] transition hover:text-rose-400"
                              aria-label={`Remove ${m}`}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {canManageBook(book) && (
                    <button
                      type="button"
                      onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                      className="mt-3 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                      {isExpanded ? 'Close people manager' : 'Manage people'}
                    </button>
                  )}

                  {isExpanded && canManageBook(book) && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Discord username to invite"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember(book.id)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddMember(book.id)}
                        disabled={!newMemberName.trim()}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
                      >
                        <UserPlus size={14} />
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookId(book.id)
                    setActiveTab('ledger')
                  }}
                  className="mt-4 w-full rounded-lg bg-[#1c2335] py-2 text-sm font-medium text-[#e8eaf2] transition hover:bg-[#2a344e]"
                >
                  Open Ledger
                </button>
              </Panel>
            )
          })}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <Panel>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#e8eaf2]">
                {selectedBook ? selectedBook.name : 'Select a book'}
              </h2>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className={inputClass}
              >
                {books.length === 0 && <option value="">No books</option>}
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedBook && canEditBook(selectedBook) ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <input
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={entryForm.description}
                  onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                  className={`${inputClass} sm:col-span-2`}
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={entryForm.category}
                  onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={entryForm.type}
                  onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value as LedgerEntry['type'] })}
                  className={inputClass}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={entryForm.amount}
                  onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 lg:col-span-6"
                >
                  <Plus size={16} />
                  Add Entry
                </button>
              </div>
            ) : selectedBook ? (
              <p className="text-sm text-[#8b92a8]">You can view this ledger. Only members can add or remove entries.</p>
            ) : (
              <p className="text-sm text-[#8b92a8]">Create a company book in the Companies / Books tab first.</p>
            )}
          </Panel>

          {selectedBook && (
            <div className="overflow-hidden rounded-xl border border-[#1c2335]">
              <table className="w-full text-sm">
                <thead className="bg-[#111827] text-[#8b92a8]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Description</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2335] bg-[#0b0f19]">
                  {selectedBook.entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-sm text-[#5d6a87]">
                        No entries yet.
                      </td>
                    </tr>
                  )}
                  {selectedBook.entries.map((entry) => (
                    <tr key={entry.id} className="transition hover:bg-[#111827]">
                      <td className="px-4 py-3 text-[#8b92a8]">{entry.date}</td>
                      <td className="px-4 py-3 text-[#e8eaf2]">{entry.description}</td>
                      <td className="px-4 py-3 text-[#8b92a8]">{entry.category || '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            entry.type === 'income'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[#e8eaf2]">
                        {entry.amount.toLocaleString()} DC
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEditBook(selectedBook) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                            aria-label="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Panel>
            <p className="text-xs text-[#8b92a8]">Total Income</p>
            <p className="text-2xl font-semibold text-emerald-400">{totals.income.toLocaleString()} DC</p>
          </Panel>
          <Panel>
            <p className="text-xs text-[#8b92a8]">Total Expenses</p>
            <p className="text-2xl font-semibold text-rose-400">{totals.expenses.toLocaleString()} DC</p>
          </Panel>
          <Panel>
            <p className="text-xs text-[#8b92a8]">Net Balance</p>
            <p className={`text-2xl font-semibold ${totals.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totals.net >= 0 ? '+' : ''}
              {totals.net.toLocaleString()} DC
            </p>
          </Panel>

          <Panel className="sm:col-span-2 lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold text-[#e8eaf2]">Entries by Category</h3>
            {selectedBook ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(
                  selectedBook.entries.reduce((acc, e) => {
                    const key = e.category || 'Uncategorized'
                    if (!acc[key]) acc[key] = 0
                    acc[key] += e.type === 'income' ? e.amount : -e.amount
                    return acc
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between rounded-lg bg-[#111827] px-3 py-2">
                      <span className="text-sm text-[#e8eaf2]">{category}</span>
                      <span className={`text-sm font-medium ${amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {amount >= 0 ? '+' : ''}
                        {amount.toLocaleString()} DC
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-[#8b92a8]">Select a book to view reports.</p>
            )}
          </Panel>
        </div>
      )}

      <AIAssistant
        service="accounting"
        department="Accounting"
        placeholder="Ask the accounting AI about ledger entries, reports, or financial drafts..."
      />
    </div>
  )
}
