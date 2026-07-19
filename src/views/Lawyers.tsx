import { useEffect, useState } from 'react'
import { Gavel, Plus, Trash2, Users, Shield } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  addRequest,
  getEmployees,
  getRequests,
  removeRequest,
  updateRequest,
  type Employee,
  type ServiceRequest,
} from '../lib/data'

const SERVICE_TYPE = 'Legal'

export function Lawyers() {
  const { isAdmin, userName } = useDiscordAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [form, setForm] = useState({ clientName: '', contact: '', description: '' })

  useEffect(() => {
    setEmployees(getEmployees())
    setRequests(getRequests())
  }, [])

  const legalStaff = employees.filter((e) => e.department === SERVICE_TYPE)
  const legalRequests = requests.filter((r) => r.serviceType === SERVICE_TYPE)

  const submitRequest = () => {
    if (!form.clientName.trim() || !form.description.trim()) return
    addRequest({
      clientName: form.clientName.trim(),
      contact: form.contact.trim(),
      serviceType: SERVICE_TYPE,
      description: form.description.trim(),
      status: 'Open',
    })
    setRequests(getRequests())
    setForm({ clientName: '', contact: '', description: '' })
  }

  const canManage = (req: ServiceRequest) => isAdmin || (userName && req.assignedTo === userName)

  const advance = (req: ServiceRequest) => {
    const next: ServiceRequest['status'] =
      req.status === 'Open' ? 'In Progress' : req.status === 'In Progress' ? 'Closed' : 'Open'
    updateRequest(req.id, { status: next })
    setRequests(getRequests())
  }

  const claim = (req: ServiceRequest) => {
    if (!userName) return
    updateRequest(req.id, { assignedTo: userName })
    setRequests(getRequests())
  }

  const updateNotes = (req: ServiceRequest, notes: string) => {
    updateRequest(req.id, { notes })
    setRequests(getRequests())
  }

  const handleRemove = (req: ServiceRequest) => {
    removeRequest(req.id)
    setRequests(getRequests())
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Legal Department</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          UAG legal team, client intake, and case management.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Users size={16} className="text-blue-400" />
            Legal Staff
          </div>
          {legalStaff.length === 0 ? (
            <p className="text-sm text-[#9ca3af]">No legal staff listed yet. Add them in Admin.</p>
          ) : (
            <ul className="space-y-2">
              {legalStaff.map((emp) => (
                <li key={emp.id} className="rounded-lg bg-[#181a20] px-3 py-2">
                  <p className="text-sm font-medium text-white">{emp.name}</p>
                  <p className="text-xs text-[#6b7280]">
                    {emp.role} • {emp.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Gavel size={16} className="text-blue-400" />
            Request a Lawyer
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Your name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Discord / contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <textarea
              placeholder="Describe your legal matter..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500 sm:col-span-2"
            />
          </div>
          <button
            type="button"
            onClick={submitRequest}
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Plus size={16} />
            Submit Legal Request
          </button>
        </Panel>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Open Cases</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {legalRequests.length === 0 && (
            <Panel>
              <p className="text-sm text-[#9ca3af]">No legal requests yet.</p>
            </Panel>
          )}
          {legalRequests.map((req) => (
            <Panel key={req.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{req.clientName}</h3>
                  <p className="text-xs text-[#6b7280]">
                    {new Date(req.createdAt).toLocaleString()} {req.contact ? `• ${req.contact}` : ''}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRemove(req)}
                    className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-rose-500/10 hover:text-rose-400"
                    aria-label="Delete request"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm text-[#e5e7eb]">{req.description}</p>
              {req.assignedTo && (
                <p className="mt-2 text-xs text-blue-400">Assigned: {req.assignedTo}</p>
              )}
              <textarea
                value={req.notes || ''}
                onChange={(e) => updateNotes(req, e.target.value)}
                placeholder={canManage(req) ? 'Case notes...' : 'Notes visible to assigned lawyer/admin'}
                disabled={!canManage(req)}
                rows={2}
                className="mt-3 w-full rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-xs text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500 disabled:opacity-50"
              />
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    req.status === 'Open'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : req.status === 'In Progress'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-[#2a2c35] text-[#9ca3af]'
                  }`}
                >
                  {req.status}
                </span>
                {canManage(req) ? (
                  <button
                    type="button"
                    onClick={() => advance(req)}
                    className="rounded-md bg-[#2a2c35] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#3a3c45]"
                  >
                    {req.status === 'Closed' ? 'Reopen' : 'Advance'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => claim(req)}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                  >
                    <Shield size={12} />
                    Claim
                  </button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}
