import { useEffect, useState } from 'react'
import { Briefcase, MapPin, DollarSign, Plus, Trash2, UserPlus } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'

type JobPosting = {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  applicants: string[]
}

const defaultJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Property Manager',
    company: 'UAG Realty',
    location: 'DemocracyCraft',
    type: 'Full-time',
    salary: 'Competitive',
    description: 'Manage rental listings and client relations for UAG Realty.',
    applicants: [],
  },
  {
    id: '2',
    title: 'Financial Analyst',
    company: 'UAG Capital',
    location: 'Remote',
    type: 'Contract',
    salary: 'DOE',
    description: 'Analyze stock, bank, and fund data for executive reports.',
    applicants: [],
  },
]

const STORAGE_KEY = 'uag_jobs'

export function Jobs() {
  const { user, canPostJobs, userName } = useDiscordAuth()
  const [jobs, setJobs] = useState<JobPosting[]>(defaultJobs)
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setJobs(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
    } catch {}
  }, [jobs])

  const addJob = () => {
    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) return
    const posting: JobPosting = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || 'DemocracyCraft',
      type: form.type,
      salary: form.salary.trim() || 'TBD',
      description: form.description.trim(),
      applicants: [],
    }
    setJobs((prev) => [posting, ...prev])
    setForm({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '' })
  }

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  const apply = (id: string) => {
    const name = userName || user?.username || 'Guest'
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id && !j.applicants.includes(name)
          ? { ...j, applicants: [...j.applicants, name] }
          : j
      )
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Jobs Portal</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Open positions across UAG and DemocracyCraft partners.
        </p>
      </header>

      {canPostJobs && (
        <Panel className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Plus size={16} className="text-blue-400" />
            Post a Job
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              type="text"
              placeholder="Job title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
            <input
              type="text"
              placeholder="Salary / Compensation"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={addJob}
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Briefcase size={16} />
            Publish Listing
          </button>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <Panel key={job.id}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#181a20]">
                <Briefcase size={20} className="text-blue-400" />
              </div>
              {canPostJobs && (
                <button
                  type="button"
                  onClick={() => removeJob(job.id)}
                  className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Delete job"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{job.title}</h3>
            <p className="text-sm text-[#9ca3af]">{job.company}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
              <span className="flex items-center gap-1 rounded-md bg-[#181a20] px-2 py-1">
                <MapPin size={12} />
                {job.location}
              </span>
              <span className="rounded-md bg-[#181a20] px-2 py-1">{job.type}</span>
              <span className="flex items-center gap-1 rounded-md bg-[#181a20] px-2 py-1">
                <DollarSign size={12} />
                {job.salary}
              </span>
            </div>
            <p className="mt-4 text-sm text-[#9ca3af]">{job.description}</p>
            <button
              type="button"
              onClick={() => apply(job.id)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              <UserPlus size={16} />
              Apply
            </button>
            {job.applicants.length > 0 && (
              <p className="mt-2 text-xs text-[#6b7280]">
                Applicants: {job.applicants.join(', ')}
              </p>
            )}
          </Panel>
        ))}
      </div>
    </div>
  )
}
