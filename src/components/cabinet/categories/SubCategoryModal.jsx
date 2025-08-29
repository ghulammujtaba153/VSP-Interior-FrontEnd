"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { Edit, Delete, Add, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";

const SubCategoryModal = ({ open, handleClose, categoryId, editSubCategory, onSubCategoryChange }) => {
  const [data, setData] = useState({ name: "" });
  const [subCategories, setSubCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState(null);

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/cabinet-subcategories/get/${categoryId}`
      );
      setSubCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    if (open && categoryId) {
      fetchSubCategories();
      // Check if we're editing an existing subcategory
      if (editSubCategory) {
        setData({ name: editSubCategory.name });
        setSubCategoryId(editSubCategory.id);
        setEditMode(true);
      } else {
        // Reset form for new subcategory
        setData({ name: "" });
        setEditMode(false);
        setSubCategoryId(null);
      }
    }
  }, [open, categoryId, editSubCategory]);

  const handleSubmit = async () => {
    if (!data.name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    toast.loading("Please wait...");
    try {
      if (editMode) {
        await axios.put(
          `${BASE_URL}/api/cabinet-subcategories/update/${subCategoryId}`,
          {
            name: data.name,
            categoryId,
          }
        );
        toast.success("Subcategory updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/cabinet-subcategories/create`, {
          name: data.name,
          categoryId,
        });
        toast.success("Subcategory created successfully");
      }

      setData({ name: "" });
      setEditMode(false);
      setSubCategoryId(null);
      fetchSubCategories();
      
      // Call parent callback to refresh main table
      if (onSubCategoryChange) {
        onSubCategoryChange();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save subcategory"
      );
    } finally {
      toast.dismiss();
    }
  };

  const handleEdit = (subCategory) => {
    setData({ name: subCategory.name });
    setSubCategoryId(subCategory.id);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    toast.loading("Please wait...");
    try {
      await axios.delete(`${BASE_URL}/api/cabinet-subcategories/delete/${id}`);
      toast.success("Subcategory deleted successfully");
      fetchSubCategories();
      
      // Call parent callback to refresh main table
      if (onSubCategoryChange) {
        onSubCategoryChange();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete subcategory"
      );
    } finally {
      toast.dismiss();
    }
  };

  const handleModalClose = () => {
    setData({ name: "" });
    setEditMode(false);
    setSubCategoryId(null);
    handleClose();
  };

  const handleCancel = () => {
    if (editMode) {
      // If editing, reset to original data
      if (editSubCategory) {
        setData({ name: editSubCategory.name });
      }
    } else {
      // If adding new, clear the form
      setData({ name: "" });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {editMode ? "Edit Subcategory" : "Add New Subcategory"}
          </Typography>
          <IconButton onClick={handleModalClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Input for add/edit */}
        <Box mb={3}>
          <TextField
            fullWidth
            margin="normal"
            label="Subcategory Name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Enter subcategory name..."
            variant="outlined"
            size="medium"
            autoFocus
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Subcategories list */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Existing Subcategories ({subCategories.length})
          </Typography>
          
          {subCategories.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {subCategories.map((sub, index) => (
                <ListItem
                  key={sub.id}
                  divider={index < subCategories.length - 1}
                  secondaryAction={
                    <Box display="flex" gap={1}>
                      <IconButton 
                        onClick={() => handleEdit(sub)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(sub.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                  sx={{ py: 1.5 }}
                >
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight="medium">
                          {sub.name}
                        </Typography>
                        {editMode && sub.id === subCategoryId && (
                          <Chip label="Editing" color="warning" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        Created: {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                No subcategories found for this category.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="secondary"
        >
          {editMode ? "Reset" : "Clear"}
        </Button>
        <Button
          onClick={handleModalClose}
          variant="outlined"
        >
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!data.name.trim()}
          startIcon={editMode ? <Edit /> : <Add />}
        >
          {editMode ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryModal;
