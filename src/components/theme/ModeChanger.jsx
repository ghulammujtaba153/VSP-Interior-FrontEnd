// React Imports
import { useEffect } from 'react'

// MUI Imports
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import { useMedia } from 'react-use'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeChanger = ({ systemMode }) => {
  // Hooks
  const { setMode, mode } = useColorScheme()
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')


  useEffect(() => {
    console.log('=== MODE CHANGER DEBUG ===')
    console.log('Settings mode:', settings.mode)
    console.log('System prefers dark:', isDark)
    console.log('Current MUI mode:', mode)
    console.log('SystemMode prop:', systemMode)
    
    if (settings.mode) {
      if (settings.mode === 'system') {
        const newMode = isDark ? 'dark' : 'light'
        console.log('Setting system mode:', newMode)
        setMode(newMode)
      } else {
        console.log('Setting manual mode:', settings.mode)
        setMode(settings.mode)
      }
    }
    console.log('=========================')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode, isDark])


  useEffect(() => {
    if (settings.mode) {
      if (settings.mode === 'system') {
        setMode(isDark ? 'dark' : 'light')
      } else {
        setMode(settings.mode)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode])

  return null
}

export default ModeChanger
