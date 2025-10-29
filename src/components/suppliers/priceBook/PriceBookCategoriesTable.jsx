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
  CircularProgress,
  Typography,
  TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { RemoveRedEye } from "@mui/icons-material";
import Link from "next/link";
import Loader from "@/components/loader/Loader";

const PriceBookCategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/pricebook-categories/get${search ? `?search=${search}` : ''}`
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
  }, []);

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
    setSelectedCategory(category);
    setCategoryName(category.name);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    toast.loading("Please wait...");
    try {
      if (selectedCategory) {
        await axios.put(
          `${BASE_URL}/api/pricebook-categories/update/${selectedCategory.id}`,
          {
            name: categoryName.trim(),
          }
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/pricebook-categories/create`, {
          name: categoryName.trim(),
        });
        toast.success("Category added successfully");
      }
      toast.dismiss();
      setOpen(false);
      fetchCategories();
      handleClose();
    } catch (error) {
      toast.dismiss();
      const errorMessage = error.response?.data?.error || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories();
    }, 500); // 500ms debounce delay
  
    return () => clearTimeout(delayDebounce);
  }, [search]);
  

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setCategoryName("");
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Slice data for current page
  const paginatedData = categories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Price Book Categories
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleClearSearch}
        >
          Clear
        </Button>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          Search
        </Button> */}

        <Button
        variant="contained"
        color="primary"

        onClick={handleAdd}
        sx={{ mb: 2, ml: "auto" }}
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
              <TableHead>
                <TableRow>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
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
                        <Link href={`/suppliers/category/${row.id}`} passHref>
                          <IconButton color="primary">
                            <RemoveRedEye />
                          </IconButton>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={categories.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </>
        )}
      </TableContainer>

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
    </Box>
  );
};

export default PriceBookCategoriesTable;
