'use client'

import React, { useState } from 'react'

import {
  Box,
  Button,
  Container,
  Input,
  TextField,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material'

import { Visibility, VisibilityOff } from '@mui/icons-material'
import axios from 'axios'


import { toast } from 'react-toastify'

import { useAuth } from '@/context/authContext'
import { BASE_URL } from '@/configs/url'

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState(null)

  const handleFileChange = (event) => {
    setAvatar(event.target.files[0])
  }

  const handleUpdate = async () => {
    try {
      const formData = new FormData()

      formData.append('name', name)
      formData.append('email', email)
      formData.append('phone', phone)

      if (password.trim() !== '') {
        formData.append('password', password)
      }

      if (avatar) {
        formData.append('avatar', avatar)
      }

      const res = await axios.put(`${BASE_URL}/api/auth/${user?._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setUser(res.data)
      toast.success('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Error updating profile.')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Box display="flex" justifyContent="center" mb={2}>
        <Avatar
          src={user?.avatar}
          alt={user?.name}
          sx={{ width: 100, height: 100 }}
        />
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        <Input type="file" onChange={handleFileChange} />

        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Phone"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          label="Password"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Leave empty to keep existing password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" color="primary" onClick={handleUpdate}>
          Update Profile
        </Button>
      </Box>
    </Container>
  )
}

export default ProfilePage
