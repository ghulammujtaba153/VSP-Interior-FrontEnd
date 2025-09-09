'use client'

import Loader from '@/components/loader/Loader'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DataGrid } from '@mui/x-data-grid'
import {
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import * as XLSX from 'xlsx'

const SupplierCategoryPage = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  // Modal states
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: '',
    status: ''
  })
  

  // Fetch category
  const fetchCategory = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/pricebook/get/${id}`)
      setData(response.data)
    } catch (error) {
      toast.error('Failed to fetch category')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [id])

  const handleDelete = async rowId => {
    toast.loading('Please wait...')
    try {
      await axios.delete(`${BASE_URL}/api/pricebook/delete/${rowId}`)
      toast.dismiss()
      toast.success('Item deleted successfully')
      fetchCategory()
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to delete item')
    }
  }

  const handleEdit = row => {
    setSelectedRow(row)
    setFormData({
      name: row.name,
      description: row.description,
      unit: row.unit,
      price: row.price,
      status: row.status
    })
    setOpen(true)
  }

  const handleUpdate = async () => {
    toast.loading('Please wait...')
    try {
      if (selectedRow) {
        // Update existing
        await axios.put(`${BASE_URL}/api/pricebook/update/${selectedRow.id}`, formData)
        toast.success('Item updated successfully')
      } else {
        // Create new
        await axios.post(`${BASE_URL}/api/pricebook/create`, {
        ...formData,
        priceBookCategoryId: id
      })
        toast.success('Item added successfully')
      }
      toast.dismiss()
      setOpen(false)
      setSelectedRow(null)
      fetchCategory()
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to save item')
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedRow(null)
  }

  // Export XLS
  // Export XLS
const handleExport = () => {
  if (!data || data.length === 0) {
    toast.error('No data to export')
    return
  }

  // Map the data to include category name instead of id
  const exportData = data.map(item => ({
    ID: item.id,
    Name: item.name,
    Description: item.description,
    Unit: item.unit,
    Price: item.price,
    Status: item.status,
    Category: item.PriceBookCategory ? item.PriceBookCategory.name : '', // <-- category name
    CreatedAt: item.createdAt,
    UpdatedAt: item.updatedAt
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PriceBook')
  XLSX.writeFile(workbook, 'PriceBook.xlsx')
}


  // Columns for DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'unit', headerName: 'Unit', width: 120 },
    { field: 'price', headerName: 'Price', width: 120 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: params => (
        <Box>
          <IconButton color='primary' onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color='error' onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ]

  if (loading) return <Loader />

  return (
    <div className='p-4' component={Paper}>
      <Box display='flex' justifyContent='space-between' mb={2}>
        <Button variant='contained' color='primary' onClick={() => window.history.back()}>
          Back
        </Button>
        <Box>
          <Button variant='contained' color='success' onClick={handleExport} sx={{ mr: 2 }}>
            Export XLS
          </Button>
          <Button variant='contained' color='secondary' onClick={() => setOpen(true)}>
            Add Item
          </Button>
        </Box>
      </Box>

      <h1 className='text-lg font-bold mb-4'>Supplier Category Page</h1>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          disableRowSelectionOnClick
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedRow ? 'Edit Price Book Item' : 'Add Price Book Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            fullWidth
            margin='dense'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label='Description'
            fullWidth
            margin='dense'
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            label='Unit'
            fullWidth
            margin='dense'
            value={formData.unit}
            onChange={e => setFormData({ ...formData, unit: e.target.value })}
          />
          <TextField
            label='Price'
            type='number'
            fullWidth
            margin='dense'
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
          />
          <TextField
            label='Status'
            fullWidth
            margin='dense'
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleUpdate} color='primary' variant='contained'>
            {selectedRow ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SupplierCategoryPage
