'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/authContext'
import { usePermissions } from '@/hooks/usePermissions'

const ProtectedRoute = ({ children, requiredResource = null, requiredAction = 'canView' }) => {
  const { user, loading } = useAuth()
  const { hasPermission, showPermissionDenied } = usePermissions()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Only proceed after loading is finished
    const token = localStorage.getItem('token')
    if (!loading) {
      if (!user && !token) {
        router.push('/login')
      } else if (requiredResource && !hasPermission(requiredResource, requiredAction)) {
        // User is authenticated but doesn't have permission for this resource
        showPermissionDenied(requiredResource, requiredAction.replace('can', '').toLowerCase())
        router.push('/home') // Redirect to home or dashboard
      } else {
        setChecked(true)
      }
    }
  }, [user, loading, router, requiredResource, requiredAction, hasPermission, showPermissionDenied])

  if (loading || !checked) {
    return <div>Loading...</div>
  }

  return children
}

export default ProtectedRoute
