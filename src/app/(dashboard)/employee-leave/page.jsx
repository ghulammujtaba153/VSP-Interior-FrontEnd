"use client"

import React from 'react'
import EmployeeLeaveMain from '@/components/employee-leave/EmployeeLeaveMain'
import { Stack } from '@mui/material'

const Page = () => {
  return (
    <Stack sx={{ width: "100%", p: 0 }}>
      <EmployeeLeaveMain />
    </Stack>
  )
}

export default Page
