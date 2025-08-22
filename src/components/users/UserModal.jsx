import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import ConfirmationDialog from '../ConfirmationDialog';

import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';

const UserModal = ({ open, mode, userProfile, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    id: null,
    name: '',
    email: '',
    roleId: '',   // ✅ use roleId instead of role name
    password: '',
  });

  const [roles, setRoles] = React.useState([]);
  const { user } = useAuth();

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationConfig, setConfirmationConfig] = React.useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  const fetchRoles = async () => {
    try {
      const roleRes = await axios.get(`${BASE_URL}/api/role/get`);
      setRoles(roleRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    fetchRoles();
  }, []);

  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        id: userProfile.id || null,
        name: userProfile.name || '',
        email: userProfile.email || '',
        roleId: userProfile.roleId || '', // ✅ use roleId from backend
        password: '',
      });
    } else {
      setFormData({ id: null, name: '', email: '', roleId: '', password: '' });
    }
  }, [userProfile, open]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleSave = () => {
    if (isCreateMode) {
      showConfirmation({
        title: 'Create New User',
        message: `Are you sure you want to create a new user with name "${formData.name}" and email "${formData.email}"?`,
        action: () => onSave(formData),
        severity: 'info'
      });
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update User',
        message: `Are you sure you want to update the details for user "${formData.name}"? This will modify the existing user information.`,
        action: () => onSave(formData),
        severity: 'warning'
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isViewMode && 'View User'}
        {isEditMode && 'Edit User'}
        {isCreateMode && 'Add New User'}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          disabled={isViewMode}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          disabled={isViewMode}
        />
        <TextField
          fullWidth
          select
          label="Role"
          name="roleId"   // ✅ bind to roleId
          value={formData.roleId}
          onChange={handleChange}
          margin="normal"
          disabled={isViewMode}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </TextField>
        {!isViewMode && (
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {!isViewMode && (
          <Button onClick={handleSave} variant="contained" color="primary">
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        )}
      </DialogActions>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={isCreateMode ? 'Create' : 'Update'}
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default UserModal;
