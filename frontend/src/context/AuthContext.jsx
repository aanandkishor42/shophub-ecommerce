import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('shophub_user')
    const storedToken = localStorage.getItem('shophub_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)

    const handleAuthExpired = () => setUser(null)
    window.addEventListener('auth-expired', handleAuthExpired)
    return () => window.removeEventListener('auth-expired', handleAuthExpired)
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    const data = res.data
    localStorage.setItem('shophub_token', data.token)
    const userObj = {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
    }
    localStorage.setItem('shophub_user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  const register = async (userData) => {
    const res = await api.post('/api/auth/register', userData)
    const data = res.data
    localStorage.setItem('shophub_token', data.token)
    const userObj = {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
    }
    localStorage.setItem('shophub_user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  const logout = () => {
    localStorage.removeItem('shophub_token')
    localStorage.removeItem('shophub_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}