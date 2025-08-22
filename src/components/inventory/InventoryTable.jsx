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
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import InventoryModal from "./InventoryModal";
import { toast } from "react-toastify";
import ViewInventoryModal from "./ViewInventoryModal";
import PermissionWrapper from "../PermissionWrapper";
import { useAuth } from "@/context/authContext";
import { DataGrid } from "@mui/x-data-grid";
import ImportCSV from "./ImportCSV";

// ✅ Import XLSX
import * as XLSX from "xlsx";

const InventoryTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const { user } = useAuth();
  const [importCSV, setImportCSV] = useState(false);



  const handleImportCSV = () => {
    setImportCSV(true);
  }

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/inventory/get`);
      setData(res.data.inventory || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      toast.loading("Deleting Inventory...");
      await axios.delete(`${BASE_URL}/api/inventory/delete/${id}`, {
        data: {
          userId: user.id,
        },
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
    const exportData = data.map((item) => ({
      "ID": item.id,
      "Item Code": item.itemCode,
      "Name": item.name,
      "Category": item.category,
      "Unit": item.unit,
      "Quantity": item.quantity,
      "Price": item.costPrice,
      "Minimun Threshold": item.minThreshold,
      "Maximum Threshold": item.maxThreshold,
      "Supplier": item.supplier?.companyName || "N/A",
      "Date": item.createdAt ? formatDate(item.createdAt) : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory.xlsx");
  };

  if (loading) {
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
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <Delete />
            </IconButton>
          </PermissionWrapper>
        </Box>
      ),
    },
  ];

  return (
    <Paper p={3} sx={{ p: 4 }}>
      {/* Header with Add + Export Buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Inventory Table
        </Typography>
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
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Paper>


      <ImportCSV
        open={importCSV}
        onClose={() => setImportCSV(false)}
        fetchData={fetchData}
      />

      {/* Modal for Add/Edit */}
      <InventoryModal
        open={open}
        setOpen={setOpen}
        editData={editData}
        setEditData={setEditData}
        onSuccess={fetchData}
      />

      <ViewInventoryModal
        open={viewOpen}
        setOpen={setViewOpen}
        inventory={viewData}
      />
    </Paper>
  );
};

export default InventoryTable;
