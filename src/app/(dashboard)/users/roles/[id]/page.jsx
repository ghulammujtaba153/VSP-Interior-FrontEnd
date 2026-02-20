"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";

// Individual Permission Card Component with its own isolated state
const PermissionCard = ({ permission, roleId, onSaved }) => {
  const [permissions, setPermissions] = useState({
    canCreate: permission.canCreate || false,
    canView: permission.canView || false,
    canEdit: permission.canEdit || false,
    canDelete: permission.canDelete || false,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Update states when permission prop changes (after save refresh)
  useEffect(() => {
    setPermissions({
      canCreate: permission.canCreate || false,
      canView: permission.canView || false,
      canEdit: permission.canEdit || false,
      canDelete: permission.canDelete || false,
    });
  }, [permission.canCreate, permission.canView, permission.canEdit, permission.canDelete]);

  const handlePermissionChange = async (key, value) => {
    const updatedPermissions = { ...permissions, [key]: value };
    setPermissions(updatedPermissions);
    setIsSaving(true);
    
    try {
      if (permission.id) {
        // Update existing permission
        await axios.put(`${BASE_URL}/api/permission/update/${permission.id}`, updatedPermissions);
      } else {
        // Create new permission
        await axios.post(`${BASE_URL}/api/permission/create-or-update`, {
          roleId: parseInt(roleId),
          resourceId: permission.resourceId,
          ...updatedPermissions,
        });
      }
      
      toast.success(`${permission.resource} permissions updated!`);
      // Call parent refresh function
      onSaved();
      
    } catch (error) {
      console.error("Error saving permission", error);
      toast.error(`Failed to save ${permission.resource} permissions`);
      // Revert if save failed
      setPermissions(permissions); 
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {permission.resource.charAt(0).toUpperCase() +
            permission.resource.slice(1)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={permission.id ? "Configured" : "New"}
            color={permission.id ? "success" : "default"}
            size="small"
          />
          {isSaving && (
            <Chip
              label="Saving..."
              color="info"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
      
      <FormGroup>
        <Grid container>
            <Grid item xs={6}>
                 <FormControlLabel
                    control={
                        <Checkbox 
                            checked={permissions.canCreate} 
                            onChange={(e) => handlePermissionChange('canCreate', e.target.checked)} 
                            name="canCreate" 
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">Create</Typography>}
                />
            </Grid>
            <Grid item xs={6}>
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={permissions.canView} 
                            onChange={(e) => handlePermissionChange('canView', e.target.checked)} 
                            name="canView" 
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">View</Typography>}
                />
            </Grid>
            <Grid item xs={6}>
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={permissions.canEdit} 
                            onChange={(e) => handlePermissionChange('canEdit', e.target.checked)} 
                            name="canEdit" 
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">Edit</Typography>}
                />
            </Grid>
            <Grid item xs={6}>
                 <FormControlLabel
                    control={
                        <Checkbox 
                            checked={permissions.canDelete} 
                            onChange={(e) => handlePermissionChange('canDelete', e.target.checked)} 
                            name="canDelete" 
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">Delete</Typography>}
                />
            </Grid>
        </Grid>
      </FormGroup>
    </Paper>
  );
};

// Main Role Page Component
const RolePage = () => {
  const { id } = useParams();
  const [roleTitle, setRoleTitle] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/permission/get/by-role/${id}`
      );
      setRoleTitle(response.data.role);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error("Error fetching permissions", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePermissionSaved = async () => {
    // Refresh data without forcing re-render of all components
    setLoading(true);
    // await fetchData();
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Role: {roleTitle.charAt(0).toUpperCase() + roleTitle.slice(1)}
      </Typography>

      <Grid container spacing={3}>
        {permissions.map((perm) => (
          <Grid item xs={12} md={6} lg={4} key={perm.resourceId}>
            <PermissionCard 
              permission={perm}
              roleId={id}
              onSaved={handlePermissionSaved}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RolePage;