"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  Grid,
  Avatar,
} from "@mui/material";
import {
  CalendarToday,
  CheckCircle,
  AccessTime,
  Cancel,
  Search,
  Groups,
  EventBusy,
  FactCheck,
  History,
} from "@mui/icons-material";
import Loader from "../loader/Loader";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import ViewRequestModal from "./ViewRequestModal";
import { useAuth } from "@/context/authContext";
import Link from "next/link";

import LeaveCharts from "./LeaveCharts";

const LeaveAvailability = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const { user } = useAuth();

  // Pagination states
  const [page, setPage] = useState(0); // MUI uses 0-based index
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [availableStaff, setAvailableStaff] = useState(0);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/employee-leave/get?page=${page + 1}&limit=${limit}&search=${searchTerm}`
      );
      setData(res.data.employeeLeaves || []);
      setAvailableStaff(res.data.availableStaff || 0);
      setTotal(res.data.total || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [page, limit, searchTerm]);

  if (loading) return <Loader />;

  // --- Stats Calculation ---
  const todayStr = new Date().toISOString().split("T")[0];

  const pendingRequests = data.filter(
    (leave) => leave.status?.toLowerCase() === "pending"
  ).length;

  const staffOnLeaveToday = data.filter(
    (leave) =>
      leave.status?.toLowerCase() === "approved" &&
      leave.startDate <= todayStr &&
      leave.endDate >= todayStr
  ).length;

  // --- Chips ---
  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <Chip
            icon={<CheckCircle />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      case "pending":
        return (
          <Chip
            icon={<AccessTime />}
            label="Pending"
            color="warning"
            size="small"
          />
        );
      case "rejected":
        return (
          <Chip icon={<Cancel />} label="Rejected" color="error" size="small" />
        );
      default:
        return <Chip label={status || "-"} variant="outlined" size="small" />;
    }
  };

  const getLeaveTypeChip = (type) => {
    switch (type?.toLowerCase()) {
      case "annual leave":
        return <Chip label={type} color="primary" size="small" />;
      case "sick":
      case "sick leave":
        return <Chip label={type} color="warning" size="small" />;
      case "personal leave":
        return <Chip label={type} color="info" size="small" />;
      default:
        return <Chip label={type || "-"} variant="outlined" size="small" />;
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/api/employee-leave/update/${id}`, { status });
      fetch();
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  // Handler to open view modal
  const handleView = (request) => {
    setSelectedRequest(request);
    setViewOpen(true);
  };

  return (
    <Container maxWidth={false} sx={{ py: 6 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={5}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Leave & Availability
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Insights and management for staff leave and presence
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
           <Button variant="outlined" startIcon={<History />} onClick={() => fetch()} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Link href="/human-resource/calendar" style={{ textDecoration: 'none' }}>
            <Button variant="contained" startIcon={<CalendarToday />} sx={{ borderRadius: 2 }}>
              Organization Planner
            </Button>
          </Link>
        </Stack>
      </Stack>

      {/* Overview Cards (Rect Section) */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, borderTop: '4px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Pending Requests</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={700}>{pendingRequests}</Typography>
              </Box>
              <FactCheck fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, borderTop: '4px solid', borderColor: 'error.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>On Leave Today</Typography>
                <Typography variant="h5" color="error.main" fontWeight={700}>{staffOnLeaveToday}</Typography>
              </Box>
              <EventBusy fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, borderTop: '4px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Available Team</Typography>
                <Typography variant="h5" color="success.main" fontWeight={700}>{availableStaff}</Typography>
              </Box>
              <Groups fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* 📊 Data Visualization */}
      <LeaveCharts data={data} />

      {/* Search & Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search staff, reason, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Link href="/human-resource/calendar" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="outlined" startIcon={<CalendarToday />} sx={{ height: 40 }}>
                  View Planner
                </Button>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader title="Recent Leave Requests" />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell><TableCell>Type</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell>Days</TableCell><TableCell>Status</TableCell><TableCell>Reason</TableCell><TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.employeeName || request.employee?.name || "-"}</TableCell><TableCell>{getLeaveTypeChip(request.leaveType || request.type)}</TableCell><TableCell>{request.startDate ? new Date(request.startDate).toLocaleDateString() : "-"}</TableCell><TableCell>{request.endDate ? new Date(request.endDate).toLocaleDateString() : "-"}</TableCell><TableCell>{request.days ?? (request.startDate && request.endDate ? Math.floor((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1 : "-")}</TableCell><TableCell>{getStatusChip(request.status)}</TableCell><TableCell>{request.reason}</TableCell><TableCell align="center"><Box display="flex" justifyContent="center" gap={1}><Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); handleAction(request.id, "approved"); }}>Approve</Button><Button size="small" variant="contained" color="error" onClick={(e) => { e.stopPropagation(); handleAction(request.id, "rejected"); }}>Reject</Button></Box></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>

      {/* View/Update Status Modal */}
      <ViewRequestModal
        fetch={fetch}
        user={user}
        selectedRequest={selectedRequest}
        setOpen={setViewOpen}
        open={viewOpen}
      />
    </Container>
  );
};

export default LeaveAvailability;
