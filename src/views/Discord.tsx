import { MessageCircle, Bot, Shield, Users, CheckCircle } from 'lucide-react'
import { Panel } from '../components/Panel'

const commands = [
  { command: '/transfer', description: 'Initiate an instant bank transfer' },
  { command: '/balance', description: 'Check portfolio and account balances' },
  { command: '/stock <symbol>', description: 'Pull live NER / TSE quotes' },
  { command: '/legal <request>', description: 'Open a legal or compliance ticket' },
  { command: '/property', description: 'List real estate and escrow status' },
  { command: '/staff', description: 'Role-based staff dashboard link' },
]

const roles = [
  { name: 'Admin', access: 'Full portal + Discord bot control' },
  { name: 'Banking Officer', access: 'Transfers, bank integrations, escrow' },
  { name: 'Legal / Finance', access: 'Documents, compliance, realty tabs' },
  { name: 'Investor', access: 'Capital fund and stock exchange views' },
]

export function Discord() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Discord Portal</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Bot-automated operations, staff commands and role-based access.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Bot size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Bot Commands</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {commands.map((cmd) => (
              <div
                key={cmd.command}
                className="rounded-lg bg-[#181a20] p-3 transition hover:bg-[#1f2129]"
              >
                <div className="font-mono text-sm font-semibold text-white">{cmd.command}</div>
                <div className="mt-1 text-xs text-[#9ca3af]">{cmd.description}</div>
              </div>
            ))}
          </div>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4752C4]"
          >
            <MessageCircle size={16} />
            Open Discord Server
          </a>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <Shield size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Staff Access</h2>
          </div>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.name} className="rounded-lg bg-[#181a20] p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Users size={14} className="text-[#9ca3af]" />
                  {role.name}
                </div>
                <div className="mt-1 text-xs text-[#9ca3af]">{role.access}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle size={14} />
            Bot integration ready
          </div>
        </Panel>
      </div>
    </div>
  )
}
