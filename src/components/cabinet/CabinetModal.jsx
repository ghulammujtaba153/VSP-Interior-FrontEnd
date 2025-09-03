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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import ConfirmationDialog from '../ConfirmationDialog';

const CabinetModal = ({ open, setOpen, editData, setEditData, onSuccess }) => {
  const [formData, setFormData] = useState({
    cabinetCategoryId: "",
    cabinetSubCategoryId: "",
    code: "",
    description: "",
    dynamicData: [],
    status: "active",
  });

  const [dynamicFields, setDynamicFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  // Fetch categories and subcategories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cabinet-categories/get`);
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/api/cabinet-subcategories/get/${categoryId}`);
      setSubCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (formData.cabinetCategoryId) {
      fetchSubCategories(formData.cabinetCategoryId);
    }
  }, [formData.cabinetCategoryId]);

  useEffect(() => {
    if (editData) {
      setFormData({
        cabinetCategoryId: editData.cabinetCategoryId || "",
        cabinetSubCategoryId: editData.cabinetSubCategoryId || "",
        code: editData.code || "",
        description: editData.description || "",
        dynamicData: editData.dynamicData || [],
        status: editData.status || "active",
      });
      
      // Convert dynamicData array to dynamicFields array
      if (editData.dynamicData && Array.isArray(editData.dynamicData)) {
        const fields = editData.dynamicData.map((item, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: item.columnName || "",
          value: item.value || ""
        }));
        setDynamicFields(fields);
      }
    } else {
      setFormData({
        cabinetCategoryId: "",
        cabinetSubCategoryId: "",
        code: "",
        description: "",
        dynamicData: [],
        status: "active",
      });
      setDynamicFields([]);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset subcategory when category changes
    if (name === 'cabinetCategoryId') {
      setFormData(prev => ({
        ...prev,
        cabinetSubCategoryId: "",
      }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.checked ? "active" : "inactive",
    }));
  };

  // Dynamic field management
  const addDynamicField = () => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      value: ""
    };
    setDynamicFields([...dynamicFields, newField]);
  };

  const removeDynamicField = (fieldId) => {
    setDynamicFields(dynamicFields.filter(field => field.id !== fieldId));
  };

  const updateDynamicField = (fieldId, field, value) => {
    setDynamicFields(dynamicFields.map(f => 
      f.id === fieldId ? { ...f, [field]: value } : f
    ));
  };

  // Convert dynamicFields array to dynamicData array (new format)
  const getDynamicDataArray = () => {
    const dynamicData = [];
    dynamicFields.forEach(field => {
      if (field.name && field.name.trim()) {
        dynamicData.push({
          columnName: field.name.trim(),
          value: field.value || ""
        });
      }
    });
    return dynamicData;
  };

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const validateForm = () => {
    if (!formData.cabinetCategoryId) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.cabinetSubCategoryId) {
      toast.error("Please select a subcategory");
      return false;
    }
    if (!formData.code) {
      toast.error("Please enter a cabinet code");
      return false;
    }
    if (!formData.description) {
      toast.error("Please enter a description");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const isCreateMode = !editData;
    const isEditMode = !!editData;

    if (isCreateMode) {
      showConfirmation({
        title: 'Create New Cabinet',
        message: `Are you sure you want to create a new cabinet with code "${formData.code}" in category "${categories.find(c => c.id === formData.cabinetCategoryId)?.name}"?`,
        action: () => submitCabinet(),
        severity: 'info'
      });
    } else if (isEditMode) {
      showConfirmation({
        title: 'Update Cabinet',
        message: `Are you sure you want to update cabinet "${formData.code}"? This will modify the existing cabinet information.`,
        action: () => submitCabinet(),
        severity: 'warning'
      });
    }
  };

  const submitCabinet = async () => {
    try {
      setLoading(true);
      toast.loading(editData ? "Updating cabinet..." : "Adding cabinet...");
      
      // Convert dynamic fields to array format
      const dynamicData = getDynamicDataArray();
      
      const submitData = {
        ...formData,
        userId: user.id,
        code: formData.code,
        cabinetCategoryId: parseInt(formData.cabinetCategoryId),
        cabinetSubCategoryId: parseInt(formData.cabinetSubCategoryId),
        dynamicData: dynamicData,
      };
      
      if (editData) {
        await axios.put(`${BASE_URL}/api/cabinet/update/${editData.id}`, submitData);
        toast.dismiss();
        toast.success("Cabinet updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/cabinet/create`, submitData);
        toast.dismiss();
        toast.success("Cabinet added successfully");
      }
      onSuccess();
      setOpen(false);
      setEditData(null);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error saving cabinet");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const getSubCategoryName = (subCategoryId) => {
    const subCategory = subCategories.find(s => s.id === subCategoryId);
    return subCategory ? subCategory.name : "Unknown Subcategory";
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {editData ? "Edit Item" : "Add New Item"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Category and Subcategory Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Category Information
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="cabinetCategoryId"
                value={formData.cabinetCategoryId}
                onChange={handleChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth required disabled={!formData.cabinetCategoryId}>
              <InputLabel>Subcategory</InputLabel>
              <Select
                name="cabinetSubCategoryId"
                value={formData.cabinetSubCategoryId}
                onChange={handleChange}
                label="Subcategory"
              >
                {subCategories.map((subCategory) => (
                  <MenuItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom color="primary">
              Cabinet Details
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              name="code"
              label="Cabinet Code"
              type="String"
              fullWidth
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter cabinet code"
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === "active"}
                  onChange={handleStatusChange}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Status</Typography>
                  <Chip 
                    label={formData.status} 
                    color={formData.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter cabinet description"
            />
          </Grid>

          {/* Dynamic Fields Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" color="primary">
                Additional Properties
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Add />}
                onClick={addDynamicField}
                size="small"
              >
                Add Field
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Add custom properties for this cabinet (optional)
            </Typography>
          </Grid>

          {/* Dynamic Fields */}
          {dynamicFields.length > 0 && (
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" gap={2}>
                {dynamicFields.map((field, index) => (
                  <Card key={field.id} variant="outlined">
                    <CardContent sx={{ py: 2, px: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            label="Field Name"
                            fullWidth
                            size="small"
                            value={field.name}
                            onChange={(e) => updateDynamicField(field.id, 'name', e.target.value)}
                            placeholder="e.g., Color, Style, Finish"
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            label="Field Value"
                            fullWidth
                            size="small"
                            value={field.value}
                            onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)}
                            placeholder="e.g., Brown, Modern, Matte"
                          />
                        </Grid>
                        <Grid item xs={2} display="flex" justifyContent="center">
                          <IconButton
                            color="error"
                            onClick={() => removeDynamicField(field.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          )}

          {dynamicFields.length === 0 && (
            <Grid item xs={12}>
              <Box 
                p={3} 
                textAlign="center" 
                border="2px dashed" 
                borderColor="divider" 
                borderRadius={2}
              >
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  No additional properties added yet
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Click "Add Field" to add custom properties like color, style, finish, etc.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={() => setOpen(false)} 
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
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