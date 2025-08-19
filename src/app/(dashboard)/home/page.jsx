'use client'

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Input,
  TextField,
  Typography,
} from '@mui/material'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/authContext'
import { BASE_URL } from '@/configs/url'
import AuditSection from '@/components/home/AuditSection'
import NotificationSection from '@/components/home/NotificationSection'

export default function HomePage() {
  const { googleLogin } = useAuth()
  const searchParams = useSearchParams()
  const [tokenHandled, setTokenHandled] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      googleLogin(token)
    }

    setTokenHandled(true)
  }, [searchParams, googleLogin])

  if (!tokenHandled) return <Box p={4}>Checking token...</Box>

  return (
    <ProtectedRoute>
      <MainHome />
    </ProtectedRoute>
  )
}

const MainHome = () => {
  const { user, } = useAuth()
  
  console.log("user", user)



  return (
    <Container  sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'User'}!
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        This is your protected home page. Submit site configuration below.
      </Typography>

      <NotificationSection/>

      <AuditSection/>

      
    </Container>
  )
}
