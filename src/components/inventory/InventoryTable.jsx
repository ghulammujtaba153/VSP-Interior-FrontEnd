"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import InventoryModal from "./InventoryModal";
import { toast } from "react-toastify";
import ViewInventoryModal from "./ViewInventoryModal";
import PermissionWrapper from "../PermissionWrapper";
import { useAuth } from "@/context/authContext";

const InventoryTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
const [viewData, setViewData] = useState(null);
const { user } = useAuth();

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
          userId: user.id
        }
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
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header with Add Item Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Inventory Table
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditData(null); // ✅ reset edit data for add mode
            setOpen(true);
          }}
        >
          Add Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Item Code</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Supplier Name</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.itemCode}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.supplier?.companyName || "N/A"}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>
                  <PermissionWrapper resource="inventory" action="canView">
                  <IconButton color="primary" onClick={() => {
                    setViewData(item);
                    setViewOpen(true);
                  }}>
                    <Visibility />
                  </IconButton>
                  </PermissionWrapper>

                  <PermissionWrapper resource="inventory" action="canEdit">
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      setEditData(item); // ✅ set for edit
                      setOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  </PermissionWrapper>

                  <PermissionWrapper resource="inventory" action="canDelete">
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                  </PermissionWrapper>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Box>
  );
};

export default InventoryTable;
