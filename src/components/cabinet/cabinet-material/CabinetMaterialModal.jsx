'use client'

import Loader from '@/components/loader/Loader'
import { BASE_URL } from '@/configs/url'
import { toast } from 'react-toastify'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  TextField,
  Button,
  Box,
  Typography,
  Autocomplete,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const CabinetMaterialModal = ({ open, onClose, editData, onSuccess }) => {
  const [mode, setMode] = useState('add')
  const [categories, setCategories] = useState([])
  const [cabinets, setCabinets] = useState([])
  const [selectedCabinets, setSelectedCabinets] = useState([])
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASE_URL}/api/cabinet-categories/get`)
      setCategories(response.data.data || response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fetchCabinets = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/cabinet/get`)
      setCabinets(res.data.cabinet || res.data.data || [])
    } catch (error) {
      console.error('Error fetching cabinets:', error)
      toast.error('Failed to fetch cabinets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
      fetchCabinets()
    }
  }, [open])

  useEffect(() => {
    if (editData) {
      setMode('edit')
      setTitle(editData.title || '')
      setMaterialDescription(editData.description || '')
      // Set selected cabinets if editing
      if (editData.cabinetMaterials) {
        setSelectedCabinets(editData.cabinetMaterials.map(cm => cm.cabinet))
      }
    } else {
      setMode('add')
      setTitle('')
      setMaterialDescription('')
      setSelectedCabinets([])
    }
  }, [editData])

  const handleSubmit = async () => {
    if (!title.trim() || selectedCabinets.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.loading(mode === 'add' ? 'Adding material...' : 'Updating material...')

    try {
      setLoading(true)
      if (mode === 'add') {
        await axios.post(`${BASE_URL}/api/cabinet-quote/create`, {
          title: title,
          description: materialDescription,
          cabinetIds: selectedCabinets.map((cab) => cab.id),
        })
        toast.success('Material added successfully')
      } else {
        await axios.put(`${BASE_URL}/api/cabinet-quote/update/${editData.id}`, {
          title: title,
          description: materialDescription,
          cabinetIds: selectedCabinets.map((cab) => cab.id),
        })
        toast.success('Material updated successfully')
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Something went wrong')
      console.error(error)
    } finally {
      setLoading(false)
      toast.dismiss()
      
    }
  }

  const handleClose = () => {
    setTitle('')
    setMaterialDescription('')
    setSelectedCabinets([])
    onClose()
  }

  if (loading) {
    return <Loader />
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {mode === 'add' ? 'Add Cabinet Material' : 'Edit Cabinet Material'}
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Material Title */}
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          {/* Material Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={materialDescription}
            onChange={(e) => setMaterialDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />

          {/* Multi-select with search */}
          <Autocomplete
            multiple
            options={cabinets}
            getOptionLabel={(option) => option.code?.toString() || ''}
            value={selectedCabinets}
            onChange={(_, newValue) => setSelectedCabinets(newValue)}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Items"
                placeholder="Search by code..."
                margin="normal"
                required
              />
            )}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!title.trim() || selectedCabinets.length === 0 || loading}
        >
          {loading ? 'Saving...' : mode === 'add' ? 'Add Material' : 'Update Material'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CabinetMaterialModal
