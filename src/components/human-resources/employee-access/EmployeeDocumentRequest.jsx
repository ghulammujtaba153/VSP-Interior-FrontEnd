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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

  // show loader until we have employeeId and initial fetch settled
  if (loading || !employeeId) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const paginated = docRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
 

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No document requests
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{r.documentType}</TableCell>
                    <TableCell>{r.documentName}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line", maxWidth: 300 }}>{r.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        color={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell align="center">
                      {r.status === "pending" && <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Upload Document">
                          <IconButton size="small" color="primary" onClick={() => handleOpenUpload(r)}>
                            <UploadFileIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={docRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ mt: 1 }}
        />
      </CardContent>

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
    </Card>
  );
};

export default EmployeeDocumentRequest;
