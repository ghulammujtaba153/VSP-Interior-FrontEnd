"use client";

import Loader from '@/components/loader/Loader';
import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, TextField, TablePagination,
  Grid, Card, CardContent, Typography, Avatar, Box, Stack, Chip
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  EventAvailable,
  EventBusy,
  PendingActions,
  Search,
  CheckCircle
} from "@mui/icons-material";
import EmployeeLeaveModal from './EmployeeLeaveModal';
import { toast } from 'react-toastify';

const ROWS_PER_PAGE = 5;

import EmployeeLeaveCharts from './EmployeeLeaveCharts';

const EmployeeLeaveTable = () => {
  const theme = useTheme();
  // ... state ...
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employee-leave/get/${user.id}`);
      setData(res.data.employeeLeave || res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    toast.loading("Please wait...");
    try {
      await axios.post(`${BASE_URL}/api/employee-leave/delete`, {
        id, userId: user.id
      });
      toast.dismiss();
      toast.success("Leave deleted successfully");
      fetchData();
    } catch (error) {
      toast.dismiss();
      toast.error("Error deleting leave");
      console.error("Error deleting leave:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const ROWS_PER_PAGE = 5;

  // Filtered data for search
  const filteredData = (data || []).filter(
    (leave) =>
      leave.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
      leave.status?.toLowerCase().includes(search.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const paginatedData = filteredData.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Helper to calculate number of days between two dates (inclusive)
  const getNumDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    return diffTime >= 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
  };

  // Stats calculation
  const stats = {
    total: data.length,
    approved: data.filter(l => l.status?.toLowerCase() === 'approved').length,
    pending: data.filter(l => l.status?.toLowerCase() === 'pending').length,
    usedDays: data.filter(l => l.status?.toLowerCase() === 'approved').reduce((acc, l) => acc + (getNumDays(l.startDate, l.endDate) || 0), 0)
  };
  const REMAINING_LIMIT = 20;
  const balance = Math.max(0, REMAINING_LIMIT - stats.usedDays);

  const getStatusChip = (status) => {
    const s = status?.toLowerCase();
    let color = "default";
    if (s === "approved") color = "success";
    if (s === "pending") color = "warning";
    if (s === "rejected") color = "error";
    return <Chip label={status} color={color} size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />;
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <Box mb={4}>
         <EmployeeLeaveCharts data={data} />
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Request History</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{stats.total}</Typography>
              </Box>
              <PendingActions fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Allowance Spent</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>{stats.usedDays} Days</Typography>
              </Box>
              <EventAvailable fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Available Balance</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{balance} Days</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            setEditLeave(null);
            setOpen(true);
          }}
          sx={{ borderRadius: 2 }}
        >
          Request Leave
        </Button>
        <TextField
          size="small"
          placeholder="Filter leave records..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ minWidth: 260 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell><TableCell>Start Date</TableCell><TableCell>End Date</TableCell><TableCell>No. Days</TableCell><TableCell>Status</TableCell><TableCell>Reason</TableCell><TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((leave) => (
              <TableRow key={leave.id} hover>
                <TableCell>{leave.leaveType}</TableCell><TableCell>{leave.startDate}</TableCell><TableCell>{leave.endDate}</TableCell><TableCell>{getNumDays(leave.startDate, leave.endDate)}</TableCell><TableCell>{getStatusChip(leave.status)}</TableCell><TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</TableCell><TableCell align="center"><Stack direction="row" spacing={0.5} justifyContent="center"><IconButton size="small" color="primary" onClick={() => { setEditLeave(leave); setOpen(true); }}><EditIcon fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => handleDelete(leave.id)}><DeleteIcon fontSize="small" /></IconButton></Stack></TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">No leave records found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
        />
      </TableContainer>

      {/* Leave Request/Edit Modal */}
      <EmployeeLeaveModal
        open={open}
        handleClose={() => {
          setOpen(false);
          setEditLeave(null);
        }}
        onLeaveAdded={fetchData}
        editLeave={editLeave}
      />
    </Box>
  );
};

export default EmployeeLeaveTable;
