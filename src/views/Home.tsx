import { Panel } from '../components/Panel'
import { useDiscordAuth } from '../context/DiscordAuth'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Code,
  Dice5,
  DollarSign,
  ExternalLink,
  Gavel,
  Globe,
  Landmark,
  MessageCircle,
  Search,
  ShoppingBag,
  Users,
  Wrench,
} from '../icons'
import { UAG_CAPITAL_COMPANIES } from '../lib/data'

const divisions = [
  { label: 'Banking & Accounts', icon: Landmark, desc: 'RVR, Barclays, RBR, Chase connections and internal ledgers.' },
  { label: 'Real Estate', icon: Building2, desc: 'Two Guys Realty listings, property management, and sales.' },
  { label: 'Legal Services', icon: Gavel, desc: 'Contracts, case files, and corporate legal counsel.' },
  { label: 'Investigations', icon: Search, desc: 'Discreet inquiry, evidence handling, and reporting.' },
  { label: 'Construction', icon: Wrench, desc: 'Project oversight, crew management, and builds.' },
  { label: 'Casino & Entertainment', icon: Dice5, desc: 'Gaming, events, and hospitality operations.' },
  { label: 'Commodities', icon: BarChart3, desc: 'Resource trading, market tracking, and warehousing.' },
  { label: 'TSE', icon: DollarSign, desc: 'The Stock Exchange — capital markets and portfolio management.' },
  { label: 'Dev Services', icon: Code, desc: 'Custom development, integrations, and technical consulting.' },
  { label: 'Corporate Consultancy', icon: Users, desc: 'Strategy, mergers, and executive advisory.' },
  { label: 'DC Store', icon: ShoppingBag, desc: 'In-game commerce and merchandise.' },
  { label: 'Discord Portal', icon: MessageCircle, desc: 'Community, support, and Discord integrations.' },
]

const stats = [
  { value: '7+', label: 'Subsidiaries' },
  { value: '12', label: 'Service Divisions' },
  { value: '24/7', label: 'Operations' },
]

export function Home() {
  const { userName, login } = useDiscordAuth()

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />

      <section className="relative px-8 pb-16 pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            UAG Portal v2.0
          </div>

          <h1 className="glow-text mt-8 max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            The future of{' '}
            <span className="gradient-text">DemocracyCraft</span> business
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[#8b92a8] leading-relaxed">
            Utterly Amazing Group is the holding company behind UAGCapital, UAGNews Network,
            Two Guys Realty, De Ryder, and more. One portal for banking, real estate, legal,
            investigations, and corporate services.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
            >
              Explore services
              <ArrowRight size={16} />
            </button>

            {!userName ? (
              <button type="button" onClick={login} className="btn-secondary">
                <Users size={16} />
                Login with Discord
              </button>
            ) : (
              <a
                href="https://discord.gg/4uaq7tWBSY"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                <MessageCircle size={16} />
                Join Discord
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <Panel key={s.label} className="p-5">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-[#5d6a87]">{s.label}</div>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="relative px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Our divisions</h2>
              <p className="mt-1 text-sm text-[#5d6a87]">
                Everything you need to operate a business in DemocracyCraft.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {divisions.map((d) => {
              const Icon = d.icon
              return (
                <Panel
                  key={d.label}
                  className="group p-5 transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
                >
                  <div className="icon-box mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{d.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8b92a8]">{d.desc}</p>
                </Panel>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">UAGCapital companies</h2>
          <p className="mt-1 text-sm text-[#5d6a87]">
            The businesses owned and operated under the UAG umbrella.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UAG_CAPITAL_COMPANIES.map((c) => (
              <Panel
                key={c.name}
                className="flex items-center gap-4 p-4 transition hover:border-[#2a344e]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#8b92a8]">
                  {c.website ? <Globe size={18} /> : <Briefcase size={18} />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{c.name}</div>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-indigo-400 transition hover:text-indigo-300"
                    >
                      Visit website
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <Panel className="relative overflow-hidden p-10 text-center">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-[80px]" />
            <div className="relative">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Ready to do business?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#8b92a8]">
                Staff and clients can log in with Discord to access services, submit requests, and manage accounts.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {!userName ? (
                  <button type="button" onClick={login} className="btn-primary">
                    <Users size={16} />
                    Login with Discord
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#02040a]">
                    Welcome back, {userName}
                  </span>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  )
}
