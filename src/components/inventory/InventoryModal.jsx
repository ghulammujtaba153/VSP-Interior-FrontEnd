"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";
import ConfirmationDialog from '../ConfirmationDialog';

const InventoryModal = ({ open, setOpen, editData, onSuccess }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierCategories, setSupplierCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supplierId: "",
    category: "",
    costPrice: "",
    quantity: "",
    notes: "",
    status: "active",
  });
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const { user } = useAuth();

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
        name: editData.name || "",
        description: editData.description || "",
        supplierId: editData.supplier?.id || editData.supplierId || "",
        category: editData.categoryDetails?.id || editData.category || "",
        costPrice: editData.costPrice || "",
        quantity: editData.quantity || "",
        notes: editData.notes || "",
        status: editData.status || "active",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        supplierId: "",
        category: "",
        costPrice: "",
        quantity: "",
        notes: "",
        status: "active",
      });
    }
  }, [editData]);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/suppliers/get?page=1&limit=10000`);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch categories (globally, independent of supplier)
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook-categories/get`);
      setSupplierCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSupplierCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
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
        message: `Are you sure you want to create a new inventory item "${formData.name}"?`,
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
      formData.costPrice = parseFloat(formData.costPrice) || 0;
      formData.quantity = parseInt(formData.quantity) || 0;
      formData.userId = user.id;

      if (editData) {
        await axios.put(`${BASE_URL}/api/inventory/update/${editData.id}`, formData);
        toast.dismiss();
        toast.success("Inventory updated successfully");
      } else {
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
          width: { xs: '90%', sm: 600 },
          maxWidth: 600,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3} color="primary">
          {editData ? "Edit Inventory Item" : "Add Inventory Item"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 2}}>
            {/* Name Field */}
            <Grid item xs={12}>
              <TextField
                sx={{ width: '100%', mb:3 }}
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            
            </Grid>
            {/* Description Field */}
            <Grid item xs={12}>
              <TextField

                sx={{ width: '100%', mb:3 }}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter item description..."
              />

              {/* Category Field */}
            <Grid item xs={12}>
              <TextField
                select
                sx={{ width: '100%', mb:3 }}
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                variant="outlined"
                SelectProps={{
                  IconComponent: loadingCategories ? () => <CircularProgress size={20} /> : undefined
                }}
              >
                <MenuItem value="">Select category</MenuItem>
                {supplierCategories.map((cat) => (
                  <MenuItem key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Supplier Field */}
            <Grid item xs={12}>
              <TextField
                select
                sx={{ width: '100%', mb:3 }}
                label="Supplier"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                variant="outlined"
                SelectProps={{
                  IconComponent: loadingSuppliers ? () => <CircularProgress size={20} /> : undefined
                }}
              >
                <MenuItem value="">Select supplier</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Cost Price Field */}
            <Grid item xs={12}>
              <TextField
                sx={{ width: '100%', mb:3 }}
                label="Cost Price"
                name="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Quantity Field */}
            <Grid item xs={12}>
              <TextField
                sx={{ width: '100%', mb:3 }}
                label="Quantity in Stock"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>

            {/* Notes Field */}
            <Grid item xs={12}>
              <TextField
                sx={{ width: '100%', mb:3 }}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                placeholder="Add any additional notes..."
              />
            </Grid>

            {/* Status Field */}
            <Grid item xs={12}>
              <TextField
                select
                sx={{ width: '100%', mb:3 }}
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                variant="outlined"
              >
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              onClick={() => setOpen(false)} 
              variant="outlined"
              color="secondary"
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmit}
              sx={{ minWidth: 100 }}
            >
              {isSubmit ? "Processing..." : (editData ? "Update" : "Create")}
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
