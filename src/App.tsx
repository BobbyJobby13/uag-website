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
  Dice5,
  Wheat,
  BarChart3,
  ShoppingBag,
  Code,
  DollarSign,
  Users,
  MessageCircle,
} from 'lucide-react'
import {
  Banking,
  Capital,
  Consultancy,
  Dashboard,
  Discord,
  Legal,
  Placeholder,
  Realty,
  Stocks,
} from './views'

type NavItem = {
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home },
  { label: 'About Us', icon: Info },
  { label: 'Banking', icon: Landmark },
  { label: 'Real Estate', icon: Building2 },
  { label: 'Accounts', icon: CreditCard },
  { label: 'Legal', icon: Gavel },
  { label: 'Construction', icon: Wrench },
  { label: 'Escrow', icon: Briefcase },
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
  Banking,
  'Real Estate': Realty,
  'Stock Exchanges': Stocks,
  Legal,
  'Corporate Consultancy': Consultancy,
  'Capital & Funds': Capital,
  'Discord Portal': Discord,
}

function App() {
  const [activeNav, setActiveNav] = useState('Home')

  const View = viewMap[activeNav] ?? (() => <Placeholder title={activeNav} />)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0c0f] text-[#f3f4f6]">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-[#1e2028] bg-[#111217]">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
              U
            </div>
            <div className="text-lg font-bold tracking-tight text-white">Utterly Amazing Group</div>
          </div>
          <div className="mt-2 text-xs font-medium text-[#6b7280]">One-Stop Portal</div>
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
          <div className="flex items-center gap-3 rounded-lg bg-[#181a20] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              d
            </div>
            <div>
              <div className="text-sm font-semibold text-white">dert</div>
              <div className="text-xs text-[#6b7280]">@donutsmp123123</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <View />
      </main>
    </div>
  )
}

export default App
