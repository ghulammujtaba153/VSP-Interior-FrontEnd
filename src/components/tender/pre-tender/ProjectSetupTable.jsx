'use client'

import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Loader from '@/components/loader/Loader'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  TextField,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import { Edit, Delete, Add, Assignment } from '@mui/icons-material'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GenerateTenderTemplate } from '@/utils/GenerateTenderTemplate'

const ProjectSetupTable = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [rowCount, setRowCount] = useState(0)

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [orderBy, setOrderBy] = useState('id')
  const [order, setOrder] = useState('asc')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const router = useRouter()

  // confirmation modal states
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/api/project-setup/get?page=${page + 1}&limit=${limit}&search=${search}`
      )
      setData(res.data.data || [])
      setRowCount(res.data.pagination?.totalRecords || 0)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = project => {
    setDeleteTarget(project)
    setConfirmationOpen(true)
  }

  const confirmDeleteProject = async () => {
    if (!deleteTarget) return
    toast.loading('Deleting project...')
    try {
      await axios.delete(`${BASE_URL}/api/project-setup/delete/${deleteTarget.id}`)
      fetchProjects()
      toast.dismiss()
      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.dismiss()
      toast.error('Error deleting project')
    } finally {
      setConfirmationOpen(false)
      setDeleteTarget(null)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [page, limit, search])

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // ✅ Export to Excel — replaced QS fields with Estimator and Project Date
  const handleExportExcel = () => {
    const exportData = data.map(p => ({
      ID: p.id,
      'Project Name': p.projectName,
      'Site Location': p.siteLocation,
      Estimator: p.estimator || 'N/A',
      'Project Date': formatDate(p.projectDate),
      Revision:
        p.revision === 0
          ? 'Awaiting Super Admin Approval'
          : p.revision === 1
          ? 'Ready for Quotation'
          : p.revision,
      Client: p.client?.companyName || 'N/A',
      'Created Date': formatDate(p.createdAt),
      'Updated Date': formatDate(p.updatedAt)
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects')
    XLSX.writeFile(workbook, 'Projects.xlsx')
    toast.success('Project data exported successfully')
  }

  const handleResetSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSort = property => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleTenderTemplate = async (projectId) => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }
    await GenerateTenderTemplate(projectId);
  }


  
  if (loading) return <Loader />

  return (
    <Paper sx={{ padding: 3, backgroundImage: "none", borderRadius: 2 }}>
      <Link href='/quotes'>
        <Button variant='outlined' color='primary' sx={{ mb: 3 }}>
          Back to Quotes
        </Button>
      </Link>

      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box>
          <Typography variant='h4' fontWeight='700' color='primary' sx={{ mb: 0.5 }}>
            Project Setup Management
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage and monitor all your interior design projects
          </Typography>
        </Box>

        <Box display='flex' gap={2}>
          <Button 
            variant='outlined' 
            color='success' 
            onClick={handleExportExcel}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Export Excel
          </Button>

          <Link href='/project/form'>
            <Button 
              variant='contained' 
              color='primary' 
              startIcon={<Add />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Add Project
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Search */}
      <Box 
        display='flex' 
        gap={2} 
        mb={4} 
        component={Paper} 
        variant="outlined" 
        sx={{ p: 2, backgroundImage: 'none', borderStyle: 'dashed' }}
      >
        <TextField
          label='Search Projects'
          size='medium'
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          sx={{ width: '400px' }}
          placeholder='Search by name, site, or description...'
        />
        <Button
          variant='contained'
          size="large"
          sx={{ px: 4 }}
          onClick={() => {
            setPage(0)
            setSearch(searchInput)
          }}
        >
          Apply Filter
        </Button>
        <Button variant='outlined' color='secondary' size="large" onClick={handleResetSearch}>
          Reset
        </Button>
      </Box>

      {/* Table */}
      <TableContainer sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
        <Table sx={{ minWidth: 800 }} aria-label='project table'>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 250, fontWeight: 'bold' }}>Project Name</TableCell>
              <TableCell sx={{ minWidth: 250, fontWeight: 'bold' }}>Site Location</TableCell>
              <TableCell sx={{ minWidth: 200, fontWeight: 'bold' }}>Estimator</TableCell>
              <TableCell sx={{ minWidth: 180, fontWeight: 'bold' }}>Project Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Revision</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
              <TableCell sx={{ minWidth: 280, fontWeight: 'bold', textAlign: 'center' }}>Manage</TableCell>
              <TableCell sx={{ minWidth: 220, fontWeight: 'bold', textAlign: 'center' }}>Outputs</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(project => (
              <TableRow
                key={project.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell sx={{ py: 2.5 }}>{project.id}</TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight='700'>
                    {project.projectName}
                  </Typography>
                </TableCell>
                <TableCell>{project.siteLocation}</TableCell>
                <TableCell>{project.estimator || 'N/A'}</TableCell>
                <TableCell>{formatDate(project.projectDate)}</TableCell>
                <TableCell>
                  {project.client ? (
                    <Chip
                      label={project.client.companyName}
                      color='primary'
                      variant='outlined'
                      size='medium'
                      sx={{ fontWeight: 600 }}
                    />
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {project.revision === 0 ? (
                    <Chip
                      label='Awaiting Approval'
                      color='warning'
                      size='small'
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ) : project.revision === 1 ? (
                    <Chip
                      label='Ready'
                      color='success'
                      size='small'
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ) : (
                    <Chip label={project.revision} color='secondary' size='small' />
                  )}
                </TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title='Create Amendment'>
                      <IconButton
                        color='primary'
                        variant="contained"
                        sx={{ 
                          backgroundColor: 'primary.lighterOpacity',
                          '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                        }}
                        onClick={() =>
                          router.push(`/project/form?id=${project.id}&mode=edit&amend=true`)
                        }
                      >
                        <Assignment fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Link href={`/project/history?id=${project.id}`}>
                      <Button
                        variant='contained'
                        size='small'
                        sx={{ borderRadius: 1.5 }}
                      >
                        History
                      </Button>
                    </Link>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Button 
                    variant='outlined' 
                    color='info' 
                    size='small' 
                    fullWidth
                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    onClick={() => handleTenderTemplate(project.id)}
                  >
                    Tender Template
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Box display='flex' gap={1} justifyContent="flex-end">
                    <Tooltip title='Edit Project'>
                      <IconButton
                        color='secondary'
                        sx={{ 
                          backgroundColor: 'secondary.lighterOpacity',
                          '&:hover': { backgroundColor: 'secondary.main', color: 'white' }
                        }}
                        onClick={() =>
                          router.push(`/project/form?id=${project.id}&mode=edit`)
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete Project'>
                      <IconButton
                        color='error'
                        sx={{ 
                          backgroundColor: 'error.lighterOpacity',
                          '&:hover': { backgroundColor: 'error.main', color: 'white' }
                        }}
                        onClick={() => handleDelete(project)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align='center' sx={{ py: 10 }}>
                  <Typography variant="h6" color="text.secondary">No records found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component='div'
        count={rowCount}
        rowsPerPage={limit}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ 
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          mt: 2
        }}
      />

      {/* Delete Confirmation */}
      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete project "
            <strong>{deleteTarget?.projectName}</strong>"? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteProject} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default ProjectSetupTable