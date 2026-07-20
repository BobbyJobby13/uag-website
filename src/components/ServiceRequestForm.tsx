import { useState } from 'react'
import { Send } from '../icons'
import { useDiscordAuth } from '../context/DiscordAuth'
import { addRequest, type ServiceRequest } from '../lib/data'

interface ServiceRequestFormProps {
  serviceType: ServiceRequest['serviceType']
  title: string
  descriptionPlaceholder?: string
}

export function ServiceRequestForm({
  serviceType,
  title,
  descriptionPlaceholder = 'Describe what you need help with...',
}: ServiceRequestFormProps) {
  const { userName } = useDiscordAuth()
  const [form, setForm] = useState({
    clientName: userName || '',
    contact: '',
    description: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle')

  const handleSubmit = () => {
    if (!form.clientName.trim() || !form.description.trim()) return
    setStatus('submitting')
    addRequest({
      clientName: form.clientName.trim(),
      contact: form.contact.trim(),
      serviceType,
      description: form.description.trim(),
      status: 'Open',
    })
    setStatus('submitted')
    setForm({ clientName: userName || '', contact: '', description: '' })
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-2xl border border-[#1c2335] bg-[#080b12]/80 p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Fill out the form below and the relevant UAG department will review your request.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Your name / Discord username"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
          />
          <input
            type="text"
            placeholder="Discord / contact info"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
          />
          <textarea
            placeholder={descriptionPlaceholder}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 sm:col-span-2"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!form.clientName.trim() || !form.description.trim() || status === 'submitting'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send size={16} />
          {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
        </button>

        {status === 'submitted' && (
          <p className="mt-3 text-sm text-emerald-400">Request submitted. A staff member will reach out soon.</p>
        )}
      </div>
    </div>
  )
}
