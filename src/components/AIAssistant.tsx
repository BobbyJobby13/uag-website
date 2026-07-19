import { useEffect, useRef, useState } from 'react'
import { Bot, Send } from '../icons'
import { useDiscordAuth } from '../context/DiscordAuth'
import { hasDepartment, type Department } from '../lib/data'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

const systemNames: Record<string, string> = {
  accounting: 'UAG Accounting Assistant',
  legal: 'UAG Legal Assistant',
  investigations: 'UAG Investigations Assistant',
  general: 'UAG Assistant',
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

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Bot size={16} />
        {open ? 'Close AI assistant' : 'Ask AI'}
      </button>

      {open && (
        <div className="mt-3 flex h-80 flex-col rounded-xl border border-[#2a2c35] bg-[#111217] shadow-2xl">
          <div className="flex items-center gap-2 rounded-t-xl bg-[#181a20] px-4 py-3 text-sm font-semibold text-white">
            <Bot size={16} className="text-blue-400" />
            {systemNames[service] || 'AI Assistant'}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-[#181a20] text-[#e5e7eb]'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-[#181a20] px-3 py-2 text-sm text-[#9ca3af]">Typing...</div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[#2a2c35] p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
