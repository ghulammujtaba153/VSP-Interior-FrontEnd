"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
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
  Chip,
  Tooltip,
  CircularProgress,
  Stack,
  TextField,
  Divider,
} from "@mui/material";
import { 
  UploadFile as UploadFileIcon, 
  Description,
  Search,
  Schedule as AccessTime,
  CheckCircle,
  Download as DownloadIcon,
} from "@mui/icons-material";
import EmployeeDocumentUpload from "./EmployeeDocumentUpload";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { openSecureUpload } from "@/lib/openSecureFile";
import {
  getLatestDocument,
  docRequestStatusColor,
  docRequestStatusLabel,
} from "@/lib/hrUtils";

const EmployeeDocumentRequest = () => {
  // useAuth can return null/undefined while auth is initializing — guard it
  const auth = useAuth();
  const user = auth?.user || null;

  // route param (if present) — prefer route id, fallback to logged in user id
  const params = useParams();
  const routeEmployeeId = params?.id || null;
  const employeeId = routeEmployeeId || user?.id || null;

  const [docRequests, setDocRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadRequest, setUploadRequest] = useState(null);

  // fetch document requests for the resolved employeeId
  const fetchDocRequests = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        search: debouncedSearch,
      });
      const res = await apiClient.get(`/api/employee-document/employee/${empId}?${params}`);
      setDocRequests(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setSummary(res.data?.summary || { total: 0, pending: 0, approved: 0 });
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
  }, [employeeId, page, rowsPerPage, debouncedSearch]);

  const handleOpenUpload = (r) => {
    setUploadRequest(r);
    setUploadOpen(true);
  };

  const handleUploadComplete = () => {
    setUploadOpen(false);
    setUploadRequest(null);
    fetchDocRequests(employeeId);
  };

  const handleDownload = async (request) => {
    const doc = getLatestDocument(request);
    if (!doc?.documentUrl) return;
    try {
      await openSecureUpload(doc.documentUrl);
    } catch {
      toast.error("Could not download document");
    }
  };

  const canUpload = (r) => ["pending", "rejected"].includes(r.status);
  const canDownload = (r) => ["uploaded", "approved"].includes(r.status) && getLatestDocument(r);

  const filtered = docRequests;
  const paginated = filtered;

  const stats = summary;

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
                <Typography variant="body2" color="text.secondary">Awaiting Upload</Typography>
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
            <Box>
              <Typography variant="h6" fontWeight="bold">Assigned Documents</Typography>
              <Typography variant="body2" color="text.secondary">
                HR-assigned requests — upload the documents requested below
              </Typography>
            </Box>
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
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No document requests from HR yet. Contact HR if you need to submit a document.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((r, idx) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{r.documentType}</TableCell>
                      <TableCell>{r.documentName}</TableCell>
                      <TableCell sx={{ whiteSpace: "pre-line", maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={docRequestStatusLabel(r.status)}
                          color={docRequestStatusColor(r.status)}
                          size="small"
                        />
                        {r.status === "rejected" && r.rejectionReason && (
                          <Typography variant="caption" display="block" color="error.main" sx={{ mt: 0.5 }}>
                            {r.rejectionReason}
                          </Typography>
                        )}
                        {r.status === "uploaded" && (
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            HR is reviewing your submission
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {canUpload(r) && (
                            <Tooltip title={r.status === "rejected" ? "Re-upload document" : "Upload document"}>
                              <IconButton size="small" color="primary" onClick={() => handleOpenUpload(r)}>
                                <UploadFileIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDownload(r) && (
                            <Tooltip title="Download submitted file">
                              <IconButton size="small" color="success" onClick={() => handleDownload(r)}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

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
