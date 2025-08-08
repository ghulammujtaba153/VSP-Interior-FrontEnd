"use client";

import React, { useState } from 'react';

import {
  Box, Button, IconButton, Typography, Paper, Switch
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import axios from 'axios';

import { toast } from 'react-toastify';

import UserModal from './UserModal';
import { BASE_URL } from '@/configs/url';


import PermissionWrapper from '@/components/PermissionWrapper';
import { usePermissions } from '@/hooks/usePermissions';

const UserTable = ({ users, fetchUsers }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedUser, setSelectedUser] = useState(null);
  const { canView, canCreate, canEdit, canDelete } = usePermissions();

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (formData) => {
    if (modalMode === 'edit') {
      console.log('Updating user:', formData);

      try {
        const res = await axios.put(`${BASE_URL}/api/user/update/${formData.id}`, formData);

        console.log(res.data);
        toast.success("User updated successfully");
        fetchUsers(); // Refresh the users list
      } catch (error) {
        console.error("Error updating user", error);
        toast.error("Error updating user");
      }
    } else if (modalMode === 'create') {
      console.log('Creating user:', formData);

      try {
        const res = await axios.post(`${BASE_URL}/api/user/create`, formData);

        console.log(res.data);
        toast.success("User created successfully");
        fetchUsers(); // Refresh the users list
      } catch (error) {
        console.error("Error creating user", error);
        toast.error("Error creating user");
      }
    }

    handleCloseModal();
  };

  const handleDeleteUser = async (id) => {
    console.log('Deleting user with id:', id);


    // Call your delete API here
    try {
      const res = await axios.delete(`${BASE_URL}/api/user/delete/${id}`);

      console.log(res.data);
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };


  const handleStatusChange = async (id, checked) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/user/update-status/${id}`, { status: checked ? 'active' : 'suspended' });

      console.log(res.data);
      toast.success("User status updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Error updating user status");
      console.error("Error updating user status", error);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    {
      field: 'Role',
      headerName: 'Role',
      flex: 1,
      valueGetter: (params) => {
        console.log("params", params)
        
        const roleName = params?.name;

        
return roleName || 'N/A';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        const row = params?.row;

        if (!row) return null;

        return (
          <Switch
            checked={row.status === 'active'}
            onChange={(e) => handleStatusChange(row.id, e.target.checked)}
            color="primary"
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1.5,
      valueGetter: (params) => {
        console.log("params createdAt", params)
        const createdAt = params;

        
return createdAt ? new Date(createdAt).toLocaleString() : 'N/A';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params?.row;

        if (!row) return null;

        return (
          <>
            <PermissionWrapper resource="users" action="canView">
              <IconButton onClick={() => handleOpenModal('view', row)}>
                <VisibilityIcon />
              </IconButton>
            </PermissionWrapper>
            
            <PermissionWrapper resource="users" action="canEdit">
              <IconButton onClick={() => handleOpenModal('edit', row)}>
                <EditIcon />
              </IconButton>
            </PermissionWrapper>
            
            <PermissionWrapper resource="users" action="canDelete">
              <IconButton onClick={() => handleDeleteUser(row.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </PermissionWrapper>
          </>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%', borderRadius: 2, boxShadow: 1, p: 2 }} component={Paper} >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">User Table</Typography>
        <PermissionWrapper resource="users" action="canCreate">
          <Button variant="contained" color="primary" onClick={() => handleOpenModal('create')}>
            Add User
          </Button>
        </PermissionWrapper>
      </Box>

      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.id}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableRowSelectionOnClick
      />

      <UserModal
        open={modalOpen}
        mode={modalMode}
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </Box>
  );
};

export default UserTable;
