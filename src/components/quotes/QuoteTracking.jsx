'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Avatar,
  TextField,
  TablePagination,
  InputAdornment
} from '@mui/material'

import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MailIcon from '@mui/icons-material/Mail'
import DescriptionIcon from '@mui/icons-material/Description'
import SearchIcon from '@mui/icons-material/Search'
import Loader from '../loader/Loader'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'

const getStatusColor = status => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
      return 'error'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'info'
    case 'cancelled':
      return 'error'
    case 'revised':
      return 'warning'
    case 'draft':
    default:
      return 'default'
  }
}

const getStatusIcon = status => {
  switch (status) {
    case 'pending':
      return <AccessTimeIcon fontSize='small' />
    case 'approved':
      return <CheckCircleIcon fontSize='small' />
    case 'rejected':
      return <CancelIcon fontSize='small' />
    case 'completed':
      return <CheckCircleIcon fontSize='small' />
    case 'cancelled':
      return <CancelIcon fontSize='small' />
    case 'revised':
      return <DescriptionIcon fontSize='small' />
    case 'draft':
    default:
      return <DescriptionIcon fontSize='small' />
  }
}

export const QuoteTracking = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [clients, setClients] = useState([])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(clientFilter !== 'all' && { clientId: clientFilter })
      })

      const res = await axios.get(`${BASE_URL}/api/project-setup/get?${params}`)
      setData(res.data.data || [])
      setTotalRecords(res.data.pagination?.totalRecords || 0)
      
      // Extract unique clients for filter
      if (res.data.data) {
        const uniqueClients = res.data.data
          .filter(project => project.client)
          .reduce((acc, project) => {
            if (!acc.find(client => client.id === project.client.id)) {
              acc.push(project.client)
            }
            return acc
          }, [])
        setClients(uniqueClients)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [page, rowsPerPage, search, statusFilter, clientFilter])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/project-setup/update/status/${id}`, { status: newStatus })
      fetchProjects()
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value)
    setPage(0)
  }

  const handleClientFilterChange = (event) => {
    setClientFilter(event.target.value)
    setPage(0)
  }

  const calculateTotalValue = (project) => {
    if (!project.rates || project.rates.length === 0) return 0
    return project.rates.reduce((total, rate) => total + (rate.sell || 0), 0)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setClientFilter('all')
    setPage(0)
  }

  if (loading) return <Loader />

  return (
    <Box sx={{ p: 2 }}>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant='subtitle2'>Total Projects</Typography>}
              action={<VisibilityIcon color='primary' />}
            />
            <CardContent>
              <Typography variant='h5'>{totalRecords}</Typography>
              <Typography variant='caption' color='text.secondary'>
                All project quotes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant='subtitle2'>Draft Quotes</Typography>}
              action={<DescriptionIcon color='info' />}
            />
            <CardContent>
              <Typography variant='h5'>
                {data.filter(item => item.status === 'draft').length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Quotes in draft stage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant='subtitle2'>Pending Review</Typography>}
              action={<AccessTimeIcon color='warning' />}
            />
            <CardContent>
              <Typography variant='h5'>
                {data.filter(item => item.status === 'pending').length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant='subtitle2'>Approved</Typography>}
              action={<CheckCircleIcon color='success' />}
            />
            <CardContent>
              <Typography variant='h5'>
                {data.filter(item => item.status === 'approved').length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Approved quotes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filters" />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search projects..."
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="revised">Revised</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Client</InputLabel>
                <Select
                  value={clientFilter}
                  label="Client"
                  onChange={handleClientFilterChange}
                >
                  <MenuItem value="all">All Clients</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Project Quotes Table */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">Project Quotes</Typography>}
        />

        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Quote Value</TableCell>
                  <TableCell>Rates Count</TableCell>
                  <TableCell>Materials Count</TableCell>
                  <TableCell>Revision</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.client?.companyName || "-"}</TableCell>
                      <TableCell>{item.projectName}</TableCell>
                      <TableCell>{item.siteLocation}</TableCell>
                      <TableCell>${calculateTotalValue(item).toLocaleString()}</TableCell>
                      <TableCell>{item.rates?.length || 0}</TableCell>
                      <TableCell>{item.materials?.length || 0}</TableCell>
                      <TableCell>{item.revision}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={
                            item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)
                          }
                          color={getStatusColor(item.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexDirection="column">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MailIcon />}
                            onClick={() => handleStatusUpdate(item.id, 'pending')}
                            disabled={item.status === 'pending' || item.status === 'approved'}
                          >
                            Send
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleStatusUpdate(item.id, 'approved')}
                            disabled={item.status === 'approved'}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusUpdate(item.id, 'rejected')}
                            disabled={item.status === 'rejected'}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          />
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title={<Typography variant='h6'>Recent Activity</Typography>} />
        <CardContent>
          <Box display='flex' flexDirection='column' gap={2}>
            <Box display='flex' alignItems='flex-start' gap={2} pb={2} borderBottom='1px solid #eee'>
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                <CheckCircleIcon fontSize='small' />
              </Avatar>
              <Box>
                <Typography fontWeight='500'>Projects Loaded</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Successfully loaded {data.length} projects with pagination
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Just now
                </Typography>
              </Box>
            </Box>

            <Box display='flex' alignItems='flex-start' gap={2} pb={2} borderBottom='1px solid #eee'>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <VisibilityIcon fontSize='small' />
              </Avatar>
              <Box>
                <Typography fontWeight='500'>Filters Applied</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {statusFilter !== 'all' && `Status: ${statusFilter} `}
                  {clientFilter !== 'all' && `Client: ${clients.find(c => c.id == clientFilter)?.companyName} `}
                  {search && `Search: "${search}"`}
                  {statusFilter === 'all' && clientFilter === 'all' && !search && 'No filters applied'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Just now
                </Typography>
              </Box>
            </Box>

            <Box display='flex' alignItems='flex-start' gap={2}>
              <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                <DescriptionIcon fontSize='small' />
              </Avatar>
              <Box>
                <Typography fontWeight='500'>Pagination Active</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Showing {data.length} of {totalRecords} records (Page {page + 1})
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Just now
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}