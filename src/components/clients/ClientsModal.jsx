'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material'
import { toast } from 'react-toastify'
import axios from 'axios'
import ConfirmationDialog from '../ConfirmationDialog'
import { MuiTelInput } from 'mui-tel-input'

import { BASE_URL } from '@/configs/url'
import { useAuth } from '@/context/authContext'
import ImportModal from './ImportModal'

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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>{editClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            fullWidth
            label='Company Name'
            name='companyName'
            value={client.companyName}
            onChange={handleChange}
            margin='normal'
            required={client.isCompany} // required only if isCompany is true
          />

          <FormControlLabel
            control={
              <Switch
                checked={client.isCompany}
                onChange={e => setClient({ ...client, isCompany: e.target.checked })}
                color='primary'
              />
            }
            label='Is Company?'
          />

          <TextField
            fullWidth
            label='Email Address'
            name='emailAddress'
            type='email'
            value={client.emailAddress}
            onChange={handleChange}
            margin='normal'
            required
          />
          <MuiTelInput
            fullWidth
            defaultCountry='NZ'
            label='Phone Number'
            value={client.phoneNumber}
            onChange={value => setClient({ ...client, phoneNumber: value })}
            margin='normal'
            required
          />
          <TextField
            fullWidth
            label='Address'
            name='address'
            value={client.address}
            onChange={handleChange}
            margin='normal'
            required
          />
          <TextField
            fullWidth
            label='Post Code'
            name='postCode'
            value={client.postCode}
            onChange={handleChange}
            margin='normal'
            required
          />
          <TextField
            fullWidth
            label='Notes'
            name='notes'
            value={client.notes}
            onChange={handleChange}
            margin='normal'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary' disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' color='primary' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editClient ? 'Update' : 'Create'}
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
