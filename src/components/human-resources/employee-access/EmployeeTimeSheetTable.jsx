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
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Stack,
  TablePagination,
  TextField,
  Divider
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Add as AddIcon,
  Timer,
  AssignmentTurnedIn,
  TrendingUp,
  Search
} from "@mui/icons-material";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

 

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
  }, [user.id]);

  const filteredData = (data || []).filter(item => 
    item.date?.includes(searchTerm) || 
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const stats = {
    total: data.length,
    overwork: data.filter(d => d.overWork && d.overWork !== "0").length,
    avgBreak: 30 // placeholder or calculate
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Entries</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{stats.total}</Typography>
              </Box>
              <AssignmentTurnedIn fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Overwork Logged</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>{stats.overwork} Days</Typography>
              </Box>
              <TrendingUp fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>98%</Typography>
              </Box>
              <Timer fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">Time Sheet Records</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search date..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
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
            </Stack>
          </Box>
          <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell><TableCell>Start Time</TableCell><TableCell>End Time</TableCell><TableCell>Break</TableCell><TableCell>Over Work</TableCell><TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.date}</TableCell><TableCell>{row.startTime}</TableCell><TableCell>{row.endTime}</TableCell><TableCell>{row.breakTime}</TableCell><TableCell>{row.overWork}</TableCell><TableCell align="center"><IconButton size="small" color="primary" onClick={() => { setSelected(row); setModalOpen(true); }}><EditIcon fontSize="small" /></IconButton></TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">No timesheets found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
    </CardContent>
  </Card>

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
