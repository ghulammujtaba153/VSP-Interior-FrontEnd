"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
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
} from "@mui/material";
import { Add, CalendarToday, CheckCircle, AccessTime, Cancel, Search } from "@mui/icons-material";

const LeaveAvailability = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const leaveRequests = [
    {
      id: 1,
      employee: "Sarah Johnson",
      type: "Annual Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-19",
      days: 5,
      status: "Approved",
      reason: "Family vacation",
    },
    {
      id: 2,
      employee: "Michael Chen",
      type: "Sick Leave",
      startDate: "2024-01-22",
      endDate: "2024-01-23",
      days: 2,
      status: "Pending",
      reason: "Medical appointment",
    },
    {
      id: 3,
      employee: "Emma Williams",
      type: "Personal Leave",
      startDate: "2024-02-05",
      endDate: "2024-02-05",
      days: 1,
      status: "Rejected",
      reason: "Personal matters",
    },
    {
      id: 4,
      employee: "David Rodriguez",
      type: "Annual Leave",
      startDate: "2024-03-10",
      endDate: "2024-03-17",
      days: 6,
      status: "Pending",
      reason: "Extended weekend trip",
    },
  ];

  const leaveBalances = [
    { employee: "Sarah Johnson", annual: 15, sick: 8, personal: 3 },
    { employee: "Michael Chen", annual: 20, sick: 10, personal: 5 },
    { employee: "Emma Williams", annual: 12, sick: 6, personal: 2 },
    { employee: "David Rodriguez", annual: 18, sick: 9, personal: 4 },
  ];

  const filteredRequests = leaveRequests.filter(
    (request) =>
      request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusChip = (status) => {
    switch (status) {
      case "Approved":
        return <Chip icon={<CheckCircle />} label={status} color="success" size="small" />;
      case "Pending":
        return <Chip icon={<AccessTime />} label={status} color="warning" size="small" />;
      case "Rejected":
        return <Chip icon={<Cancel />} label={status} color="error" size="small" />;
      default:
        return <Chip label={status} variant="outlined" size="small" />;
    }
  };

  const getLeaveTypeChip = (type) => {
    switch (type) {
      case "Annual Leave":
        return <Chip label={type} color="primary" size="small" />;
      case "Sick Leave":
        return <Chip label={type} color="warning" size="small" />;
      case "Personal Leave":
        return <Chip label={type} color="info" size="small" />;
      default:
        return <Chip label={type} variant="outlined" size="small" />;
    }
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
          <Button variant="outlined" startIcon={<CalendarToday />}>
            View Calendar
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            New Request
          </Button>
        </Stack>
      </Stack>

      {/* Overview Cards */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>
                  2
                </Typography>
              </Box>
              <AccessTime fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Staff on Leave Today
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>
                  1
                </Typography>
              </Box>
              <CalendarToday fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Available Staff
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  12
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
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} /> }}
          />
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card sx={{ mb: 4 }}>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.employee}</TableCell>
                    <TableCell>{getLeaveTypeChip(request.type)}</TableCell>
                    <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Leave Balances Table */}
      <Card>
        <CardHeader title="Leave Balances" />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Annual Leave</TableCell>
                  <TableCell>Sick Leave</TableCell>
                  <TableCell>Personal Leave</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveBalances.map((balance, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{balance.employee}</TableCell>
                    <TableCell>
                      <Chip label={`${balance.annual} days`} color="primary" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${balance.sick} days`} color="warning" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${balance.personal} days`} color="info" variant="outlined" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LeaveAvailability;
