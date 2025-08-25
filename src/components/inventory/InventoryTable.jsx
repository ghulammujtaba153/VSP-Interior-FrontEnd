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
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import InventoryModal from "./InventoryModal";
import { toast } from "react-toastify";
import ViewInventoryModal from "./ViewInventoryModal";
import PermissionWrapper from "../PermissionWrapper";
import { useAuth } from "@/context/authContext";
import { DataGrid } from "@mui/x-data-grid";
import ImportCSV from "./ImportCSV";
import ConfirmationDialog from "../ConfirmationDialog";
import * as XLSX from "xlsx"; // ✅ Import XLSX

const InventoryTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0); // ✅ total records count
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const { user } = useAuth();
  const [importCSV, setImportCSV] = useState(false);

  // ✅ pagination + search
  const [page, setPage] = useState(0); // DataGrid is 0-based
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // ✅ Confirmation dialog states
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/inventory/get?page=${page + 1}&limit=${limit}&search=${search}`
      );
      setData(res.data.inventory || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 500); // debounce search

    return () => clearTimeout(delayDebounce);
  }, [page, limit, search]);

  const handleDelete = (inventoryRow) => {
    showConfirmation({
      title: "Delete Inventory Item",
      message: `Are you sure you want to delete inventory item "${inventoryRow.name}" (${inventoryRow.itemCode})? This action cannot be undone and will remove all associated data.`,
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

  // ✅ Export to Excel
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
      "Item Code": item.itemCode,
      Name: item.name,
      Category: item.category,
      Unit: item.unit,
      Quantity: item.quantity,
      Price: item.costPrice,
      "Minimun Threshold": item.minThreshold,
      "Maximum Threshold": item.maxThreshold,
      Supplier: item.supplier?.companyName || "N/A",
      Date: item.createdAt ? formatDate(item.createdAt) : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory.xlsx");
    toast.success("Inventory data exported successfully");
  };

  const handleResetSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  if (loading && data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "itemCode", headerName: "Item Code", flex: 1.2 },
    { field: "name", headerName: "Name", flex: 1.5 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "unit", headerName: "Unit", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "costPrice", headerName: "Price", flex: 1 },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <PermissionWrapper resource="inventory" action="canView">
            <IconButton
              color="primary"
              onClick={() => {
                setViewData(params.row);
                setViewOpen(true);
              }}
            >
              <Visibility />
            </IconButton>
          </PermissionWrapper>
          <PermissionWrapper resource="inventory" action="canEdit">
            <IconButton
              color="secondary"
              onClick={() => {
                setEditData(params.row);
                setOpen(true);
              }}
            >
              <Edit />
            </IconButton>
          </PermissionWrapper>
          <PermissionWrapper resource="inventory" action="canDelete">
            <IconButton color="error" onClick={() => handleDelete(params.row)}>
              <Delete />
            </IconButton>
          </PermissionWrapper>
        </Box>
      ),
    },
  ];

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
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button variant="outlined" color="primary" onClick={() => {
              setPage(0) // reset to first page
              setSearch(searchInput) // ✅ apply search
            }}
          >
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

      <Paper>
        <DataGrid
          rows={data.map((item) => ({
            ...item,
            supplierName: item.supplier?.companyName || "N/A",
            id: item.id,
          }))}
          columns={columns}
          autoHeight
          pagination
          paginationMode="server"
          rowCount={rowCount}
          page={page}
          pageSize={limit}
          rowsPerPageOptions={[5, 10, 20]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newLimit) => setLimit(newLimit)}
          disableRowSelectionOnClick
          loading={loading}
        />
      </Paper>

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
