import React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from '@mui/material';

const RoleViewModal = ({ open, role, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>View Role</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1">ID: {role?.id}</Typography>
        <Typography variant="subtitle1">Name: {role?.name}</Typography>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Created At: {new Date(role?.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="subtitle2">
          Updated At: {new Date(role?.updatedAt).toLocaleString()}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleViewModal;
