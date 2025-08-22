"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";
import { useAuth } from "@/context/authContext";
import ConfirmationDialog from '../ConfirmationDialog';


const InventoryModal = ({ open, setOpen, editData, onSuccess }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    description: "",
    category: "",
    unit: "",
    supplierId: "",
    costPrice: "",
    quantity: "",
    minThreshold: "",
    maxThreshold: "",
  });
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (editData) {
      setFormData({
        itemCode: editData.itemCode || "",
        name: editData.name || "",
        description: editData.description || "",
        category: editData.category || "",
        unit: editData.unit || "",
        supplierId: editData.supplierId || "",
        costPrice: editData.costPrice || "",
        quantity: editData.quantity || "",
        minThreshold: editData.minThreshold || "",
        maxThreshold: editData.maxThreshold || "",
      });
    } else {
      setFormData({
        itemCode: "",
        name: "",
        description: "",
        category: "",
        unit: "",
        supplierId: "",
        costPrice: "",
        quantity: "",
        minThreshold: "",
        maxThreshold: "",
      });
    }
  }, [editData]);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {

      const res = await axios.get(`${BASE_URL}/api/suppliers/get`);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCreateMode = !editData;
    const isEditMode = !!editData;

    if (isCreateMode) {
      showConfirmation({
        title: 'Create New Inventory Item',
        message: `Are you sure you want to create a new inventory item "${formData.name}" with item code "${formData.itemCode}"?`,
        action: () => submitInventory(),
        severity: 'info'
      });
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update Inventory Item',
        message: `Are you sure you want to update inventory item "${formData.name}"? This will modify the existing inventory information.`,
        action: () => submitInventory(),
        severity: 'warning'
      });
    }
  };

  const submitInventory = async () => {
    setIsSubmit(true);
    toast.loading(editData ? "Updating Inventory..." : "Creating Inventory...");

    try {
      if (editData) {
        // Edit Mode
        formData.minThreshold = parseInt(formData.minThreshold) || 0;
        formData.maxThreshold = parseInt(formData.maxThreshold) || 0;
        formData.costPrice = parseInt(formData.costPrice) || 0;
        formData.quantity = parseInt(formData.quantity) || 0;
        formData.userId = user.id;
        await axios.put(`${BASE_URL}/api/inventory/update/${editData.id}`, formData);
        toast.dismiss();
        toast.success("Inventory updated successfully");
      } else {
        // Add Mode
        formData.minThreshold = parseInt(formData.minThreshold) || 0;
        formData.maxThreshold = parseInt(formData.maxThreshold) || 0;
        formData.costPrice = parseInt(formData.costPrice) || 0;
        formData.quantity = parseInt(formData.quantity) || 0;
        formData.userId = user.id;
        await axios.post(`${BASE_URL}/api/inventory/create`, formData);
        toast.dismiss();
        toast.success("Inventory created successfully");
      }

      setOpen(false);
      onSuccess?.(); // Refresh table after save
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsSubmit(false);
    }
  };


  if(loading) return <Loader/>

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          width: 500,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          {editData ? "Edit Inventory Item" : "Add Inventory Item"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Item Code"
                name="itemCode"
                value={formData.itemCode}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Supplier"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cost Price"
                name="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Threshold"
                name="minThreshold"
                type="number"
                value={formData.minThreshold}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Threshold"
                name="maxThreshold"
                type="number"
                value={formData.maxThreshold}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmit}
            >
              {editData ? "Update" : "Create"}
            </Button>
          </Box>
        </form>

        <ConfirmationDialog
          open={confirmationOpen}
          onClose={handleConfirmationClose}
          onConfirm={confirmationConfig.action}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          severity={confirmationConfig.severity}
          confirmText={editData ? 'Update' : 'Create'}
          cancelText="Cancel"
        />
      </Box>
    </Modal>
  );
};

export default InventoryModal;
