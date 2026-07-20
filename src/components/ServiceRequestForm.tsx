import { useState } from 'react'
import { Send } from '../icons'
import { Panel } from './Panel'
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
      <Panel>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-[#8b92a8]">
          Fill out the form below and the relevant UAG department will review your request.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Your name / Discord username"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className="input"
          />
          <input
            type="text"
            placeholder="Discord / contact info"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="input"
          />
          <textarea
            placeholder={descriptionPlaceholder}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="textarea sm:col-span-2"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!form.clientName.trim() || !form.description.trim() || status === 'submitting'}
          className="btn-primary mt-4 w-full"
        >
          <Send size={16} />
          {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
        </button>

        {status === 'submitted' && (
          <p className="mt-3 text-sm text-emerald-400">Request submitted. A staff member will reach out soon.</p>
        )}
      </Panel>
    </div>
  )
}
