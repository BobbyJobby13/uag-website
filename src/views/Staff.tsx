import { useEffect, useState } from 'react'
import { Users, Trash2 } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import { DEPARTMENTS, getEmployees, removeEmployee, type Department, type Employee } from '../lib/data'

export function Staff() {
  const { isAdmin } = useDiscordAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filter, setFilter] = useState<'All' | Department>('All')

  useEffect(() => {
    setEmployees(getEmployees())
  }, [])

  const filtered = filter === 'All' ? employees : employees.filter((e) => e.department === filter)

  const handleRemove = (id: string) => {
    removeEmployee(id)
    setEmployees(getEmployees())
  }

  return (
    <div className="page">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Staff Directory</h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Accounting, Legal, Investigations, Construction, and Management teams.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('All')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            filter === 'All' ? 'bg-indigo-600 text-white' : 'bg-[#111827] text-[#8b92a8] hover:text-white'
          }`}
        >
          All
        </button>
        {DEPARTMENTS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setFilter(d.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === d.id ? 'bg-indigo-600 text-white' : 'bg-[#111827] text-[#8b92a8] hover:text-white'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Panel>
          <p className="text-sm text-[#8b92a8]">No staff in this department yet. Add employees from the Admin page.</p>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp) => (
          <Panel key={emp.id}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827]">
                <Users size={20} className="text-indigo-400" />
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleRemove(emp.id)}
                  className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Remove employee"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{emp.name}</h3>
            <p className="text-sm text-indigo-400">{emp.role}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#5d6a87]">
              <span className="rounded-md bg-[#111827] px-2 py-1">{emp.department}</span>
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
            </div>
            {emp.discordUsername && (
              <p className="mt-2 text-xs text-[#5d6a87]">Discord: @{emp.discordUsername}</p>
            )}
            {emp.notes && <p className="mt-2 text-xs text-[#8b92a8]">{emp.notes}</p>}
            <p className="mt-3 text-xs text-[#5d6a87]">Joined {emp.joined}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
