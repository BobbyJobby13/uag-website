import { Globe, Scale, Building2, Banknote } from '../icons'
import { Panel } from '../components/Panel'

const services = [
  {
    title: 'DemocracyCraft',
    icon: Globe,
    description:
      'A fake political game world where governments, businesses and citizens interact. UAG LLC operates inside and alongside this economy.',
  },
  {
    title: 'Banking Network',
    icon: Banknote,
    description:
      'Connected banks including RVR, Barclays, RBR, Chase and others support instant transfers through the UAG portal.',
  },
  {
    title: 'Stock Exchanges',
    icon: Building2,
    description:
      'Live access to NER (New Economic Reserve) and TSE (Transatlantic Stock Exchange) tickers and holdings.',
  },
  {
    title: 'Legal, Finance & Realty',
    icon: Scale,
    description:
      'Legal counsel, tax and audit automation, title checks, escrow and realty management in one place.',
  },
]

export function About() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Utterly Amazing Group LLC</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          One-stop portal for DemocracyCraft and UAG operations.
        </p>
      </header>

      <div className="mb-8 rounded-xl border border-[#1e2028] bg-[#111217] p-6">
        <p className="text-sm leading-relaxed text-[#9ca3af]">
          Utterly Amazing Group LLC is a holding and services company built for the
          DemocracyCraft political/economy simulation. This portal ties together
          banking, stock exchanges, legal services, real estate, corporate consultancy
          and an investment capital fund. Discord bots handle most automation; the
          website handles the rest, with staff access to every resource they need.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Panel key={service.title}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#181a20]">
                <Icon size={20} className="text-blue-400" />
              </div>
              <div className="text-sm font-semibold text-white">{service.title}</div>
              <div className="mt-2 text-xs leading-relaxed text-[#9ca3af]">
                {service.description}
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
