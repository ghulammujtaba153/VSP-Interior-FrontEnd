import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

const PermissionModal = ({ open, onClose, mode = 'create', permission = null, onSave }) => {
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const [formData, setFormData] = useState({
    resource: '',
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: false,
  });


  const [resources, setResources] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (permission && isEditMode) {
      setFormData({
        resource: permission.resource || '',
        canCreate: permission.canCreate || false,
        canEdit: permission.canEdit || false,
        canDelete: permission.canDelete || false,
        canView: permission.canView || false,
      });
    } else {
      setFormData({
        resource: '',
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canView: false,
      });
    }
  }, [permission, open, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Edit Permission' : 'Add Permission'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Resource"
          name="resource"
          value={formData.resource}
          onChange={handleChange}
          margin="normal"
        />
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.canCreate}
                onChange={handleChange}
                name="canCreate"
              />
            }
            label="Can Create"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.canEdit}
                onChange={handleChange}
                name="canEdit"
              />
            }
            label="Can Edit"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.canDelete}
                onChange={handleChange}
                name="canDelete"
              />
            }
            label="Can Delete"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.canView}
                onChange={handleChange}
                name="canView"
              />
            }
            label="Can View"
          />
        </FormGroup>
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

export default PermissionModal;
