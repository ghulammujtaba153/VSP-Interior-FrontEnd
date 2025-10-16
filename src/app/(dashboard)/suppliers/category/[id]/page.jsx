'use client'

import Loader from '@/components/loader/Loader'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import * as XLSX from 'xlsx'

const SupplierCategoryPage = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modal
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
        await axios.put(`${BASE_URL}/api/pricebook/update/${selectedRow.id}`, formData)
        toast.success('Item updated successfully')
      } else {
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
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    const exportData = data.map(item => ({
      ID: item.id,
      Name: item.name,
      Description: item.description,
      Unit: item.unit,
      Price: item.price,
      Version: item.version,
      Status: item.status,
      Category: item.PriceBookCategory ? item.PriceBookCategory.name : '',
      CreatedAt: item.createdAt,
      UpdatedAt: item.updatedAt
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PriceBook')
    XLSX.writeFile(
      workbook,
      `${data[0]?.PriceBookCategory?.Supplier.name || 'Supplier'} - ${
        data[0]?.PriceBookCategory?.name || 'Category'
      } VSP.xlsx`
    )
  }

  // Filtered rows
  const filteredData = data.filter(item =>
    Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Paginated rows
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (loading) return <Loader />

  return (
    <div className='p-4' component={Paper}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
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

      <Typography variant='h6' fontWeight='bold' mb={2}>
        Supplier Category Page
      </Typography>

      <Box className='my-2' display='flex' alignItems='center'>
        <TextField
          label='Search...'
          variant='outlined'
          size='small'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ mx: 2, flex: 1, maxWidth: 300 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>ID</b>
              </TableCell>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Description</b>
              </TableCell>
              <TableCell>
                <b>Unit</b>
              </TableCell>
              <TableCell>
                <b>Price</b>
              </TableCell>
              <TableCell>
                <b>Version</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
              <TableCell align='center'>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.version}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align='center'>
                    <IconButton color='primary' onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={filteredData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </TableContainer>

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
          <FormControl fullWidth margin='dense'>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label='Status'
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
            </Select>
          </FormControl>
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
