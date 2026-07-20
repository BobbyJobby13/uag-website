import { useEffect, useState } from 'react'
import { Building2, MapPin, Home, Plus, Trash2 } from '../icons'
import { Panel } from '../components/Panel'
import { ServiceRequestForm } from '../components/ServiceRequestForm'
import { useDiscordAuth } from '../context/DiscordAuth'
import { getRequests, hasDepartment, updateRequest, type ServiceRequest } from '../lib/data'

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
  const { isAdmin, userName, canEditRealty } = useDiscordAuth()
  const isRealtyStaff = isAdmin || hasDepartment(userName, 'Real Estate')
  const [listings, setListings] = useState<Listing[]>(defaultListings)
  const [form, setForm] = useState({ name: '', location: '', type: 'Residential', value: '', status: 'Listed' })
  const [requests, setRequests] = useState<ServiceRequest[]>([])

  const refreshRequests = () => setRequests(getRequests().filter((r) => r.serviceType === 'Real Estate'))

  const advanceRequest = (req: ServiceRequest) => {
    const next: ServiceRequest['status'] =
      req.status === 'Open' ? 'In Progress' : req.status === 'In Progress' ? 'Closed' : 'Open'
    updateRequest(req.id, { status: next })
    refreshRequests()
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setListings(JSON.parse(raw))
    } catch {}
    refreshRequests()
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
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Real Estate</h1>
        <p className="page-subtitle">
          Property listings and realty partnerships.
        </p>
      </header>

      <ServiceRequestForm
        serviceType="Real Estate"
        title="Request a Realtor"
        descriptionPlaceholder="Describe the property you are looking for, your budget, and how to contact you..."
      />

      {canEditRealty && (
        <Panel className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Add Listing</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
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
              className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5d6a87] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
            >
              <option>Listed</option>
              <option>Owned</option>
              <option>Managed</option>
              <option>Sold</option>
            </select>
            <button
              type="button"
              onClick={addListing}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </Panel>
      )}

      {isRealtyStaff && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Realty Requests</h2>
          {requests.length === 0 && (
            <Panel>
              <p className="text-sm text-[#8b92a8]">No realty requests yet.</p>
            </Panel>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {requests.map((req) => (
              <Panel key={req.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{req.clientName}</h3>
                    <p className="text-xs text-[#5d6a87]">
                      {new Date(req.createdAt).toLocaleString()} {req.contact ? `• ${req.contact}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      req.status === 'Open'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : req.status === 'In Progress'
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'bg-[#1c2335] text-[#8b92a8]'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#e8eaf2]">{req.description}</p>
                <button
                  type="button"
                  onClick={() => advanceRequest(req)}
                  className="mt-4 rounded-md bg-[#1c2335] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#2a344e]"
                >
                  {req.status === 'Closed' ? 'Reopen' : 'Advance'}
                </button>
              </Panel>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-white">Property Listings</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((property) => (
          <Panel key={property.id}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827]">
              <Building2 size={20} className="text-indigo-400" />
            </div>
            <div className="text-lg font-semibold text-white">{property.name}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#8b92a8]">
              <MapPin size={12} />
              {property.location}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-md bg-[#111827] px-2 py-1 text-xs text-[#8b92a8]">
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
                  className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
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
