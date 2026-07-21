import { useEffect, useRef, useState } from 'react'
import { Bot, Copy, ExternalLink, FileText, Send } from '../icons'
import { useDiscordAuth } from '../context/DiscordAuth'
import { API_BASE } from '../lib/api'
import { hasDepartment, type Department } from '../lib/data'

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
        className="btn-primary"
      >
        <Bot size={16} />
        {open ? 'Close AI assistant' : 'Ask AI'}
      </button>

      {open && (
        <div className="glass-panel mt-3 flex h-96 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1c2335] bg-[#111827]/60 px-4 py-3 text-sm font-semibold text-white">
            <Bot size={16} className="text-indigo-400" />
            {systemNames[service] || 'AI Assistant'}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'ml-auto bg-indigo-600 text-white'
                      : 'bg-[#111827] text-[#9aa3b8]'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'assistant' && service === 'accounting' && i > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportReportAsPDF(m.text)}
                      className="btn-ghost text-[11px]"
                    >
                      <FileText size={12} />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => openInGoogleDocs(m.text, i)}
                      className="btn-ghost text-[11px]"
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
                      className="btn-ghost text-[11px]"
                    >
                      <Copy size={12} />
                      {copiedId === i ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-3.5 py-2.5 text-sm text-[#8b92a8]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                Typing…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[#1c2335] bg-[#111827]/40 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={placeholder}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="btn-primary p-2.5"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
