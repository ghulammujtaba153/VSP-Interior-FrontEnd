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
} from '@mui/material'
import { useRouter } from 'next/navigation'

const CabinetMaterialAddPage = () => {
  const [categories, setCategories] = useState([])
  const [cabinets, setCabinets] = useState([])
  const [selectedCabinets, setSelectedCabinets] = useState([])
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [materialName, setMaterialName] = useState('')
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
    fetchData()
    fetchCabinets()
  }, [])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await axios.post(`${BASE_URL}/api/cabinet-quote/create`, {
          title: materialName,
          description: materialDescription,
          cabinetIds: selectedCabinets.map((cab) => cab.id), // send only IDs
        
      })
      toast.success('Material added successfully')
      router.push('/cabinet/material')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Add Cabinet Material
      </Typography>

      {/* Material Name */}
      <TextField
        fullWidth
        label="Title"
        name="materialName"
        value={materialName}
        onChange={(e) => setMaterialName(e.target.value)}
        margin="normal"
      />

      {/* Material Description */}
      <TextField
        fullWidth
        label="Description"
        name="materialDescription"
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
            label="Select Cabinets"
            placeholder="Search by code..."
            margin="normal"
          />
        )}
        sx={{ mt: 2 }}
      />

      {/* Submit Button */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!materialName || selectedCabinets.length === 0}
        >
          Submit
        </Button>
      </Box>
    </Paper>
  )
}

export default CabinetMaterialAddPage
