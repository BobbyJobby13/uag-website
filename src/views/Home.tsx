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
  { label: 'Stock Exchanges', icon: DollarSign, desc: 'Capital markets and portfolio management.' },
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

      <section className="relative px-8 pb-12 pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            UAG Portal v2.0
          </div>

          <h1 className="glow-text mt-6 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              Explore services
              <ArrowRight size={16} />
            </button>

            {!userName ? (
              <button
                type="button"
                onClick={login}
                className="flex items-center gap-2 rounded-xl border border-[#2a344e] bg-[#0b0f19]/80 px-6 py-3 text-sm font-semibold text-[#e8eaf2] backdrop-blur-md transition hover:border-indigo-500/50 hover:bg-[#111827]"
              >
                <Users size={16} />
                Login with Discord
              </button>
            ) : (
              <a
                href="https://discord.gg/uag"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[#2a344e] bg-[#0b0f19]/80 px-6 py-3 text-sm font-semibold text-[#e8eaf2] backdrop-blur-md transition hover:border-indigo-500/50 hover:bg-[#111827]"
              >
                <MessageCircle size={16} />
                Join Discord
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#1c2335] bg-[#080b12]/60 p-5 backdrop-blur-sm transition hover:border-[#2a344e]"
              >
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-[#5d6a87]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="relative px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Our divisions</h2>
              <p className="mt-1 text-sm text-[#5d6a87]">
                Everything you need to operate a business in DemocracyCraft.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {divisions.map((d) => {
              const Icon = d.icon
              return (
                <div
                  key={d.label}
                  className="group relative rounded-2xl border border-[#1c2335] bg-[#080b12]/60 p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-[#0b0f19]/90 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{d.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8b92a8]">{d.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-white">UAGCapital companies</h2>
          <p className="mt-1 text-sm text-[#5d6a87]">
            The businesses owned and operated under the UAG umbrella.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UAG_CAPITAL_COMPANIES.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-4 rounded-2xl border border-[#1c2335] bg-[#080b12]/60 p-4 backdrop-blur-sm transition hover:border-[#2a344e]"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#1c2335] bg-gradient-to-br from-indigo-900/40 to-purple-900/30 p-10 text-center">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-[80px]" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to do business?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#8b92a8]">
                Staff and clients can log in with Discord to access services, submit requests, and manage accounts.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {!userName ? (
                  <button
                    type="button"
                    onClick={login}
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#02040a] transition hover:bg-[#e8eaf2]"
                  >
                    <Users size={16} />
                    Login with Discord
                  </button>
                ) : (
                  <span className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#02040a]">
                    Welcome back, {userName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
