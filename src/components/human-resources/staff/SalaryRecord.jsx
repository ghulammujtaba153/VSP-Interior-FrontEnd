"use client";

import React, { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/axios";
import { openAuthenticatedFile } from "@/lib/openSecureFile";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Divider,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { formatNzd } from "@/lib/hrUtils";
import {
  AttachMoney,
  TrendingUp,
  AccountBalanceWallet,
  Savings,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const defaultForm = {
  month: MONTHS[new Date().getMonth()],
  year: CURRENT_YEAR,
  baseSalary: "",
  overtimeSalary: "",
  bonus: "",
  deduction: "",
  status: "pending",
  paymentDate: "",
  paymentMethod: "",
  notes: "",
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" color={color} fontWeight={600}>
            {value}
          </Typography>
        </Box>
        {React.cloneElement(icon, { fontSize: "large", sx: { color } })}
      </Stack>
    </CardContent>
  </Card>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const SalaryRecord = ({ records = [], loading = false }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const normalizedRecords = (records || []).map((r) => ({
    ...r,
    month: r.month || r.payrollRun?.month || '—',
    year: r.year || r.payrollRun?.year || '—',
    baseSalary: r.basePay ?? r.baseSalary ?? 0,
    overtimeSalary: r.overtimePay ?? r.overtimeSalary ?? 0,
    bonus: r.allowances ?? r.bonus ?? 0,
    deduction: (Number(r.payeTax || 0) + Number(r.kiwiSaverEmployee || 0) + Number(r.otherDeductions || 0)) || r.deduction || 0,
    netSalary: r.netPay ?? r.netSalary ?? 0,
    status: r.status || r.payrollRun?.status || 'draft',
  }));

  const fmt = (n) => formatNzd(n, { maximumFractionDigits: 0 });

  const totalPaid = normalizedRecords.reduce((sum, r) => sum + Number(r.netSalary || 0), 0);
  const avgNet = normalizedRecords.length ? totalPaid / normalizedRecords.length : 0;

  return (
    <>
      {/* ── Salary Records Table ──────────────────────────────────────── */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Payslip History (NZ payroll runs)
            </Typography>
            {normalizedRecords[0]?.id && (
              <Button
                variant="outlined"
                startIcon={<PaymentIcon />}
                onClick={() => openAuthenticatedFile(`/api/hr/payslips/${normalizedRecords[0].id}/pdf`)}
                size="small"
              >
                Latest Payslip
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Month / Year</TableCell>
                      <TableCell align="right">Base</TableCell>
                      <TableCell align="right">Overtime</TableCell>
                      <TableCell align="right">Bonus</TableCell>
                      <TableCell align="right">Deduction</TableCell>
                      <TableCell align="right">Net Salary</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {normalizedRecords
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, idx) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                          <TableCell>
                            {row.month} {row.year}
                          </TableCell>
                          <TableCell align="right">{fmt(row.baseSalary)}</TableCell>
                          <TableCell align="right">{fmt(row.overtimeSalary || 0)}</TableCell>
                          <TableCell align="right">{fmt(row.bonus || 0)}</TableCell>
                          <TableCell align="right" sx={{ color: "error.main" }}>
                            -{fmt(row.deduction || 0)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: "success.main" }}>
                            {fmt(row.netSalary)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              color={row.status === "paid" ? "success" : "warning"}
                            />
                          </TableCell>
                          <TableCell>
                            {row.paymentDate
                              ? new Date(row.paymentDate).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>{row.paymentMethod || "—"}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="View payslip">
                              <IconButton size="small" color="primary" onClick={() => openAuthenticatedFile(`/api/hr/payslips/${row.id}/pdf`)}>
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    {normalizedRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 4, color: "text.secondary" }}>
                          No salary records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={normalizedRecords.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SalaryRecord;
