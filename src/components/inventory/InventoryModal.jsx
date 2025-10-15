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
  const [supplierPriceBooks, setSupplierPriceBooks] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supplierId: "",
    category: "",
    priceBookId: "",
    costPrice: "",
    quantity: "",
    notes: "",
    status: "active",
  });
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPriceBooks, setLoadingPriceBooks] = useState(false);
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
        priceBookId: editData.priceBooks?.id || editData.priceBookId || "",
        costPrice: editData.costPrice || editData.priceBooks?.price || "",
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
        priceBookId: "",
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
      const res = await axios.get(`${BASE_URL}/api/suppliers/get`);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch supplier categories when supplier changes
  const fetchSupplierCategories = async (supplierId) => {
    setLoadingCategories(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook-categories/get/${supplierId}`);
      setSupplierCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching supplier categories:", error);
      setSupplierCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch supplier pricebooks when category changes
  const fetchSupplierPriceBooks = async (categoryId) => {
    setLoadingPriceBooks(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/get/${categoryId}`);
      setSupplierPriceBooks(res.data || []);
    } catch (error) {
      console.error("Error fetching supplier pricebooks:", error);
      setSupplierPriceBooks([]);
    } finally {
      setLoadingPriceBooks(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // When supplier changes, fetch categories
  useEffect(() => {
    if (formData.supplierId) {
      fetchSupplierCategories(formData.supplierId);
      setFormData({ ...formData, category: "", priceBookId: "", costPrice: "" });
      setSupplierPriceBooks([]);
    }
  }, [formData.supplierId]);

  // When category changes, fetch pricebooks for priceBookId dropdown
  useEffect(() => {
    if (formData.category) {
      fetchSupplierPriceBooks(formData.category); // category is now id
      setFormData({ ...formData, priceBookId: "", costPrice: "" });
    }
  }, [formData.category]);

  // When priceBookId changes, set costPrice from selected pricebook
  useEffect(() => {
    if (formData.priceBookId && supplierPriceBooks.length > 0) {
      const selectedPriceBook = supplierPriceBooks.find(pb => pb.id === Number(formData.priceBookId));
      if (selectedPriceBook) {
        setFormData(prev => ({
          ...prev,
          costPrice: selectedPriceBook.price
        }));
      }
    }
  }, [formData.priceBookId, supplierPriceBooks]);

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
          width: 500,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          {editData ? "Edit Inventory Item" : "Add Inventory Item"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <TextField
                sx={{ minWidth: 120 }}
                select
                fullWidth
                label="Supplier"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
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
            <Grid item xs={12}>
              <TextField
              sx={{ minWidth: 120 }}
                select
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={!formData.supplierId}
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
            <Grid item xs={12}>
              <TextField
              sx={{ minWidth: 120 }}
                select
                fullWidth
                label="Price Book"
                name="priceBookId"
                value={formData.priceBookId}
                onChange={handleChange}
                required
                disabled={!formData.category}
                SelectProps={{
                  IconComponent: loadingPriceBooks ? () => <CircularProgress size={20} /> : undefined
                }}
              >
                <MenuItem value="">Select price book</MenuItem>
                {supplierPriceBooks.map((pb) => (
                  <MenuItem key={pb.id || pb._id} value={pb.id}>
                    {pb.name} ({pb.unit})
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
                label="Quantity in Stock"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
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
