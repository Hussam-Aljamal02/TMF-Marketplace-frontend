'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/api'

interface User {
  id: number
  username: string
  email: string
  role: 'uploader' | 'buyer'
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  password2: string
  role: 'uploader' | 'buyer'
  first_name?: string
  last_name?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = Cookies.get('access_token')
    if (token) {
      try {
        const res = await api.get('/auth/profile/')
        localStorage.setItem('user', JSON.stringify(res.data))
        setUser(res.data)
      } catch {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    setLoading(false)
  }

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login/', { username, password })
    Cookies.set('access_token', res.data.tokens.access)
    Cookies.set('refresh_token', res.data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register/', data)
    Cookies.set('access_token', res.data.tokens.access)
    Cookies.set('refresh_token', res.data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
