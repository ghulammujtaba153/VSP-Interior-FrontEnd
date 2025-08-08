"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { BASE_URL } from '@/configs/url';
import Loader from '@/components/loader/Loader';
import { useParams } from 'next/navigation';

import {
  Box,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip,
} from '@mui/material';

const RolePage = () => {
  const { id } = useParams();
  const [roleTitle, setRoleTitle] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/permission/get/by-role/${id}`);
      setRoleTitle(response.data.role);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error("Error fetching permissions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePermissionChange = async (permission, field, value) => {
    try {
      // 1. Update local state immediately
      const updated = permissions.map((perm) =>
        perm.resourceId === permission.resourceId ? { ...perm, [field]: value } : perm
      );
      setPermissions(updated);

      // 2. Prepare data for backend
      const updatedPermission = { ...permission, [field]: value };
      
      // 3. Send create or update to backend
      if (permission.id) {
        // Update existing permission
        await axios.put(`${BASE_URL}/api/permission/update/${permission.id}`, {
          [field]: value
        });
      } else {
        // Create new permission
        await axios.post(`${BASE_URL}/api/permission/create-or-update`, {
          roleId: parseInt(id),
          resourceId: permission.resourceId,
          canCreate: updatedPermission.canCreate,
          canView: updatedPermission.canView,
          canEdit: updatedPermission.canEdit,
          canDelete: updatedPermission.canDelete
        });
        
        // Refresh data to get the new permission ID
        fetchData();
      }

    } catch (error) {
      console.error("Error updating permission", error);
      // Revert local state on error
      fetchData();
    }
  };


  

  if (loading) return <Loader />;

  const configuredCount = permissions.filter(p => p.id).length;
  const totalResources = permissions.length;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Role: {roleTitle.charAt(0).toUpperCase() + roleTitle.slice(1)}
      </Typography>
      
      {/* <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Chip 
          label={`Total Resources: ${totalResources}`} 
          color="primary" 
          variant="outlined"
        />
        <Chip 
          label={`Configured: ${configuredCount}`} 
          color="success" 
          variant="outlined"
        />
        <Chip 
          label={`Pending: ${totalResources - configuredCount}`} 
          color="warning" 
          variant="outlined"
        />
      </Box> */}

      <Grid container spacing={3}>
        {permissions.map((perm, index) => (
          <Grid item xs={12} md={6} lg={4} key={perm.resourceId || index}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  {perm.resource.charAt(0).toUpperCase() + perm.resource.slice(1)}
                </Typography>
                <Chip 
                  label={perm.id ? "Configured" : "New"} 
                  color={perm.id ? "success" : "default"}
                  size="small"
                />
              </Box>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={perm.canCreate || false}
                      onChange={(e) =>
                        handlePermissionChange(perm, 'canCreate', e.target.checked)
                      }
                    />
                  }
                  label="Create"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={perm.canView || false}
                      onChange={(e) =>
                        handlePermissionChange(perm, 'canView', e.target.checked)
                      }
                    />
                  }
                  label="Read"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={perm.canEdit || false}
                      onChange={(e) =>
                        handlePermissionChange(perm, 'canEdit', e.target.checked)
                      }
                    />
                  }
                  label="Edit"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={perm.canDelete || false}
                      onChange={(e) =>
                        handlePermissionChange(perm, 'canDelete', e.target.checked)
                      }
                    />
                  }
                  label="Delete"
                />
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RolePage;
