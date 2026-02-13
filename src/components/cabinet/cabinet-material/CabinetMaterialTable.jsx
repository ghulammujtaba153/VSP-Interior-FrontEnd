'use client'

import Loader from '@/components/loader/Loader'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PermissionWrapper from '@/components/PermissionWrapper'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TablePagination,
  TableSortLabel,
} from '@mui/material'
import { Add, Visibility, Edit, Delete, Search, FileDownload } from '@mui/icons-material'
import { useAuth } from '@/context/authContext'
import { toast } from 'react-toastify'
import CabinetMaterialModal from './CabinetMaterialModal'
import ViewCabinetMaterialModal from './ViewCabinetMaterialModal'
import ConfirmationDialog from '../../ConfirmationDialog'

const CabinetMaterialTable = () => {
  const [cabinetQuotes, setCabinetQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [orderBy, setOrderBy] = useState('id')
  const [order, setOrder] = useState('asc')
  const { user } = useAuth()

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [viewData, setViewData] = useState(null)

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  })

  const fetchCabinetQuotes = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${BASE_URL}/api/cabinet-quote/get?page=${page + 1}&limit=${limit}&search=${search}`
      )
      setCabinetQuotes(response.data.data || response.data || [])
      setTotalCount(response.data.pagination?.totalItems || response.data.length || 0)
    } catch (error) {
      console.error('Error fetching cabinet quotes:', error)
      toast.error('Failed to fetch cabinet materials')
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

  const handleView = (quote) => {
    setViewData(quote)
    setViewModalOpen(true)
  }

  const handleEdit = (quote) => {
    setEditData(quote)
    setModalOpen(true)
  }

  const handleDelete = (quote) => {
    showConfirmation({
      title: 'Delete Cabinet Material',
      message: `Are you sure you want to delete "${quote.title}"? This action cannot be undone.`,
      action: () => confirmDelete(quote.id),
      severity: 'error'
    })
  }

  const confirmDelete = async (id) => {
    try {
      toast.loading("Deleting cabinet material...")
      setLoading(true)
      await axios.delete(`${BASE_URL}/api/cabinet-quote/delete/${id}`)
      toast.success("Cabinet material deleted successfully")
      fetchCabinetQuotes()
    } catch (error) {
      toast.error("Error deleting cabinet material")
    } finally {
      setLoading(false)
      toast.dismiss()
    }
  }

  const handleAddNew = () => {
    setEditData(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditData(null)
  }

  const handleViewModalClose = () => {
    setViewModalOpen(false)
    setViewData(null)
  }

  const handleSuccess = () => {
    fetchCabinetQuotes()
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

  const handleResetSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  const handleExportExcel = () => {
    if (cabinetQuotes.length === 0) {
      toast.warning('No data to export')
      return
    }

    try {
      const exportData = cabinetQuotes.map((quote) => ({
        ID: quote.id,
        'Title': quote.title || 'N/A',
        'Description': quote.description || 'N/A',
        'Cabinets Count': quote.cabinetMaterials?.length || 0,
        'Created Date': quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A',
        'Associated Cabinets': quote.cabinetMaterials?.map(cm => cm.cabinet?.code).join(', ') || 'N/A',
        'Properties Summary': quote.cabinetMaterials?.map(cm => {
          const cabinet = cm.cabinet;
          if (cabinet.dynamicData && Object.keys(cabinet.dynamicData).length > 0) {
            const properties = Object.entries(cabinet.dynamicData)
              .map(([key, value]) => `${key}: ${value}`)
              .join('; ');
            return `${cabinet.code} (${properties})`;
          }
          return `${cabinet.code} (No properties)`;
        }).join(' | ') || 'N/A'
      }))

      // Create CSV content
      const headers = Object.keys(exportData[0]).join(',')
      const csvContent = [
        headers,
        ...exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `cabinet-materials-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Cabinet materials exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  useEffect(() => {
    fetchCabinetQuotes()
  }, [page, limit, search])

  if (loading) return <Loader />

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Cabinet Material Management
        </Typography>
        
        <Box display="flex" gap={2}>
          <PermissionWrapper resource="Cabinet" action="canView">
            <Button
              variant="outlined"
              color="success"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={cabinetQuotes.length === 0}
            >
              Export CSV
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper resource="Cabinet" action="canCreate">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddNew}
            >
              Add Material
            </Button>
          </PermissionWrapper>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box mb={3} display="flex" gap={2} alignItems="center">
        <TextField
          placeholder="Search by title or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="small"
          sx={{ width: '300px' }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            setPage(0)
            setSearch(searchInput)
          }}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleResetSearch}
        >
          Reset
        </Button>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  #
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Cabinets Count</TableCell>
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
            {cabinetQuotes.length > 0 ? (
              cabinetQuotes.map((quote, index) => (
                <TableRow 
                  key={quote.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    '&:hover': {
                      backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#f9fafb',
                    }
                  }}
                >
                  <TableCell>{(page * limit) + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {quote.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={quote.description || 'No description'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {quote.description || 'No description'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={quote.cabinetMaterials?.length || 0} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <PermissionWrapper resource="Cabinet" action="canView">
                        <Tooltip title="View Material">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleView(quote)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </PermissionWrapper>
                      <PermissionWrapper resource="Cabinet" action="canEdit">
                        <Tooltip title="Edit Material">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleEdit(quote)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </PermissionWrapper>
                      <PermissionWrapper resource="Cabinet" action="canDelete">
                        <Tooltip title="Delete Material">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(quote)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </PermissionWrapper>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No cabinet materials found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[25, 50, 75, 100, 150]}
        component="div"
        count={totalCount}
        rowsPerPage={limit}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Modals */}
      <CabinetMaterialModal
        open={modalOpen}
        onClose={handleModalClose}
        editData={editData}
        onSuccess={handleSuccess}
      />

      <ViewCabinetMaterialModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        data={viewData}
      />

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Paper>
  )
}

export default CabinetMaterialTable
