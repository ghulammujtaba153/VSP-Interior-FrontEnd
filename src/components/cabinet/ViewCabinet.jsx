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

const ViewCabinet = ({ open, setOpen, data }) => {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Property Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((item, index) => (
                <TableRow 
                  key={index} 
                  sx={{ 
                    backgroundColor: index % 2 === 0 ? 'white' : 'grey.50',
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
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Cabinet Code</Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.code || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
            <Chip 
              label={data.status || 'N/A'} 
              color={data.status === 'active' ? 'success' : 'default'} 
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {data.description || 'No description provided'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              Category Information
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
            {data.cabinetCategory ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={data.cabinetCategory.name} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
                <Typography variant="body2" color="textSecondary">
                  (ID: {data.cabinetCategoryId})
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">Not assigned</Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Subcategory</Typography>
            {data.cabinetSubCategory ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={data.cabinetSubCategory.name} 
                  color="secondary" 
                  variant="outlined"
                  size="small"
                />
                <Typography variant="body2" color="textSecondary">
                  (ID: {data.cabinetSubCategoryId})
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">Not assigned</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="primary" gutterBottom>
                Additional Properties
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {(() => {
                  const count = Array.isArray(data.dynamicData?.arrayList)
                    ? data.dynamicData.arrayList.length
                    : Array.isArray(data.dynamicData)
                      ? data.dynamicData.length
                      : Object.keys(data.dynamicData || {}).length;
                  return `${count} propert${count === 1 ? 'y' : 'ies'}`;
                })()}
              </Typography>
            </Box>
            <Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
              {renderDynamicProperties(data.dynamicData)}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              System Information
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
            <Typography variant="body2" fontFamily="monospace">
              {formatDate(data.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
            <Typography variant="body2" fontFamily="monospace">
              {formatDate(data.updatedAt)}
            </Typography>
          </Grid>

          {data.createdBy && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Created By</Typography>
              <Typography variant="body2">
                {data.createdBy.name || data.createdBy.email || 'N/A'}
              </Typography>
            </Grid>
          )}

          {data.updatedBy && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Updated By</Typography>
              <Typography variant="body2">
                {data.updatedBy.name || data.updatedBy.email || 'N/A'}
              </Typography>
            </Grid>
          )}
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

export default ViewCabinet;