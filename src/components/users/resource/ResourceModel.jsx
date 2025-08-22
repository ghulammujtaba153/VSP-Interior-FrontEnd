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

const ResourceModal = ({ open, onClose, onSave, resource, mode }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (resource && isEditMode) {
      setFormData({ name: resource.name || '' });
    } else {
      setFormData({ name: '' });
    }
  }, [resource, open, mode, isEditMode]);

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
    setError('');
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
    if (!formData.name.trim()) {
      setError('Resource name is required');
      return;
    }

    if (isCreateMode) {
      showConfirmation({
        title: 'Create New Resource',
        message: `Are you sure you want to create a new resource with name "${formData.name}"?`,
        action: () => onSave({ ...resource, name: formData.name }),
        severity: 'info'
      });
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update Resource',
        message: `Are you sure you want to update the resource name to "${formData.name}"? This will modify the existing resource information.`,
        action: () => onSave({ ...resource, name: formData.name }),
        severity: 'warning'
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Edit Resource' : 'Add Resource'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Resource Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={isEditMode ? 'Update' : 'Create'}
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default ResourceModal;
