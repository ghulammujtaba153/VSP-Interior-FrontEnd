"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";

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
const SalaryRecord = ({ employeeId, baseSalary: employeeSalary, records = [], loading = false, onRefresh }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fmt = (n) =>
    Number(n).toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, baseSalary: employeeSalary || "" });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      month: row.month,
      year: row.year,
      baseSalary: row.baseSalary,
      overtimeSalary: row.overtimeSalary || "",
      bonus: row.bonus || "",
      deduction: row.deduction || "",
      status: row.status,
      paymentDate: row.paymentDate ? row.paymentDate.split("T")[0] : "",
      paymentMethod: row.paymentMethod || "",
      notes: row.notes || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.baseSalary) {
      toast.error("Base salary is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${BASE_URL}/api/payroll/update/${editing.id}`, form);
        toast.success("Payroll record updated");
      } else {
        await axios.post(`${BASE_URL}/api/payroll/create`, {
          ...form,
          userId: employeeId,
        });
        toast.success("Payroll record created");
      }
      setModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      const msg = err?.response?.data?.error || "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payroll record?")) return;
    toast.loading("Deleting...");
    try {
      await axios.delete(`${BASE_URL}/api/payroll/delete/${id}`);
      toast.dismiss();
      toast.success("Deleted");
      if (onRefresh) onRefresh();
    } catch {
      toast.dismiss();
      toast.error("Delete failed");
    }
  };

  // ── Computed net salary preview for form ──────────────────────────────────
  const previewNet =
    Number(form.baseSalary || 0) +
    Number(form.overtimeSalary || 0) +
    Number(form.bonus || 0) -
    Number(form.deduction || 0);

  return (
    <>
      {/* ── Salary Records Table ──────────────────────────────────────── */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Salary Records
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              size="small"
            >
              Add Record
            </Button>
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
                    {records
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
                            <Box display="flex" justifyContent="center" gap={0.5}>
                              <Tooltip title="Edit">
                                <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    {records.length === 0 && (
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
                count={records.length}
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

      {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editing ? "Edit Payroll Record" : "New Payroll Record"}
            </Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Month / Year row */}
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Month"
                name="month"
                value={form.month}
                onChange={handleChange}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Year"
                name="year"
                value={form.year}
                onChange={handleChange}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Salary fields */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Base Salary *"
                name="baseSalary"
                type="number"
                value={form.baseSalary}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Overtime Salary"
                name="overtimeSalary"
                type="number"
                value={form.overtimeSalary}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Bonus"
                name="bonus"
                type="number"
                value={form.bonus}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Deduction"
                name="deduction"
                type="number"
                value={form.deduction}
                onChange={handleChange}
              />
            </Grid>

            {/* Net preview */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Net Salary Preview</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {fmt(previewNet)}
                </Typography>
              </Paper>
            </Grid>

            {/* Status / Payment */}
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Payment Method"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                placeholder="e.g. Bank Transfer"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Payment Date"
                name="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notes"
                name="notes"
                multiline
                rows={2}
                value={form.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SalaryRecord;
