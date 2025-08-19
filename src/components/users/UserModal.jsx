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

import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';

const UserModal = ({ open, mode, userProfile, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    id: null,
    name: '',
    email: '',
    role: '',
    password: '',
  });

  const [roles, setRoles] = React.useState([]);
  const {user} = useAuth();

  const fetchRoles = async () => {
    try {
      const roleRes = await axios.get(`${BASE_URL}/api/role/get`);

      setRoles(roleRes.data); // expecting an array of roles
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
        role: userProfile.Role?.name || '',
        password: '', // do not prefill password
      });
    } else {
      setFormData({ id: null, name: '', email: '', role: '', password: '' });
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

  const handleSave = () => {
    onSave(formData);
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
          name="role"
          value={formData.role}
          onChange={handleChange}
          margin="normal"
          disabled={isViewMode}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.name}>
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
    </Dialog>
  );
};

export default UserModal;
