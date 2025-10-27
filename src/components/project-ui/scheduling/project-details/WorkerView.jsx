"use client"

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Grid,
  IconButton,
  Divider,
  Stack
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'

const WorkerView = ({ projectId, data }) => {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  console.log("worker view data", data?.workers)

  const workerData = data?.workers || []

  // Function to get avatar color based on job title
  const getAvatarColor = (jobTitle) => {
    const colors = {
      'Manager': '#1976d2',
      'Worker': '#2e7d32',
      'Electrician': '#ed6c02',
      'Supervisor': '#9c27b0',
      'Technician': '#0288d1',
      'default': '#757575'
    }
    return colors[jobTitle] || colors.default
  }

  // Function to get status color
  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error'
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        👥 Project Team
      </Typography>

      {/* Summary Stats */}
      {workerData.length > 0 && (
        <Box 
          sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'grey.50', 
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
              {workerData.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Workers
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {workerData.filter(w => w.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Workers
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 600 }}>
              {workerData.reduce((total, worker) => total + (worker.ProjectSetupJobWorker?.hoursAssigned || 0), 0)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours Assigned
            </Typography>
          </Box>
        </Box>
      )}
      

      {workerData.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            bgcolor: 'grey.50', 
            borderRadius: 2 
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No workers assigned to this project
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add workers to see them listed here
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {workerData.map((worker) => (
            <Grid item xs={12} md={6} lg={4} key={worker.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header with Avatar and Basic Info */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: getAvatarColor(worker.jobTitle),
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        mr: 2
                      }}
                    >
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {worker.name}
                      </Typography>
                      <Chip
                        label={worker.jobTitle}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          label={worker.status}
                          size="small"
                          color={getStatusColor(worker.status)}
                          variant="filled"
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Contact Information */}
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {worker.email}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {worker.phone}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
                      <Typography variant="body2" color="text.secondary">
                        {worker.address}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Work Details */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TimeIcon color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {worker.weeklyHours}h
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weekly Hours
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <MoneyIcon color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {formatCurrency(worker.hourlyRate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hourly Rate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Project Specific Assignment */}
                  {worker.ProjectSetupJobWorker && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText',
                          p: 1.5,
                          borderRadius: 1,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Project Assignment
                        </Typography>
                        <Typography variant="body2">
                          {worker.ProjectSetupJobWorker.hoursAssigned} hours assigned
                        </Typography>
                      </Box>
                    </>
                  )}

                  {/* Footer with Join Date */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Joined: {new Date(worker.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      
    </Box>
  )
}

export default WorkerView