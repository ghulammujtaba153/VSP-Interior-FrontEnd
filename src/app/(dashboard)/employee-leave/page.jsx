"use client"

import React, { Suspense } from 'react'
import EmployeeLeaveMain from '@/components/employee-leave/EmployeeLeaveMain'
import { Stack, CircularProgress, Box } from '@mui/material'
import PermissionRoute from '@/components/PermissionRoute'

const Page = () => {
  return (
    <PermissionRoute allowAnyAuthenticated>
      <Stack sx={{ width: "100%", p: 0 }}>
        <Suspense fallback={<Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>}>
          <EmployeeLeaveMain />
        </Suspense>
      </Stack>
    </PermissionRoute>
  )
}

export default Page
