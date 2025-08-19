"use client";

import { BASE_URL } from "@/configs/url";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../loader/Loader";
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
  Typography,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import CabinetModal from "./CabinetModal";
import ViewCabinet from "./ViewCabinet";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";

const CabinetTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const {user} = useAuth()

  
  const fetchCabinets = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cabinet/get`);
      setData(res.data.cabinet || []);
    } catch (error) {
      console.error("Error fetching cabinets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    toast.loading("Deleting Cabinet...")
    try {
      await axios.delete(`${BASE_URL}/api/cabinet/delete/${id}`, {
        data: {
          userId: user.id
        }
      })
      fetchCabinets()
      toast.dismiss()
      toast.success("Cabinet deleted successfully")
    } catch (error) {
      console.error("Error deleting cabinet:", error)
      toast.dismiss()
      toast.error("Error deleting cabinet")
    }
  }

  useEffect(() => {
    fetchCabinets();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <Loader />;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Cabinet Table
        </Typography>
        <Button variant="contained" color="primary" onClick={()=>{
            setEditData(null)
            setOpen(true)
        }}>
          Add Item
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Model Name</strong></TableCell>
              <TableCell><strong>Material</strong></TableCell>
              <TableCell><strong>Height</strong></TableCell>
              <TableCell><strong>Width</strong></TableCell>
              <TableCell><strong>Base Price</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((cabinet) => (
              <TableRow key={cabinet.id}>
                <TableCell>{cabinet.id}</TableCell>
                <TableCell>{cabinet.modelName}</TableCell>
                <TableCell>{cabinet.material}</TableCell>
                <TableCell>{cabinet.height}</TableCell>
                <TableCell>{cabinet.width}</TableCell>
                <TableCell>${cabinet.basePrice}</TableCell>
                <TableCell>{cabinet.status}</TableCell>
                <TableCell>{formatDate(cabinet.createdAt)}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={()=>{
                    setViewData(cabinet)
                    setViewOpen(true)
                  }}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="secondary" onClick={()=>{
                    setEditData(cabinet)
                    setOpen(true)
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={()=>{
                    handleDelete(cabinet.id)
                  }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CabinetModal
        open={open}
        setOpen={setOpen}
        editData={editData}
        setEditData={setEditData}
        onSuccess={fetchCabinets}
      />
      <ViewCabinet
        open={viewOpen}
        setOpen={setViewOpen}
        data={viewData}
      />
    </Box>
  );
};

export default CabinetTable;
