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
} from "@mui/material";
import {
  Add,
  CalendarToday,
  CheckCircle,
  AccessTime,
  Cancel,
  Search,
} from "@mui/icons-material";
import Loader from "../loader/Loader";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import ViewRequestModal from "./ViewRequestModal";
import { useAuth } from "@/context/authContext";
import Link from "next/link";

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

  const allEmployeeIds = Array.from(new Set(data.map((leave) => leave.employeeId)));
  const employeeIdsOnLeaveToday = new Set(
    data
      .filter(
        (leave) =>
          leave.status?.toLowerCase() === "approved" &&
          leave.startDate <= todayStr &&
          leave.endDate >= todayStr
      )
      .map((leave) => leave.employeeId)
  );
  

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

  // Handler to open view modal
  const handleView = (request) => {
    setSelectedRequest(request);
    setViewOpen(true);
  };

  return (
    <Container sx={{ py: 6 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Leave & Availability
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage leave requests and staff availability
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Link href="/human-resource/calendar" passHref>
            <Button variant="outlined" startIcon={<CalendarToday />}>
              View Calendar
            </Button>
          </Link>
          
          {/* <Button variant="contained" startIcon={<Add />}>
            New Request
          </Button> */}
        </Stack>
      </Stack>

      {/* Overview Cards */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>
                  {pendingRequests}
                </Typography>
              </Box>
              <AccessTime fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Staff on Leave Today
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>
                  {staffOnLeaveToday}
                </Typography>
              </Box>
              <CalendarToday fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Available Staff
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  {availableStaff}
                </Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search leave requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader title="Recent Leave Requests" />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Action</TableCell> {/* <-- Added Action column */}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      {request.employeeName || request.employee?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {getLeaveTypeChip(request.leaveType || request.type)}
                    </TableCell>
                    <TableCell>
                      {request.startDate
                        ? new Date(request.startDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {request.endDate
                        ? new Date(request.endDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {request.days ??
                        (request.startDate && request.endDate
                          ? Math.floor(
                              (new Date(request.endDate) -
                                new Date(request.startDate)) /
                                (1000 * 60 * 60 * 24)
                            ) + 1
                          : "-")}
                    </TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleView(request)}
                      >
                        View
                      </Button>
                    </TableCell>
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
