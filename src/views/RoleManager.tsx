import { useEffect, useMemo, useState } from 'react'
import { UserCog, Save, Plus } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  addEmployee,
  DEPARTMENTS,
  getEmployees,
  rolesForDepartment,
  updateEmployee,
  type Department,
  type Employee,
} from '../lib/data'

type FormState = {
  name: string
  discordUsername: string
  department: Department
  role: string
  status: Employee['status']
  notes: string
}

const DEFAULT_FORM: FormState = {
  name: '',
  discordUsername: '',
  department: 'Accounting',
  role: '',
  status: 'Active',
  notes: '',
}

export function RoleManager() {
  const { user, userName, isAdmin } = useDiscordAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setEmployees(getEmployees())
  }, [])

  const allowed = isAdmin || userName?.toLowerCase() === 'brzzzes'

  const target = useMemo(() => {
    if (isAdmin && selectedId) {
      if (selectedId === 'new') return null
      return employees.find((e) => e.id === selectedId)
    }
    return (
      employees.find(
        (e) =>
          e.name.toLowerCase() === (userName || '').toLowerCase() ||
          (e.discordUsername && e.discordUsername.toLowerCase() === (user?.username || '').toLowerCase())
      ) || null
    )
  }, [employees, isAdmin, selectedId, user?.username, userName])

  useEffect(() => {
    if (target) {
      setForm({
        name: target.name,
        discordUsername: target.discordUsername || '',
        department: target.department,
        role: target.role,
        status: target.status,
        notes: target.notes || '',
      })
    } else {
      setForm({
        ...DEFAULT_FORM,
        name: isAdmin ? '' : userName || '',
        discordUsername: user?.username || '',
        role: rolesForDepartment(DEFAULT_FORM.department)[0] || '',
      })
    }
  }, [target, isAdmin, userName, user?.username])

  const handleDepartmentChange = (department: Department) => {
    const role = rolesForDepartment(department)[0] || ''
    setForm((f) => ({ ...f, department, role }))
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.role) return
    if (target) {
      updateEmployee(target.id, form)
    } else {
      addEmployee({
        name: form.name.trim(),
        discordUsername: form.discordUsername.trim() || undefined,
        department: form.department,
        role: form.role,
        status: form.status,
        notes: form.notes.trim() || undefined,
      })
    }
    setEmployees(getEmployees())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Panel>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-sm text-[#8b92a8]">
            This page is only available to Brzzzes and admins.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Role Manager</h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Update your department, role, and status. Admins can also manage other employees.
        </p>
      </header>

      <Panel>
        {isAdmin && (
          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Select employee</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            >
              <option value="">{userName?.toLowerCase() === 'brzzzes' ? 'My profile' : 'Select an employee'}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </option>
              ))}
              <option value="new">+ Create new employee</option>
            </select>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <UserCog size={16} className="text-indigo-400" />
          {target ? `Editing ${target.name}` : 'Create profile'}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!isAdmin && target !== null}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Discord username</label>
            <input
              type="text"
              value={form.discordUsername}
              onChange={(e) => setForm({ ...form, discordUsername: e.target.value })}
              disabled={!isAdmin && target !== null}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Department</label>
            <select
              value={form.department}
              onChange={(e) => handleDepartmentChange(e.target.value as Department)}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            >
              {rolesForDepartment(form.department).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Employee['status'] })}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            >
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-[#8b92a8]">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          {target ? <Save size={16} /> : <Plus size={16} />}
          {target ? 'Save changes' : 'Create profile'}
        </button>

        {saved && (
          <p className="mt-3 text-sm text-emerald-400">Saved successfully.</p>
        )}
      </Panel>
    </div>
  )
}
