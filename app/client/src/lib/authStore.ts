/**
 * Strategy:
 * - accessToken is kept in memory (never written to localStorage by default).
 * - When "rememberSession" is true, accessToken is also persisted to
 *   localStorage so it survives a full page reload.
 * - refreshToken lives in an httpOnly cookie handled by the server —
 *   we never touch it directly.
 * - On app startup call `authStore.tryRestore()` to attempt a silent token
 *   refresh using the cookie.
 *
 * Listeners can subscribe to state changes via `authStore.subscribe()`.
 */

import { apiLogout, apiRefreshToken } from './authApi'
import type { UserDto } from './authApi'

export interface AuthState {
  accessToken: string | null
  user: UserDto | null
  /** true while tryRestore() is running */
  restoring: boolean
}

type Listener = (state: AuthState) => void

const LS_TOKEN_KEY = 'accessToken'
const LS_USER_KEY = 'authUser'

class AuthStore {
  private state: AuthState = {
    accessToken: null,
    user: null,
    restoring: true,
  }

  private listeners: Set<Listener> = new Set()
  /** Whether we're already in the middle of a refresh call */
  private refreshPromise: Promise<boolean> | null = null

  getState(): Readonly<AuthState> {
    return this.state
  }

  getToken(): string | null {
    return this.state.accessToken
  }

  isAuthenticated(): boolean {
    return this.state.accessToken !== null
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify(): void {
    for (const fn of this.listeners) fn({ ...this.state })
  }

  private setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  saveSession(token: string, user: UserDto, remember: boolean): void {
    this.setState({ accessToken: token, user, restoring: false })

    if (remember) {
      try {
        localStorage.setItem(LS_TOKEN_KEY, token)
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user))
      } catch {
        // storage might be blocked (private mode, quota exceeded, etc.)
      }
    } else {
      // Make sure no stale persistent token exists
      localStorage.removeItem(LS_TOKEN_KEY)
      localStorage.removeItem(LS_USER_KEY)
    }
  }

  updateToken(token: string, user: UserDto): void {
    this.setState({ accessToken: token, user })

    // If the user had previously persisted their session, update localStorage
    if (localStorage.getItem(LS_TOKEN_KEY)) {
      try {
        localStorage.setItem(LS_TOKEN_KEY, token)
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user))
      } catch {
        // ignore
      }
    }
  }

  clearSession(): void {
    this.setState({ accessToken: null, user: null, restoring: false })
    localStorage.removeItem(LS_TOKEN_KEY)
    localStorage.removeItem(LS_USER_KEY)
  }

  async logout(): Promise<void> {
    const token = this.state.accessToken
    this.clearSession()
    if (token) {
      // Fire and forget — we've already cleared state locally
      apiLogout(token).catch(() => undefined)
    }
  }

  async tryRestore(): Promise<boolean> {
    this.setState({ restoring: true })

    // Load from localStorage for immediate (optimistic) render
    const persistedToken = localStorage.getItem(LS_TOKEN_KEY)
    const persistedUserRaw = localStorage.getItem(LS_USER_KEY)
    if (persistedToken && persistedUserRaw) {
      try {
        const user = JSON.parse(persistedUserRaw) as UserDto
        this.setState({ accessToken: persistedToken, user })
      } catch {
        // corrupted — clear it
        localStorage.removeItem(LS_TOKEN_KEY)
        localStorage.removeItem(LS_USER_KEY)
      }
    }

    // Silent refresh via cookie
    try {
      const data = await apiRefreshToken()
      this.updateToken(data.accessToken, data.user)
      this.setState({ restoring: false })
      return true
    } catch {
      this.clearSession()
      this.setState({ restoring: false })
      return false
    }
  }

  async silentRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const data = await apiRefreshToken()
        this.updateToken(data.accessToken, data.user)
        return true
      } catch {
        this.clearSession()
        return false
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }
}

export const authStore = new AuthStore()
