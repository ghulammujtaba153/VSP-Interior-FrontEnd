"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  Search,
  Add,
  Download,
  AccessTime,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import Loader from "../loader/Loader";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";

const Timesheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch timesheets
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/employee-timesheet/get?Search=${searchTerm}`
      );
      setData(res.data.data || []);
      console.log("Fetched Timesheets:", res.data);
    } catch (error) {
      toast.error("Failed to fetch employee timesheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Update timesheet status
  const handleStatusUpdate = async (id, newStatus) => {
    toast.loading("loading...")
    try {
      await axios.put(`${BASE_URL}/api/employee-timesheet/update/${id}`, {
        status: newStatus,
      });
      toast.dismiss()
      toast.success(`Timesheet ${newStatus} successfully`);
      fetchData(); // refresh after update
    } catch (error) {
      toast.dismiss()
      console.error("Status update failed:", error);
      toast.error("Failed to update timesheet status");
    } 
  };

  // ✅ Filter by search + status
  const filteredTimesheets = data.filter((ts) => {
    const matchesSearch =
      ts.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ts.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      ts.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // ✅ Render status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CheckCircle fontSize="small" color="success" />
            <Typography variant="body2" color="success.main">
              Approved
            </Typography>
          </Stack>
        );
      case "pending":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTime fontSize="small" color="warning" />
            <Typography variant="body2" color="warning.main">
              Pending
            </Typography>
          </Stack>
        );
      case "rejected":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Cancel fontSize="small" color="error" />
            <Typography variant="body2" color="error.main">
              Rejected
            </Typography>
          </Stack>
        );
      default:
        return <Typography variant="body2">{status}</Typography>;
    }
  };

  if (loading) return <Loader />;

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
            Employee Timesheets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and approve employee working hours
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by employee name or email..."
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
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableCell>Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Break</TableCell>
                  <TableCell>Overwork</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTimesheets.map((ts) => (
                  <TableRow key={ts.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {ts.employee?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(ts.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{ts.startTime}</TableCell>
                    <TableCell>{ts.endTime}</TableCell>
                    <TableCell>{ts.breakTime}</TableCell>
                    <TableCell>{ts.overWork}</TableCell>
                    <TableCell>{getStatusBadge(ts.status)}</TableCell>

                    {/* ✅ Actions */}
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={ts.status?.toLowerCase() === "approved"}
                          onClick={() => handleStatusUpdate(ts.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          disabled={ts.status?.toLowerCase() === "rejected"}
                          onClick={() => handleStatusUpdate(ts.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </Stack>
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
