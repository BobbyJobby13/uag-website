const FALLBACK_CLIENT_ID = '1528309593686409278'
const FALLBACK_GUILD_ID = '1487214421540606012'

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  global_name: string | null
  avatar: string | null
  banner: string | null
  banner_color: number | null
  accent_color: number | null
  flags: number
  public_flags: number
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  features: string[]
}

export interface DiscordAuth {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  expires_at: number
}

export function getDiscordClientId(): string {
  return import.meta.env.VITE_DISCORD_CLIENT_ID || FALLBACK_CLIENT_ID
}

export function getDiscordGuildId(): string {
  return import.meta.env.VITE_DISCORD_GUILD_ID || FALLBACK_GUILD_ID
}

export function buildDiscordAuthUrl(): string {
  const redirectUri =
    import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/`
  const params = new URLSearchParams({
    client_id: getDiscordClientId(),
    response_type: 'token',
    redirect_uri: redirectUri,
    scope: 'identify guilds',
    prompt: 'consent',
  })
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

export function parseDiscordAuthHash(): DiscordAuth | null {
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  const params = new URLSearchParams(hash)
  const access_token = params.get('access_token')
  const token_type = params.get('token_type') || 'Bearer'
  const expires_in = Number(params.get('expires_in') || '0')
  const scope = params.get('scope') || ''
  if (!access_token) return null
  return {
    access_token,
    token_type,
    expires_in,
    scope,
    expires_at: Date.now() + expires_in * 1000,
  }
}

const STORAGE_KEY = 'uag_discord_auth'

export function getStoredDiscordAuth(): DiscordAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const auth: DiscordAuth = JSON.parse(raw)
    if (auth.expires_at && auth.expires_at < Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return auth
  } catch {
    return null
  }
}

export function setStoredDiscordAuth(auth: DiscordAuth | null): void {
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function authHeader(auth: DiscordAuth): string {
  return `${auth.token_type} ${auth.access_token}`
}

async function discordFetch<T>(path: string, auth: DiscordAuth): Promise<T | null> {
  try {
    const res = await fetch(`https://discord.com/api/v10${path}`, {
      headers: { Authorization: authHeader(auth) },
    })
    if (!res.ok) throw new Error(`Discord API error: ${res.status}`)
    return (await res.json()) as T
  } catch {
    return null
  }
}

export function fetchDiscordUser(auth: DiscordAuth): Promise<DiscordUser | null> {
  return discordFetch<DiscordUser>('/users/@me', auth)
}

export function fetchDiscordGuilds(auth: DiscordAuth): Promise<DiscordGuild[] | null> {
  return discordFetch<DiscordGuild[]>('/users/@me/guilds', auth)
}

export function getAvatarUrl(user: DiscordUser, size = 128): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`
  }
  const idx = Number(user.discriminator || 0) % 5
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

export function getBannerUrl(user: DiscordUser, size = 1024): string | null {
  if (!user.banner) return null
  const ext = user.banner.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${ext}?size=${size}`
}

export function getGuildIconUrl(guild: DiscordGuild, size = 128): string | null {
  if (!guild.icon) return null
  const ext = guild.icon.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=${size}`
}

export function displayName(user: DiscordUser): string {
  return user.global_name || user.username
}

export function getAdminUsernames(): string[] {
  const env = (import.meta.env.VITE_ADMIN_DISCORD_USERNAMES as string | undefined) || 'Brzzzes'
  return env
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean)
}

export function getEmployeeUsernames(): string[] {
  const env = (import.meta.env.VITE_EMPLOYEE_DISCORD_USERNAMES as string | undefined) || ''
  return env
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(
  user: DiscordUser | null,
  guilds: DiscordGuild[] | null,
  guildId = getDiscordGuildId()
): boolean {
  if (!user) return false
  const names = getAdminUsernames()
  if (names.includes(user.username.toLowerCase())) return true
  if (user.global_name && names.includes(user.global_name.toLowerCase())) return true
  const guild = guilds?.find((g) => g.id === guildId)
  if (guild?.owner) return true
  return false
}

export function isEmployeeUser(user: DiscordUser | null): boolean {
  if (!user) return false
  const names = getEmployeeUsernames()
  return names.includes(user.username.toLowerCase()) || (user.global_name ? names.includes(user.global_name.toLowerCase()) : false)
}

export function canEditRealty(user: DiscordUser | null, guilds: DiscordGuild[] | null): boolean {
  return isAdminUser(user, guilds)
}

export function canPostJobs(user: DiscordUser | null, guilds: DiscordGuild[] | null): boolean {
  return isAdminUser(user, guilds) || isEmployeeUser(user)
}
