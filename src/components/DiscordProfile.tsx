import { LogIn, LogOut } from '../icons'
import { useDiscordAuth } from '../context/DiscordAuth'
import { getAvatarUrl, getBannerUrl } from '../lib/discord'

export function DiscordProfile({ compact = false }: { compact?: boolean }) {
  const { user, loading, error, login, logout, userName } = useDiscordAuth()

  if (loading) {
    return (
      <div className="rounded-lg border border-[#1e2028] bg-[#181a20] p-3 text-sm text-[#9ca3af]">
        Loading Discord…
      </div>
    )
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={login}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#4752C4]"
      >
        <LogIn size={16} />
        Login with Discord
      </button>
    )
  }

  const banner = getBannerUrl(user, compact ? 512 : 1024)
  const accent = user.accent_color != null ? `#${user.accent_color.toString(16).padStart(6, '0')}` : '#111217'

  return (
    <div
      className={`overflow-hidden rounded-lg border border-[#1e2028] bg-[#111217] ${compact ? '' : 'p-5'}`}
    >
      {banner ? (
        <div className="h-20 w-full bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }} />
      ) : (
        <div className="h-12 w-full" style={{ backgroundColor: accent }} />
      )}
      <div className={`flex items-start gap-3 ${compact ? 'p-3' : 'p-4'}`}>
        <img
          src={getAvatarUrl(user, compact ? 64 : 128)}
          alt={userName || 'Discord avatar'}
          className={`rounded-full border-2 border-[#111217] object-cover ${compact ? '-mt-7 h-12 w-12' : '-mt-10 h-16 w-16'}`}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{userName}</div>
          <div className="text-xs text-[#9ca3af]">@{user.username}</div>
          {error && <div className="mt-1 text-xs text-rose-400">{error}</div>}
        </div>
        <button
          type="button"
          onClick={logout}
          title="Logout"
          className="rounded-md p-1.5 text-[#9ca3af] transition hover:bg-[#181a20] hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}
