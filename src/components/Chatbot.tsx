import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, Send } from '../icons'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

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
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-500"
        aria-label="Open assistant"
      >
        {open ? '×' : <Bot size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex h-96 w-80 flex-col rounded-xl border border-[#2a2c35] bg-[#111217] shadow-2xl">
          <div className="flex items-center gap-3 rounded-t-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
            <MessageCircle size={18} />
            <span className="text-sm font-semibold">UAG Assistant</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-500 disabled:opacity-50"
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
