import { useState, useCallback } from 'react'
import type { AppUser, UserRole } from '../types'

const ROLE_MAP: Record<string, UserRole> = {
  // Add specific emails here to assign roles
  // 'ever@empresa.com': 'gerencia',
  // 'auditor@firma.com': 'auditor',
}

const DEFAULT_ROLE: UserRole = 'gerencia'

function resolveRole(email: string): UserRole {
  return ROLE_MAP[email.toLowerCase()] ?? DEFAULT_ROLE
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('fssc_user')
      return stored ? (JSON.parse(stored) as AppUser) : null
    } catch {
      return null
    }
  })

  const login = useCallback((profile: { email: string; name: string; picture?: string }, accessToken: string) => {
    const u: AppUser = {
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      role: resolveRole(profile.email),
      accessToken,
    }
    sessionStorage.setItem('fssc_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('fssc_user')
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: user !== null }
}
