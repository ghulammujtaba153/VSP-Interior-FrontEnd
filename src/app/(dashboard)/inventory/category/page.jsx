"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Loader from "@/components/loader/Loader";

const InventoryCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Modal states
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
  });
  const [search, setSearch] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/inventory-category/get`);
      // Since the backend doesn't implement pagination/search yet in the provided requirement,
      // let's just handle it client-side or use the full list.
      const data = response.data || [];
      setCategories(data);
      setTotalCount(data.length);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    toast.loading("Please wait...");
    try {
      await axios.delete(`${BASE_URL}/api/inventory-category/delete/${categoryId}`);
      toast.dismiss();
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      status: category.status,
    });
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      status: "Active",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    toast.loading("Please wait...");
    try {
      if (selectedCategory) {
        await axios.put(
          `${BASE_URL}/api/inventory-category/update/${selectedCategory.id}`,
          formData
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/inventory-category/create`, formData);
        toast.success("Category added successfully");
      }
      toast.dismiss();
      setOpen(false);
      fetchCategories();
    } catch (error) {
      toast.dismiss();
      const errorMessage = error.response?.data?.error || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setFormData({ name: "", status: "Active" });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Inventory Categories
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <TextField
          label="Search Categories"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          sx={{ ml: "auto" }}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <Loader />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell><b>#</b></TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      <b>Name</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page * rowsPerPage) + index + 1}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(row)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(row.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredCategories.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>
          {selectedCategory ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryCategoryPage;