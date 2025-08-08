'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/authContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!loading) {
      if (!user && !token) {
        router.push('/login')
      } else {
        setChecked(true)
      }
    }
  }, [user, loading, router])

  if (loading || !checked) {
    return <div>Loading...</div>
  }

  return children
}

export default ProtectedRoute
