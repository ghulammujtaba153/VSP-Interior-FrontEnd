"use client"

import React, { useEffect, useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

const RoleModal = ({ open, mode, role, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (role) {
      setFormData({ name: role.name });
    } else {
      setFormData({ name: '' });
    }
  }, [role, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? 'Edit Role' : 'Add New Role'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Role Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {mode === 'edit' ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleModal;
