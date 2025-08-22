'use client'

import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Loader from '../loader/Loader'
import { Box, Button, IconButton, Typography, Paper } from '@mui/material'
import { Visibility, Edit, Delete } from '@mui/icons-material'
import CabinetModal from './CabinetModal'
import ViewCabinet from './ViewCabinet'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/authContext'
import { DataGrid } from '@mui/x-data-grid'
import CSVFileModal from './CSVFileModal'

// ✅ Import XLSX
import * as XLSX from 'xlsx'

const CabinetTable = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)
  const { user } = useAuth()
  const [csvModalOpen, setCsvModalOpen] = useState(false)

  const fetchCabinets = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cabinet/get`)
      setData(res.data.cabinet || [])
    } catch (error) {
      console.error('Error fetching cabinets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    toast.loading('Deleting Cabinet...')
    try {
      await axios.delete(`${BASE_URL}/api/cabinet/delete/${id}`, {
        data: {
          userId: user.id
        }
      })
      fetchCabinets()
      toast.dismiss()
      toast.success('Cabinet deleted successfully')
    } catch (error) {
      console.error('Error deleting cabinet:', error)
      toast.dismiss()
      toast.error('Error deleting cabinet')
    }
  }

  useEffect(() => {
    fetchCabinets()
  }, [])

  const formatDate = dateString => {
    return new Date(dateString).toISOString().slice(0, 10)
  }

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const exportData = data.map(cabinet => ({
      ID: cabinet.id,
      'Model Name': cabinet.modelName,
      Material: cabinet.material,
      Height: cabinet.height,
      Width: cabinet.width,
      Depth: cabinet.depth,
      'Base Price': cabinet.basePrice,
      'Price Per Sqft': cabinet.pricePerSqft,
      Status: cabinet.status,
      Date: cabinet.createdAt ? formatDate(cabinet.createdAt) : 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cabinets')
    XLSX.writeFile(workbook, 'cabinets.xlsx')
  }

  if (loading) return <Loader />

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'modelName', headerName: 'Model Name', flex: 1.5 },
    { field: 'material', headerName: 'Material', flex: 1 },
    { field: 'height', headerName: 'Height', flex: 1 },
    { field: 'width', headerName: 'Width', flex: 1 },
    {
      field: 'basePrice',
      headerName: 'Base Price',
      flex: 1,
      renderCell: params => `$${params.value}`
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      renderCell: params => formatDate(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Box>
          <IconButton
            color='primary'
            onClick={() => {
              setViewData(params.row)
              setViewOpen(true)
            }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            color='secondary'
            onClick={() => {
              setEditData(params.row)
              setOpen(true)
            }}
          >
            <Edit />
          </IconButton>
          <IconButton
            color='error'
            onClick={() => {
              handleDelete(params.row.id)
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Paper p={8} sx={{ padding: 2 }}>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h5' fontWeight='bold'>
          Cabinet Table
        </Typography>
        <Box display='flex' gap={2}>
          <Button
            variant='outlined'
            color='success'
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setCsvModalOpen(true)
            }}
          >
            Upload CSV/XLSX
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* DataGrid Table */}
      <Paper>
        <DataGrid
          rows={data.map(cabinet => ({
            ...cabinet,
            id: cabinet.id
          }))}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Paper>

      <CabinetModal
        open={open}
        setOpen={setOpen}
        editData={editData}
        setEditData={setEditData}
        onSuccess={fetchCabinets}
      />
      <ViewCabinet open={viewOpen} setOpen={setViewOpen} data={viewData} />

      <CSVFileModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onSuccess={fetchCabinets}
      />
    </Paper>
  )
}

export default CabinetTable
