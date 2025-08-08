"use client"

import React, { useEffect, useState } from 'react';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  TableContainer,
  Typography,
  Box,
  Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

import Loader from '@/components/loader/Loader';
import { BASE_URL } from '@/configs/url';
import ViewPermissions from './ViewPermissions';
import PermissionModal from './PermissionModal';

const PermissionsTable = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/permission/get`);

      setData(res.data);
    } catch (error) {
      console.error('Error fetching permissions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleSave = async (permission) => {
    try {
      if (isEditMode && selectedPermission?.id) {
        await axios.put(`${BASE_URL}/api/permission/update/${selectedPermission.id}`, permission);
      } else {
        await axios.post(`${BASE_URL}/api/permission/create`, permission);
      }

      setOpenModal(false);
      setSelectedPermission(null);
      setIsEditMode(false);
      fetch(); // refresh table
    } catch (error) {
      console.error('Error saving permission', error);
    }
  };

  const handleView = (permission) => {
    setSelectedPermission(permission);
    setOpenViewModal(true);
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setIsEditMode(true);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedPermission(null);
    setIsEditMode(false);
    setOpenModal(true);
  };

  if (loading) return <Loader />;

  return (
    <Box p={2} component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
      {/* View Modal */}
      <ViewPermissions
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        permission={selectedPermission}
      />

      {/* Add/Edit Modal */}
      <PermissionModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedPermission(null);
          setIsEditMode(false);
        }}
        mode={isEditMode ? 'edit' : 'create'}
        permission={selectedPermission}
        onSave={handleSave}
      />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" gutterBottom>
          Permissions Table
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Permission
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell>{perm.id}</TableCell>
                <TableCell>{perm.resource}</TableCell>
                <TableCell>
                  <IconButton aria-label="view" color="primary" onClick={() => handleView(perm)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton aria-label="edit" color="secondary" onClick={() => handleEdit(perm)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No permissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PermissionsTable;
