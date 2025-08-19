"use client"

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
  Badge
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
  ContactPhone as ContactIcon
} from '@mui/icons-material'

const AuditSection = () => {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAudits = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/audit/get`)
      setAudits(response.data.audits)
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

  // Helper functions
  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'success'
      case 'update': return 'warning'
      case 'delete': return 'error'
      case 'login': return 'info'
      default: return 'default'
    }
  }

  const getActionIcon = (action, tableName) => {
    switch (action) {
      case 'create': return <AddIcon />
      case 'update': return <EditIcon />
      case 'delete': return <DeleteIcon />
      case 'login': return <LoginIcon />
      default: return <PersonIcon />
    }
  }

  const getTableIcon = (tableName) => {
    switch (tableName) {
      case 'users': return <PersonIcon />
      case 'clients': return <BusinessIcon />
      case 'suppliers': return <BusinessIcon />
      case 'inventory': return <InventoryIcon />
      case 'cabinet': return <CabinetIcon />
      case 'roles': return <RoleIcon />
      case 'contacts': 
      case 'supplierContacts': return <ContactIcon />
      default: return <PersonIcon />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Group audits by different criteria
  const getAuditsByAction = () => {
    const grouped = {}
    audits.forEach(audit => {
      if (!grouped[audit.action]) {
        grouped[audit.action] = []
      }
      grouped[audit.action].push(audit)
    })
    return grouped
  }

  const getAuditsByTable = () => {
    const grouped = {}
    audits.forEach(audit => {
      if (!grouped[audit.tableName]) {
        grouped[audit.tableName] = []
      }
      grouped[audit.tableName].push(audit)
    })
    return grouped
  }

  const getRecentAudits = () => {
    return audits.slice(0, 10) // Show last 10 activities
  }

  const getAuditStats = () => {
    const stats = {
      total: audits.length,
      create: audits.filter(a => a.action === 'create').length,
      update: audits.filter(a => a.action === 'update').length,
      delete: audits.filter(a => a.action === 'delete').length,
      login: audits.filter(a => a.action === 'login').length
    }
    return stats
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        System Audit
      </Typography>

      {/* Stats Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2">Total Activities</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.create}</Typography>
              <Typography variant="body2">Created</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.update}</Typography>
              <Typography variant="body2">Updated</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.delete}</Typography>
              <Typography variant="body2">Deleted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.login}</Typography>
              <Typography variant="body2">Logins</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity Section */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
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
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography component="span" variant="body1">
                              {audit.User.name}
                            </Typography>
                            <Chip
                              label={audit.action.toUpperCase()}
                              color={getActionColor(audit.action)}
                              size="small"
                            />
                            <Typography component="span" variant="body2" color="text.secondary">
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
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity by Module
              </Typography>
              <List>
                {Object.entries(auditsByTable).map(([tableName, tableAudits]) => (
                  <ListItem key={tableName}>
                    <ListItemAvatar>
                      <Avatar>
                        {getTableIcon(tableName)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {tableName.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Badge badgeContent={tableAudits.length} color="primary" />
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
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Audit Log
              </Typography>
              
              {Object.entries(auditsByAction).map(([action, actionAudits]) => (
                <Accordion key={action} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={`${action.toUpperCase()} (${actionAudits.length})`}
                        color={getActionColor(action)}
                        icon={getActionIcon(action)}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Table</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Details</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {actionAudits.map((audit) => (
                            <TableRow key={audit.id} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ width: 24, height: 24 }}>
                                    <PersonIcon fontSize="small" />
                                  </Avatar>
                                  {audit.User.name}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={audit.tableName}
                                  variant="outlined"
                                  size="small"
                                  icon={getTableIcon(audit.tableName)}
                                />
                              </TableCell>
                              <TableCell>{formatDate(audit.createdAt)}</TableCell>
                              <TableCell>
                                <Tooltip title="View Details">
                                  <IconButton size="small">
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
    </Box>
  )
}

export default AuditSection