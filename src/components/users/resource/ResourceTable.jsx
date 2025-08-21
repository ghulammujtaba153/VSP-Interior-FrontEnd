"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

import ResourceModal from './ResourceModel';
import { BASE_URL } from '@/configs/url';
import Loader from '@/components/loader/Loader';
import PermissionWrapper from '@/components/PermissionWrapper';
import { useAuth } from '@/context/authContext';




const ResourceTable = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [mode, setMode] = useState('create');
  const { user } = useAuth();

  const handleAdd = () => {
    setSelectedResource(null);
    setMode('create');
    setOpenModal(true);
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setMode('edit');
    setOpenModal(true);
  };

  const handleSave = async (resource) => {
    try {
      if (mode === 'create') {
        await axios.post(`${BASE_URL}/api/resource/create`, resource, {
          userId: user.id
        });
      } else {
        await axios.put(`${BASE_URL}/api/resource/update/${resource.id}`, resource, {
          userId: user.id
        });
      }
      fetchData();
    } catch (error) {
      console.error('Error saving resource', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/resource/get`);
      setResources(res.data);
    } catch (error) {
      console.error("Error fetching resources", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/resource/delete/${id}`, {
        userId: user.id
      });
      fetchData(); // refresh
    } catch (err) {
      console.error('Error deleting resource', err);
    }
  };

  if (loading) return <Loader />;

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <PermissionWrapper resource="resources" action="canEdit">
            <IconButton color="secondary" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </PermissionWrapper>
          <PermissionWrapper resource="resources" action="canDelete">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </PermissionWrapper>
        </Box>
      ),
    },
  ];

  return (
    <Paper p={2} sx={{ p:4}}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" mb={2}>
          Resources
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>Add Resource</Button>
      </Box>

      <Paper>
        <DataGrid
          rows={resources.map((resource) => ({
            ...resource,
            id: resource.id, // DataGrid expects a unique 'id' field
          }))}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Paper>

      <ResourceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        resource={selectedResource}
        mode={mode}
      />
    </Paper>
  );
};

export default ResourceTable;
