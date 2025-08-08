'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

// Third-party Imports
import classnames from 'classnames'
import axios from 'axios'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { BASE_URL } from '@/configs/url'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/authContext'
import { Alert, AlertTitle } from '@mui/material'

// Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const { setAuth } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const authBackground = useImageVariant(mode, '/images/pages/auth-mask-light.png', '/images/pages/auth-mask-dark.png')
  const characterIllustration = useImageVariant(
    mode,
    '/images/illustrations/auth/v2-login-light.png',
    '/images/illustrations/auth/v2-login-dark.png',
    '/images/illustrations/auth/v2-login-light-border.png',
    '/images/illustrations/auth/v2-login-dark-border.png'
  )

  const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)

  const handleSubmit = async e => {
    e.preventDefault()
    const form = e.target
    const email = form.email.value
    const password = form.password.value

    try {
      const res = await axios.post(`${BASE_URL}/api/user/login`, { email, password })
      console.log(res.data)
      setAuth(res.data.token)
      setSuccess(true)
      router.push('/home')
    } catch (error) {
      setError(true)
      toast.error(error?.response?.data?.message || 'An unexpected error occurred')
    }
  }

  return (
    <div className='relative flex items-center justify-center min-h-screen'>
      {success && (
        <Alert
          severity='success'
          onClose={() => setSuccess(false)}
          className='absolute top-5 left-1/2 -translate-x-1/2'
        >
          <AlertTitle>Success</AlertTitle>
          Authentification successful.
        </Alert>
      )}

      {error && (
        <Alert
          severity='error'
          onClose={() => setError(false)}
          className='absolute top-5 left-1/2 -translate-x-1/2'
        >
          <AlertTitle>Error</AlertTitle>
          Authentication failed.
        </Alert>
      )}

      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Welcome to VPS! 👋🏻`}</Typography>
            <Typography>Please sign-in to your account</Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              name='email'
              type='email'
              label='Email or Username'
              placeholder='Enter your email or username'
            />

            <CustomTextField
              fullWidth
              name='password'
              label='Password'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button fullWidth variant='contained' type='submit'>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
