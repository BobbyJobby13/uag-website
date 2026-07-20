import { LogIn, LogOut } from '../icons'
import { useDiscordAuth } from '../context/DiscordAuth'
import { getAvatarUrl, getBannerUrl } from '../lib/discord'

export function DiscordProfile({ compact = false }: { compact?: boolean }) {
  const { user, loading, error, login, logout, userName } = useDiscordAuth()

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1c2335] bg-[#0b0f19]/80 p-3 text-sm text-[#8b92a8] backdrop-blur-md">
        Loading Discord…
      </div>
    )
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={login}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#7289da] px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
      >
        <LogIn size={16} />
        Login with Discord
      </button>
    )
  }

  const banner = getBannerUrl(user, compact ? 512 : 1024)
  const accent = user.accent_color != null ? `#${user.accent_color.toString(16).padStart(6, '0')}` : '#0b0f19'

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#1c2335] bg-[#0b0f19]/80 backdrop-blur-md ${compact ? '' : 'p-5'}`}
    >
      {banner ? (
        <div className="h-20 w-full bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }} />
      ) : (
        <div
          className="h-12 w-full"
          style={{
            backgroundColor: accent,
            backgroundImage: 'linear-gradient(90deg, rgba(99,102,241,0.35), rgba(6,182,212,0.15))',
          }}
        />
      )}
      <div className={`flex items-start gap-3 ${compact ? 'p-3' : 'p-4'}`}>
        <img
          src={getAvatarUrl(user, compact ? 64 : 128)}
          alt={userName || 'Discord avatar'}
          className={`rounded-full border-2 border-[#0b0f19] object-cover shadow-lg ${compact ? '-mt-7 h-12 w-12' : '-mt-10 h-16 w-16'}`}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{userName}</div>
          <div className="text-xs text-[#8b92a8]">@{user.username}</div>
          {error && <div className="mt-1 text-xs text-rose-400">{error}</div>}
        </div>
        <button
          type="button"
          onClick={logout}
          title="Logout"
          className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-[#1c2335] hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}
