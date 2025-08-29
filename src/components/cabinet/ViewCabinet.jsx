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
} from "@mui/material";

const ViewCabinet = ({ open, setOpen, data }) => {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const renderDynamicProperties = (dynamicData) => {
    if (!dynamicData || Object.keys(dynamicData).length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          No additional properties defined
        </Typography>
      );
    }

    return (
      <Box>
        {Object.entries(dynamicData).map(([key, value], index) => (
          <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1} px={2} sx={{ 
            backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
            borderRadius: 1,
            mb: 1
          }}>
            <Typography variant="body2" fontWeight="medium" color="primary">
              {key}:
            </Typography>
            <Typography variant="body2">
              {value || 'N/A'}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Cabinet Details - {data.code || 'N/A'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
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
            <Typography variant="body1">
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
              <Chip 
                label={data.cabinetCategory.name} 
                color="primary" 
                variant="outlined"
              />
            ) : (
              <Typography variant="body2" color="textSecondary">Not assigned</Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Subcategory</Typography>
            {data.cabinetSubCategory ? (
              <Chip 
                label={data.cabinetSubCategory.name} 
                color="secondary" 
                variant="outlined"
              />
            ) : (
              <Typography variant="body2" color="textSecondary">Not assigned</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              Additional Properties
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              {renderDynamicProperties(data.dynamicData)}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              System Information
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
            <Typography variant="body2">
              {formatDate(data.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
            <Typography variant="body2">
              {formatDate(data.updatedAt)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Cabinet ID</Typography>
            <Typography variant="body2" fontFamily="monospace">
              #{data.id}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Category ID</Typography>
            <Typography variant="body2" fontFamily="monospace">
              {data.cabinetCategoryId || 'N/A'}
            </Typography>
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

export default ViewCabinet;
