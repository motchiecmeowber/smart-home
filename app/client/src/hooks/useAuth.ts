/**
 * useAuth.ts
 * React hook that subscribes to authStore and re-renders on state changes.
 */
import { useEffect, useState } from 'react'
import { authStore } from '../lib/authStore'
import type { AuthState } from '../lib/authStore'

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() => authStore.getState())

  useEffect(() => {
    setState({ ...authStore.getState() })
    const unsub = authStore.subscribe(setState)
    return unsub
  }, [])

  return state
}
