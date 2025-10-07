"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "@/components/loader/Loader";
import { BASE_URL } from "@/configs/url";
import EmployeeTimeSheetModal from "./EmployeeTimeSheetModal";
import { useAuth } from "@/context/authContext";

const EmployeeTimeSheetTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const {user} = useAuth()

 

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/employee-timesheet/get/employee/${user.id}`);
      setData(res.data.data || res.data || []);
    } catch (error) {
      toast.error("Failed to fetch employee timesheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Employee Time Sheets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          Add Time Sheet
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Break Time</TableCell>
              <TableCell>Over Work</TableCell>
              
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.startTime}</TableCell>
                <TableCell>{row.endTime}</TableCell>
                <TableCell>{row.breakTime}</TableCell>
                <TableCell>{row.overWork}</TableCell>
                
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelected(row);
                      setModalOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      {modalOpen && (
        <EmployeeTimeSheetModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fetchData={fetchData}
          editData={selected}
        />
      )}
    </Box>
  );
};

export default EmployeeTimeSheetTable;
