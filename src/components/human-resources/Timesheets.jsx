"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge as MuiBadge,
} from "@mui/material";
import {
  Search,
  Add,
  Download,
  AccessTime,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

const Timesheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const timesheets = [
    {
      id: 1,
      employee: "Sarah Johnson",
      weekEnding: "2024-01-14",
      totalHours: 42.5,
      regularHours: 40,
      overtimeHours: 2.5,
      project: "Office Complex - Building A",
      status: "Approved",
      submittedDate: "2024-01-15",
    },
    {
      id: 2,
      employee: "Michael Chen",
      weekEnding: "2024-01-14",
      totalHours: 45,
      regularHours: 40,
      overtimeHours: 5,
      project: "Residential Development",
      status: "Pending",
      submittedDate: "2024-01-15",
    },
    {
      id: 3,
      employee: "Emma Williams",
      weekEnding: "2024-01-14",
      totalHours: 38,
      regularHours: 38,
      overtimeHours: 0,
      project: "Safety Inspections",
      status: "Rejected",
      submittedDate: "2024-01-15",
    },
    {
      id: 4,
      employee: "David Rodriguez",
      weekEnding: "2024-01-14",
      totalHours: 40,
      regularHours: 40,
      overtimeHours: 0,
      project: "Infrastructure Project",
      status: "Approved",
      submittedDate: "2024-01-15",
    },
  ];

  const filteredTimesheets = timesheets.filter((ts) => {
    const matchesSearch =
      ts.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ts.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ts.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CheckCircle fontSize="small" color="success" />
            <Typography variant="body2" color="success.main">
              {status}
            </Typography>
          </Stack>
        );
      case "Pending":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTime fontSize="small" color="warning" />
            <Typography variant="body2" color="warning.main">
              {status}
            </Typography>
          </Stack>
        );
      case "Rejected":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Cancel fontSize="small" color="error" />
            <Typography variant="body2" color="error.main">
              {status}
            </Typography>
          </Stack>
        );
      default:
        return <Typography variant="body2">{status}</Typography>;
    }
  };

  return (
    <Container sx={{ py: 6 }}>
      {/* Header with Search and Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Timesheets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and approve employee hours
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} width={{ xs: "100%", sm: "auto" }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ borderColor: "divider" }}
          >
            Export
          </Button>
          <Button variant="contained" startIcon={<Add />} color="primary">
            New Timesheet
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by employee or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Timesheets Table */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">Recent Timesheets</Typography>}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Week Ending</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Regular</TableCell>
                  <TableCell>Overtime</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTimesheets.map((ts) => (
                  <TableRow key={ts.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{ts.employee}</TableCell>
                    <TableCell>{new Date(ts.weekEnding).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{ts.totalHours}h</TableCell>
                    <TableCell>{ts.regularHours}h</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: ts.overtimeHours > 0 ? 500 : "normal",
                        color: ts.overtimeHours > 0 ? "warning.main" : "inherit",
                      }}
                    >
                      {ts.overtimeHours}h
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
                      title={ts.project}
                    >
                      {ts.project}
                    </TableCell>
                    <TableCell>{getStatusBadge(ts.status)}</TableCell>
                    <TableCell color="text.secondary">
                      {new Date(ts.submittedDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {filteredTimesheets.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            No timesheets found matching your criteria.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Timesheets;
