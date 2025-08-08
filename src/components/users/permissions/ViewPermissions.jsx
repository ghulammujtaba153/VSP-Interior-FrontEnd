import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid
} from '@mui/material';

const ViewPermissions = ({ open, onClose, permission }) => {
  if (!permission) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>View Permission</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">ID:</Typography>
            <Typography>{permission.id}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Resource:</Typography>
            <Typography>{permission.resource}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Can Create:</Typography>
            <Typography>{permission.canCreate ? 'Yes' : 'No'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Can Edit:</Typography>
            <Typography>{permission.canEdit ? 'Yes' : 'No'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Can Delete:</Typography>
            <Typography>{permission.canDelete ? 'Yes' : 'No'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Can View:</Typography>
            <Typography>{permission.canView ? 'Yes' : 'No'}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewPermissions;
