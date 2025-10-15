'use client'

import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Loader from '../loader/Loader'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  TextField,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel
} from '@mui/material'
import { Visibility, Edit, Delete, Add } from '@mui/icons-material'
import CabinetModal from './CabinetModal'
import ViewCabinet from './ViewCabinet'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/authContext'
import CSVFileModal from './CSVFileModal'
import ConfirmationDialog from '../ConfirmationDialog'

// ✅ Import XLSX
import * as XLSX from 'xlsx'

const CabinetTable = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)
  const { user } = useAuth()
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(100)
  const [orderBy, setOrderBy] = useState('id')
  const [order, setOrder] = useState('asc')

  const [searchInput, setSearchInput] = useState('') // typing state
  const [search, setSearch] = useState('') // applied state

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  })

  const fetchCabinets = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/api/cabinet/get?page=${page + 1}&limit=${limit}&search=${search}`
      )
      setData(res.data.cabinet || res.data.data || [])
      setRowCount(res.data.total || res.data.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching cabinets:', error)
      toast.error('Failed to fetch cabinets')
    } finally {
      setLoading(false)
    }
  }

  const showConfirmation = (config) => {
    setConfirmationConfig(config)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setConfirmationConfig({
      title: '',
      message: '',
      action: null,
      severity: 'warning'
    })
  }

  const handleDelete = (cabinetRow) => {
    showConfirmation({
      title: 'Delete Cabinet',
      message: `Are you sure you want to delete cabinet with code "${cabinetRow.code}"? This action cannot be undone and will remove all associated data.`,
      action: () => confirmDeleteCabinet(cabinetRow.id),
      severity: 'error'
    })
  }

  const confirmDeleteCabinet = async (id) => {
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
  }, [page, limit, search]) // ✅ only runs when Apply updates `search`

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // ✅ Export to Excel
  const handleExportExcel = () => {
    showConfirmation({
      title: 'Export Cabinets to Excel',
      message: `Are you sure you want to export ${data.length} cabinet records to Excel? This will download a file with all cabinet data including categories and dynamic properties.`,
      action: () => confirmExportExcel(),
      severity: 'info'
    })
  }

  const confirmExportExcel = () => {
    const exportData = data.map((cabinet) => ({
      ID: cabinet.id,
      'Code': cabinet.code,
      'Category': cabinet.cabinetCategory?.name || 'N/A',
      'Subcategory': cabinet.cabinetSubCategory?.name || 'N/A',
      'Description': cabinet.description || 'N/A',
      'Status': cabinet.status || 'N/A',
      'Created Date': cabinet.createdAt ? formatDate(cabinet.createdAt) : 'N/A',
      'Updated Date': cabinet.updatedAt ? formatDate(cabinet.updatedAt) : 'N/A',
      'Dynamic Properties': cabinet.dynamicData ? Object.entries(cabinet.dynamicData).map(([key, value]) => `${key}: ${value}`).join('; ') : 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cabinets')
    XLSX.writeFile(workbook, 'Cabinet VSP.xlsx')
    toast.success('Cabinet data exported successfully')
  }

  const handleResetSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  if (loading) return <Loader />

  return (
    <Paper p={8} sx={{ padding: 2 }}>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h5' fontWeight='bold'>
          Material Management
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
            variant='outlined'
            color='primary'
            onClick={() => {
              showConfirmation({
                title: 'Upload CSV/XLSX',
                message:
                  'Are you sure you want to upload cabinet data from CSV/XLSX? This will add new cabinet records to your database.',
                action: () => setCsvModalOpen(true),
                severity: 'info'
              })
            }}
          >
            Upload CSV/XLSX
          </Button>

          <Button
            variant='contained'
            color='primary'
            startIcon={<Add />}
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Search + Apply */}
      <Box display="flex" gap={1}>
          <TextField
            label="Search by code, description"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ width: '300px' }}
            placeholder="Search..."
          />
          <Button
            variant="contained"
            onClick={() => {
              setPage(0) // reset to first page
              setSearch(searchInput) // ✅ apply search
            }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetSearch}
          >
            Reset
          </Button>
        </Box>

      {/* Custom Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="cabinet table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'code'}
                    direction={orderBy === 'code' ? order : 'asc'}
                    onClick={() => handleSort('code')}
                  >
                    Code
                  </TableSortLabel>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Properties</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((cabinet, index) => (
                <TableRow
                  key={cabinet.id}
                  
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    '&:hover': {
                      backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#f9fafb',
                    }
                  }}
                >
                  <TableCell>{cabinet.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {cabinet.code || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {cabinet.cabinetCategory ? (
                      <Chip 
                        label={cabinet.cabinetCategory.name} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {cabinet.cabinetSubCategory ? (
                      <Chip 
                        label={cabinet.cabinetSubCategory.name} 
                        color="secondary" 
                        variant="outlined" 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={cabinet.description || 'No description'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {cabinet.description || 'No description'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={cabinet.status || 'N/A'} 
                      color={cabinet.status === 'active' ? 'success' : 'default'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {cabinet.dynamicData && Object.keys(cabinet.dynamicData).length > 0 ? (
                      <Tooltip title={Object.entries(cabinet.dynamicData).map(([key, value]) => `${key}: ${value}`).join(', ')}>
                        <Chip 
                          label={`${Object.keys(cabinet.dynamicData).length} property${Object.keys(cabinet.dynamicData).length !== 1 ? 'ies' : 'y'}`}
                          color="info" 
                          variant="outlined" 
                          size="small"
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No properties</Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(cabinet.createdAt)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View Cabinet">
                        <IconButton
                          color='primary'
                          size="small"
                          onClick={() => {
                            setViewData(cabinet)
                            setViewOpen(true)
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Cabinet">
                        <IconButton
                          color='secondary'
                          size="small"
                          onClick={() => {
                            setEditData(cabinet)
                            setOpen(true)
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Cabinet">
                        <IconButton
                          color='error'
                          size="small"
                          onClick={() => handleDelete(cabinet)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100, 150]}
          component="div"
          count={rowCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
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

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={
          confirmationConfig.severity === 'error' ? 'Delete' : 'Confirm'
        }
        cancelText='Cancel'
      />
    </Paper>
  )
}

export default CabinetTable
