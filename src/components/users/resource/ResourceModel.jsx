import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

const ResourceModal = ({ open, onClose, onSave, resource, mode }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (resource && isEditMode) {
      setFormData({ name: resource.name || '' });
    } else {
      setFormData({ name: '' });
    }
  }, [resource, open, mode]);

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Resource name is required');
      return;
    }
    onSave({ ...resource, name: formData.name });
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
    </Dialog>
  );
};

export default ResourceModal;
