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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { RemoveRedEye } from "@mui/icons-material";
import Link from "next/link";

const PriceBookCategoriesTable = ({ id }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  
  // Version management states
  const [openVersionDialog, setOpenVersionDialog] = useState(false);
  const [versionAction, setVersionAction] = useState("new"); // "new" or "existing"
  const [selectedVersion, setSelectedVersion] = useState("v1");
  const [availableVersions, setAvailableVersions] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/pricebook-categories/get/${id}?search=${search}`
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
    fetchAvailableVersions();
  }, [id]);

  // Fetch available versions
  const fetchAvailableVersions = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/pricebook-categories/versions/${id}`
      );
      setAvailableVersions(response.data.versions || []);
    } catch (error) {
      console.error("Failed to fetch versions", error);
      setAvailableVersions(["v1"]); // Default fallback
    }
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

  const handleSubmit = () => {
    // Show version dialog before submitting
    setOpen(false);
    setOpenVersionDialog(true);
  };

  const handleVersionConfirm = async () => {
    toast.loading("Please wait...");
    try {
      // Calculate version based on selection
      let version = selectedVersion;
      if (versionAction === "new") {
        // Generate next version
        const maxVersion = availableVersions.length > 0 
          ? Math.max(...availableVersions.map(v => parseInt(v.replace('v', '')))) 
          : 0;
        version = `v${maxVersion + 1}`;
      }

      if (selectedCategory) {
        await axios.put(
          `${BASE_URL}/api/pricebook-categories/update/${selectedCategory.id}`,
          {
            name: categoryName,
            supplierId: id,
            version: version,
          }
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/pricebook-categories/create`, {
          name: categoryName,
          supplierId: id,
          version: version,
        });
        toast.success("Category added successfully");
      }
      toast.dismiss();
      setOpenVersionDialog(false);
      fetchCategories();
      fetchAvailableVersions();
      handleClose();
    } catch (error) {
      toast.dismiss();
      const errorMessage = error.response?.data?.error || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleSearch = () => {
    fetchCategories();
    fetchAvailableVersions();
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories();
      fetchAvailableVersions();
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
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAdd}
        sx={{ mb: 2 }}
      >
        Add Category
      </Button>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Version</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.version}</TableCell>
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
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version Selection Dialog */}
      <Dialog open={openVersionDialog} onClose={() => setOpenVersionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Version</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose whether to create a new version or update an existing one. 
            New versions will apply only to new tenders, while existing price books remain for old quotes.
          </Typography>
          
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Version Action</FormLabel>
            <RadioGroup
              value={versionAction}
              onChange={(e) => setVersionAction(e.target.value)}
            >
              <FormControlLabel 
                value="new" 
                control={<Radio />} 
                label="Create New Version (for new tenders)" 
              />
              <FormControlLabel 
                value="existing" 
                control={<Radio />} 
                label="Update Existing Version" 
              />
            </RadioGroup>
          </FormControl>

          {versionAction === "existing" && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>Select Version to Update</FormLabel>
              <Select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
              >
                {availableVersions.map((version) => (
                  <MenuItem key={version} value={version}>
                    {version}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {versionAction === "new" && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              A new version will be created automatically
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenVersionDialog(false);
            setOpen(true); // Go back to category form
          }} color="inherit">
            Back
          </Button>
          <Button onClick={handleVersionConfirm} color="primary" variant="contained">
            {selectedCategory ? "Update" : "Add"} Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PriceBookCategoriesTable;
