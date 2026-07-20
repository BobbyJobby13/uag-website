import { useEffect, useMemo, useState } from 'react'
import { Banknote, BookOpen, Download, FileSpreadsheet, FileText, Plus, Printer, Receipt, Trash2, TrendingUp, UserPlus, Users } from '../icons'
import { AIAssistant } from '../components/AIAssistant'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  addAccountBook,
  addAccountBookMember,
  addInvoice,
  addLedgerEntry,
  getAccessibleAccountBooks,
  getInvoicesForBook,
  hasDepartment,
  removeAccountBook,
  removeAccountBookMember,
  removeInvoice,
  removeLedgerEntry,
  updateInvoice,
  type AccountBook,
  type Invoice,
  type InvoiceItem,
  type LedgerEntry,
} from '../lib/data'

type Tab = 'books' | 'ledger' | 'reports' | 'invoices'

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

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    clientName: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxRate: '0',
    notes: '',
    status: 'draft' as Invoice['status'],
    items: [{ description: '', quantity: '1', rate: '' }],
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

  const uid = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  const refreshInvoices = () => {
    if (!selectedBook) {
      setInvoices([])
      return
    }
    setInvoices(getInvoicesForBook(selectedBook.id))
  }

  useEffect(() => {
    refreshInvoices()
  }, [selectedBookId])

  const resetInvoiceForm = () => {
    setEditingInvoiceId(null)
    setInvoiceForm({
      invoiceNumber: '',
      clientName: '',
      clientAddress: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      taxRate: '0',
      notes: '',
      status: 'draft',
      items: [{ description: '', quantity: '1', rate: '' }],
    })
  }

  const invoiceTotals = useMemo(() => {
    const subtotal = invoiceForm.items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0
      const rate = Number(item.rate) || 0
      return acc + qty * rate
    }, 0)
    const taxRate = Number(invoiceForm.taxRate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    return { subtotal, taxAmount, total: subtotal + taxAmount }
  }, [invoiceForm.items, invoiceForm.taxRate])

  const handleInvoiceItemChange = (index: number, field: 'description' | 'quantity' | 'rate', value: string) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  const handleAddInvoiceItem = () => {
    setInvoiceForm((prev) => ({ ...prev, items: [...prev.items, { description: '', quantity: '1', rate: '' }] }))
  }

  const handleRemoveInvoiceItem = (index: number) => {
    setInvoiceForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const handleSaveInvoice = () => {
    if (!selectedBook || !canEditBook(selectedBook) || !invoiceForm.clientName.trim()) return
    const items: InvoiceItem[] = invoiceForm.items
      .filter((i) => i.description.trim())
      .map((i) => {
        const quantity = Number(i.quantity) || 0
        const rate = Number(i.rate) || 0
        return { id: uid(), description: i.description.trim(), quantity, rate, amount: quantity * rate }
      })
    const payload = {
      bookId: selectedBook.id,
      invoiceNumber: invoiceForm.invoiceNumber.trim() || `INV-${Date.now()}`,
      clientName: invoiceForm.clientName.trim(),
      clientAddress: invoiceForm.clientAddress.trim(),
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      items,
      subtotal: invoiceTotals.subtotal,
      taxRate: Number(invoiceForm.taxRate) || 0,
      taxAmount: invoiceTotals.taxAmount,
      total: invoiceTotals.total,
      notes: invoiceForm.notes.trim(),
      status: invoiceForm.status,
      createdBy: userName || undefined,
    }
    if (editingInvoiceId) {
      updateInvoice(editingInvoiceId, payload)
    } else {
      addInvoice(payload)
    }
    resetInvoiceForm()
    refreshInvoices()
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id)
    setInvoiceForm({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientAddress: invoice.clientAddress || '',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      taxRate: String(invoice.taxRate),
      notes: invoice.notes || '',
      status: invoice.status,
      items: invoice.items.map((i) => ({ description: i.description, quantity: String(i.quantity), rate: String(i.rate) })),
    })
  }

  const handleDeleteInvoice = (id: string) => {
    removeInvoice(id)
    if (editingInvoiceId === id) resetInvoiceForm()
    refreshInvoices()
  }

  const handlePrintInvoice = () => {
    window.print()
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

  const downloadFile = (content: string | Blob, filename: string, type: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportBookAsCSV = (book: AccountBook) => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
    const rows = book.entries.map((e) => [e.date, e.description, e.category || '-', e.type, String(e.amount)])
    const escape = (v: string) => {
      const s = v.replace(/"/g, '""')
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s}"`
      return s
    }
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
    const filename = `${book.name.replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/gi, '')}_ledger.csv`
    downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8;')
  }

  const exportBookAsPDF = async (book: AccountBook) => {
    const [{ jsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF()
    const balance = book.entries.reduce((acc, e) => (e.type === 'income' ? acc + e.amount : acc - e.amount), 0)
    const income = book.entries.reduce((acc, e) => (e.type === 'income' ? acc + e.amount : acc), 0)
    const expenses = book.entries.reduce((acc, e) => (e.type === 'expense' ? acc + e.amount : acc), 0)

    doc.setFontSize(18)
    doc.text(book.name, 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Owner: ${book.owner || 'Unknown'}`, 14, 28)
    doc.text(`Total income: ${income.toLocaleString()} DC`, 14, 34)
    doc.text(`Total expenses: ${expenses.toLocaleString()} DC`, 14, 40)
    doc.text(`Net balance: ${balance.toLocaleString()} DC`, 14, 46)

    autoTable(doc, {
      startY: 54,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount (DC)']],
      body: book.entries.map((e) => [e.date, e.description, e.category || '-', e.type, e.amount.toLocaleString()]),
      styles: { fontSize: 10, textColor: 40 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 14, right: 14 },
    })

    const filename = `${book.name.replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/gi, '')}_ledger.pdf`
    doc.save(filename)
  }

  const exportBookAsJSON = (book: AccountBook) => {
    const data = JSON.stringify(book, null, 2)
    const filename = `${book.name.replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/gi, '')}_ledger.json`
    downloadFile(data, filename, 'application/json')
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
          Multi-company books, ledgers, invoices, reports, and AI-assisted bookkeeping.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'books', label: 'Companies / Books', icon: BookOpen },
          { id: 'ledger', label: 'Ledger', icon: Banknote },
          { id: 'invoices', label: 'Invoices', icon: Receipt },
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

            {selectedBook && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => exportBookAsCSV(selectedBook)}
                  className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                >
                  <FileSpreadsheet size={14} />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportBookAsPDF(selectedBook)}
                  className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                >
                  <FileText size={14} />
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => exportBookAsJSON(selectedBook)}
                  className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                >
                  <Download size={14} />
                  Export JSON
                </button>
              </div>
            )}

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
          {selectedBook && (
            <Panel className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#e8eaf2]">Export {selectedBook.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => exportBookAsCSV(selectedBook)}
                    className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                  >
                    <FileSpreadsheet size={14} />
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => exportBookAsPDF(selectedBook)}
                    className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                  >
                    <FileText size={14} />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => exportBookAsJSON(selectedBook)}
                    className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                  >
                    <Download size={14} />
                    Export JSON
                  </button>
                </div>
              </div>
            </Panel>
          )}

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

      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <Panel>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#e8eaf2]">
                {selectedBook ? `Invoices for ${selectedBook.name}` : 'Select a book'}
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
            {selectedBook && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetInvoiceForm}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
                >
                  <Plus size={14} />
                  New Invoice
                </button>
              </div>
            )}
          </Panel>

          {selectedBook && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Panel>
                  <h3 className="mb-4 text-sm font-semibold text-[#e8eaf2]">
                    {editingInvoiceId ? 'Edit Invoice' : 'Create Invoice'}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Invoice #"
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="date"
                      value={invoiceForm.issueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Client name"
                      value={invoiceForm.clientName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="date"
                      placeholder="Due date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      placeholder="Tax %"
                      value={invoiceForm.taxRate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
                      className={inputClass}
                    />
                    <select
                      value={invoiceForm.status}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as Invoice['status'] })}
                      className={inputClass}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Client address"
                    value={invoiceForm.clientAddress}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddress: e.target.value })}
                    className={`${inputClass} mt-3 min-h-[80px] w-full`}
                  />
                  <textarea
                    placeholder="Invoice notes / payment terms"
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    className={`${inputClass} mt-3 min-h-[60px] w-full`}
                  />

                  <h4 className="mb-2 mt-4 text-xs font-medium text-[#8b92a8]">Line Items</h4>
                  <div className="space-y-2">
                    {invoiceForm.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg border border-[#1c2335] bg-[#0b0f19] p-3 sm:grid-cols-12">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleInvoiceItemChange(idx, 'description', e.target.value)}
                          className={`${inputClass} sm:col-span-6`}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleInvoiceItemChange(idx, 'quantity', e.target.value)}
                          className={`${inputClass} sm:col-span-2`}
                        />
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleInvoiceItemChange(idx, 'rate', e.target.value)}
                          className={`${inputClass} sm:col-span-3`}
                        />
                        <div className="flex items-center justify-end sm:col-span-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveInvoiceItem(idx)}
                            className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="sm:col-span-12 text-right text-xs text-[#8b92a8]">
                          {((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toLocaleString()} DC
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAddInvoiceItem}
                      className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInvoice}
                      disabled={!invoiceForm.clientName.trim() || !canEditBook(selectedBook)}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Receipt size={14} />
                      {editingInvoiceId ? 'Update Invoice' : 'Save Invoice'}
                    </button>
                    {editingInvoiceId && (
                      <button
                        type="button"
                        onClick={resetInvoiceForm}
                        className="rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Panel>

                {invoices.length > 0 && (
                  <Panel>
                    <h3 className="mb-4 text-sm font-semibold text-[#e8eaf2]">Saved Invoices</h3>
                    <div className="space-y-2">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#111827] p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#e8eaf2]">{inv.invoiceNumber}</p>
                            <p className="text-xs text-[#8b92a8]">
                              {inv.clientName} • {inv.total.toLocaleString()} DC
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : inv.status === 'sent'
                                    ? 'bg-indigo-500/10 text-indigo-400'
                                    : 'bg-[#2a344e] text-[#8b92a8]'
                              }`}
                            >
                              {inv.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEditInvoice(inv)}
                              className="rounded-md px-2 py-1 text-xs text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-[#e8eaf2]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                              aria-label="Delete invoice"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}
              </div>

              <Panel className="invoice-print bg-[#f8f9fc] text-[#111827]">
                <div className="mb-4 flex items-center justify-between border-b border-[#e2e4eb] pb-3">
                  <h3 className="text-sm font-semibold">Invoice Preview</h3>
                  <button
                    type="button"
                    onClick={handlePrintInvoice}
                    className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-[#e8eaf2] transition hover:bg-[#1c2335]"
                  >
                    <Printer size={14} />
                    Print / PDF
                  </button>
                </div>
                <div className="space-y-4 p-2">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <h2 className="text-xl font-bold">{selectedBook?.name || 'Company Name'}</h2>
                      <p className="text-sm text-[#5d6a87]">Invoice {invoiceForm.invoiceNumber.trim() || '#'}</p>
                    </div>
                    <div className="text-right text-sm text-[#5d6a87]">
                      <p>Issued: {invoiceForm.issueDate || '-'}</p>
                      <p>Due: {invoiceForm.dueDate || '-'}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#e2e4eb] p-3">
                    <p className="text-xs font-semibold uppercase text-[#8b92a8]">Bill to</p>
                    <p className="font-medium">{invoiceForm.clientName || 'Client Name'}</p>
                    {invoiceForm.clientAddress && (
                      <p className="mt-1 whitespace-pre-line text-sm text-[#5d6a87]">{invoiceForm.clientAddress}</p>
                    )}
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-[#e2e4eb] text-[#111827]">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Description</th>
                        <th className="px-3 py-2 text-right font-medium">Qty</th>
                        <th className="px-3 py-2 text-right font-medium">Rate</th>
                        <th className="px-3 py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e4eb]">
                      {invoiceForm.items.filter((i) => i.description.trim()).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-3 text-center text-[#8b92a8]">
                            No line items yet.
                          </td>
                        </tr>
                      )}
                      {invoiceForm.items
                        .filter((i) => i.description.trim())
                        .map((item, idx) => {
                          const qty = Number(item.quantity) || 0
                          const rate = Number(item.rate) || 0
                          const amount = qty * rate
                          return (
                            <tr key={idx}>
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-right">{qty}</td>
                              <td className="px-3 py-2 text-right">{rate.toLocaleString()} DC</td>
                              <td className="px-3 py-2 text-right font-medium">{amount.toLocaleString()} DC</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                  <div className="flex flex-col gap-1 border-t border-[#e2e4eb] pt-3 text-right text-sm">
                    <p className="text-[#5d6a87]">Subtotal: {invoiceTotals.subtotal.toLocaleString()} DC</p>
                    <p className="text-[#5d6a87]">
                      Tax ({invoiceForm.taxRate || 0}%): {invoiceTotals.taxAmount.toLocaleString()} DC
                    </p>
                    <p className="text-lg font-bold">Total: {invoiceTotals.total.toLocaleString()} DC</p>
                  </div>
                  {invoiceForm.notes && (
                    <div className="rounded-lg bg-[#f0f2f5] p-3 text-sm text-[#5d6a87]">
                      <p className="font-medium text-[#111827]">Notes</p>
                      <p className="whitespace-pre-line">{invoiceForm.notes}</p>
                    </div>
                  )}
                  <div className="text-center text-xs text-[#8b92a8]">
                    Status: <span className="font-medium capitalize">{invoiceForm.status}</span>
                  </div>
                </div>
              </Panel>
            </div>
          )}
        </div>
      )}

      <AIAssistant
        service="accounting"
        department="Accounting"
        placeholder="Ask the accounting AI about ledger entries, reports, invoices, or financial drafts..."
      />
    </div>
  )
}
