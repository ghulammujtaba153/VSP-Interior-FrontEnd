"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  Stack,
  TextField,
  Divider,
  Grid,
  Avatar,
} from "@mui/material";
import { 
  UploadFile as UploadFileIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Description,
  QueryBuilder,
  TaskAlt,
  Search,
  Schedule as AccessTime,
  CheckCircle,
  AccountTree as CalendarToday
} from "@mui/icons-material";
import DocumentRequestModal from "@/components/human-resources/staff/DocumentRequestModal";
import EmployeeDocumentUpload from "./EmployeeDocumentUpload";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/authContext";

const EmployeeDocumentRequest = () => {
  // useAuth can return null/undefined while auth is initializing — guard it
  const auth = useAuth();
  const user = auth?.user || null;

  // route param (if present) — prefer route id, fallback to logged in user id
  const params = useParams();
  const routeEmployeeId = params?.id || null;
  const employeeId = routeEmployeeId || user?.id || null;

  const [docRequests, setDocRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadRequest, setUploadRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // fetch document requests for the resolved employeeId
  const fetchDocRequests = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/employee-document/employee/${empId}`);
      // normalize response shape
      const items = res.data?.data || res.data?.items || res.data || [];
      setDocRequests(items);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch document requests");
      setDocRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // only fetch when we have a valid employeeId
    if (employeeId) {
      fetchDocRequests(employeeId);
    } else {
      // if no employee id yet, show not-loading state until available
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleEdit = (r) => {
    setSelectedRequest(r);
    setRequestModalOpen(true);
  };

  const handleDelete = async (reqId) => {
    if (!window.confirm("Delete this request?")) return;
    toast.loading("Deleting...");
    try {
      await axios.delete(`${BASE_URL}/api/employee-document/delete/${reqId}`);
      toast.dismiss();
      toast.success("Deleted");
      fetchDocRequests(employeeId);
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const handleOpenUpload = (r) => {
    setUploadRequest(r);
    setUploadOpen(true);
  };

  const handleUploadComplete = () => {
    setUploadOpen(false);
    setUploadRequest(null);
    fetchDocRequests(employeeId);
  };

  const handleRequestSaved = () => {
    setRequestModalOpen(false);
    setSelectedRequest(null);
    fetchDocRequests(employeeId);
  };

  const filtered = (docRequests || []).filter(r => 
    r.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.documentType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const stats = {
    total: docRequests.length,
    pending: docRequests.filter(r => r.status === 'pending').length,
    approved: docRequests.filter(r => r.status === 'approved').length,
  };

  if (loading || !employeeId) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Requests</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{stats.total}</Typography>
              </Box>
              <Description fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Pending Actions</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>{stats.pending}</Typography>
              </Box>
              <AccessTime fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Approved Docs</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{stats.approved}</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">My Document Requests</Typography>
            <TextField
              size="small"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              sx={{ minWidth: 260 }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell><TableCell>Type</TableCell><TableCell>Name</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Requested At</TableCell><TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No document requests found</TableCell></TableRow>
                ) : (
                  paginated.map((r, idx) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell><TableCell>{r.documentType}</TableCell><TableCell>{r.documentName}</TableCell><TableCell sx={{ whiteSpace: "pre-line", maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason}</TableCell><TableCell><Chip label={r.status} color={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "error"} size="small" /></TableCell><TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</TableCell><TableCell align="center">{r.status === "pending" && <Tooltip title="Upload Document"><IconButton size="small" color="primary" onClick={() => handleOpenUpload(r)}><UploadFileIcon fontSize="small" /></IconButton></Tooltip>}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <DocumentRequestModal
        open={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setSelectedRequest(null);
        }}
        data={selectedRequest}
        employeeId={employeeId}
        onSaved={handleRequestSaved}
      />

      <EmployeeDocumentUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        request={uploadRequest}
        employeeId={user?.id}
        onUploaded={handleUploadComplete}
      />
    </Box>
  );
};

export default EmployeeDocumentRequest;
