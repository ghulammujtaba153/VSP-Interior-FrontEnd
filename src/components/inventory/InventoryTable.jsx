"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import InventoryModal from "./InventoryModal";
import { toast } from "react-toastify";
import ViewInventoryModal from "./ViewInventoryModal";
import PermissionWrapper from "../PermissionWrapper";
import { useAuth } from "@/context/authContext";
import ImportCSV from "./ImportCSV";
import ConfirmationDialog from "../ConfirmationDialog";
import * as XLSX from "xlsx";

const InventoryTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const { user } = useAuth();
  const [importCSV, setImportCSV] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Pagination + search
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: "",
    message: "",
    action: null,
    severity: "warning",
  });

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({
      title: "",
      message: "",
      action: null,
      severity: "warning",
    });
  };

  const handleImportCSV = () => {
    showConfirmation({
      title: "Import Inventory",
      message:
        "Are you sure you want to import inventory items from Excel? This will add new inventory records to your database.",
      action: () => setImportCSV(true),
      severity: "info",
    });
  };

  const fetchData = async (currentPage = page, currentLimit = limit, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/inventory/get?page=${currentPage + 1}&limit=${currentLimit}&search=${searchTerm}&supplierId=${selectedSupplier}`
      );
      setData(res.data.inventory || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/suppliers/get`);
      setSuppliers(res.data.data || []);
      
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
    
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, []);

  // Refetch data when page or limit changes
  useEffect(() => {
    fetchData(page, limit, search);
    // eslint-disable-next-line
  }, [page, limit, selectedSupplier, search]);

  const handleDelete = (inventoryRow) => {
    showConfirmation({
      title: "Delete Inventory Item",
      message: `Are you sure you want to delete inventory item "${inventoryRow.name}"? This action cannot be undone and will remove all associated data.`,
      action: () => confirmDeleteInventory(inventoryRow.id),
      severity: "error",
    });
  };

  const confirmDeleteInventory = async (id) => {
    try {
      toast.loading("Deleting Inventory...");
      await axios.delete(`${BASE_URL}/api/inventory/delete/${id}`, {
        data: { userId: user.id },
      });
      toast.dismiss();
      toast.success("Inventory deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting inventory:", error);
      toast.dismiss();
      toast.error("Error deleting inventory");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().slice(0, 10);
  };

  // Export to Excel
  const handleExportExcel = () => {
    showConfirmation({
      title: "Export Inventory to Excel",
      message: `Are you sure you want to export ${data.length} inventory items to Excel? This will download a file with all inventory data.`,
      action: () => confirmExportExcel(),
      severity: "info",
    });
  };

  const confirmExportExcel = () => {
    const exportData = data.map((item) => ({
      ID: item.id,
      Name: item.name,
      Description: item.description,
      Category: item.category,
      Unit: item.unit,
      Quantity: item.quantity,
      Price: item.costPrice,
      Supplier: item.supplier?.companyName || "N/A",
      Status: item.status,
      Notes: item.notes,
      Date: item.createdAt ? formatDate(item.createdAt) : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "Inventory VSP.xlsx");
    toast.success("Inventory data exported successfully");
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
    fetchData(0, limit, '');
  };

  // Search event handlers
  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearchApply = () => {
    setPage(0);
    setSearch(searchInput);
    fetchData(0, limit, searchInput);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchApply();
    }
  };

  // Pagination logic for Table
  const paginatedData = data;

  if (loading && data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper p={3} sx={{ p: 4 }}>
      {/* Header with Add + Export + Search */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Inventory Table
        </Typography>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            placeholder="Search inventory..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
          <Button variant="contained" color="primary" onClick={handleSearchApply}>
            Apply
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetSearch}
          >
            Reset
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" color="primary" onClick={handleImportCSV}>
            Import Excel
          </Button>
          <Button variant="outlined" color="success" onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>


      <Select
        sx={{ minWidth: 200 }}
        label="Supplier"
          
        size="small"
        value={selectedSupplier}
        onChange={(e) => setSelectedSupplier(e.target.value)}
      >
        {suppliers.map((supplier) => (
          <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
        ))}
      </Select>

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 80, fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ minWidth: 160, fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ minWidth: 220, fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>Unit</TableCell>
              <TableCell sx={{ minWidth: 160, fontWeight: 'bold' }}>Supplier</TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ minWidth: 180, fontWeight: 'bold' }}>Notes</TableCell>
              <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ minWidth: 190, fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow 
                key={item.id}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                  '&:hover': {
                    backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#f9fafb',
                  }
                }}
              >
                <TableCell sx={{ minWidth: 80 }}>{item.id}</TableCell>
                <TableCell sx={{ minWidth: 160 }}>{item.name}</TableCell>
                <TableCell sx={{ minWidth: 220 }}>{item.description}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{item.category}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{item.unit}</TableCell>
                <TableCell sx={{ minWidth: 160 }}>{item.supplier?.name || "N/A"}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{item.costPrice}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{item.quantity}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: item.status === "active" ? "#e6f4ea" : "#f3f4f6",
                    color: item.status === "active" ? "#15803d" : "#6b7280",
                    fontWeight: 500,
                    fontSize: "0.85em"
                  }}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell sx={{ minWidth: 180 }}>{item.notes}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{formatDate(item.createdAt)}</TableCell>
                <TableCell sx={{ minWidth: 190 }}>
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setViewData(item);
                        setViewOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => {
                        setEditData(item);
                        setOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(item)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={rowCount}
        rowsPerPage={limit}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setLimit(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <ImportCSV open={importCSV} onClose={() => setImportCSV(false)} fetchData={fetchData} />

      <InventoryModal
        open={open}
        setOpen={setOpen}
        editData={editData}
        setEditData={setEditData}
        onSuccess={fetchData}
      />

      <ViewInventoryModal open={viewOpen} setOpen={setViewOpen} inventory={viewData} />

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={confirmationConfig.severity === "error" ? "Delete" : "Confirm"}
        cancelText="Cancel"
      />
    </Paper>
  );
};

export default InventoryTable;
