'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Box,
  Stack,
  Divider
} from '@mui/material'
import { toast } from 'react-toastify'
import axios from 'axios'
import ConfirmationDialog from '../ConfirmationDialog'
import { MuiTelInput } from 'mui-tel-input'
import {
  Business,
  Person,
  Email,
  Phone,
  LocationOn,
  LocalPostOffice,
  Notes
} from '@mui/icons-material'

import { BASE_URL } from '@/configs/url'
import { useAuth } from '@/context/authContext'

const initialClientState = {
  companyName: '',
  emailAddress: '',
  phoneNumber: '',
  address: '',
  postCode: '',
  notes: '',
  isCompany: false
}

const ClientsModal = ({ open, handleClose, editClient, refreshClients }) => {
  const [client, setClient] = useState(initialClientState)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  })

  useEffect(() => {
    if (editClient) {
      setClient(editClient)
    } else {
      setClient(initialClientState)
    }
  }, [editClient])

  const handleChange = e => {
    const { name, value } = e.target
    setClient({ ...client, [name]: value })
  }

  const showConfirmation = config => {
    setConfirmationConfig(config)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const isCreateMode = !editClient
    const isEditMode = !!editClient

    if (isCreateMode) {
      showConfirmation({
        title: 'Create New Client',
        message: `Are you sure you want to create a new client "${client.companyName}"?`,
        action: () => submitClient(),
        severity: 'info'
      })
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update Client',
        message: `Are you sure you want to update client "${client.companyName}"? This will modify the existing client information.`,
        action: () => submitClient(),
        severity: 'warning'
      })
    }
  }

  const submitClient = async () => {
    setLoading(true)
    try {
      if (editClient) {
        await axios.put(`${BASE_URL}/api/client/update/${client.id}`, {
          ...client,
          userId: user.id
        })
        toast.success('Client updated successfully')
      } else {
        await axios.post(`${BASE_URL}/api/client/create`, {
          ...client,
          userId: user.id
        })
        toast.success('Client created successfully')
      }

      refreshClients()
      handleClose()
    } catch (error) {
      toast.error('Failed to submit client data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth='sm'
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Business />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {editClient ? 'Edit Client' : 'Add New Client'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {editClient ? 'Update client information' : 'Create a new client profile'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Client Type Selection */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1rem'
              }}>
                Client Type
              </FormLabel>
              <RadioGroup
                row
                value={client.isCompany}
                onChange={(e) => setClient({ ...client, isCompany: e.target.value === 'true' })}
                sx={{ 
                  gap: 3,
                  justifyContent: 'space-between',
                  '& .MuiFormControlLabel-root': {
                    margin: 0,
                    flex: 1
                  }
                }}
              >
                <FormControlLabel
                  value={false}
                  control={
                    <Radio 
                      icon={<Person />}
                      checkedIcon={<Person />}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={600}>
                        Individual
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Personal client
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: client.isCompany ? 1 : 2,
                    borderColor: client.isCompany ? 'grey.300' : 'primary.main',
                    borderRadius: 2,
                    p: 2,
                    m: 0,
                    backgroundColor: !client.isCompany ? 'primary.50' : 'transparent',
                    '&:hover': {
                      backgroundColor: !client.isCompany ? 'primary.100' : 'grey.50',
                    }
                  }}
                />
                <FormControlLabel
                  value={true}
                  control={
                    <Radio 
                      icon={<Business />}
                      checkedIcon={<Business />}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={600}>
                        Company
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Business client
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: client.isCompany ? 2 : 1,
                    borderColor: client.isCompany ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 2,
                    m: 0,
                    backgroundColor: client.isCompany ? 'primary.50' : 'transparent',
                    '&:hover': {
                      backgroundColor: client.isCompany ? 'primary.100' : 'grey.50',
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Name Field */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label={client.isCompany ? "Company Name" : "Client Name"}
                name='companyName'
                value={client.companyName}
                onChange={handleChange}
                required={client.isCompany}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'action.active' }}>
                      {client.isCompany ? <Business /> : <Person />}
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    pl: 1
                  }
                }}
              />
            </Box>

            {/* Contact Information */}
            <Box>
              
              <Stack spacing={2} >
                <TextField
                  fullWidth
                  label='Email Address'
                  name='emailAddress'
                  type='email'
                  value={client.emailAddress}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      pl: 1
                    }
                  }}
                />
                
                <MuiTelInput
                  fullWidth
                  defaultCountry='NZ'
                  label='Phone Number'
                  value={client.phoneNumber}
                  onChange={value => setClient({ ...client, phoneNumber: value })}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <Phone sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      pl: 1
                    }
                  }}
                />
              </Stack>
            </Box>

            {/* Address Information */}
            <Box>
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label='Address'
                  name='address'
                  value={client.address}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      pl: 1
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label='Post Code'
                  name='postCode'
                  value={client.postCode}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <LocalPostOffice sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      pl: 1
                    }
                  }}
                />
              </Stack>
            </Box>

            {/* Notes */}
            <Box>
              
              <Box>
                <TextField
                  fullWidth
                  label='Notes'
                  name='notes'
                  value={client.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add any additional notes or comments about this client..."
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            color='secondary' 
            disabled={loading}
            variant="outlined"
            size="large"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            type='submit' 
            variant='contained' 
            color='primary' 
            disabled={loading}
            size="large"
            sx={{ minWidth: 120 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editClient ? (
              'Update Client'
            ) : (
              'Create Client'
            )}
          </Button>
        </DialogActions>
      </form>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={editClient ? 'Update' : 'Create'}
        cancelText='Cancel'
      />
    </Dialog>
  )
}

export default ClientsModal