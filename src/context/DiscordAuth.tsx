import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  buildDiscordAuthUrl,
  displayName,
  fetchDiscordGuilds,
  fetchDiscordUser,
  getStoredDiscordAuth,
  parseDiscordAuthHash,
  setStoredDiscordAuth,
  type DiscordGuild,
  type DiscordUser,
} from '../lib/discord'

interface DiscordAuthState {
  user: DiscordUser | null
  guilds: DiscordGuild[] | null
  loading: boolean
  error: string | null
  login: () => void
  logout: () => void
  userName: string | null
}

const DiscordAuthContext = createContext<DiscordAuthState | null>(null)

export function DiscordAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [guilds, setGuilds] = useState<DiscordGuild[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    let auth = parseDiscordAuthHash()
    if (auth) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      setStoredDiscordAuth(auth)
    } else {
      auth = getStoredDiscordAuth()
    }
    if (!auth) {
      setUser(null)
      setGuilds(null)
      setLoading(false)
      return
    }
    const [fetchedUser, fetchedGuilds] = await Promise.all([
      fetchDiscordUser(auth),
      fetchDiscordGuilds(auth),
    ])
    if (fetchedUser) {
      setUser(fetchedUser)
      setGuilds(fetchedGuilds)
    } else {
      setError('Could not load your Discord profile.')
      setStoredDiscordAuth(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const login = useCallback(() => {
    window.location.href = buildDiscordAuthUrl()
  }, [])

  const logout = useCallback(() => {
    setStoredDiscordAuth(null)
    setUser(null)
    setGuilds(null)
    setError(null)
  }, [])

  const userName = user ? displayName(user) : null

  return (
    <DiscordAuthContext.Provider value={{ user, guilds, loading, error, login, logout, userName }}>
      {children}
    </DiscordAuthContext.Provider>
  )
}

export function useDiscordAuth(): DiscordAuthState {
  const ctx = useContext(DiscordAuthContext)
  if (!ctx) throw new Error('useDiscordAuth must be used within DiscordAuthProvider')
  return ctx
}
