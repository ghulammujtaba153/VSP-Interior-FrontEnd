"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const ViewMaterial = ({ open, setOpen, data }) => {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const listCount = () => {
    if (!data.dynamicData) return 0;
    if (Array.isArray(data.dynamicData?.arrayList)) return data.dynamicData.arrayList.length;
    if (Array.isArray(data.dynamicData)) return data.dynamicData.length;
    return Object.keys(data.dynamicData).length;
  };

  const renderDynamicProperties = (dynamicData) => {
    const toArrayList = (data) => {
      if (!data) return []
      if (Array.isArray(data?.arrayList)) return data.arrayList
      if (Array.isArray(data)) return data.map(it => ({ label: it.columnName ?? it.label, value: it.value }))
      if (typeof data === 'object') return Object.entries(data).map(([label, value]) => ({ label, value }))
      return []
    }
    const list = toArrayList(dynamicData)
    if (!list || list.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          No additional properties defined
        </Typography>
      );
    }

    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 400 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Property Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((item, index) => (
                <TableRow 
                  key={index} 
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                    {item.label || item.columnName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.value || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      maxWidth="lg" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Cabinet Details - {data.code || 'N/A'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          ID: #{data.id}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowX: 'auto' }}>
        <Grid container spacing={4}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              p: 3,
              borderRadius: 2,
              mb: 1
            }}>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5 }}>
                  Cabinet Details
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {data.code || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ID: #{data.id}
                </Typography>
              </Box>
              <Chip 
                label={data.status || 'N/A'} 
                sx={{ 
                  bgcolor: data.status === 'active' ? 'success.main' : 'warning.main',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  px: 1
                }}
              />
            </Box>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 4 }} />
                General Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Description</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, color: 'text.primary', minHeight: '3em' }}>
                    {data.description || 'No description provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Category</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {data.cabinetCategory ? (
                      <Chip 
                        label={data.cabinetCategory.name} 
                        color="primary" 
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'medium', bgcolor: 'primary.50' }}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not assigned</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Subcategory</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {data.cabinetSubCategory ? (
                      <Chip 
                        label={data.cabinetSubCategory.name} 
                        color="secondary" 
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'medium', bgcolor: 'secondary.50' }}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not assigned</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.08)' }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 4 }} />
                System Audit
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Created</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                  {formatDate(data.createdAt)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  by {data.createdBy?.name || data.createdBy?.email || 'System'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Last Updated</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                  {formatDate(data.updatedAt)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  by {data.updatedBy?.name || data.updatedBy?.email || 'System'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Additional Properties Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 4 }} />
                Additional Properties
              </Typography>
              <Chip 
                label={`${listCount()} propert${listCount() === 1 ? 'y' : 'ies'}`}
                size="small"
                variant="outlined"
              />
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {renderDynamicProperties(data.dynamicData)}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setOpen(false)} 
          variant="outlined"
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewMaterial;