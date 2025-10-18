"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Pagination,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";

const Certifications = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch employee document requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/employee-document/get?page=${page}&limit=${limit}`
      );

      setRequests(response.data.data || []);
      setPagination(response.data.pagination || { totalPages: 1 });
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch document requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Approve / Reject handlers
  const handleStatusUpdate = async (id, status) => {
    toast.loading("Updating status...");
    try {
      await axios.put(`${BASE_URL}/api/employee-document/update-status/${id}`, {
        status,
      });
      toast.dismiss();
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (error) {
      toast.dismiss();
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2} fontWeight="600">
        Employee Document Requests
      </Typography>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Document Type</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {requests.length > 0 ? (
                requests.map((req, index) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                    <TableCell>{req.employee?.name || "N/A"}</TableCell>
                    <TableCell>{req.documentType}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line" }}>{req.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        color={
                          req.status === "approved"
                            ? "success"
                            : req.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedRequest(req)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      {req.status === "pending" && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleStatusUpdate(req.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleStatusUpdate(req.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No document requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" py={2}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Paper>

      {/* View Dialog */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Document Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography>
                <strong>Employee:</strong> {selectedRequest.employee?.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedRequest.employee?.email}
              </Typography>
              <Typography>
                <strong>Document Type:</strong> {selectedRequest.documentType}
              </Typography>
              <Typography>
                <strong>Reason:</strong>
              </Typography>
              <Typography
                sx={{ mb: 2, whiteSpace: "pre-line", color: "text.secondary" }}
              >
                {selectedRequest.reason}
              </Typography>

              {selectedRequest.documents?.length > 0 && (
                <>
                  <Typography fontWeight={600} mb={1}>
                    Uploaded Document(s):
                  </Typography>
                  {selectedRequest.documents.map((doc) => (
                    <Button
                      key={doc.id}
                      variant="outlined"
                      href={`${BASE_URL}${doc.documentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mb: 1 }}
                    >
                      View Document
                    </Button>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Certifications;
