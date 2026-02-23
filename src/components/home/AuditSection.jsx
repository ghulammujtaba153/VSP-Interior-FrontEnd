'use client'

import { BASE_URL } from '@/configs/url'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Badge,
  TextField,
  Button,
  Stack
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Kitchen as CabinetIcon,
  SupervisorAccount as RoleIcon,
  ContactPhone as ContactIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import Loader from '../loader/Loader'
import { useAuth } from '@/context/authContext'

const AuditSection = () => {
  const [audits, setAudits] = useState([])
  const [filteredAudits, setFilteredAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const { token} = useAuth()

  const fetchAudits = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/audit/get`, {
        headers: {
          Authorization: `Bearer ${token}`,  
        }
      })
      setAudits(response.data.audits)
      setFilteredAudits(response.data.audits)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setError('Failed to fetch audit data')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudits()
  }, [])

  // Filter audits by date range
  const filterAuditsByDate = () => {
    if (!fromDate && !toDate) {
      setFilteredAudits(audits)
      return
    }

    const filtered = audits.filter(audit => {
      const auditDate = new Date(audit.createdAt)
      const from = fromDate ? new Date(fromDate) : null
      const to = toDate ? new Date(toDate) : null

      // Set time to start/end of day for proper comparison
      if (from) from.setHours(0, 0, 0, 0)
      if (to) to.setHours(23, 59, 59, 999)

      if (from && to) {
        return auditDate >= from && auditDate <= to
      } else if (from) {
        return auditDate >= from
      } else if (to) {
        return auditDate <= to
      }
      return true
    })

    setFilteredAudits(filtered)
  }

  // Clear filters
  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setFilteredAudits(audits)
  }

  // Apply filters when dates change
  useEffect(() => {
    filterAuditsByDate()
  }, [fromDate, toDate, audits])

  // Helper functions
  const getActionColor = action => {
    switch (action) {
      case 'create':
        return 'success'
      case 'update':
        return 'warning'
      case 'delete':
        return 'error'
      case 'login':
        return 'info'
      default:
        return 'default'
    }
  }

  const getActionIcon = (action, tableName) => {
    switch (action) {
      case 'create':
        return <AddIcon />
      case 'update':
        return <EditIcon />
      case 'delete':
        return <DeleteIcon />
      case 'login':
        return <LoginIcon />
      default:
        return <PersonIcon />
    }
  }

  const getTableIcon = tableName => {
    switch (tableName) {
      case 'users':
        return <PersonIcon />
      case 'clients':
        return <BusinessIcon />
      case 'suppliers':
        return <BusinessIcon />
      case 'inventory':
        return <InventoryIcon />
      case 'cabinet':
        return <CabinetIcon />
      case 'roles':
        return <RoleIcon />
      case 'contacts':
      case 'supplierContacts':
        return <ContactIcon />
      default:
        return <PersonIcon />
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleString()
  }

  // Group audits by different criteria (using filtered audits)
  const getAuditsByAction = () => {
    const grouped = {}
    filteredAudits.forEach(audit => {
      if (!grouped[audit.action]) {
        grouped[audit.action] = []
      }
      grouped[audit.action].push(audit)
    })
    return grouped
  }

  const getAuditsByTable = () => {
    const grouped = {}
    filteredAudits.forEach(audit => {
      if (!grouped[audit.tableName]) {
        grouped[audit.tableName] = []
      }
      grouped[audit.tableName].push(audit)
    })
    return grouped
  }

  const getRecentAudits = () => {
    return filteredAudits.slice(0, 10) // Show last 10 activities
  }

  const getAuditStats = () => {
    const stats = {
      total: filteredAudits.length,
      create: filteredAudits.filter(a => a.action === 'create').length,
      update: filteredAudits.filter(a => a.action === 'update').length,
      delete: filteredAudits.filter(a => a.action === 'delete').length,
      login: filteredAudits.filter(a => a.action === 'login').length
    }
    return stats
  }

  if (loading) {
    return (
      <Loader/>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  const auditsByAction = getAuditsByAction()
  const auditsByTable = getAuditsByTable()
  const recentAudits = getRecentAudits()
  const stats = getAuditStats()

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant='h4' component='h1' gutterBottom sx={{ mb: 4 }}>
        System Audit
      </Typography>

      {/* Date Filter Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filter by Date Range
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
            <TextField
              type='date'
              label='From Date'
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
            />
            <TextField
              type='date'
              label='To Date'
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
            />
            <Button
              variant='outlined'
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              disabled={!fromDate && !toDate}
              size='small'
            >
              Clear Filters
            </Button>
            <Typography variant='body3' color='text.secondary'>
              {filteredAudits.length !== audits.length &&
                `Showing ${filteredAudits.length} of ${audits.length} records`}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { value: stats.total, label: 'Total Activities', color: 'primary' },
          { value: stats.create, label: 'Created', color: 'success' },
          { value: stats.update, label: 'Updated', color: 'warning' },
          { value: stats.delete, label: 'Deleted', color: 'error' },
          { value: stats.login, label: 'Logins', color: 'info' }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index} sx={{ flexGrow: 1 }}>
            <Card sx={{ textAlign: 'center', bgcolor: `${item.color}.main`, color: 'white' }}>
              <CardContent>
                <Typography variant='h4'>{item.value}</Typography>
                <Typography variant='body2'>{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity Section */}
        <Grid item xs={12} lg={6} sx={{ width: "100%" }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentAudits.map((audit, index) => (
                  <React.Fragment key={audit.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getActionColor(audit.action)}.main` }}>
                          {getActionIcon(audit.action)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display='flex' alignItems='center' gap={1}>
                            <Typography component='span' variant='body1'>
                              {audit.User.name}
                            </Typography>
                            <Chip
                              label={audit.action.toUpperCase()}
                              color={getActionColor(audit.action)}
                              size='small'
                            />
                            <Typography component='span' variant='body1' color='text.secondary'>
                              in {audit.tableName}
                            </Typography>
                          </Box>
                        }
                        secondary={formatDate(audit.createdAt)}
                      />
                    </ListItem>
                    {index < recentAudits.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity by Table Section */}
        <Grid item xs={12} lg={6} sx={{ width: "100%" }}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Activity by Module
              </Typography>
              <List>
                {Object.entries(auditsByTable).map(([tableName, tableAudits]) => (
                  <ListItem key={tableName}>
                    <ListItemAvatar>
                      <Avatar>{getTableIcon(tableName)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display='flex' alignItems='center' justifyContent='space-between'>
                          <Typography variant='body1' sx={{ textTransform: 'capitalize' }}>
                            {tableName.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Badge badgeContent={tableAudits.length} color='primary' />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Audit Log Section */}
        <Grid container bgcolor={'red.50'} spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} sx={{ width: "100%" }}>
            <Card  >
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Detailed Audit Log
                </Typography>

                {Object.entries(auditsByAction).map(([action, actionAudits]) => (
                  <Accordion key={action} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display='flex' alignItems='center' gap={2}>
                        <Chip
                          label={`${action.toUpperCase()} (${actionAudits.length})`}
                          color={getActionColor(action)}
                          icon={getActionIcon(action)}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant='outlined'>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Table</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Details</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {actionAudits.map(audit => (
                              <TableRow key={audit.id} hover>
                                <TableCell>
                                  <Box display='flex' alignItems='center' gap={1}>
                                    <Avatar sx={{ width: 24, height: 24 }}>
                                      <PersonIcon fontSize='small' />
                                    </Avatar>
                                    {audit.User.name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={audit.tableName}
                                    variant='outlined'
                                    size='small'
                                    icon={getTableIcon(audit.tableName)}
                                  />
                                </TableCell>
                                <TableCell>{formatDate(audit.createdAt)}</TableCell>
                                <TableCell>
                                  <Tooltip title='View Details'>
                                    <IconButton size='small'>
                                      <ExpandMoreIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AuditSection
