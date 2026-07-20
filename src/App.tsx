import { useState, type ComponentType, type ReactNode } from 'react'
import {
  Home as HomeIcon,
  Info,
  Landmark,
  Building2,
  CreditCard,
  Gavel,
  Wrench,
  Briefcase,
  Scale,
  Dice5,
  Wheat,
  BarChart3,
  ShoppingBag,
  Code,
  DollarSign,
  Users,
  MessageCircle,
  Shield,
  Search,
  MessageSquare,
  Settings,
  UserCog,
  Banknote,
  LayoutGrid,
} from './icons'
import { DiscordProfile } from './components/DiscordProfile'
import { DiscordAuthProvider, useDiscordAuth } from './context/DiscordAuth'
import { isStaff } from './lib/data'
import {
  About,
  Accounting,
  Admin,
  Banking,
  Capital,
  Consultancy,
  DashboardHub,
  Discord,
  Home,
  Investigators,
  Jobs,
  Lawyers,
  Legal,
  Placeholder,
  Realty,
  RoleManager,
  Staff,
  StaffChat,
  Stocks,
} from './views'

type NavItem = {
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Admin', icon: Shield },
  { label: 'About Us', icon: Info },
  { label: 'Banking', icon: Landmark },
  { label: 'Real Estate', icon: Building2 },
  { label: 'Accounts', icon: CreditCard },
  { label: 'Legal', icon: Gavel },
  { label: 'Accounting', icon: Banknote },
  { label: 'Lawyers', icon: Scale },
  { label: 'Investigators', icon: Search },
  { label: 'Construction', icon: Wrench },
  { label: 'Escrow', icon: Settings },
  { label: 'Jobs', icon: Briefcase },
  { label: 'Staff', icon: Users },
  { label: 'Staff Chat', icon: MessageSquare },
  { label: 'Role Manager', icon: UserCog },
  { label: 'Casino', icon: Dice5 },
  { label: 'Commodities', icon: Wheat },
  { label: 'TSE', icon: BarChart3 },
  { label: 'DC Store', icon: ShoppingBag },
  { label: 'Dev Services', icon: Code },
  { label: 'Corporate Consultancy', icon: Users },
  { label: 'Capital & Funds', icon: DollarSign },
  { label: 'Discord Portal', icon: MessageCircle },
]

const viewMap: Record<string, () => ReactNode> = {
  Home,
  Dashboard: DashboardHub,
  Admin,
  'About Us': About,
  Banking,
  'Real Estate': Realty,
  TSE: Stocks,
  Legal,
  Accounting,
  Lawyers,
  Investigators,
  'Corporate Consultancy': Consultancy,
  'Capital & Funds': Capital,
  Jobs,
  Staff,
  'Staff Chat': StaffChat,
  'Role Manager': RoleManager,
  'Discord Portal': Discord,
}

const staffOnlyNavLabels = new Set([
  'Admin',
  'Staff',
  'Staff Chat',
  'Role Manager',
])

function AppContent() {
  const [activeNav, setActiveNav] = useState('Home')
  const { userName, isAdmin } = useDiscordAuth()
  const canViewStaff = isAdmin || isStaff(userName)

  const visibleNavItems = navItems.filter(
    (item) => !staffOnlyNavLabels.has(item.label) || canViewStaff
  )

  const View = viewMap[activeNav] ?? (() => <Placeholder title={activeNav} />)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#02040a] text-[#e8eaf2] antialiased selection:bg-indigo-500/30">
      <aside className="relative flex w-72 flex-shrink-0 flex-col border-r border-[#1c2335] bg-[#080b12]/85 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <div className="border-b border-[#1c2335] p-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-sm.png"
              alt="Utterly Amazing Group"
              className="h-10 w-auto object-contain drop-shadow-lg"
            />
            <span className="text-sm font-bold tracking-tight text-white">UAG Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const active = activeNav === item.label
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setActiveNav(item.label)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-500/15'
                        : 'text-[#8b92a8] hover:bg-[#131928] hover:text-white'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                    )}
                    <Icon size={18} className={active ? 'text-white' : 'text-[#5d6a87] group-hover:text-white transition-colors'} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-[#1c2335] p-4">
          <DiscordProfile compact />
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500/40 via-cyan-400/40 to-purple-500/40" />
        <View />
      </main>
    </div>
  )
}

function App() {
  return (
    <DiscordAuthProvider>
      <AppContent />
    </DiscordAuthProvider>
  )
}

export default App
