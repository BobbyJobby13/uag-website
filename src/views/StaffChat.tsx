import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Users } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import { addChatMessage, getChatMessages, type ChatMessage } from '../lib/data'

export function StaffChat() {
  const { userName } = useDiscordAuth()
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

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Staff Chat</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Internal communication for all UAG employees and departments.
        </p>
      </header>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex items-center gap-2 border-b border-[#2a2c35] pb-3 text-sm font-semibold text-white">
          <Users size={16} className="text-blue-400" />
          #general
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-2">
          {messages.length === 0 && (
            <p className="text-sm text-[#6b7280]">No messages yet. Start the conversation.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg bg-[#181a20] p-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-white">{m.author}</span>
                <span className="text-xs text-[#6b7280]">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-1 pl-6 text-sm text-[#e5e7eb]">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#2a2c35] pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={userName ? 'Message #general...' : 'Log in with Discord to chat'}
            disabled={!userName}
            className="flex-1 rounded-lg border border-[#2a2c35] bg-[#111217] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!userName || !input.trim()}
            className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </Panel>
    </div>
  )
}
