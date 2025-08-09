"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";

// Individual Permission Card Component with its own isolated state
const PermissionCard = ({ permission, roleId, onSaved }) => {
  const [localState, setLocalState] = useState({
    canCreate: Boolean(permission.canCreate),
    canView: Boolean(permission.canView),
    canEdit: Boolean(permission.canEdit),
    canDelete: Boolean(permission.canDelete),
  });
  const [originalState, setOriginalState] = useState({
    canCreate: Boolean(permission.canCreate),
    canView: Boolean(permission.canView),
    canEdit: Boolean(permission.canEdit),
    canDelete: Boolean(permission.canDelete),
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update states when permission prop changes (after save refresh)
  useEffect(() => {
    const newState = {
      canCreate: Boolean(permission.canCreate),
      canView: Boolean(permission.canView),
      canEdit: Boolean(permission.canEdit),
      canDelete: Boolean(permission.canDelete),
    };
    setLocalState(newState);
    setOriginalState(newState);
  }, [permission.canCreate, permission.canView, permission.canEdit, permission.canDelete]);

  // Check if current state differs from original
  const hasChanges = () => {
    return (
      localState.canCreate !== originalState.canCreate ||
      localState.canView !== originalState.canView ||
      localState.canEdit !== originalState.canEdit ||
      localState.canDelete !== originalState.canDelete
    );
  };

  const handleChange = (field, value) => {
    console.log(`Changing ${permission.resource} ${field} to:`, value);
    setLocalState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (permission.id) {
        // Update existing permission
        await axios.put(`${BASE_URL}/api/permission/update/${permission.id}`, {
          canCreate: localState.canCreate,
          canView: localState.canView,
          canEdit: localState.canEdit,
          canDelete: localState.canDelete,
        });
        toast.success(`${permission.resource} permissions updated successfully!`);
      } else {
        // Create new permission
        await axios.post(`${BASE_URL}/api/permission/create-or-update`, {
          roleId: parseInt(roleId),
          resourceId: permission.resourceId,
          canCreate: localState.canCreate,
          canView: localState.canView,
          canEdit: localState.canEdit,
          canDelete: localState.canDelete,
        });
        toast.success(`${permission.resource} permissions created successfully!`);
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
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
        ID: {permission.resourceId} | Current: C:{String(localState.canCreate)} V:{String(localState.canView)} E:{String(localState.canEdit)} D:{String(localState.canDelete)}
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={localState.canCreate}
              onChange={(e) => handleChange("canCreate", e.target.checked)}
              disabled={isSaving}
            />
          }
          label="Create"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={localState.canView}
              onChange={(e) => handleChange("canView", e.target.checked)}
              disabled={isSaving}
            />
          }
          label="Read"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={localState.canEdit}
              onChange={(e) => handleChange("canEdit", e.target.checked)}
              disabled={isSaving}
            />
          }
          label="Edit"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={localState.canDelete}
              onChange={(e) => handleChange("canDelete", e.target.checked)}
              disabled={isSaving}
            />
          }
          label="Delete"
        />
      </FormGroup>
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