import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  const loginSuccess = useCallback((data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((data) => {
    const updated = { ...JSON.parse(localStorage.getItem('user')), ...data }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
