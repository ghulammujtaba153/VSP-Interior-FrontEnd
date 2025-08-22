"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import ConfirmationDialog from '../ConfirmationDialog';

const CabinetModal = ({ open, setOpen, editData, setEditData, onSuccess }) => {
  const [formData, setFormData] = useState({
    modelName: "",
    material: "",
    height: "",
    width: "",
    depth: "",
    basePrice: "",
    pricePerSqft: "",
  });
  const {user} = useAuth()

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        modelName: editData.modelName || "",
        material: editData.material || "",
        height: editData.height || "",
        width: editData.width || "",
        depth: editData.depth || "",
        basePrice: editData.basePrice || "",
        pricePerSqft: editData.pricePerSqft || "",
      });
    } else {
      setFormData({
        modelName: "",
        material: "",
        height: "",
        width: "",
        depth: "",
        basePrice: "",
        pricePerSqft: "",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleSubmit = async () => {
    const isCreateMode = !editData;
    const isEditMode = !!editData;

    if (isCreateMode) {
      showConfirmation({
        title: 'Create New Cabinet',
        message: `Are you sure you want to create a new cabinet "${formData.modelName}" with material "${formData.material}"?`,
        action: () => submitCabinet(),
        severity: 'info'
      });
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update Cabinet',
        message: `Are you sure you want to update cabinet "${formData.modelName}"? This will modify the existing cabinet information.`,
        action: () => submitCabinet(),
        severity: 'warning'
      });
    }
  };

  const submitCabinet = async () => {
    try {
      toast.loading(editData ? "Updating cabinet..." : "Adding cabinet...");
      formData.userId = user.id
      formData.depth = parseInt(formData.depth) || 0
      
      if (editData) {
        await axios.put(`${BASE_URL}/api/cabinet/update/${editData.id}`, formData);
        toast.dismiss();
        toast.success("Cabinet updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/cabinet/create`, formData);
        toast.dismiss();
        toast.success("Cabinet added successfully");
      }
      onSuccess();
      setOpen(false);
      setEditData(null);
    } catch (error) {
      toast.dismiss();
      toast.error("Error saving cabinet");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{editData ? "Edit Cabinet" : "Add Cabinet"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              name="modelName"
              label="Model Name"
              fullWidth
              value={formData.modelName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="material"
              label="Material"
              fullWidth
              value={formData.material}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="height"
              label="Height"
              type="number"
              fullWidth
              value={formData.height}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="width"
              label="Width"
              type="number"
              fullWidth
              value={formData.width}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="depth"
              label="Depth"
              type="number"
              fullWidth
              value={formData.depth}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="basePrice"
              label="Base Price"
              type="number"
              fullWidth
              value={formData.basePrice}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="pricePerSqft"
              label="Price per Sqft"
              type="number"
              fullWidth
              value={formData.pricePerSqft}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update" : "Save"}
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={editData ? 'Update' : 'Save'}
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default CabinetModal;
