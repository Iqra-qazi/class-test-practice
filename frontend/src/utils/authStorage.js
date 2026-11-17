export const AUTH_STORAGE_KEYS = Object.freeze({
  token: 'clinic_token',
  user: 'clinic_user',
})

export const AUTH_UNAUTHORIZED_EVENT = 'clinic:unauthorized'

export function readStoredAuth() {
  const token = window.localStorage.getItem(AUTH_STORAGE_KEYS.token)
  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEYS.user)

  if (!token || !storedUser) {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.token)
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.user)
    return null
  }

  try {
    const user = JSON.parse(storedUser)
    const validRoles = ['admin', 'doctor', 'patient']
    if (
      typeof user?.id !== 'string'
      || typeof user.name !== 'string'
      || typeof user.email !== 'string'
      || !validRoles.includes(user.role)
    ) {
      throw new Error('Stored user data is invalid.')
    }

    return { token, user }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.token)
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.user)
    return null
  }
}

export function storeAuth({ token, user }) {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.token, token)
  window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user))
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEYS.token)
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.user)
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
}
