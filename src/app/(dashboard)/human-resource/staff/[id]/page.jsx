"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";
import DocumentRequestModal from "@/components/human-resources/staff/DocumentRequestModal";

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
import { Person, WorkHistory, EventNote, CheckCircle } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
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

  // Filter states
  const [timesheetFilter, setTimesheetFilter] = useState("all");
  const [leaveFilter, setLeaveFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");

  const fetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/staff/${id}`);
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
      const res = await axios.get(`${BASE_URL}/api/employee-document/employee/${id}`);
      
      const items = res.data?.data || res.data?.items || res.data || [];
      setDocRequests(items);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch document requests");
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    fetchDocRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader />;

  const { name, email, status, Role, EmployeeTimeSheets = [], EmployeeLeaves = [] } = data || {};

  // Stats
  const totalTimesheets = EmployeeTimeSheets?.length || 0;
  const totalLeaves = EmployeeLeaves?.length || 0;
  const approvedLeaves = EmployeeLeaves?.filter((l) => l.status.toLowerCase() === "approved").length || 0;

  // New Upgrade: Calculated Leave Balance (Assuming 20 standard annual leaves)
  const USED_LEAVES = EmployeeLeaves
    .filter(l => l.status.toLowerCase() === "approved")
    .reduce((acc, l) => {
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      const days = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return acc + days;
    }, 0);
  const LEAVE_LIMIT = 20; // This should ideally come from backend settings
  const remainingLeaves = Math.max(0, LEAVE_LIMIT - USED_LEAVES);

  const openNewDocModal = () => {
    setSelectedDocRequest(null);
    setDocModalOpen(true);
  };

  const handleEditDoc = (req) => {
    setSelectedDocRequest(req);
    setDocModalOpen(true);
  };

  const handleDeleteDoc = async (reqId) => {
    if (!window.confirm("Delete this request?")) return;
    toast.loading("Deleting...");
    try {
      await axios.delete(`${BASE_URL}/api/employee-document/delete/${reqId}`);
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
  const handleDownloadDocument = (doc) => {
    if (!doc || !doc.documentUrl) return;
    // open file in new tab / trigger browser download
    const url = `${BASE_URL}${doc.documentUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
    <Box sx={{ p: 4 }}>
      <Link href="/human-resource" style={{ textDecoration: "none" }}>
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
                <Typography variant="h5" color="secondary.main" fontWeight={600}>{USED_LEAVES}</Typography>
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
                  <TableCell>Date</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell>Break</TableCell><TableCell>Overwork</TableCell><TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTimeSheets.slice(
                  pageTimesheet * rowsPerPageTimesheet,
                  pageTimesheet * rowsPerPageTimesheet + rowsPerPageTimesheet
                ).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell><TableCell>{row.startTime}</TableCell><TableCell>{row.endTime}</TableCell><TableCell>{row.breakTime}</TableCell><TableCell>{row.overWork}</TableCell><TableCell><Chip label={row.status} color={row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "error"} size="small" /></TableCell>
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
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
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
                  <TableRow key={r.id}><TableCell>{docPage * docRowsPerPage + idx + 1}</TableCell><TableCell>{r.documentType}</TableCell><TableCell>{r.documentName}</TableCell><TableCell sx={{ whiteSpace: "pre-line" }}>{r.reason}</TableCell><TableCell><Chip label={r.status} color={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "error"} size="small" /></TableCell><TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</TableCell><TableCell align="center"><Box display="flex" justifyContent="center" gap={1}>{/* If documents exist show download buttons, otherwise show edit */}{Array.isArray(r.documents) && r.documents.length > 0 ? (r.documents.map((doc) => (<Tooltip key={doc.id} title="Download Document"><IconButton size="small" color="primary" onClick={() => handleDownloadDocument(doc)}><DownloadIcon /></IconButton></Tooltip>))) : (<><IconButton size="small" color="primary" onClick={() => handleEditDoc(r)}><EditIcon /></IconButton><IconButton size="small" color="error" onClick={() => handleDeleteDoc(r.id)}><DeleteIcon /></IconButton></>)}</Box></TableCell></TableRow>
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
    </Box>
  );
};

export default StaffProfilePage;
