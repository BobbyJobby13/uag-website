import { useEffect, useState } from 'react'
import { Building2, MapPin, Home, Plus, Trash2 } from '../icons'
import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'

type Listing = {
  id: string
  name: string
  location: string
  type: string
  value: string
  status: string
}

const defaultListings: Listing[] = [
  { id: '1', name: 'Primary Residence', location: 'London, UK', type: 'Residential', value: '$0.00', status: 'Owned' },
  { id: '2', name: 'Downtown Office', location: 'New York, US', type: 'Commercial', value: '$0.00', status: 'Managed' },
  { id: '3', name: 'Lakeside Villa', location: 'Dubai, UAE', type: 'Residential', value: '$0.00', status: 'Listed' },
]

const STORAGE_KEY = 'uag_realty_listings'

export function Realty() {
  const { canEditRealty } = useDiscordAuth()
  const [listings, setListings] = useState<Listing[]>(defaultListings)
  const [form, setForm] = useState({ name: '', location: '', type: 'Residential', value: '', status: 'Listed' })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setListings(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
    } catch {}
  }, [listings])

  const addListing = () => {
    if (!form.name.trim() || !form.location.trim() || !form.value.trim()) return
    const newListing: Listing = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      location: form.location.trim(),
      type: form.type,
      value: form.value.trim(),
      status: form.status,
    }
    setListings((prev) => [newListing, ...prev])
    setForm({ name: '', location: '', type: 'Residential', value: '', status: 'Listed' })
  }

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Real Estate</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Property listings and realty partnerships.
        </p>
      </header>

      {canEditRealty && (
        <Panel className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Add Listing</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
              <option>Land</option>
            </select>
            <input
              type="text"
              placeholder="Value"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-blue-500"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-lg border border-[#2a2c35] bg-[#181a20] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>Listed</option>
              <option>Owned</option>
              <option>Managed</option>
              <option>Sold</option>
            </select>
            <button
              type="button"
              onClick={addListing}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((property) => (
          <Panel key={property.id}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#181a20]">
              <Building2 size={20} className="text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-white">{property.name}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#9ca3af]">
              <MapPin size={12} />
              {property.location}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-md bg-[#181a20] px-2 py-1 text-xs text-[#9ca3af]">
                {property.type}
              </span>
              <span className="text-sm font-medium text-white">{property.value}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">{property.status}</span>
              </div>
              {canEditRealty && (
                <button
                  type="button"
                  onClick={() => removeListing(property.id)}
                  className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Delete listing"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
