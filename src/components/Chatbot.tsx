import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '../lib/api'
import { Bot, MessageCircle, Send } from '../icons'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I am the UAG Portal Assistant. How can I help?' },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', text }])
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer || 'Sorry, I could not answer that.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Oops, something went wrong. Try again later.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500"
        aria-label="Open assistant"
      >
        {open ? '×' : <Bot size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex h-96 w-80 flex-col rounded-xl border border-[#1c2335] bg-[#0b0f19] shadow-2xl">
          <div className="flex items-center gap-3 rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white">
            <MessageCircle size={18} />
            <span className="text-sm font-semibold">UAG Assistant</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-indigo-600 text-white'
                    : 'bg-[#111827] text-[#9aa3b8]'
                }`}
              >
                {m.text}
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
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-indigo-600 p-2 text-white transition hover:bg-indigo-500 disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
