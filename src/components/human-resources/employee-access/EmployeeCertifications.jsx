"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  Chip,
  Stack,
  TablePagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import { School, Search } from "@mui/icons-material";
import apiClient from "@/lib/axios";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";

const statusColor = (status) => {
  if (status === "expired") return "error";
  if (status === "expiring_soon") return "warning";
  return "success";
};

const EmployeeCertifications = () => {
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        search: debouncedSearch,
      });
      const res = await apiClient.get(`/api/hr/certifications?${params}`);
      setCerts(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  if (loading && certs.length === 0) return <Loader />;

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <School color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">My Certifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Licences and compliance records on file
          </Typography>
        </Box>
        <Chip label={`${total} total`} size="small" variant="outlined" color="primary" />
      </Stack>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <TextField
          size="small"
          placeholder="Search certifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240 }}
        />
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issuer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No certifications on record</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  certs.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.issuer || "—"}</TableCell>
                      <TableCell>
                        {c.issueDate ? new Date(c.issueDate).toLocaleDateString("en-NZ") : "—"}
                      </TableCell>
                      <TableCell>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-NZ") : "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={(c.status || "valid").replace("_", " ")}
                          color={statusColor(c.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeCertifications;
