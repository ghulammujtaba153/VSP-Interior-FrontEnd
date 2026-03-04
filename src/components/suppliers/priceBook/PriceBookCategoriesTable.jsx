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
  TableSortLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import Loader from "@/components/loader/Loader";
import useTableZoom from "@/hooks/useTableZoom";
import TableZoom from "@/components/TableZoom";

const PriceBookCategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { zoom, handleZoomChange, zoomStyle } = useTableZoom('pricebook_categories_zoom');

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
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/pricebook-categories/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}&sortBy=${orderBy}&order=${order}`
      );
      setCategories(response.data.priceBookCategories || []);
      setTotalCount(response.data.total || 0);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, orderBy, order]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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
    setPage(0);
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          sx={{ mb: 2, ml: "auto" }}
        >
          Add Category
        </Button>
        <Box sx={{ mb: 2 }}>
          <TableZoom zoom={zoom} onZoomChange={handleZoomChange} />
        </Box>

      </Box>

      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Box sx={zoomStyle}>
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'id'}
                      direction={orderBy === 'id' ? order : 'asc'}
                      onClick={() => handleSort('id')}
                    >
                      <b>#</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      <b>Name</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{(page * rowsPerPage) + index + 1}</TableCell>
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
                        <Button component={Link} href={`/suppliers/category/${row.id}`} variant="outlined" color="primary" size="small"> 
                          Manage Price Books
                        </Button>
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
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20, 50, 100]}
            />
          </>
        )}
      </TableContainer>
      </Box>

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
    </Box>
  );
};

export default PriceBookCategoriesTable;
