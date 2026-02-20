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
    <Paper sx={{ padding: 2 }}>
      <Link href='/quotes'>
        <Button variant='contained' color='primary'>
          back
        </Button>
      </Link>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h5' fontWeight='bold'>
          Project Setup Management
        </Typography>

        <Box display='flex' gap={2}>
          <Button variant='outlined' color='success' onClick={handleExportExcel}>
            Export Excel
          </Button>

          <Link href='/project/form'>
            <Button variant='contained' color='primary' startIcon={<Add />}>
              Add Project
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Search */}
      <Box display='flex' gap={1} mb={2}>
        <TextField
          label='Search by name/description'
          size='small'
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          sx={{ width: '300px' }}
          placeholder='Search...'
        />
        <Button
          variant='contained'
          onClick={() => {
            setPage(0)
            setSearch(searchInput)
          }}
        >
          Apply
        </Button>
        <Button variant='outlined' color='secondary' onClick={handleResetSearch}>
          Reset
        </Button>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label='project table'>
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
              <TableCell sx={{minWidth: 250}}>Project Name</TableCell>
              <TableCell sx={{minWidth: 250}}>Site Location</TableCell>
              <TableCell sx={{minWidth: 200}}>Estimator</TableCell>
              <TableCell sx={{minWidth: 180}}>Project Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Revision</TableCell>
              <TableCell>Created At</TableCell>

              <TableCell sx={{minWidth: 250}}>Amendment</TableCell>
              <TableCell sx={{minWidth: 250}}>Tender Template</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(project => (
              <TableRow
                key={project.id}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                hover
              >
                <TableCell>{project.id}</TableCell>
                <TableCell>
                  <Typography variant='body3' fontWeight='medium'>
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
                      size='small'
                    />
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {project.revision === 0 ? (
                    <Chip
                      label='Awaiting Super Admin Approval'
                      color='warning'
                      size='small'
                    />
                  ) : project.revision === 1 ? (
                    <Chip
                      label='Ready for Quotation'
                      color='success'
                      size='small'
                    />
                  ) : (
                    <Chip label={project.revision} color='secondary' size='small' />
                  )}
                </TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell>
                  <Tooltip title='Create Amendment'>
                    <IconButton
                      color='primary'
                      size='small'
                      onClick={() =>
                        router.push(`/project/form?id=${project.id}&mode=edit&amend=true`)
                      }
                    >
                      <Assignment />
                    </IconButton>
                  </Tooltip>

                  <Link href={`/project/history?id=${project.id}`}>
                  <Button
                    variant='contained'
                    >
                      View History
                    </Button>
                    </Link>

                  


                </TableCell>
                <TableCell>
                  <Button variant='contained' color='primary' onClick={() => handleTenderTemplate(project.id)}>
                    Generate Tender Template
                  </Button>
                </TableCell>
                <TableCell>
                  <Box display='flex' gap={0.5}>
                    <Tooltip title='Edit Project'>
                      <IconButton
                        color='secondary'
                        size='small'
                        onClick={() =>
                          router.push(`/project/form?id=${project.id}&mode=edit`)
                        }
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete Project'>
                      <IconButton
                        color='error'
                        size='small'
                        onClick={() => handleDelete(project)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align='center'>
                  No records found
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