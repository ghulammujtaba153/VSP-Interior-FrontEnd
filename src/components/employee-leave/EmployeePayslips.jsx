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
  Button,
  Chip,
  Stack,
  TablePagination,
} from "@mui/material";
import { Payments, Visibility } from "@mui/icons-material";
import apiClient from "@/lib/axios";
import { formatNzd } from "@/lib/hrUtils";
import { useAuth } from "@/context/authContext";
import { openAuthenticatedFile } from "@/lib/openSecureFile";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";

const formatPeriod = (payslip) => {
  const run = payslip.payrollRun;
  if (run?.month && run?.year) {
    const shortMonth = run.month.length > 3 ? run.month.slice(0, 3) : run.month;
    return `${shortMonth} ${run.year}`;
  }
  if (payslip.createdAt) {
    return new Date(payslip.createdAt).toLocaleDateString("en-NZ", {
      month: "short",
      year: "numeric",
    });
  }
  return "—";
};

const EmployeePayslips = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchPayslips = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      const res = await apiClient.get(`/api/hr/payslips/user/${user.id}?${params}`);
      setPayslips(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, rowsPerPage]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  const handleView = async (id) => {
    try {
      await openAuthenticatedFile(`/api/hr/payslips/${id}/pdf`);
    } catch {
      toast.error("Could not open payslip");
    }
  };

  if (loading && payslips.length === 0) return <Loader />;

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Payments color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">My Payslips</Typography>
          <Typography variant="body2" color="text.secondary">
            View and download your NZ payroll payslips (NZD)
          </Typography>
        </Box>
        <Chip label={`${total} total`} size="small" variant="outlined" color="primary" />
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Gross (NZD)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Net Pay (NZD)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No payslips available yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payslips.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatPeriod(p)}
                        </Typography>
                        {p.payrollRun?.status && (
                          <Chip
                            size="small"
                            label={p.payrollRun.status}
                            sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
                            color={p.payrollRun.status === "paid" ? "success" : "default"}
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatNzd(p.grossPay)}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatNzd(p.netPay)}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {p.paymentDate
                          ? new Date(p.paymentDate).toLocaleDateString("en-NZ")
                          : "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleView(p.id)}
                        >
                          View PDF
                        </Button>
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

export default EmployeePayslips;
