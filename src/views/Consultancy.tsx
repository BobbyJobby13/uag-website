import { Users, CheckCircle, ArrowRight } from 'lucide-react'
import { Panel } from '../components/Panel'

const offerings = [
  'Corporate structuring',
  'Regulatory navigation',
  'M&A advisory',
  'Fundraising strategy',
  'Governance & board support',
]

export function Consultancy() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Corporate Consultancy</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Strategic guidance and operational support for connected clients.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#181a20]">
            <Users size={20} className="text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Connect with UAG Consultancy</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Book a session, request due diligence, or open a managed account. Our
            team works through the portal and Discord for instant coordination.
          </p>
          <button
            type="button"
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Connect Now
            <ArrowRight size={16} />
          </button>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-semibold text-white">Services</h2>
          <div className="space-y-3">
            {offerings.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#9ca3af]">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
