'use client'

import { useAuth } from '@/context/authContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { BASE_URL } from '@/configs/url'

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

      
    </Container>
  )
}
