import { useEffect, useState } from 'react'
import { Bot, Gavel, Plus, Trash2, Users } from '../icons'
import { AIAssistant } from '../components/AIAssistant'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  addRequest,
  getEmployees,
  getRequests,
  hasDepartment,
  removeRequest,
  updateRequest,
  type Employee,
  type ServiceRequest,
} from '../lib/data'

const SERVICE_TYPE = 'Legal'

export function Lawyers() {
  const { isAdmin, userName } = useDiscordAuth()
  const allowed = isAdmin || hasDepartment(userName, SERVICE_TYPE)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [form, setForm] = useState({ clientName: '', contact: '', description: '' })
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    setEmployees(getEmployees())
    setRequests(getRequests())
  }, [])

  const refresh = () => setRequests(getRequests())

  const legalStaff = employees.filter((e) => e.department === SERVICE_TYPE)
  const legalRequests = requests.filter((r) => r.serviceType === SERVICE_TYPE)

  const createCase = () => {
    if (!form.clientName.trim() || !form.description.trim()) return
    addRequest({
      clientName: form.clientName.trim(),
      contact: form.contact.trim(),
      serviceType: SERVICE_TYPE,
      description: form.description.trim(),
      status: 'Open',
      assignedTo: userName || undefined,
    })
    refresh()
    setForm({ clientName: '', contact: '', description: '' })
  }

  const advance = (req: ServiceRequest) => {
    const next: ServiceRequest['status'] =
      req.status === 'Open' ? 'In Progress' : req.status === 'In Progress' ? 'Closed' : 'Open'
    updateRequest(req.id, { status: next })
    refresh()
  }

  const updateNotes = (req: ServiceRequest, notes: string) => {
    updateRequest(req.id, { notes })
    refresh()
  }

  const generateCaseFile = async (req: ServiceRequest) => {
    setGeneratingId(req.id)
    try {
      const prompt = `Client: ${req.clientName}. Contact: ${req.contact || 'N/A'}. Status: ${req.status}. Notes: ${req.notes || 'None'}. Facts: ${req.description}. Create a complete legal case file: summary of facts, claims/issues, applicable legal strategy, recommended next steps, and a draft memo. Keep it concise and professional.`
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'legal', question: prompt }),
      })
      const data = await res.json()
      updateRequest(req.id, { caseFile: data.answer || 'Could not generate case file.' })
      refresh()
    } catch {
      updateRequest(req.id, { caseFile: 'AI case file generation failed. Try again later.' })
      refresh()
    } finally {
      setGeneratingId(null)
    }
  }

  const handleRemove = (req: ServiceRequest) => {
    removeRequest(req.id)
    refresh()
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Panel>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-sm text-[#9ca3af]">
            This workspace is for UAG Legal staff only.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Legal Department</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          UAG legal case management and AI-assisted drafting.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Users size={16} className="text-blue-400" />
            Legal Staff
          </div>
          {legalStaff.length === 0 ? (
            <p className="text-sm text-[#9ca3af]">No legal staff listed. Assign roles in Role Manager.</p>
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
            New Case
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Client name"
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
              placeholder="Case facts and description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500 sm:col-span-2"
            />
          </div>
          <button
            type="button"
            onClick={createCase}
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Plus size={16} />
            Create Case
          </button>
        </Panel>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Cases</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {legalRequests.length === 0 && (
            <Panel>
              <p className="text-sm text-[#9ca3af]">No cases yet. Create one above.</p>
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => generateCaseFile(req)}
                    disabled={generatingId === req.id}
                    className="flex items-center gap-1 rounded-md bg-purple-600/10 px-2 py-1 text-xs font-medium text-purple-400 transition hover:bg-purple-600/20 disabled:opacity-50"
                    aria-label="Generate case file with AI"
                  >
                    <Bot size={12} />
                    {generatingId === req.id ? 'Drafting...' : 'AI Case File'}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemove(req)}
                      className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label="Delete case"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-[#e5e7eb]">{req.description}</p>
              {req.assignedTo && <p className="mt-2 text-xs text-blue-400">Assigned: {req.assignedTo}</p>}
              <textarea
                value={req.notes || ''}
                onChange={(e) => updateNotes(req, e.target.value)}
                placeholder="Case notes..."
                rows={2}
                className="mt-3 w-full rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-xs text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
              />
              {req.caseFile && (
                <div className="mt-3 rounded-lg bg-[#181a20] p-3">
                  <p className="text-xs font-semibold text-purple-400">AI Case File</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-[#e5e7eb]">{req.caseFile}</p>
                </div>
              )}
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
                <button
                  type="button"
                  onClick={() => advance(req)}
                  className="rounded-md bg-[#2a2c35] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#3a3c45]"
                >
                  {req.status === 'Closed' ? 'Reopen' : 'Advance'}
                </button>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <AIAssistant
        service="legal"
        department={SERVICE_TYPE}
        placeholder="Ask the legal AI to draft clauses, memos, or case strategy..."
      />
    </div>
  )
}
