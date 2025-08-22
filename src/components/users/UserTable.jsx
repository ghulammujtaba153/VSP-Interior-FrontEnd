"use client";

import React, { useState } from 'react';

import {
  Box, Button, IconButton, Typography, Paper, Switch,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import axios from 'axios';

import { toast } from 'react-toastify';

import UserModal from './UserModal';
import ConfirmationDialog from '../ConfirmationDialog';
import { BASE_URL } from '@/configs/url';

import PermissionWrapper from '@/components/PermissionWrapper';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/authContext';

import * as XLSX from "xlsx";   // ✅ Import XLSX

const UserTable = ({ users, fetchUsers }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Confirmation dialog states (only for delete)
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  const { user } = useAuth();

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
      try {
        formData.userId = user.id;
        const res = await axios.put(`${BASE_URL}/api/user/update/${formData.id}`, formData);
        toast.success("User updated successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Error updating user");
      }
    } else if (modalMode === 'create') {
      try {
        formData.userId = user.id;
        const res = await axios.post(`${BASE_URL}/api/user/create`, formData);
        toast.success("User created successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Error creating user");
      }
    }
    handleCloseModal();
  };

  const handleDeleteUser = (userRow) => {
    setUserToDelete(userRow);
    setConfirmationOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/user/delete/${userToDelete.id}`, {
        data: { userId: user.id }
      });
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user", error);
      toast.error("Error deleting user");
    } finally {
      setConfirmationOpen(false);
      setUserToDelete(null);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setUserToDelete(null);
  };

  const handleStatusChange = async (id, checked) => {
    try {
      await axios.put(`${BASE_URL}/api/user/update-status/${id}`, { 
        status: checked ? 'active' : 'suspended', 
        userId: user.id 
      });
      toast.success("User status updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Error updating user status");
    }
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const exportData = users.map(u => ({
      Name: u.name,
      Email: u.email,
      Role: u.Role.name || "N/A",
      Status: u.status,
      "Created At": u.createdAt ? new Date(u.createdAt).toLocaleString() : "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    {
      field: 'Role',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => {
        const row = params?.row;
        if (!row) return null;
        return (
          <Chip label={row.Role.name} />
        );
      }
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
      renderCell: (params) => {
        const row = params?.row;
        if (!row || !row.createdAt) return 'N/A';
        return new Date(row.createdAt).toLocaleString();
      }
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
              <IconButton onClick={() => handleDeleteUser(row)}>
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
        <Box sx={{ display: "flex", gap: 1 }}>
          <PermissionWrapper resource="users" action="canCreate">
            <Button variant="contained" color="primary" onClick={() => handleOpenModal('create')}>
              Add User
            </Button>
          </PermissionWrapper>
          <Button variant="outlined" color="success" onClick={handleExportExcel}>
            Export Excel
          </Button>
        </Box>
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
        userProfile={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone.`}
        severity="error"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default UserTable;
