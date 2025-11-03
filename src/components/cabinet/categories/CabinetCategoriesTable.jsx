"use client";

import { BASE_URL } from "@/configs/url";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  IconButton, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  TextField,
  InputAdornment,
  TablePagination
} from "@mui/material";
import { 
  Delete, 
  Edit, 
  Visibility, 
  Category, 
  Add,
  Search,
  Clear
} from "@mui/icons-material";
import CabinetCategoriesModal from "./CabinetCategoriesModal";
import Link from "next/link";

const CabinetCategoriesTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit' | 'view'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (currentPage = page, currentRowsPerPage = rowsPerPage, search = '') => {
    try {
      setLoading(true);
      console.log("fetching data", currentPage, currentRowsPerPage, search);
      const response = await axios.get(`${BASE_URL}/api/cabinet-categories/get?page=${currentPage + 1}&limit=${currentRowsPerPage}&search=${search}`);
      setData(response.data.cabinetCategories);

      setTotalCount(response.data.total);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when page or rowsPerPage changes
  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [page, rowsPerPage]);

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id) => {
    toast.loading("Please wait...");
    try {
      await axios.delete(`${BASE_URL}/api/cabinet-categories/delete/${id}`);
      toast.success("Category deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      toast.dismiss();
    }
  };

  // Handle add/edit submit
  const handleSubmit = async (formData) => {
    toast.loading("Please wait...");
    try {
      if (modalMode === "add") {
        await axios.post(`${BASE_URL}/api/cabinet-categories/create`, formData);
        toast.success("Category added successfully");
      } else if (modalMode === "edit") {
        await axios.put(
          `${BASE_URL}/api/cabinet-categories/update/${selectedCategory.id}`,
          formData
        );
        toast.success("Category updated successfully");
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      toast.dismiss();
    }
  };

  // Pagination event handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Search event handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchApply = () => {
    setPage(0); // Reset to first page when searching
    fetchData(0, rowsPerPage, searchTerm);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setPage(0);
    fetchData(0, rowsPerPage, ''); // Immediately fetch all results when clearing
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchApply();
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Paper p={2} sx={{ padding: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Cabinet Categories</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenModal("add")}
        >
          Add Category
        </Button>
      </Box>

      {/* Search Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Search categories by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            variant="outlined"
            size="small"
            sx={{ width: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleSearchClear}
                    edge="end"
                    size="small"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSearchApply}
            sx={{ height: '40px' }}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSearchClear}
          >
            Reset
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {totalCount > 0 ? `${totalCount} categor${totalCount !== 1 ? 'ies' : 'y'} found` : 'No categories found'}
          {searchTerm && ` for "${searchTerm}"`}
        </Typography>
      </Box>

      {/* Category Modal */}
      <CabinetCategoriesModal
        open={openModal}
        handleClose={handleCloseModal}
        mode={modalMode}
        initialData={selectedCategory}
        onSubmit={handleSubmit}
      />

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow >
                <TableCell><strong>Category ID</strong></TableCell>
                <TableCell><strong>Category Name</strong></TableCell>
                <TableCell><strong>Subcategories</strong></TableCell>
                <TableCell><strong>Created Date</strong></TableCell>
                <TableCell><strong>Updated Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((category, index) => (
                <TableRow
                  key={category.id}
                  hover
                  // sx={{
                  //   backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                  //   '&:hover': {
                  //     backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#f9fafb',
                  //   }
                  // }}
                >
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.subCategories?.length || 0}
                      size="small"
                      color={category.subCategories?.length > 0 ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenModal("view", category)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal("edit", category)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      <Link href={`/cabinet/categories/sub-categories/${category.id}`} passHref>
                        <Button size="small" variant="outlined" color="primary">
                          Manage Sub Categories
                        </Button>
                      </Link>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100, 150]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Paper>
  );
};

export default CabinetCategoriesTable;