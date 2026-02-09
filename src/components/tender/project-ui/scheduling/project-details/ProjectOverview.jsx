"use client"

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Note as NoteIcon,
  CheckCircle as StatusIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ProjectOverview = ({ data }) => {
  const project = data.projectSetup || {};
  const client = project.client || {};
  const rates = project.rates || [];
  const materials = project.materials || [];
  const variations = project.variations || [];
  const amends = project.amends || [];
  const workers = data.workers || [];

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'in progress':
        return 'success';
      case 'pending':
      case 'upcoming':
        return 'warning';
      case 'cancelled':
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Project Details Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Project Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete project information and specifications
                </Typography>
              </Box>
            </Box>
            
          </Box>

          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BusinessIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Project Name
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {project.projectName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <LocationIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Site Location
                    </Typography>
                    <Typography variant="body1">
                      {project.siteLocation || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <StatusIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Project Status
                    </Typography>
                    <Chip 
                      label={project.status || 'N/A'} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <WorkIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Revision
                    </Typography>
                    <Typography variant="body1">
                      {project.revision || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
          </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <CalendarIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(data.startDate)}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <CalendarIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(data.endDate)}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      QS Name
                    </Typography>
                    <Typography variant="body1">
                      {project.qsName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <PhoneIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      QS Phone
                    </Typography>
                    <Typography variant="body1">
                      {project.qsPhone || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          
        </CardContent>
      </Card>

      {/* Client Information Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="secondary">
                  Client Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Client contact details and account information
                </Typography>
              </Box>
            </Box>
            
          </Box>

          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BusinessIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Company Name
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {client.companyName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <EmailIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {client.emailAddress || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <PhoneIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {client.phoneNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
          </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <HomeIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {client.address || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <LocationIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Post Code
                    </Typography>
                    <Typography variant="body1">
                      {client.postCode || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <StatusIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Account Status
                    </Typography>
                    <Chip 
                      label={client.accountStatus || 'N/A'} 
                      color={getStatusColor(client.accountStatus)}
                      size="small"
                    />
                  </Box>
                </Box>
              </Stack>
          </Grid>
        </Grid>
        </CardContent>
      </Card>

      {/* Assigned Workers Card */}
      {workers.length > 0 && (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="success">
                    Assigned Workers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team members assigned to this project
                  </Typography>
                </Box>
              </Box>
              
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Worker</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hours Assigned</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {worker.name?.charAt(0) || 'W'}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {worker.name || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {worker.email || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {worker.phone || 'No phone'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={worker.jobTitle || 'N/A'} 
                          color="primary" 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {worker.ProjectSetupJobWorker?.hoursAssigned ?? 'N/A'} hrs
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={worker.status || 'Active'} 
                          color={getStatusColor(worker.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

        {/* Rates Table */}
        {/* {rates.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Rates</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Markup</TableCell>
                    <TableCell>Sell</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.type}</TableCell>
                      <TableCell>{rate.cost}</TableCell>
                      <TableCell>{rate.markup}</TableCell>
                      <TableCell>{rate.sell}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )} */}

        {/* Materials Table */}
        {/* {materials.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Materials</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Finish Material</TableCell>
                    <TableCell>Material Type</TableCell>
                    <TableCell>Measure</TableCell>
                    <TableCell>Material Cost</TableCell>
                    <TableCell>Edging Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell>{mat.finishMaterial}</TableCell>
                      <TableCell>{mat.materialType}</TableCell>
                      <TableCell>{mat.measure}</TableCell>
                      <TableCell>{mat.materialCost}</TableCell>
                      <TableCell>{mat.edgingCost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )} */}

        {/* Variations */}
        {/* {variations.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Variations</Typography>
            <Typography>{JSON.stringify(variations, null, 2)}</Typography>
          </>
        )} */}

      {/* Project Amendments */}
      {amends.length > 0 && (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              
              <Box>
                <Typography variant="h5" fontWeight="bold" color="warning">
                  Project Amendments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Changes and modifications to the project
                </Typography>
              </Box>
            </Box>
            
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {JSON.stringify(amends, null, 2)}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProjectOverview;
