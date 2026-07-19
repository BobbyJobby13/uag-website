import { useState, type ComponentType, type ReactNode } from 'react'
import {
  Home,
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
} from './icons'
import { Chatbot } from './components/Chatbot'
import { DiscordProfile } from './components/DiscordProfile'
import { DiscordAuthProvider } from './context/DiscordAuth'
import {
  About,
  Admin,
  Banking,
  Capital,
  Consultancy,
  Dashboard,
  Discord,
  Investigators,
  Jobs,
  Lawyers,
  Legal,
  Placeholder,
  Realty,
  Staff,
  StaffChat,
  Stocks,
} from './views'

type NavItem = {
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home },
  { label: 'Admin', icon: Shield },
  { label: 'About Us', icon: Info },
  { label: 'Banking', icon: Landmark },
  { label: 'Real Estate', icon: Building2 },
  { label: 'Accounts', icon: CreditCard },
  { label: 'Legal', icon: Gavel },
  { label: 'Lawyers', icon: Scale },
  { label: 'Investigators', icon: Search },
  { label: 'Construction', icon: Wrench },
  { label: 'Escrow', icon: Settings },
  { label: 'Jobs', icon: Briefcase },
  { label: 'Staff', icon: Users },
  { label: 'Staff Chat', icon: MessageSquare },
  { label: 'Casino', icon: Dice5 },
  { label: 'Commodities', icon: Wheat },
  { label: 'Stock Exchanges', icon: BarChart3 },
  { label: 'DC Store', icon: ShoppingBag },
  { label: 'Dev Services', icon: Code },
  { label: 'Corporate Consultancy', icon: Users },
  { label: 'Capital & Funds', icon: DollarSign },
  { label: 'Discord Portal', icon: MessageCircle },
]

const viewMap: Record<string, () => ReactNode> = {
  Home: Dashboard,
  Admin,
  'About Us': About,
  Banking,
  'Real Estate': Realty,
  'Stock Exchanges': Stocks,
  Legal,
  Lawyers,
  Investigators,
  'Corporate Consultancy': Consultancy,
  'Capital & Funds': Capital,
  Jobs,
  Staff,
  'Staff Chat': StaffChat,
  'Discord Portal': Discord,
}

function App() {
  const [activeNav, setActiveNav] = useState('Home')

  const View = viewMap[activeNav] ?? (() => <Placeholder title={activeNav} />)

  return (
    <DiscordAuthProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0b0c0f] text-[#f3f4f6]">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-[#1e2028] bg-[#111217]">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
              U
            </div>
            <div className="text-lg font-bold tracking-tight text-white">Utterly Amazing Group</div>
          </div>
          <div className="mt-2 text-xs font-medium text-[#6b7280]">DemocracyCraft • UAG LLC</div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeNav === item.label
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setActiveNav(item.label)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#1f2129] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:bg-[#181a20] hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-[#1e2028] p-4">
          <DiscordProfile compact />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <View />
      </main>
      <Chatbot />
    </div>
    </DiscordAuthProvider>
  )
}

export default App
