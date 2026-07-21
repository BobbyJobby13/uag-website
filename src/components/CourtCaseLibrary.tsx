import { useEffect, useMemo, useState } from 'react'
import {
  addCourtCase,
  getCourtCases,
  removeCourtCase,
  updateCourtCase,
  type CourtCase,
  type CourtStatus,
} from '../lib/legal'
import { hasDepartment } from '../lib/data'
import { useDiscordAuth } from '../context/DiscordAuth'
import { API_BASE } from '../lib/api'
import { Panel } from './Panel'
import { BookOpen, Bot, ExternalLink, Gavel, Pencil, RefreshCw, Save, Search, Trash2 } from '../icons'

const COURTS = ['Supreme Court', 'Federal Court', 'District Court', 'Other']
const STATUSES: CourtStatus[] = ['Open', 'Pending', 'In Progress', 'Adjourned', 'Closed', 'Dismissed', 'Accepted', 'Unknown']

const emptyForm = {
  title: '',
  forumUrl: '',
  court: '',
  status: 'Open' as CourtStatus,
  summary: '',
  facts: '',
  charges: '',
  evidence: '',
  notes: '',
  rawText: '',
}

export function CourtCaseLibrary() {
  const { userName, isAdmin } = useDiscordAuth()
  const canEdit = isAdmin || hasDepartment(userName, 'Legal')

  const [cases, setCases] = useState<CourtCase[]>([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [draft, setDraft] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setCases(getCourtCases())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cases
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.court || '').toLowerCase().includes(q) ||
        (c.charges || '').toLowerCase().includes(q) ||
        (c.summary || '').toLowerCase().includes(q) ||
        (c.facts || '').toLowerCase().includes(q)
    )
  }, [cases, query])

  const resetForm = () => {
    setForm({ ...emptyForm })
    setEditingId(null)
    setFetchError('')
    setDraft('')
  }

  const fetchThread = async () => {
    const url = form.forumUrl.trim()
    if (!url) return
    setFetching(true)
    setFetchError('')
    try {
      const res = await fetch(`${API_BASE}/legal/fetch-thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not fetch thread')
      setForm((prev) => ({
        ...prev,
        title: prev.title || data.title || '',
        summary: prev.summary || data.text.slice(0, 600) || '',
        rawText: data.text || '',
      }))
    } catch (err: any) {
      setFetchError(err.message || 'Fetch failed. You can still paste the thread text manually.')
    } finally {
      setFetching(false)
    }
  }

  const saveCase = () => {
    if (!form.title.trim() || !form.forumUrl.trim()) return
    if (editingId) {
      updateCourtCase(editingId, { ...form, court: form.court || undefined })
    } else {
      addCourtCase({ ...form, court: form.court || undefined })
    }
    setCases(getCourtCases())
    resetForm()
  }

  const startEdit = (c: CourtCase) => {
    setForm({
      title: c.title,
      forumUrl: c.forumUrl,
      court: c.court || '',
      status: c.status,
      summary: c.summary || '',
      facts: c.facts || '',
      charges: c.charges || '',
      evidence: c.evidence || '',
      notes: c.notes || '',
      rawText: c.rawText || '',
    })
    setEditingId(c.id)
    setSelectedId(null)
    setDraft('')
  }

  const deleteCase = (id: string) => {
    if (!confirm('Delete this case from the library?')) return
    removeCourtCase(id)
    setCases(getCourtCases())
    if (selectedId === id) setSelectedId(null)
  }

  const buildPrompt = (c: CourtCase) => {
    return `You are helping a UAG lawyer prepare a DemocracyCraft court case. Review the following case details from ${c.forumUrl} and draft a professional case file: summary of facts, claims or charges, relevant legal strategy, recommended next steps, and a concise memo. Label everything as a draft for attorney review.\n\nTitle: ${c.title}\nCourt: ${c.court || 'N/A'}\nStatus: ${c.status}\nSummary: ${c.summary || 'N/A'}\nFacts: ${c.facts || 'N/A'}\nCharges: ${c.charges || 'N/A'}\nEvidence: ${c.evidence || 'N/A'}\nNotes: ${c.notes || 'N/A'}\nForum text excerpt: ${c.rawText?.slice(0, 2000) || 'N/A'}`
  }

  const draftCaseFile = async (c: CourtCase) => {
    setDrafting(true)
    setDraft('')
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'legal', question: buildPrompt(c) }),
      })
      const data = await res.json()
      setDraft(data.answer || 'Could not generate a draft.')
    } catch {
      setDraft('AI drafting failed. Try again later.')
    } finally {
      setDrafting(false)
    }
  }

  const inputClass =
    'rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-[#e8eaf2] outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20'

  return (
    <div className="space-y-6">
      <Panel>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#e8eaf2]">Court Case Library</h2>
        </div>
        <p className="text-sm text-[#8b92a8]">
          Save DemocracyCraft court threads and case details to build a knowledge base for the AI legal assistant.
          Paste a forum URL below to pull the thread title and first post, then refine the case record.
        </p>
        <a
          href="https://www.democracycraft.net/forums/courts.19/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
        >
          Browse DemocracyCraft Courts <ExternalLink size={12} />
        </a>
      </Panel>

      {canEdit && (
        <Panel className="border-indigo-500/20">
          <div className="mb-4 flex items-center gap-2">
            <Gavel size={18} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-[#e8eaf2]">
              {editingId ? 'Edit Case' : 'Add New Case'}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Forum thread URL"
              value={form.forumUrl}
              onChange={(e) => setForm({ ...form, forumUrl: e.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
            <button
              type="button"
              onClick={fetchThread}
              disabled={fetching || !form.forumUrl.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#1c2335] px-3 py-2 text-sm font-medium text-[#e8eaf2] transition hover:bg-[#2a344e] disabled:opacity-50"
            >
              <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
              {fetching ? 'Fetching...' : 'Fetch Thread'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#1c2335] bg-transparent px-3 py-2 text-sm font-medium text-[#8b92a8] transition hover:text-[#e8eaf2]"
            >
              Reset
            </button>
          </div>

          {fetchError && <p className="mt-3 text-xs text-rose-400">{fetchError}</p>}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Case title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
            <select
              value={form.court}
              onChange={(e) => setForm({ ...form, court: e.target.value })}
              className={inputClass}
            >
              <option value="">Select court...</option>
              {COURTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as CourtStatus })}
              className={inputClass}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <textarea
              placeholder="Summary (auto-filled from forum fetch or paste your own)"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <textarea
              placeholder="Facts"
              value={form.facts}
              onChange={(e) => setForm({ ...form, facts: e.target.value })}
              rows={3}
              className={inputClass}
            />
            <textarea
              placeholder="Charges / Claims"
              value={form.charges}
              onChange={(e) => setForm({ ...form, charges: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <textarea
              placeholder="Evidence"
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              rows={3}
              className={inputClass}
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>

          {form.rawText && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-[#8b92a8]">Raw forum text ({form.rawText.length} chars)</summary>
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[#1c2335] bg-[#02040a] p-3 text-xs text-[#8b92a8]">
                {form.rawText}
              </div>
            </details>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={saveCase}
              disabled={!form.title.trim() || !form.forumUrl.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save size={16} />
              {editingId ? 'Update Case' : 'Save Case'}
            </button>
          </div>
        </Panel>
      )}

      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-[#e8eaf2]">Saved Cases ({cases.length})</h3>
          </div>
          <input
            type="text"
            placeholder="Search cases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass} w-full sm:w-64`}
          />
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-[#8b92a8]">
            {cases.length === 0
              ? 'No cases saved yet. Add a DemocracyCraft court thread to start building the knowledge base.'
              : 'No cases match your search.'}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border transition ${
                selectedId === c.id ? 'border-indigo-500/40 bg-[#0b0f19]' : 'border-[#1c2335] bg-[#0b0f19] hover:border-[#2a344e]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                className="flex w-full items-start justify-between p-4 text-left"
              >
                <div>
                  <h4 className="text-sm font-medium text-[#e8eaf2]">{c.title}</h4>
                  <p className="mt-1 text-xs text-[#8b92a8]">
                    {c.court || 'Unknown court'} • {c.status}
                    {c.createdAt ? ` • ${new Date(c.createdAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={c.forumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-indigo-400"
                    aria-label="Open forum thread"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEdit(c)
                        }}
                        className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-indigo-400"
                        aria-label="Edit case"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCase(c.id)
                        }}
                        className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                        aria-label="Delete case"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </button>

              {selectedId === c.id && (
                <div className="border-t border-[#1c2335] p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {c.summary && (
                      <div>
                        <span className="text-xs font-medium text-[#5d6a87] uppercase">Summary</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#9aa3b8]">{c.summary}</p>
                      </div>
                    )}
                    {c.facts && (
                      <div>
                        <span className="text-xs font-medium text-[#5d6a87] uppercase">Facts</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#9aa3b8]">{c.facts}</p>
                      </div>
                    )}
                    {c.charges && (
                      <div>
                        <span className="text-xs font-medium text-[#5d6a87] uppercase">Charges / Claims</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#9aa3b8]">{c.charges}</p>
                      </div>
                    )}
                    {c.evidence && (
                      <div>
                        <span className="text-xs font-medium text-[#5d6a87] uppercase">Evidence</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#9aa3b8]">{c.evidence}</p>
                      </div>
                    )}
                    {c.notes && (
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-[#5d6a87] uppercase">Notes</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#9aa3b8]">{c.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => draftCaseFile(c)}
                      disabled={drafting}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600/90 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Bot size={14} />
                      {drafting ? 'Drafting...' : 'Draft Case Memo'}
                    </button>
                  </div>

                  {draft && (
                    <div className="mt-4 rounded-xl border border-[#1c2335] bg-[#02040a] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Bot size={14} className="text-indigo-400" />
                        <span className="text-xs font-semibold text-[#e8eaf2]">AI Draft</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm text-[#9aa3b8]">{draft}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
