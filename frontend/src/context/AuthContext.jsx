import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearStoredAuth,
  readStoredAuth,
  storeAuth,
} from '../utils/authStorage'
import AuthContext from './authContext'

const validRoles = new Set(['admin', 'doctor', 'patient'])

function isAuthUser(user) {
  return Boolean(
    user
    && typeof user.id === 'string'
    && typeof user.name === 'string'
    && typeof user.email === 'string'
    && validRoles.has(user.role),
  )
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredAuth())

  useEffect(() => {
    function handleUnauthorized() {
      setSession(null)
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const saveSession = useCallback((response) => {
    if (typeof response?.token !== 'string' || !response.token || !isAuthUser(response.user)) {
      throw new Error('The server returned an invalid authentication response.')
    }

    const nextSession = { token: response.token, user: response.user }
    storeAuth(nextSession)
    setSession(nextSession)
    return response.user
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    return saveSession(response)
  }, [saveSession])

  const register = useCallback(async (patientDetails) => {
    const response = await authApi.register(patientDetails)
    return saveSession(response)
  }, [saveSession])

  const logout = useCallback(() => {
    clearStoredAuth()
    setSession(null)
  }, [])

  const value = useMemo(() => ({
    token: session?.token ?? null,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token && isAuthUser(session?.user)),
    login,
    register,
    logout,
  }), [session, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
