"use client";

import Loader from '@/components/loader/Loader';
import apiClient from '@/lib/axios';
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
import { useAuth } from '@/context/authContext';

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, approved: 0, pending: 0, usedDays: 0 });

  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        search: debouncedSearch,
      });
      const leaveRes = await apiClient.get(`/api/employee-leave/get/employee/${user.id}?${params}`);
      setData(leaveRes.data.employeeLeave || []);
      setTotal(leaveRes.data.total || 0);
      setChartData(leaveRes.data.chartLeaves || leaveRes.data.employeeLeave || []);
      setSummary(leaveRes.data.summary || { total: 0, approved: 0, pending: 0, usedDays: 0 });
      setBalances(leaveRes.data.balances || []);
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
      await apiClient.delete(`/api/employee-leave/delete/${id}`);
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
  }, [user?.id, page, rowsPerPage, debouncedSearch]);

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
    total: summary.total,
    approved: summary.approved,
    pending: summary.pending,
    usedDays: summary.usedDays,
  };
  const annualBalance = balances.find((b) => b.leaveType === 'annual') || balances[0];
  const entitled = Number(annualBalance?.entitled ?? annualBalance?.remaining + annualBalance?.used ?? 0);
  const remaining = Number(annualBalance?.remaining ?? Math.max(0, entitled - stats.usedDays));

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
         <EmployeeLeaveCharts data={chartData} entitled={entitled} remaining={remaining} />
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
                <Typography variant="h5" color="success.main" fontWeight={600}>{remaining} Days</Typography>
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
            {data.map((leave) => (
              <TableRow key={leave.id} hover>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.startDate}</TableCell>
                <TableCell>{leave.endDate}</TableCell>
                <TableCell>{getNumDays(leave.startDate, leave.endDate)}</TableCell>
                <TableCell>{getStatusChip(leave.status)}</TableCell>
                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    {leave.status?.toLowerCase() === 'pending' && (
                      <>
                        <IconButton size="small" color="primary" onClick={() => { setEditLeave(leave); setOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(leave.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">No leave records found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
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
