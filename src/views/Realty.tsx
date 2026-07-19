import { Building2, MapPin, Home } from 'lucide-react'
import { Panel } from '../components/Panel'

const listings = [
  { id: '1', name: 'Primary Residence', location: 'London, UK', type: 'Residential', value: '$0.00', status: 'Owned' },
  { id: '2', name: 'Downtown Office', location: 'New York, US', type: 'Commercial', value: '$0.00', status: 'Managed' },
  { id: '3', name: 'Lakeside Villa', location: 'Dubai, UAE', type: 'Residential', value: '$0.00', status: 'Listed' },
]

export function Realty() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Real Estate</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Property portfolio and realty partnerships.
        </p>
      </header>

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
            <div className="mt-4 flex items-center gap-2">
              <Home size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">{property.status}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
