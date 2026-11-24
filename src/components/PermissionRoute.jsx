'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '@/context/authContext'
import { usePermissions } from '@/hooks/usePermissions'

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.resource] - RBAC resource name (e.g. 'human resource')
 * @param {boolean} [props.requireHrAdmin] - HR admin only
 * @param {boolean} [props.allowAnyAuthenticated] - any logged-in user
 */
export default function PermissionRoute({
  children,
  resource,
  requireHrAdmin = false,
  allowAnyAuthenticated = false,
}) {
  const router = useRouter()
  const { user, loading, token } = useAuth()
  const { canView } = usePermissions()

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login')
    }
  }, [loading, token, router])

  if (loading || (token && !user)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!token) {
    return null
  }

  if (allowAnyAuthenticated) {
    return children
  }

  if (requireHrAdmin || resource) {
    const allowed = canView(resource || 'human resource')
    if (!allowed) {
      return (
        <Box sx={{ p: 4 }}>
          <Typography color="error">You do not have permission to access this page.</Typography>
        </Box>
      )
    }
  }

  return children
}
