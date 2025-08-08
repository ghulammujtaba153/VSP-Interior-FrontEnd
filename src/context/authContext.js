'use client'

import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'


const AuthContext = createContext(undefined)


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState(null)


  const fetchConfig = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/config`)
        setConfig(res.data)
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message)
      }
    }

    useEffect(() => {
      fetchConfig()
    }, [])

  const fetchUser = async () => {
    // const token = localStorage.getItem('token')
    // if (!token) return

    console.log("fetching user", token)
    setLoading(true)

    console.log("fetching user", token)

    
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get-user-by-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log("user fetched is here", res.data)
      setUser(res.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token) // Sync on state change
      fetchUser()
    }
  }, [token])
  

  const setAuth = (token) => {
    setToken(token)
    localStorage.setItem('token', token)
  }


  const googleLogin = ( token) => {
    setToken(token)
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, setUser, loading, config, setConfig, googleLogin, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
