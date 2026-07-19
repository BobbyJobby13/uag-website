export type Department = 'Accounting' | 'Legal' | 'Investigations' | 'Construction' | 'Management'

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
}

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
