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
import ConfirmationDialog from '../../ConfirmationDialog';

const RoleModal = ({ open, mode, role, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '' });

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

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

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleSubmit = () => {
    const isCreateMode = mode === 'create';
    const isEditMode = mode === 'edit';

    if (isCreateMode) {
      showConfirmation({
        title: 'Create New Role',
        message: `Are you sure you want to create a new role with name "${formData.name}"?`,
        action: () => onSave(formData),
        severity: 'info'
      });
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update Role',
        message: `Are you sure you want to update the role name to "${formData.name}"? This will modify the existing role information.`,
        action: () => onSave(formData),
        severity: 'warning'
      });
    }
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

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={mode === 'edit' ? 'Update' : 'Create'}
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default RoleModal;
