"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/axios";
import { toast } from "react-toastify";
import { formatNzd } from "@/lib/hrUtils";
import { openSecureUpload } from "@/lib/openSecureFile";
import Loader from "@/components/loader/Loader";
import DocumentRequestModal from "@/components/human-resources/staff/DocumentRequestModal";
import DocumentRejectDialog from "@/components/human-resources/staff/DocumentRejectDialog";
import SalaryRecord from "@/components/human-resources/staff/SalaryRecord";
import {
  getRequestDocuments,
  docRequestStatusColor,
  docRequestStatusLabel,
} from "@/lib/hrUtils";
import StaffProfileCharts from "@/components/human-resources/staff/StaffProfileCharts";
import EmploymentProfileForm from "@/components/human-resources/EmploymentProfileForm";
import PermissionRoute from "@/components/PermissionRoute";


// MUI imports
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
} from "@mui/material";
import { Person, WorkHistory, EventNote, CheckCircle, AttachMoney, AccountBalanceWallet, Savings, Payment } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import Link from "next/link";

const StaffProfilePage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [pageTimesheet, setPageTimesheet] = useState(0);
  const [rowsPerPageTimesheet, setRowsPerPageTimesheet] = useState(5);

  const [pageLeave, setPageLeave] = useState(0);
  const [rowsPerPageLeave, setRowsPerPageLeave] = useState(5);

  // Document request states
  const [docRequests, setDocRequests] = useState([]);
  const [docPage, setDocPage] = useState(0);
  const [docRowsPerPage, setDocRowsPerPage] = useState(5);
  const [docLoading, setDocLoading] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocRequest, setSelectedDocRequest] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Filter states
  const [timesheetFilter, setTimesheetFilter] = useState("all");
  const [leaveFilter, setLeaveFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState([]);

  const fetch = async () => {
    try {
      const res = await apiClient.get(`/api/user/staff/${id}`);
      setData(res.data);
    } catch (error) {
      toast.error("Error fetching staff details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocRequests = async () => {
    setDocLoading(true);
    try {
      const res = await apiClient.get(`/api/employee-document/employee/${id}?page=1&limit=500`);
      
      const items = res.data?.data || res.data?.items || res.data || [];
      setDocRequests(items);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch document requests");
    } finally {
      setDocLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const res = await apiClient.get(`/api/hr/leave-balances/${id}`);
      setLeaveBalances(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayroll = async () => {
    setPayrollLoading(true);
    try {
      const res = await apiClient.get(`/api/hr/payslips/user/${id}?page=1&limit=500`);
      setPayrollRecords(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPayrollLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    fetchDocRequests();
    fetchPayroll();
    fetchLeaveBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader />;

  const { name, email, status, Role, EmployeeTimeSheets = [], EmployeeLeaves = [] } = data || {};

  // Stats
  const totalTimesheets = EmployeeTimeSheets?.length || 0;
  const totalLeaves = EmployeeLeaves?.length || 0;
  const approvedLeaves = EmployeeLeaves?.filter((l) => l.status.toLowerCase() === "approved").length || 0;

  // New Upgrade: Calculated Leave Balance (Assuming 20 standard annual leaves)
  const annualBalance = leaveBalances.find((b) => b.leaveType === 'annual') || leaveBalances[0];
  const remainingLeaves = Number(annualBalance?.remaining ?? 0);
  const usedLeaves = Number(annualBalance?.used ?? 0);

  // Payroll Stats
  const totalPaid = payrollRecords.reduce((sum, r) => sum + Number(r.netPay || 0), 0);
  const avgNet = payrollRecords.length > 0 ? totalPaid / payrollRecords.length : 0;
  const fmt = (n) => formatNzd(n, { maximumFractionDigits: 0 });

  const openNewDocModal = () => {
    setSelectedDocRequest(null);
    setDocModalOpen(true);
  };

  const handleEditDoc = (req) => {
    if (!["pending", "rejected"].includes(req.status)) {
      toast.info("Only pending or rejected requests can be edited");
      return;
    }
    setSelectedDocRequest(req);
    setDocModalOpen(true);
  };

  const handleApproveDoc = async (req) => {
    if (!window.confirm(`Approve "${req.documentName}"?`)) return;
    setReviewLoading(true);
    try {
      await apiClient.put(`/api/employee-document/update-status/${req.id}`, { status: "approved" });
      toast.success("Document approved");
      fetchDocRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve document");
    } finally {
      setReviewLoading(false);
    }
  };

  const openRejectDoc = (req) => {
    setRejectTarget(req);
    setRejectDialogOpen(true);
  };

  const handleRejectDoc = async (rejectionReason) => {
    if (!rejectTarget) return;
    setReviewLoading(true);
    try {
      await apiClient.put(`/api/employee-document/update-status/${rejectTarget.id}`, {
        status: "rejected",
        rejectionReason,
      });
      toast.success("Document rejected — employee can re-upload");
      setRejectDialogOpen(false);
      setRejectTarget(null);
      fetchDocRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject document");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteDoc = async (reqId) => {
    if (!window.confirm("Delete this request?")) return;
    toast.loading("Deleting...");
    try {
      await apiClient.delete(`/api/employee-document/delete/${reqId}`);
      toast.dismiss();
      toast.success("Deleted");
      fetchDocRequests();
    } catch (error) {
      toast.dismiss();
      toast.error("Delete failed");
    }
  };

  const handleDocSaved = () => {
    fetchDocRequests();
  };

  // add download handler
  const handleDownloadDocument = async (doc) => {
    if (!doc?.documentUrl) return;
    try {
      await openSecureUpload(doc.documentUrl);
    } catch {
      toast.error("Could not download document");
    }
  };

  const renderDocActions = (r) => {
    const docs = getRequestDocuments(r);
    const canEdit = ["pending", "rejected"].includes(r.status);
    const canReview = r.status === "uploaded";
    const canDownload = docs.length > 0;

    return (
      <Box display="flex" justifyContent="center" gap={0.5} flexWrap="wrap">
        {canReview && (
          <>
            <Tooltip title="Approve">
              <span>
                <IconButton size="small" color="success" disabled={reviewLoading} onClick={() => handleApproveDoc(r)}>
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Reject">
              <span>
                <IconButton size="small" color="error" disabled={reviewLoading} onClick={() => openRejectDoc(r)}>
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
        {canDownload && docs.map((doc) => (
          <Tooltip key={doc.id} title={`Download${doc.originalFilename ? `: ${doc.originalFilename}` : ""}`}>
            <IconButton size="small" color="primary" onClick={() => handleDownloadDocument(doc)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ))}
        {canEdit && (
          <>
            <Tooltip title="Edit request">
              <IconButton size="small" color="primary" onClick={() => handleEditDoc(r)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete request">
              <IconButton size="small" color="error" onClick={() => handleDeleteDoc(r.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    );
  };

  // ✅ Time formatting helpers
  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return "N/A";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    if (typeof timeStr === 'number') return timeStr;
    const parts = timeStr.split(":");
    if (parts.length < 2) return parseFloat(timeStr) || 0;
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

  // 🔍 Filter Logic
  const filteredTimeSheets = (EmployeeTimeSheets || []).filter(ts => 
    timesheetFilter === "all" || ts.status === timesheetFilter
  );

  const filteredLeaves = (EmployeeLeaves || []).filter(l => 
    leaveFilter === "all" || l.status.toLowerCase() === leaveFilter.toLowerCase()
  );

  const filteredDocRequests = (docRequests || []).filter(r => 
    docFilter === "all" || r.status === docFilter
  );

  return (
    <PermissionRoute resource="human resource">
    <Box sx={{ p: 4 }}>
      <Link href="/human-resource?tab=staffProfiles" style={{ textDecoration: "none" }}>
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          &larr; Back to Staff List
        </Typography>
      </Link>

      {/* Profile Header */}
      <Card sx={{ mb: 4, p: 3, boxShadow: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 90, height: 90, bgcolor: "primary.main", fontSize: 36 }}>
              {name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold">
              {name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {email}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Role:{" "}
              <Chip label={Role?.name} color="secondary" size="small" sx={{ fontWeight: "bold" }} />
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Status:{" "}
              <Chip label={status} color={status === "active" ? "success" : "error"} size="small" />
            </Typography>
          </Grid>
        </Grid>
      </Card>

      <EmploymentProfileForm
        userId={id}
        initialProfile={data?.employmentProfile}
        linkedWorker={data?.worker}
        onSaved={fetch}
      />

      {/* Stats Overview */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Attendance</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{totalTimesheets}</Typography>
              </Box>
              <WorkHistory fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Leaves Used</Typography>
                <Typography variant="h5" color="secondary.main" fontWeight={600}>{usedLeaves}</Typography>
              </Box>
              <EventNote fontSize="large" color="secondary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Remaining Balance</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{remainingLeaves}</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Account Status</Typography>
                <Typography variant="h5" color="info.main" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{status}</Typography>
              </Box>
              <Person fontSize="large" color="info" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Base Salary</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>
                  {data?.salary ? `$${Number(data.salary).toLocaleString()}` : "—"}
                </Typography>
              </Box>
              <AttachMoney fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  {fmt(totalPaid)}
                </Typography>
              </Box>
              <Payment fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Payslips</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>
                  {payrollRecords.length}
                </Typography>
              </Box>
              <AccountBalanceWallet fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Avg. Net Salary</Typography>
                <Typography variant="h5" color="info.main" fontWeight={600}>
                  {fmt(avgNet)}
                </Typography>
              </Box>
              <Savings fontSize="large" color="info" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* 📊 Personnel Data Analytics */}
      <StaffProfileCharts
        timesheets={EmployeeTimeSheets}
        leaves={EmployeeLeaves}
        payroll={payrollRecords}
        leaveEntitled={Number(annualBalance?.entitled ?? usedLeaves + remainingLeaves ?? 20)}
      />

      {/* TimeSheet Table */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Employee TimeSheets
            </Typography>
            <TextField
              select
              size="small"
              value={timesheetFilter}
              onChange={(e) => { setTimesheetFilter(e.target.value); setPageTimesheet(0); }}
              sx={{ width: 150 }}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Break</TableCell>
                  <TableCell>Net Hours</TableCell>
                  <TableCell>Overwork</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTimeSheets.slice(
                  pageTimesheet * rowsPerPageTimesheet,
                  pageTimesheet * rowsPerPageTimesheet + rowsPerPageTimesheet
                ).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {new Date(row.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>{formatTimeTo12Hour(row.startTime)}</TableCell>
                    <TableCell>{formatTimeTo12Hour(row.endTime)}</TableCell>
                    <TableCell>{formatBreakTime(row.breakTime)}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.netHours?.toFixed(2)}h</TableCell>
                    <TableCell color="primary">+{timeToDecimal(row.overWork)}h</TableCell>
                    <TableCell>
                      <Chip label={row.status} color={row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "error"} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTimeSheets.length}
            page={pageTimesheet}
            onPageChange={(e, newPage) => setPageTimesheet(newPage)}
            rowsPerPage={rowsPerPageTimesheet}
            onRowsPerPageChange={(e) => {
              setRowsPerPageTimesheet(parseInt(e.target.value, 10));
              setPageTimesheet(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Employee Leaves
            </Typography>
            <TextField
              select
              size="small"
              value={leaveFilter}
              onChange={(e) => { setLeaveFilter(e.target.value); setPageLeave(0); }}
              sx={{ width: 150 }}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell><TableCell>Start Date</TableCell><TableCell>End Date</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.slice(
                  pageLeave * rowsPerPageLeave,
                  pageLeave * rowsPerPageLeave + rowsPerPageLeave
                ).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.leaveType}</TableCell><TableCell>{row.startDate}</TableCell><TableCell>{row.endDate}</TableCell><TableCell sx={{ whiteSpace: "pre-line" }}>{row.reason}</TableCell><TableCell><Chip label={row.status} color={row.status.toLowerCase() === "approved" ? "success" : row.status.toLowerCase() === "pending" ? "warning" : "error"} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredLeaves.length}
            page={pageLeave}
            onPageChange={(e, newPage) => setPageLeave(newPage)}
            rowsPerPage={rowsPerPageLeave}
            onRowsPerPageChange={(e) => {
              setRowsPerPageLeave(parseInt(e.target.value, 10));
              setPageLeave(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Salary Records Section */}
      <SalaryRecord records={payrollRecords} loading={payrollLoading} />

      {/* Document Requests Section */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Document Requests
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                select
                size="small"
                value={docFilter}
                onChange={(e) => { setDocFilter(e.target.value); setDocPage(0); }}
                sx={{ width: 150 }}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="uploaded">Awaiting review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
              <Button variant="contained" color="primary" onClick={openNewDocModal}>
                Request Document
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell><TableCell>Type</TableCell><TableCell>Name</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Requested At</TableCell><TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocRequests.slice(docPage * docRowsPerPage, docPage * docRowsPerPage + docRowsPerPage).map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell>{docPage * docRowsPerPage + idx + 1}</TableCell>
                    <TableCell>{r.documentType}</TableCell>
                    <TableCell>{r.documentName}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line", maxWidth: 200 }}>{r.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={docRequestStatusLabel(r.status)}
                        color={docRequestStatusColor(r.status)}
                        size="small"
                      />
                      {r.rejectionReason && (
                        <Typography variant="caption" display="block" color="error.main" sx={{ mt: 0.5 }}>
                          {r.rejectionReason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell align="center">{renderDocActions(r)}</TableCell>
                  </TableRow>
                ))}
                {filteredDocRequests.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">No document requests</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredDocRequests.length}
            page={docPage}
            onPageChange={(e, newPage) => setDocPage(newPage)}
            rowsPerPage={docRowsPerPage}
            onRowsPerPageChange={(e) => {
              setDocRowsPerPage(parseInt(e.target.value, 10));
              setDocPage(0);
            }}
          />
        </CardContent>
      </Card>

      <DocumentRequestModal
        open={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        data={selectedDocRequest}
        employeeId={id}
        onSaved={handleDocSaved}
      />

      <DocumentRejectDialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectTarget(null);
        }}
        request={rejectTarget}
        onConfirm={handleRejectDoc}
        loading={reviewLoading}
      />
    </Box>
    </PermissionRoute>
  );
};

export default StaffProfilePage;
