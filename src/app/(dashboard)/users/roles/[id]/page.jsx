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
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";

// Individual Permission Card Component with its own isolated state
const PermissionCard = ({ permission, roleId, onSaved }) => {
  // Determine if module is enabled (has any permissions)
  const isModuleEnabled = Boolean(
    permission.canCreate || permission.canView || permission.canEdit || permission.canDelete
  );
  
  const [localState, setLocalState] = useState(isModuleEnabled);
  const [originalState, setOriginalState] = useState(isModuleEnabled);
  const [isSaving, setIsSaving] = useState(false);

  // Update states when permission prop changes (after save refresh)
  useEffect(() => {
    const newEnabled = Boolean(
      permission.canCreate || permission.canView || permission.canEdit || permission.canDelete
    );
    setLocalState(newEnabled);
    setOriginalState(newEnabled);
  }, [permission.canCreate, permission.canView, permission.canEdit, permission.canDelete]);

  // Check if current state differs from original
  const hasChanges = () => {
    return localState !== originalState;
  };

  const handleToggle = (value) => {
    console.log(`Toggling ${permission.resource} module to:`, value);
    setLocalState(value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // When enabled, give all permissions; when disabled, remove all permissions
      const permissions = localState ? {
        canCreate: true,
        canView: true,
        canEdit: true,
        canDelete: true,
      } : {
        canCreate: false,
        canView: false,
        canEdit: false,
        canDelete: false,
      };

      if (permission.id) {
        // Update existing permission
        await axios.put(`${BASE_URL}/api/permission/update/${permission.id}`, permissions);
        toast.success(`${permission.resource} module ${localState ? 'enabled' : 'disabled'} successfully!`);
      } else {
        // Create new permission
        await axios.post(`${BASE_URL}/api/permission/create-or-update`, {
          roleId: parseInt(roleId),
          resourceId: permission.resourceId,
          ...permissions,
        });
        toast.success(`${permission.resource} module ${localState ? 'enabled' : 'disabled'} successfully!`);
      }
      
      // Call parent refresh function
      onSaved();
      
    } catch (error) {
      console.error("Error saving permission", error);
      toast.error(`Failed to save ${permission.resource} permissions`);
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
          mb: 1,
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
          {hasChanges() && (
            <Chip
              label="Modified"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
      
      {/* Debug info */}
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
        ID: {permission.resourceId} | Status: {localState ? 'Enabled' : 'Disabled'}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={localState}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={isSaving}
              color="primary"
            />
          }
          label={
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {/* {localState ? 'Module Enabled' : 'Module Disabled'} */}
            </Typography>
          }
        />
      </Box>
      
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
        {localState ? 'Full access: Create, Read, Edit, Delete' : 'No access to this module'}
      </Typography>
      <Button
        variant="contained"
        size="small"
        sx={{ mt: 2 }}
        onClick={handleSave}
        disabled={!hasChanges() || isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
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
    await fetchData();
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