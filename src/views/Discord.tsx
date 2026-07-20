import { MessageCircle, Bot, Shield, Users, CheckCircle } from '../icons'
import { Panel } from '../components/Panel'
import { DiscordProfile } from '../components/DiscordProfile'
import { useDiscordAuth } from '../context/DiscordAuth'
import { getDiscordGuildId, getGuildIconUrl } from '../lib/discord'

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
  const { user, guilds } = useDiscordAuth()
  const uagGuild = guilds?.find((g) => g.id === getDiscordGuildId())

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Discord Portal</h1>
        <p className="page-subtitle">
          Login with Discord to link your UAG profile, banner, guilds and staff access.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Bot size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Bot Commands</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {commands.map((cmd) => (
              <div
                key={cmd.command}
                className="rounded-lg bg-[#111827] p-3 transition hover:bg-[#1f2129]"
              >
                <div className="font-mono text-sm font-semibold text-white">{cmd.command}</div>
                <div className="mt-1 text-xs text-[#8b92a8]">{cmd.description}</div>
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

        <Panel className="space-y-6">
          {user ? (
            <div>
              <h2 className="mb-2 font-semibold text-white">Linked Discord Profile</h2>
              <DiscordProfile />
            </div>
          ) : (
            <p className="text-sm text-[#8b92a8]">
              Login with Discord in the sidebar to link your profile, banner and guilds.
            </p>
          )}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="font-semibold text-white">Staff Access</h2>
            </div>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.name} className="rounded-lg bg-[#111827] p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Users size={14} className="text-[#8b92a8]" />
                    {role.name}
                  </div>
                  <div className="mt-1 text-xs text-[#8b92a8]">{role.access}</div>
                </div>
              ))}
            </div>
          </div>

          {guilds && (
            <div>
              <h2 className="mb-3 font-semibold text-white">UAG Guild Connection</h2>
              {uagGuild ? (
                <div className="flex items-center gap-3 rounded-lg bg-[#111827] p-3">
                  {getGuildIconUrl(uagGuild) ? (
                    <img
                      src={getGuildIconUrl(uagGuild, 64) || undefined}
                      alt={uagGuild.name}
                      className="h-10 w-10 rounded-lg"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2335] text-sm font-bold text-white">
                      {uagGuild.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">{uagGuild.name}</div>
                    <div className="text-xs text-emerald-400">
                      {uagGuild.owner ? 'Owner' : 'Member'}
                    </div>
                  </div>
                </div>
              ) : user ? (
                <div className="rounded-lg bg-[#111827] p-3 text-sm text-[#8b92a8]">
                  You are not in the UAG Discord server.
                </div>
              ) : (
                <div className="rounded-lg bg-[#111827] p-3 text-sm text-[#8b92a8]">
                  Log in to check guild membership.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle size={14} />
            Bot integration ready
          </div>
        </Panel>
      </div>
    </div>
  )
}
