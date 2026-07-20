import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Users } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import { addChatMessage, getChatMessages, isStaff, type ChatMessage } from '../lib/data'

export function StaffChat() {
  const { userName, isAdmin } = useDiscordAuth()
  const allowed = isAdmin || isStaff(userName)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(getChatMessages())
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const author = userName || 'Guest'
    addChatMessage({ author, text })
    setMessages(getChatMessages())
    setInput('')
  }

  if (!allowed) {
    return (
      <div className="page">
        <Panel>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-sm text-[#8b92a8]">Staff Chat is for UAG staff only.</p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Staff Chat</h1>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Internal communication for all UAG employees and departments.
        </p>
      </header>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex items-center gap-2 border-b border-[#1c2335] pb-3 text-sm font-semibold text-white">
          <Users size={16} className="text-indigo-400" />
          #general
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-2">
          {messages.length === 0 && (
            <p className="text-sm text-[#5d6a87]">No messages yet. Start the conversation.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg bg-[#111827] p-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-indigo-400" />
                <span className="text-xs font-semibold text-white">{m.author}</span>
                <span className="text-xs text-[#5d6a87]">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-1 pl-6 text-sm text-[#e8eaf2]">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#1c2335] pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={userName ? 'Message #general...' : 'Log in with Discord to chat'}
            disabled={!userName}
            className="flex-1 rounded-lg border border-[#1c2335] bg-[#0b0f19] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!userName || !input.trim()}
            className="rounded-lg bg-indigo-600 p-2 text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </Panel>
    </div>
  )
}
