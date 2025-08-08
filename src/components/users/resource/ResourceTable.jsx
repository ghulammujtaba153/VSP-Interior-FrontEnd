"use client";

import { useState, useEffect } from 'react';

import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import axios from 'axios';

import ResourceModal from './ResourceModel';
import { BASE_URL } from '@/configs/url';
import Loader from '@/components/loader/Loader';

const ResourceTable = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [openModal, setOpenModal] = useState(false);
const [selectedResource, setSelectedResource] = useState(null);
const [mode, setMode] = useState('create');

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
        await axios.post(`${BASE_URL}/api/resource/create`, resource);
      } else {
        await axios.put(`${BASE_URL}/api/resource/update/${resource.id}`, resource);
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

  const handleView = (resource) => {
    console.log('Viewing resource:', resource);

    // open view modal
  };



  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/resource/delete/${id}`);
      fetchData(); // refresh
    } catch (err) {
      console.error('Error deleting resource', err);
    }
  };

  if (loading) return <Loader />;

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" mb={2}>
      <Typography variant="h5" mb={2}>
        Resources
      </Typography>
      <Button variant="contained" color="primary" onClick={handleAdd}>Add Resource</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.id}</TableCell>
                <TableCell>{resource.name}</TableCell>
                <TableCell align="center">
                  
                  <IconButton color="secondary" onClick={() => handleEdit(resource)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(resource.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {resources.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No resources found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ResourceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        resource={selectedResource}
        mode={mode}
      />
    </Box>
  );
};

export default ResourceTable;
