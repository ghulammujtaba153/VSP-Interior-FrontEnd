'use client';

import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { toast } from 'react-toastify';

import axios from 'axios';

import RoleViewModal from './RoleViewModal';
import RoleModal from './RoleModal';
import ConfirmationDialog from '../../ConfirmationDialog';

import { BASE_URL } from '@/configs/url';
import Loader from '@/components/loader/Loader';
import Link from '@/components/Link';
import PermissionWrapper from '@/components/PermissionWrapper';
import { useAuth } from '@/context/authContext';


const RolesTable = () => {
  const [roles, setRoles] = useState([])
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [mode, setMode] = useState('create');
  const [loading, setLoading] = useState(true)
  
  // Confirmation dialog states (only for delete)
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  const {user} = useAuth();



  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/role/get`)

      setRoles(res.data)
      console.log("roles", res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  } 

  useEffect(() => {
    fetchRoles()
  }, [])


  const handleOpen = (type, role = null) => {
    if (type === 'view') {
      setSelectedRole(role);
      setViewModalOpen(true);
    } else {
      setSelectedRole(role);
      setMode(type);
      setModalOpen(true);
    }
  };

  const handleClose = () => {
    setSelectedRole(null);
    setModalOpen(false);
    setViewModalOpen(false);
  };

  const handleSave = async (formData) => {
    toast.loading("Saving...");

    try {
      formData.userId = user.id;
      if (mode === 'edit') {
        console.log('Update Role:', formData);
        await axios.put(`${BASE_URL}/api/role/update/${selectedRole.id}`, formData);
        toast.dismiss();
        toast.success("Role updated successfully");
      } else {
        console.log('Create Role:', formData);
        await axios.post(`${BASE_URL}/api/role/create`, formData);
        toast.dismiss();
        toast.success("Role created successfully");
      }
  
      handleClose();
      fetchRoles(); // Re-fetch updated list
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong while saving role");
      console.error(error);
    }
  };
  

  const handleDelete = (roleRow) => {
    setRoleToDelete(roleRow);
    setConfirmationOpen(true);
  };

  const confirmDeleteRole = async () => {
    try {
      toast.loading("Deleting...");
      await axios.delete(`${BASE_URL}/api/role/delete/${roleToDelete.id}`, {
        data: { userId: user.id }
      });
      toast.dismiss();
      toast.success("Role deleted successfully");
      fetchRoles(); // Refresh roles after deletion
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete role");
      console.error(error);
    } finally {
      setConfirmationOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setRoleToDelete(null);
  };

  

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => {
        const row = params.row; // Fix: avoid direct usage of params.row inline

        
        return (
          <>
          <PermissionWrapper resource="roles" action="canView">
            <Button
              component={Link}
              href={`/users/roles/${row.id}`}
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              sx={{ textTransform: 'none' }}
            >
              Manage permissions
            </Button>
            </PermissionWrapper>

            <PermissionWrapper resource="roles" action="canEdit">
            <IconButton onClick={() => handleOpen('edit', row)}>
              <EditIcon />
            </IconButton>
            </PermissionWrapper>

            <PermissionWrapper resource="roles" action="canDelete">
            <IconButton onClick={() => handleDelete(row)}>
              <DeleteIcon color="error" />
            </IconButton>
            </PermissionWrapper>
          </>
        );
      },
    },
  ];

  if(loading) {
    return <Loader/>
  }



  return (
    <Box sx={{ width: '100%', borderRadius: 2, boxShadow: 1, p: 2 }} component={Paper}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Roles Table</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpen('create')}
        >
          Add Role
        </Button>
      </Box>

      <DataGrid
        rows={roles}
        columns={columns}
        getRowId={(row) => row.id}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableRowSelectionOnClick
      />

      <RoleModal
        open={modalOpen}
        mode={mode}
        role={selectedRole}
        onClose={handleClose}
        onSave={handleSave}
      />

      <RoleViewModal
        open={viewModalOpen}
        role={selectedRole}
        onClose={handleClose}
      />

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete role "${roleToDelete?.name}"? This action cannot be undone.`}
        severity="error"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default RolesTable;
