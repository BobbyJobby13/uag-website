export type Department = 'Accounting' | 'Legal' | 'Investigations' | 'Construction' | 'Management' | 'Real Estate'

export const DEPARTMENTS: { id: Department; label: string; roles: string[] }[] = [
  {
    id: 'Accounting',
    label: 'Accounting',
    roles: ['Accountant', 'Head Accountant', 'Chief Financial Officer'],
  },
  {
    id: 'Legal',
    label: 'Legal',
    roles: ['Lawyer', 'Chief Legal Officer', 'Paralegal', 'Associate', 'Legal Advisor'],
  },
  {
    id: 'Investigations',
    label: 'Investigations',
    roles: ['Investigator'],
  },
  {
    id: 'Construction',
    label: 'Construction',
    roles: ['Head Builder', 'Department Manager', 'Building Crew'],
  },
  {
    id: 'Management',
    label: 'Management',
    roles: ['Admin', 'Department Manager'],
  },
  {
    id: 'Real Estate',
    label: 'Real Estate',
    roles: ['Realtor', 'Real Estate Agent'],
  },
]

export type Role =
  | 'Accountant'
  | 'Head Accountant'
  | 'Chief Financial Officer'
  | 'Lawyer'
  | 'Chief Legal Officer'
  | 'Paralegal'
  | 'Associate'
  | 'Legal Advisor'
  | 'Investigator'
  | 'Head Builder'
  | 'Department Manager'
  | 'Building Crew'
  | 'Admin'
  | 'Realtor'
  | 'Real Estate Agent'

export interface Employee {
  id: string
  name: string
  discordUsername?: string
  role: string
  department: Department
  status: 'Active' | 'On Leave' | 'Inactive'
  joined: string
  notes?: string
}

export interface ServiceRequest {
  id: string
  clientName: string
  contact: string
  serviceType: Department | 'General'
  description: string
  status: 'Open' | 'In Progress' | 'Closed'
  assignedTo?: string
  createdAt: string
  notes?: string
  caseFile?: string
}

export interface Task {
  id: string
  title: string
  department: Department | 'All'
  role?: string
  status: 'Pending' | 'In Progress' | 'Done'
  due?: string
  notes?: string
}

export interface ChatMessage {
  id: string
  author: string
  department?: Department
  text: string
  createdAt: string
}

export interface LedgerEntry {
  id: string
  date: string
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  externalId?: string
  createdAt: string
}

export interface AccountBook {
  id: string
  name: string
  owner?: string
  members?: string[]
  entries: LedgerEntry[]
  website?: string
  economyAccountId?: string
  economyWebhookToken?: string
  economyApiToken?: string
  createdAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  bookId: string
  invoiceNumber: string
  clientName: string
  clientAddress?: string
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  status: 'draft' | 'sent' | 'paid'
  createdBy?: string
  createdAt: string
}

export interface Bank {
  id: string
  name: string
  code: string
  region: string
  status: 'Connected' | 'Pending' | 'Disabled'
  apiKey?: string
  apiEndpoint?: string
  createdAt: string
}

export interface BankConnection {
  id: string
  userName: string
  bankId: string
  accountName?: string
  accountNumber?: string
  apiKey?: string
  createdAt: string
}

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const KEYS = {
  employees: 'uag_employees',
  requests: 'uag_service_requests',
  tasks: 'uag_tasks',
  chat: 'uag_staff_chat',
  accountingBooks: 'uag_accounting_books',
  invoices: 'uag_invoices',
  banks: 'uag_banks',
  bankConnections: 'uag_bank_connections',
}

const defaultBanks: Bank[] = [
  { id: 'rvr', name: 'RVR Bank', code: 'RVR', region: 'Internal', status: 'Connected', createdAt: new Date().toISOString() },
  { id: 'barclays', name: 'Barclays', code: 'BARC', region: 'UK', status: 'Connected', createdAt: new Date().toISOString() },
  { id: 'rbr', name: 'RBR', code: 'RBR', region: 'EU', status: 'Connected', createdAt: new Date().toISOString() },
  { id: 'chase', name: 'Chase', code: 'CHAS', region: 'US', status: 'Connected', createdAt: new Date().toISOString() },
]

const defaultTasks: Task[] = [
  { id: uid(), title: 'Onboard new Head Accountant and configure accounting workflows', department: 'Accounting', role: 'Head Accountant', status: 'Pending' },
  { id: uid(), title: 'Draft standard retainer agreement for Legal clients', department: 'Legal', role: 'Lawyer', status: 'Pending' },
  { id: uid(), title: 'Set up investigation intake form and assign Investigators', department: 'Investigations', role: 'Investigator', status: 'Pending' },
  { id: uid(), title: 'Review active realty listings and approve new properties', department: 'Management', role: 'Admin', status: 'Pending' },
  { id: uid(), title: 'Prepare Q2 financial report for UAG LLC', department: 'Accounting', role: 'Accountant', status: 'Pending' },
  { id: uid(), title: 'Audit capital fund transactions and holdings', department: 'Accounting', role: 'Chief Financial Officer', status: 'Pending' },
  { id: uid(), title: 'Create employee handbook and department SOPs', department: 'Management', role: 'Admin', status: 'Pending' },
  { id: uid(), title: 'Inspect active construction sites and crew safety', department: 'Construction', role: 'Head Builder', status: 'Pending' },
]

export function getEmployees(): Employee[] {
  return getJSON<Employee[]>(KEYS.employees, [])
}

export function setEmployees(employees: Employee[]) {
  setJSON(KEYS.employees, employees)
}

export function addEmployee(employee: Omit<Employee, 'id' | 'joined'>): Employee {
  const emp: Employee = {
    ...employee,
    id: uid(),
    joined: new Date().toISOString().split('T')[0],
  }
  const list = [emp, ...getEmployees()]
  setEmployees(list)
  return emp
}

export function updateEmployee(id: string, partial: Partial<Employee>) {
  const list = getEmployees().map((e) => (e.id === id ? { ...e, ...partial } : e))
  setEmployees(list)
}

export function removeEmployee(id: string) {
  setEmployees(getEmployees().filter((e) => e.id !== id))
}

export function getRequests(): ServiceRequest[] {
  return getJSON<ServiceRequest[]>(KEYS.requests, [])
}

export function setRequests(requests: ServiceRequest[]) {
  setJSON(KEYS.requests, requests)
}

export function addRequest(request: Omit<ServiceRequest, 'id' | 'createdAt'>): ServiceRequest {
  const r: ServiceRequest = {
    ...request,
    id: uid(),
    createdAt: new Date().toISOString(),
  }
  const list = [r, ...getRequests()]
  setRequests(list)
  return r
}

export function updateRequest(id: string, partial: Partial<ServiceRequest>) {
  const list = getRequests().map((r) => (r.id === id ? { ...r, ...partial } : r))
  setRequests(list)
}

export function removeRequest(id: string) {
  setRequests(getRequests().filter((r) => r.id !== id))
}

export function getTasks(): Task[] {
  let tasks = getJSON<Task[]>(KEYS.tasks, [])
  if (!tasks.length) {
    tasks = defaultTasks
    setTasks(tasks)
  }
  return tasks
}

export function setTasks(tasks: Task[]) {
  setJSON(KEYS.tasks, tasks)
}

export function addTask(task: Omit<Task, 'id'>): Task {
  const t: Task = { ...task, id: uid() }
  const list = [t, ...getTasks()]
  setTasks(list)
  return t
}

export function updateTask(id: string, partial: Partial<Task>) {
  const list = getTasks().map((t) => (t.id === id ? { ...t, ...partial } : t))
  setTasks(list)
}

export function removeTask(id: string) {
  setTasks(getTasks().filter((t) => t.id !== id))
}

export function getChatMessages(): ChatMessage[] {
  return getJSON<ChatMessage[]>(KEYS.chat, [])
}

export function setChatMessages(messages: ChatMessage[]) {
  setJSON(KEYS.chat, messages)
}

export function addChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
  const m: ChatMessage = {
    ...message,
    id: uid(),
    createdAt: new Date().toISOString(),
  }
  const list = [...getChatMessages(), m]
  setChatMessages(list)
  return m
}

export function rolesForDepartment(department: Department): string[] {
  return DEPARTMENTS.find((d) => d.id === department)?.roles ?? []
}

export function getEmployeeByName(name: string | null | undefined): Employee | undefined {
  if (!name) return undefined
  const target = name.toLowerCase().trim()
  return getEmployees().find(
    (e) =>
      e.name.toLowerCase() === target ||
      (e.discordUsername && e.discordUsername.toLowerCase() === target)
  )
}

export function hasDepartment(
  name: string | null | undefined,
  department: Department
): boolean {
  const emp = getEmployeeByName(name)
  return emp ? emp.department === department : false
}

export function isStaff(name: string | null | undefined): boolean {
  return !!getEmployeeByName(name)
}

export function isBankAdmin(name: string | null | undefined): boolean {
  if (!name) return false
  const target = name.toLowerCase().trim()
  return target === 'brzzzes'
}

export function getAccountBooks(): AccountBook[] {
  return getJSON<AccountBook[]>(KEYS.accountingBooks, [])
}

export function setAccountBooks(books: AccountBook[]) {
  setJSON(KEYS.accountingBooks, books)
}

export function getAccessibleAccountBooks(
  userName: string | null | undefined,
  isAdmin = false
): AccountBook[] {
  return getAccountBooks().filter((b) => {
    if (isAdmin) return true
    const target = (userName || '').toLowerCase().trim()
    if (!target) return false
    if (b.owner && b.owner.toLowerCase().trim() === target) return true
    return (b.members || []).some((m) => m.toLowerCase().trim() === target)
  })
}

export function addAccountBook(name: string, owner: string): AccountBook {
  const ownerTrimmed = owner.trim()
  const book: AccountBook = {
    id: uid(),
    name: name.trim(),
    owner: ownerTrimmed,
    members: [ownerTrimmed],
    entries: [],
    createdAt: new Date().toISOString(),
  }
  const list = [...getAccountBooks(), book]
  setAccountBooks(list)
  return book
}

export function updateAccountBook(id: string, partial: Partial<AccountBook>) {
  const list = getAccountBooks().map((b) => (b.id === id ? { ...b, ...partial } : b))
  setAccountBooks(list)
}

export const UAG_CAPITAL_COMPANIES: Partial<AccountBook>[] = [
  { name: 'Two Guys Realty' },
  { name: 'Barclays Bank' },
  { name: 'De Ryder' },
  { name: 'UAGInvestigations' },
  { name: 'UAGCapital' },
  { name: 'Utterly Amazing Group LLC' },
  { name: 'UAGNewsNetwork', website: 'https://uag-news-network.base44.app/' },
]

export function seedUAGCapitalBooks(owner: string) {
  const books = getAccountBooks()
  const created: AccountBook[] = []
  for (const template of UAG_CAPITAL_COMPANIES) {
    const name = template.name?.trim()
    if (!name) continue
    const exists = books.some((b) => b.name.toLowerCase() === name.toLowerCase())
    if (exists) continue
    const book = addAccountBook(name, owner)
    if (template.website) {
      updateAccountBook(book.id, { website: template.website })
    }
    created.push(book)
  }
  return created
}

export function removeAccountBook(id: string) {
  setAccountBooks(getAccountBooks().filter((b) => b.id !== id))
}

export function addAccountBookMember(bookId: string, userName: string) {
  const target = userName.trim()
  if (!target) return
  updateAccountBook(bookId, {
    members: [...new Set([...((getAccountBooks().find((b) => b.id === bookId)?.members ?? [])) as string[], target])],
  })
}

export function removeAccountBookMember(bookId: string, userName: string) {
  const target = userName.trim()
  if (!target) return
  updateAccountBook(bookId, {
    members: ((getAccountBooks().find((b) => b.id === bookId)?.members ?? []) as string[]).filter(
      (m) => m.toLowerCase().trim() !== target.toLowerCase().trim()
    ),
  })
}

export function addLedgerEntry(bookId: string, entry: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
  const item: LedgerEntry = { ...entry, id: uid(), createdAt: new Date().toISOString() }
  const list = getAccountBooks().map((b) =>
    b.id === bookId ? { ...b, entries: [...b.entries, item] } : b
  )
  setAccountBooks(list)
  return item
}

export function updateLedgerEntry(bookId: string, entryId: string, partial: Partial<LedgerEntry>) {
  const list = getAccountBooks().map((b) =>
    b.id === bookId
      ? { ...b, entries: b.entries.map((e) => (e.id === entryId ? { ...e, ...partial } : e)) }
      : b
  )
  setAccountBooks(list)
}

export function removeLedgerEntry(bookId: string, entryId: string) {
  const list = getAccountBooks().map((b) =>
    b.id === bookId ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) } : b
  )
  setAccountBooks(list)
}

export function getInvoices(): Invoice[] {
  return getJSON<Invoice[]>(KEYS.invoices, [])
}

export function setInvoices(invoices: Invoice[]) {
  setJSON(KEYS.invoices, invoices)
}

export function getInvoicesForBook(bookId: string): Invoice[] {
  return getInvoices().filter((i) => i.bookId === bookId)
}

export function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
  const item: Invoice = { ...invoice, id: uid(), createdAt: new Date().toISOString() }
  const list = [item, ...getInvoices()]
  setInvoices(list)
  return item
}

export function updateInvoice(id: string, partial: Partial<Invoice>) {
  const list = getInvoices().map((i) => (i.id === id ? { ...i, ...partial } : i))
  setInvoices(list)
}

export function removeInvoice(id: string) {
  setInvoices(getInvoices().filter((i) => i.id !== id))
}

export function getBanks(): Bank[] {
  let banks = getJSON<Bank[]>(KEYS.banks, [])
  if (!banks.length) {
    banks = defaultBanks
    setBanks(banks)
  }
  return banks
}

export function setBanks(banks: Bank[]) {
  setJSON(KEYS.banks, banks)
}

export function addBank(bank: Omit<Bank, 'id' | 'createdAt'>): Bank {
  const b: Bank = { ...bank, id: uid(), createdAt: new Date().toISOString() }
  const list = [...getBanks(), b]
  setBanks(list)
  return b
}

export function updateBank(id: string, partial: Partial<Bank>) {
  const list = getBanks().map((b) => (b.id === id ? { ...b, ...partial } : b))
  setBanks(list)
}

export function removeBank(id: string) {
  setBanks(getBanks().filter((b) => b.id !== id))
}

export function getBankConnections(): BankConnection[] {
  return getJSON<BankConnection[]>(KEYS.bankConnections, [])
}

export function getBankConnectionsForUser(userName: string | null | undefined): BankConnection[] {
  if (!userName) return []
  return getBankConnections().filter((c) => c.userName.toLowerCase() === userName.toLowerCase())
}

export function setBankConnections(connections: BankConnection[]) {
  setJSON(KEYS.bankConnections, connections)
}

export function addBankConnection(connection: Omit<BankConnection, 'id' | 'createdAt'>): BankConnection {
  const c: BankConnection = { ...connection, id: uid(), createdAt: new Date().toISOString() }
  const list = [...getBankConnections(), c]
  setBankConnections(list)
  return c
}

export function removeBankConnection(id: string) {
  setBankConnections(getBankConnections().filter((c) => c.id !== id))
}
