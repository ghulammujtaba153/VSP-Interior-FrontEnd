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
} from "@mui/material";
import { BASE_URL } from "@/configs/url";

const Certifications = () => {
  const [staff, setStaff] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Fetch staff data
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/user/get?page=${page}&limit=${limit}`
      );
      setStaff(response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page]);

  const handleChangePage = (event, value) => {
    setPage(value);
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
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Staff List
      </Typography>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.length > 0 ? (
                staff.map((user, index) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.Role?.name || "N/A"}</TableCell>
                    <TableCell
                      sx={{
                        color:
                          user.status === "active" ? "green" : "error.main",
                        fontWeight: 500,
                      }}
                    >
                      {user.status}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setSelectedStaff(user)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No staff found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" py={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Staff Details Dialog */}
      <Dialog
        open={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Staff Details</DialogTitle>
        <DialogContent dividers>
          {selectedStaff && (
            <Box>
              <Typography><strong>Name:</strong> {selectedStaff.name}</Typography>
              <Typography><strong>Email:</strong> {selectedStaff.email}</Typography>
              <Typography>
                <strong>Role:</strong> {selectedStaff.Role?.name || "N/A"}
              </Typography>
              <Typography><strong>Status:</strong> {selectedStaff.status}</Typography>
              <Typography>
                <strong>Created:</strong>{" "}
                {new Date(selectedStaff.createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStaff(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Certifications;
