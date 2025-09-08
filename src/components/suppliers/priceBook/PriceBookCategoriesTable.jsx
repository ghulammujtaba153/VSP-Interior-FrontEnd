"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { RemoveRedEye } from "@mui/icons-material";
import Link from "next/link";

const PriceBookCategoriesTable = ({ id }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/pricebook-categories/get/${id}`
      );
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [id]);

  const handleDelete = async (categoryId) => {
    toast.loading("Please wait...");
    try {
      await axios.delete(
        `${BASE_URL}/api/pricebook-categories/delete/${categoryId}`
      );
      toast.dismiss();
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category); // editing existing
    setCategoryName(category.name);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null); // new category
    setCategoryName("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    toast.loading("Please wait...");
    try {
      if (selectedCategory) {
        // Update
        await axios.put(
          `${BASE_URL}/api/pricebook-categories/update/${selectedCategory.id}`,
          { name: categoryName,
            supplierId: id
           }
        );
        toast.success("Category updated successfully");
      } else {
        // Add
        await axios.post(`${BASE_URL}/api/pricebook-categories/create`, {
          name: categoryName,
          supplierId: id
        });
        toast.success("Category added successfully");
      }
      toast.dismiss();
      setOpen(false);
      fetchCategories();
    } catch (error) {
      toast.dismiss();
      toast.error("Operation failed");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setCategoryName("");
  };

  // DataGrid columns
  const columns = [
    { field: "id", headerName: "ID", width: 120 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton color="primary">
            <Link href={`/suppliers/category/${params.row.id}`} passHref>
              <RemoveRedEye />
            </Link>
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div style={{ height: 400, width: "100%" }} component={Paper}>
      <h2 className="text-lg font-bold mb-4">Price Book Categories</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAdd}
        sx={{ mb: 2 }}
      >
        Add Category
      </Button>
      <DataGrid
        rows={categories}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
      />

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedCategory ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedCategory ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PriceBookCategoriesTable;
