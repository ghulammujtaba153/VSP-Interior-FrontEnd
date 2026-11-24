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
  TablePagination,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search,
  Add,
  Download,
  AccessTime,
  CheckCircle,
  Cancel,
  Timer,
  CalendarMonth,
  History,
  PendingActions,
  TrendingUp,
} from "@mui/icons-material";
import Loader from "../loader/Loader";
import apiClient from "@/lib/axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import Link from "next/link";
import TimeSheetHeatMap from "./TimeSheetHeatMap";
import TimeSheetCharts from "./TimeSheetCharts";
import EmployeePicker from "./EmployeePicker";
import PermissionWrapper from "@/components/PermissionWrapper";

const Timesheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDefaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Global data for stats & charts
  const [globalData, setGlobalData] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    pending: 0,
    approvedTotal: 0,
    avgWorkload: 0
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [newTimesheet, setNewTimesheet] = useState({
    employeeId: "",
    date: getTodayDate(),
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 30,
    status: "draft",
  });

  // Stats for the "Rect" section (Now decoupled from filters) - UNUSED anymore, using globalStats

  // ✅ Simplified Helper: Just Start to End
  const calculateNetHours = (start, end) => {
    if (!start || !end) return 0;
    try {
      const s = new Date(`1970-01-01T${start}`);
      const e = new Date(`1970-01-01T${end}`);
      let diff = (e - s) / (1000 * 60 * 60); // diff in hours
      if (diff < 0) diff += 24; // Handle overnight shifts
      return diff;
    } catch (err) { return 0; }
  };

  // ✅ Fetch timesheets for table (with pagination & filters)
  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        Search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : "",
        startDate,
        endDate,
        page: page + 1,
        limit: rowsPerPage,
        ...(selectedPayPeriodId ? { payPeriodId: selectedPayPeriodId } : {}),
      }).toString();

      const res = await apiClient.get(`/api/employee-timesheet/get?${query}`);
      const timesheets = res.data.data || res.data.timesheets || [];
      setData(timesheets);
      setTotalCount(res.data.total || timesheets.length);
    } catch (error) {
      toast.error("Failed to fetch filtered timesheets");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get(
        `/api/employee-timesheet/get?limit=5000&startDate=${startDate}&endDate=${endDate}&status=${statusFilter !== "all" ? statusFilter : ""}`
      );
      const rows = res.data.data || [];
      const header = "Employee ID,Date,Start,End,Status,Break (min)\n";
      const body = rows
        .map((r) => `${r.employeeId},${r.date},${r.startTime},${r.endTime},${r.status},${r.breakMinutes || 0}`)
        .join("\n");
      const blob = new Blob([header + body], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `timesheets-${startDate}-${endDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleCreateTimesheet = async () => {
    if (!newTimesheet.employeeId) {
      toast.error("Employee ID is required");
      return;
    }
    try {
      await apiClient.post("/api/employee-timesheet/create", newTimesheet);
      toast.success("Timesheet created");
      setCreateOpen(false);
      fetchData();
      fetchGlobalStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create timesheet");
    }
  };

  const fetchGlobalStats = async () => {
    try {
      // Get records for charts (up to 1000 for visualization)
      const res = await apiClient.get(`/api/employee-timesheet/get?limit=1000`);
      const allRecords = res.data.data || [];
      const statsObj = res.data.stats || {};
      
      setGlobalData(allRecords);
      
      // Use pre-calculated stats from backend for the Summary Cards
      setGlobalStats({
        total: statsObj.total || 0,
        pending: statsObj.pendingCount || 0,
        approvedTotal: statsObj.approvedTotal || 0,
        avgWorkload: statsObj.avgWorkload || 0
      });
    } catch (error) {
      console.error("Failed to fetch global stats:", error);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    const loadPayPeriods = async () => {
      try {
        const res = await apiClient.get('/api/hr/pay-periods');
        setPayPeriods(res.data.data || []);
      } catch {
        /* HR admin only */
      }
    };
    loadPayPeriods();
  }, []);

  const handlePayPeriodChange = (periodId) => {
    setSelectedPayPeriodId(periodId);
    if (!periodId) return;
    const period = payPeriods.find((p) => String(p.id) === String(periodId));
    if (period) {
      setStartDate(period.startDate);
      setEndDate(period.endDate);
      setPage(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, statusFilter, startDate, endDate, selectedPayPeriodId]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page !== 0) setPage(0);
      else fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // ✅ Update timesheet status
  const handleStatusUpdate = async (id, newStatus) => {
    toast.loading("loading...")
    try {
      if (newStatus === 'approved' || newStatus === 'rejected') {
        await apiClient.post(`/api/employee-timesheet/${id}/approve`, { status: newStatus });
      } else {
        await apiClient.put(`/api/employee-timesheet/update/${id}`, { status: newStatus });
      }
      toast.dismiss()
      toast.success(`Timesheet ${newStatus} successfully`);
      fetchData(); // refresh after update
    } catch (error) {
      toast.dismiss()
      console.error("Status update failed:", error);
      toast.error("Failed to update timesheet status");
    } 
  };

  // ✅ Filter locally for UI responsiveness if needed, 
  // but we mostly rely on API pagination now.
  const filteredTimesheets = data;

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

  // ✅ Helper to format 24h time to 12h AM/PM
  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return "N/A";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minuteStr} ${ampm}`;
  };

  // ✅ Helper to convert HH:MM(:SS) to decimal hours
  const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return Number((hours + minutes / 60).toFixed(2));
  };

  const formatBreakTime = (timeStr) => {
    if (!timeStr) return "0m";
    if (typeof timeStr === 'number') {
      const h = Math.floor(timeStr);
      const m = Math.round((timeStr - h) * 60);
      if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
      return m > 0 ? `${m}m` : "0m";
    }
    const parts = timeStr.split(":");
    if (parts.length < 2) return "0m";
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
    return m > 0 ? `${m}m` : "0m";
  };

  if (loading) return <Loader />;

  return (
    <Container maxWidth={false} sx={{ py: 6 }}>
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
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            component={Link}
            href="/human-resource?tab=salary"
            variant="outlined"
            startIcon={<CalendarMonth />}
          >
            Payroll
          </Button>
          <Button variant="contained" startIcon={<Add />} color="primary" onClick={() => setCreateOpen(true)}>
            New Timesheet
          </Button>
        </Stack>
      </Stack>

      {/* Summary Stats (Rect Section) - Global Data */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Logs (Overall)</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{globalStats.total}</Typography>
              </Box>
              <History fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Pending Reviews</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>{globalStats.pending}</Typography>
              </Box>
              <PendingActions fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Net Approved Hours</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{globalStats.approvedTotal?.toFixed(1) || 0}h</Typography>
              </Box>
              <Timer fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Avg. Workload</Typography>
                <Typography variant="h5" color="secondary.main" fontWeight={600}>{globalStats.avgWorkload?.toFixed(1) || 0}h</Typography>
              </Box>
              <TrendingUp fontSize="large" color="secondary" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Activity Visualization (Heat Map) */}
      <Box mb={4}>
        <TimeSheetHeatMap data={globalData} />
      </Box>

      {/* Analytics Charts */}
      <TimeSheetCharts data={globalData} />

      {/* Filters */}
      <Card sx={{ mb: 4, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <CardHeader 
          title="Table Filters" 
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          sx={{ pb: 0 }}
        />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant={statusFilter === "pending" ? "contained" : "outlined"}
                color="warning"
                size="small"
                onClick={() => {
                  setStatusFilter(statusFilter === "pending" ? "all" : "pending");
                  setPage(0);
                }}
                sx={{ height: 40 }}
              >
                Pending only
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedPayPeriodId}
                onChange={(e) => handlePayPeriodChange(e.target.value)}
                label="Pay Period"
              >
                <MenuItem value="">All periods</MenuItem>
                {payPeriods.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.startDate} — {p.endDate} ({p.status})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
          </Grid>
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
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Net Hours</TableCell>
                  <TableCell>Overwork</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTimesheets.map((ts) => {
                  const netHours = calculateNetHours(ts.startTime, ts.endTime);

                  return (
                    <TableRow key={ts.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{ts.employee?.name || "N/A"}</Typography>
                          <Typography variant="caption" color="text.secondary">{ts.employee?.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(ts.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>{formatTimeTo12Hour(ts.startTime)}</TableCell>
                      <TableCell>{formatTimeTo12Hour(ts.endTime)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Timer sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">{netHours.toFixed(2)}h</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell color="primary">+{timeToDecimal(ts.overWork)}h</TableCell>
                      <TableCell>{getStatusBadge(ts.status)}</TableCell>

                      {/* ✅ Actions */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <PermissionWrapper resource="human resource" action="canEdit">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={ts.status?.toLowerCase() === "approved"}
                              onClick={() => handleStatusUpdate(ts.id, "approved")}
                              sx={{ minWidth: 80 }}
                            >
                              Approve
                            </Button>
                          </PermissionWrapper>
                          <PermissionWrapper resource="human resource" action="canEdit">
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              disabled={ts.status?.toLowerCase() === "rejected"}
                              onClick={() => handleStatusUpdate(ts.id, "rejected")}
                              sx={{ minWidth: 80 }}
                            >
                              Reject
                            </Button>
                          </PermissionWrapper>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                  {/* Final Total Row for Filtered Data */}
                  {filteredTimesheets.length > 0 && (
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>Total Filtered Hours:</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {filteredTimesheets.reduce((acc, ts) => acc + calculateNetHours(ts.startTime, ts.endTime), 0).toFixed(2)}h
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {filteredTimesheets.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            No timesheets found matching your criteria.
          </Typography>
        </Box>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Timesheet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <EmployeePicker
              label="Employee"
              value={newTimesheet.employeeId}
              onChange={(e) => setNewTimesheet({ ...newTimesheet, employeeId: e.target.value })}
            />
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={newTimesheet.date} onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })} />
            <TextField label="Start Time" value={newTimesheet.startTime} onChange={(e) => setNewTimesheet({ ...newTimesheet, startTime: e.target.value })} />
            <TextField label="End Time" value={newTimesheet.endTime} onChange={(e) => setNewTimesheet({ ...newTimesheet, endTime: e.target.value })} />
            <TextField type="number" label="Break (minutes)" value={newTimesheet.breakMinutes} onChange={(e) => setNewTimesheet({ ...newTimesheet, breakMinutes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTimesheet}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Timesheets;
