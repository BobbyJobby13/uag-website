import { useEffect, useState } from 'react'
import {
  addEmployee,
  addTask,
  DEPARTMENTS,
  getEmployees,
  getRequests,
  getTasks,
  removeEmployee,
  removeRequest,
  removeTask,
  rolesForDepartment,
  setRequests,
  setTasks,
  isStaff,
  type Department,
  type Employee,
  type ServiceRequest,
  type Task,
} from '../lib/data'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import { Plus, Trash2, Users, Shield, List, Inbox, LayoutGrid } from '../icons'

type Tab = 'overview' | 'employees' | 'tasks' | 'requests' | 'content'

export function Admin() {
  const { isAdmin, userName } = useDiscordAuth()
  const allowed = isAdmin || isStaff(userName)
  const [tab, setTab] = useState<Tab>('overview')
  const [employees, setEmployeesState] = useState<Employee[]>([])
  const [tasks, setTasksState] = useState<Task[]>([])
  const [requests, setRequestsState] = useState<ServiceRequest[]>([])

  useEffect(() => {
    setEmployeesState(getEmployees())
    setTasksState(getTasks())
    setRequestsState(getRequests())
  }, [])

  const saveTasks = (list: Task[]) => {
    setTasks(list)
    setTasksState(list)
  }
  const saveRequests = (list: ServiceRequest[]) => {
    setRequests(list)
    setRequestsState(list)
  }

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    discordUsername: '',
    department: 'Accounting' as Department,
    role: '',
    status: 'Active' as Employee['status'],
    notes: '',
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    department: 'All' as Department | 'All',
    role: '',
    due: '',
    notes: '',
  })

  const [requestFilter, setRequestFilter] = useState<'All' | Department>('All')

  const handleAddEmployee = () => {
    if (!employeeForm.name.trim() || !employeeForm.role) return
    addEmployee({
      name: employeeForm.name.trim(),
      discordUsername: employeeForm.discordUsername.trim() || undefined,
      department: employeeForm.department,
      role: employeeForm.role,
      status: employeeForm.status,
      notes: employeeForm.notes.trim() || undefined,
    })
    setEmployeesState(getEmployees())
    setEmployeeForm({
      name: '',
      discordUsername: '',
      department: 'Accounting',
      role: rolesForDepartment('Accounting')[0] || '',
      status: 'Active',
      notes: '',
    })
  }

  const handleAddTask = () => {
    if (!taskForm.title.trim()) return
    addTask({
      title: taskForm.title.trim(),
      department: taskForm.department,
      role: taskForm.role.trim() || undefined,
      status: 'Pending',
      due: taskForm.due || undefined,
      notes: taskForm.notes.trim() || undefined,
    })
    setTasksState(getTasks())
    setTaskForm({ title: '', department: 'All', role: '', due: '', notes: '' })
  }

  const toggleTaskStatus = (task: Task) => {
    const next: Task['status'] =
      task.status === 'Pending' ? 'In Progress' : task.status === 'In Progress' ? 'Done' : 'Pending'
    const list = tasks.map((t) => (t.id === task.id ? { ...t, status: next } : t))
    saveTasks(list)
  }

  const filteredRequests =
    requestFilter === 'All'
      ? requests
      : requests.filter((r) => r.serviceType === requestFilter)

  const departmentCounts = DEPARTMENTS.map((d) => ({
    ...d,
    count: employees.filter((e) => e.department === d.id).length,
  }))

  if (!allowed) {
    return (
      <div className="page">
        <Panel>
          <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
          <p className="mt-2 text-sm text-[#8b92a8]">
            You do not have access to this page. Log in with a staff or admin Discord account.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Manage employees, tasks, service requests, and portal content.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutGrid },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'tasks', label: 'Action Plan', icon: List },
          { id: 'requests', label: 'Service Requests', icon: Inbox },
          { id: 'content', label: 'Portal Content', icon: Shield },
        ].map((t) => {
          const Icon = t.icon
          const active = tab === (t.id as Tab)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as Tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#111827] text-[#8b92a8] hover:bg-[#1c2335] hover:text-white'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Panel>
              <p className="text-xs text-[#8b92a8]">Total Employees</p>
              <p className="text-2xl font-semibold text-white">{employees.length}</p>
            </Panel>
            <Panel>
              <p className="text-xs text-[#8b92a8]">Open Requests</p>
              <p className="text-2xl font-semibold text-white">
                {requests.filter((r) => r.status === 'Open').length}
              </p>
            </Panel>
            <Panel>
              <p className="text-xs text-[#8b92a8]">Pending Tasks</p>
              <p className="text-2xl font-semibold text-white">
                {tasks.filter((t) => t.status !== 'Done').length}
              </p>
            </Panel>
            <Panel>
              <p className="text-xs text-[#8b92a8]">Departments</p>
              <p className="text-2xl font-semibold text-white">{DEPARTMENTS.length}</p>
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel>
              <h3 className="mb-4 text-sm font-semibold text-white">Staff by Department</h3>
              <div className="space-y-2">
                {departmentCounts.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg bg-[#111827] px-3 py-2">
                    <span className="text-sm text-[#e8eaf2]">{d.label}</span>
                    <span className="rounded-md bg-[#1c2335] px-2 py-1 text-xs font-medium text-white">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <h3 className="mb-4 text-sm font-semibold text-white">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTab('employees')}
                  className="rounded-lg bg-[#111827] px-3 py-2 text-left text-sm text-white transition hover:bg-[#1c2335]"
                >
                  + Add Employee
                </button>
                <button
                  type="button"
                  onClick={() => setTab('tasks')}
                  className="rounded-lg bg-[#111827] px-3 py-2 text-left text-sm text-white transition hover:bg-[#1c2335]"
                >
                  + Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setTab('requests')}
                  className="rounded-lg bg-[#111827] px-3 py-2 text-left text-sm text-white transition hover:bg-[#1c2335]"
                >
                  View Requests
                </button>
                <button
                  type="button"
                  onClick={() => setTab('content')}
                  className="rounded-lg bg-[#111827] px-3 py-2 text-left text-sm text-white transition hover:bg-[#1c2335]"
                >
                  Manage Content
                </button>
              </div>
            </Panel>
          </div>

          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-white">UAG Operations Action Plan</h3>
            {tasks.filter((t) => t.status !== 'Done').length === 0 ? (
              <p className="text-sm text-[#8b92a8]">No pending tasks. Great job.</p>
            ) : (
              <ul className="space-y-2">
                {tasks
                  .filter((t) => t.status !== 'Done')
                  .slice(0, 10)
                  .map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded-lg bg-[#111827] px-3 py-2">
                      <div>
                        <p className="text-sm text-white">{t.title}</p>
                        <p className="text-xs text-[#5d6a87]">
                          {t.department} {t.role ? `• ${t.role}` : ''} • {t.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(t)}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-emerald-500"
                      >
                        {t.status === 'Pending' ? 'Start' : 'Done'}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {tab === 'employees' && (
        <div className="space-y-6">
          <Panel>
            <h2 className="mb-4 text-sm font-semibold text-white">Add Employee</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <input
                type="text"
                placeholder="Full name"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              />
              <input
                type="text"
                placeholder="Discord username"
                value={employeeForm.discordUsername}
                onChange={(e) => setEmployeeForm({ ...employeeForm, discordUsername: e.target.value })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              />
              <select
                value={employeeForm.department}
                onChange={(e) => {
                  const dept = e.target.value as Department
                  const roles = rolesForDepartment(dept)
                  setEmployeeForm({ ...employeeForm, department: dept, role: roles[0] || '' })
                }}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <select
                value={employeeForm.role}
                onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              >
                {rolesForDepartment(employeeForm.department).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={employeeForm.status}
                onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as Employee['status'] })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              >
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
              <button
                type="button"
                onClick={handleAddEmployee}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </Panel>

          <div className="overflow-hidden rounded-xl border border-[#1c2335]">
            <table className="w-full text-sm">
              <thead className="bg-[#111827] text-[#8b92a8]">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Name</th>
                  <th className="px-5 py-3 text-left font-medium">Department</th>
                  <th className="px-5 py-3 text-left font-medium">Role</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2335] bg-[#0b0f19]">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-4 text-center text-sm text-[#5d6a87]">
                      No employees yet. Add one above.
                    </td>
                  </tr>
                )}
                {employees.map((emp) => (
                  <tr key={emp.id} className="transition hover:bg-[#111827]">
                    <td className="px-5 py-4 text-white">
                      {emp.name}
                      {emp.discordUsername && (
                        <span className="ml-2 text-xs text-[#5d6a87]">@{emp.discordUsername}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#8b92a8]">{emp.department}</td>
                    <td className="px-5 py-4 text-[#8b92a8]">{emp.role}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#8b92a8]">{emp.joined}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          removeEmployee(emp.id)
                          setEmployeesState(getEmployees())
                        }}
                        className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                        aria-label="Delete employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-6">
          <Panel>
            <h2 className="mb-4 text-sm font-semibold text-white">Add Task</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                type="text"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              />
              <select
                value={taskForm.department}
                onChange={(e) => setTaskForm({ ...taskForm, department: e.target.value as Department | 'All' })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Role (optional)"
                value={taskForm.role}
                onChange={(e) => setTaskForm({ ...taskForm, role: e.target.value })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              />
              <input
                type="date"
                value={taskForm.due}
                onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })}
                className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tasks.map((t) => (
              <Panel key={t.id} className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                    <p className="mt-1 text-xs text-[#5d6a87]">
                      {t.department} {t.role ? `• ${t.role}` : ''} {t.due ? `• Due ${t.due}` : ''}
                    </p>
                    {t.notes && <p className="mt-2 text-xs text-[#8b92a8]">{t.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeTask(t.id)
                      setTasksState(getTasks())
                    }}
                    className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                    aria-label="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      t.status === 'Done'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : t.status === 'In Progress'
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {t.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(t)}
                    className="rounded-md bg-[#1c2335] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#2a344e]"
                  >
                    {t.status === 'Done' ? 'Reopen' : 'Advance'}
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-white">Filter:</span>
              {['All', ...DEPARTMENTS.map((d) => d.id)].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRequestFilter(f as 'All' | Department)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                    requestFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#111827] text-[#8b92a8] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredRequests.length === 0 && (
              <Panel>
                <p className="text-sm text-[#8b92a8]">No requests in this category.</p>
              </Panel>
            )}
            {filteredRequests.map((req) => (
              <Panel key={req.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{req.serviceType} Request</h3>
                    <p className="mt-1 text-xs text-[#5d6a87]">
                      From {req.clientName} • {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeRequest(req.id)
                      setRequestsState(getRequests())
                    }}
                    className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-3 text-sm text-[#e8eaf2]">{req.description}</p>
                {req.contact && (
                  <p className="mt-2 text-xs text-[#8b92a8]">Contact: {req.contact}</p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      req.status === 'Open'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : req.status === 'In Progress'
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'bg-[#1c2335] text-[#8b92a8]'
                    }`}
                  >
                    {req.status}
                  </span>
                  <select
                    value={req.assignedTo || ''}
                    onChange={(e) => {
                      const list = requests.map((r) =>
                        r.id === req.id ? { ...r, assignedTo: e.target.value || undefined } : r
                      )
                      saveRequests(list)
                    }}
                    className="rounded-lg border border-[#1c2335] bg-[#111827] px-2 py-1 text-xs text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
                  >
                    <option value="">Assign to...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.name}>
                        {e.name} ({e.role})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const next: ServiceRequest['status'] =
                        req.status === 'Open' ? 'In Progress' : req.status === 'In Progress' ? 'Closed' : 'Open'
                      const list = requests.map((r) => (r.id === req.id ? { ...r, status: next } : r))
                      saveRequests(list)
                    }}
                    className="rounded-md bg-[#1c2335] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#2a344e]"
                  >
                    Advance
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Panel>
            <h3 className="text-sm font-semibold text-white">Jobs Portal</h3>
            <p className="mt-1 text-xs text-[#8b92a8]">Post, edit, and review open positions.</p>
            <p className="mt-3 text-xs text-[#5d6a87]">Managed from the Jobs page.</p>
          </Panel>
          <Panel>
            <h3 className="text-sm font-semibold text-white">Realty Listings</h3>
            <p className="mt-1 text-xs text-[#8b92a8]">Add or remove property listings.</p>
            <p className="mt-3 text-xs text-[#5d6a87]">Managed from the Real Estate page.</p>
          </Panel>
          <Panel>
            <h3 className="text-sm font-semibold text-white">Staff Chat</h3>
            <p className="mt-1 text-xs text-[#8b92a8]">Employee communication channel.</p>
            <p className="mt-3 text-xs text-[#5d6a87]">Open the Staff Chat page.</p>
          </Panel>
          <Panel>
            <h3 className="text-sm font-semibold text-white">Lawyers & Investigators</h3>
            <p className="mt-1 text-xs text-[#8b92a8]">Client intake and case workspaces.</p>
            <p className="mt-3 text-xs text-[#5d6a87]">Managed from Lawyers and Investigators pages.</p>
          </Panel>
        </div>
      )}
    </div>
  )
}
