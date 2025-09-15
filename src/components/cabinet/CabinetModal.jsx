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
  Paper,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import ConfirmationDialog from '../ConfirmationDialog';
import { useParams } from "next/navigation";

const CabinetModal = ({ open, setOpen, editData, setEditData, onSuccess, existingDynamicColumns = [] }) => {
  const {id} = useParams();

  console.log("cabinet modal", existingDynamicColumns)
  console.log("editData", editData)

  
  const [formData, setFormData] = useState({
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

  const fetchSubCategories = async (id) => {
    if (!id) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/api/cabinet-subcategories/get/${id}`);
      setSubCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, id]);

  useEffect(() => {
    if (id) {
      fetchSubCategories(id);
    }
  }, [id]);

  useEffect(() => {
    if (editData) {

      console.log("editData in useEffect", editData)
      setFormData({
        cabinetSubCategoryId: editData.cabinetSubCategoryId || "",
        code: editData.code || "",
        description: editData.description || "",
        dynamicData: editData.dynamicData ,
        status: editData.status || "active",
      });

      // Fixed dynamic field mapping for arrayList format
      let fields = [];
      if (editData.dynamicData && editData.dynamicData.arrayList) {
        fields = editData.dynamicData.arrayList.map((item, index) => ({
          id: `existing_${index}`,
          name: item.label || "",
          value: item.value || ""
        }));
      }

      console.log("fields", fields)
      setDynamicFields(fields);
    } else {
      setFormData({
        cabinetSubCategoryId: "",
        code: "",
        description: "",
        dynamicData: [],
        status: "active",
      });

      console.log("fields empty", )
      setDynamicFields([]);
    }
  }, [editData]);

  // When modal opens, if no dynamicFields and existingDynamicColumns present, pre-populate fields
  useEffect(() => {
    if (open && !editData && dynamicFields.length === 0 && existingDynamicColumns.length > 0) {
      // Pre-populate all dynamic columns as empty fields only for new items
      setDynamicFields(
        existingDynamicColumns.map((col, index) => ({
          id: `new_${index}`,
          name: col,
          value: ""
        }))
      );
    }
  }, [open, existingDynamicColumns, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
          label: field.name.trim(),
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
        message: `Are you sure you want to create a new cabinet with code "${formData.code}"?`,
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
        cabinetCategoryId: parseInt(id),
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
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="h2" fontWeight="bold">
            {editData ? "Edit Cabinet" : "Add New Cabinet"}
          </Typography>
          <Chip 
            icon={<Edit />}
            label={editData ? "Edit Mode" : "Create Mode"}
            color={editData ? "warning" : "success"}
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={4}>
            {/* Subcategory Selection */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                  📂 Category Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
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
                </Grid>
              </Paper>
            </Grid>

            {/* Cabinet Details */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                  🗄️ Cabinet Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="code"
                      label="Cabinet Code"
                      fullWidth
                      required
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Enter cabinet code"
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                          <Typography variant="body1" fontWeight={500}>Status</Typography>
                          <Chip 
                            label={formData.status} 
                            color={formData.status === "active" ? "success" : "error"}
                            size="small"
                            variant="filled"
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
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Dynamic Fields Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      ⚙️ Additional Properties
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add custom properties for this cabinet (optional)
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={addDynamicField}
                    size="medium"
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Add Property
                  </Button>
                </Box>

                {/* Render all fields as input fields */}
                {dynamicFields.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {dynamicFields.map((field, index) => (
                      <Card key={field.id} variant="outlined" sx={{ 
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: 3,
                          transition: 'box-shadow 0.3s ease'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} sm={1}>
                              <Typography 
                                variant="body2" 
                                color="primary" 
                                fontWeight={600}
                                textAlign="center"
                              >
                                #{index + 1}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={5}>
                              <TextField
                                label="Property Name"
                                fullWidth
                                value={field.name}
                                onChange={(e) => updateDynamicField(field.id, 'name', e.target.value)}
                                placeholder="e.g., Color, Style, Finish"
                                variant="outlined"
                                size="medium"
                              />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                              <TextField
                                label="Property Value"
                                fullWidth
                                value={field.value}
                                onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)}
                                placeholder="e.g., Brown, Modern, Matte"
                                variant="outlined"
                                size="medium"
                              />
                            </Grid>
                            <Grid item xs={12} sm={1} display="flex" justifyContent="center">
                              <IconButton
                                color="error"
                                onClick={() => removeDynamicField(field.id)}
                                size="medium"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#ffebee',
                                  }
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box 
                    p={4} 
                    textAlign="center" 
                    border="2px dashed" 
                    borderColor="divider" 
                    borderRadius={3}
                    sx={{
                      backgroundColor: '#fafafa',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        transition: 'background-color 0.3s ease'
                      }
                    }}
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No additional properties added yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Click "Add Property" to add custom attributes like color, style, finish, etc.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2, backgroundColor: '#fafafa' }}>
        <Button 
          onClick={() => setOpen(false)} 
          variant="outlined"
          disabled={loading}
          size="large"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 100
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
          size="large"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 100
          }}
        >
          {editData ? "Update Cabinet" : "Save Cabinet"}
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