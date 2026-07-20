import { useEffect, useRef, useState } from 'react'
import { Bot, Copy, ExternalLink, FileText, Send } from '../icons'
import { useDiscordAuth } from '../context/DiscordAuth'
import { hasDepartment, type Department } from '../lib/data'

const apiBase = import.meta.env.VITE_API_BASE_URL
const API_BASE = (typeof apiBase === 'string' && apiBase.startsWith('/')) ? apiBase : '/api'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

const systemNames: Record<string, string> = {
  accounting: 'UAG Accounting Assistant',
  legal: 'UAG Legal Assistant',
  investigations: 'UAG Investigations Assistant',
  general: 'UAG AI Assistant',
}

export function AIAssistant({
  service,
  department,
  placeholder = 'Ask for help...',
}: {
  service: 'accounting' | 'legal' | 'investigations' | 'general'
  department: Department
  placeholder?: string
}) {
  const { userName, isAdmin } = useDiscordAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hi! I am the ${systemNames[service] || 'UAG Assistant'}. How can I help?`,
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  const allowed = isAdmin || hasDepartment(userName, department)
  if (!allowed) return null

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    const next = [...messages, { role: 'user' as const, text }]
    setMessages(next)
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, question: text }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', text: data.answer || 'Sorry, I could not answer that.' }])
    } catch {
      setMessages([...next, { role: 'assistant', text: 'Oops, something went wrong. Try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  const exportReportAsPDF = async (text: string) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const title = 'UAG Accounting Report'
    doc.setFontSize(18)
    doc.text(title, 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
    doc.setTextColor(0)
    doc.setFontSize(11)
    doc.text(text, 14, 40, { maxWidth: 180, lineHeightFactor: 1.5 })
    doc.save('uag-accounting-report.pdf')
  }

  const openInGoogleDocs = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // ignore clipboard errors
    }
    window.open('https://docs.google.com/document/create', '_blank')
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Bot size={16} />
        {open ? 'Close AI assistant' : 'Ask AI'}
      </button>

      {open && (
        <div className="mt-3 flex h-80 flex-col rounded-xl border border-[#1c2335] bg-[#0b0f19] shadow-2xl">
          <div className="flex items-center gap-2 rounded-t-xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
            <Bot size={16} className="text-indigo-400" />
            {systemNames[service] || 'AI Assistant'}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'ml-auto bg-indigo-600 text-white'
                      : 'bg-[#111827] text-[#9aa3b8]'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'assistant' && service === 'accounting' && i > 0 && (
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportReportAsPDF(m.text)}
                      className="flex items-center gap-1 rounded-md bg-[#1c2335] px-2 py-1 text-[10px] font-medium text-[#8b92a8] transition hover:bg-indigo-500/10 hover:text-indigo-400"
                    >
                      <FileText size={12} />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => openInGoogleDocs(m.text, i)}
                      className="flex items-center gap-1 rounded-md bg-[#1c2335] px-2 py-1 text-[10px] font-medium text-[#8b92a8] transition hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                      <ExternalLink size={12} />
                      Google Doc
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(m.text)
                          setCopiedId(i)
                          setTimeout(() => setCopiedId(null), 2000)
                        } catch {}
                      }}
                      className="flex items-center gap-1 rounded-md bg-[#1c2335] px-2 py-1 text-[10px] font-medium text-[#8b92a8] transition hover:bg-[#2a344e] hover:text-white"
                    >
                      <Copy size={12} />
                      {copiedId === i ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-[#111827] px-3 py-2 text-sm text-[#8b92a8]">Typing...</div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[#1c2335] p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-indigo-600 p-2 text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
