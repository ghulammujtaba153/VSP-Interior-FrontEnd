"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Tabs,
  Tab,
  MenuItem,
  Chip,
  TablePagination,
} from "@mui/material";
import {
  Edit,
  Search,
  Payments,
  History,
  Description,
  AddCircleOutline,
  CheckCircle,
  FileDownload,
} from "@mui/icons-material";
import apiClient from '@/lib/axios';
import { openAuthenticatedFile } from '@/lib/openSecureFile';
import Loader from "../loader/Loader";
import UserModal from "../users/UserModal";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Salary = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("rates");
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [monthFilter, setMonthFilter] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState("");
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [summary, setSummary] = useState({ totalNetPay: 0, pendingPayroll: 0, paidRunCount: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [viewMode, monthFilter, yearFilter, debouncedSearch]);

  const fetchRates = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
      hasSalary: 'true',
      search: debouncedSearch,
    });
    const res = await apiClient.get(`/api/user/get?${params}`);
    setTableData(res.data.users || []);
    setTotal(res.data.total || 0);
  }, [page, rowsPerPage, debouncedSearch]);

  const fetchPayroll = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
      month: monthFilter,
      year: yearFilter,
      search: debouncedSearch,
    });
    const [payslipRes, periodsRes, runsRes] = await Promise.all([
      apiClient.get(`/api/hr/payslips?${params}`),
      apiClient.get('/api/hr/pay-periods'),
      apiClient.get('/api/hr/payroll-runs?summary=true'),
    ]);
    setTableData(payslipRes.data.data || []);
    setTotal(payslipRes.data.total || 0);
    setSummary(payslipRes.data.summary || { totalNetPay: 0, pendingPayroll: 0, paidRunCount: 0 });
    setPayPeriods(periodsRes.data.data || []);
    setPayrollRuns(runsRes.data.data || []);
  }, [page, rowsPerPage, monthFilter, yearFilter, debouncedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === "rates") {
        await fetchRates();
      } else {
        await fetchPayroll();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load salary data");
    } finally {
      setLoading(false);
    }
  }, [viewMode, fetchRates, fetchPayroll]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGeneratePayrollRun = async () => {
    try {
      await apiClient.post('/api/hr/payroll-runs/generate', {
        month: monthFilter,
        year: Number(yearFilter),
        payPeriodId: selectedPayPeriodId ? Number(selectedPayPeriodId) : undefined,
      });
      toast.success('Payroll run generated from approved timesheets');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payroll run');
    }
  };

  const handleLockPayrollRun = async (runId) => {
    if (!window.confirm('Lock this payroll run? This cannot be undone.')) return;
    try {
      await apiClient.put(`/api/hr/payroll-runs/${runId}/status`, { status: 'locked' });
      toast.success('Payroll month locked');
      fetchData();
    } catch {
      toast.error('Failed to lock payroll run');
    }
  };

  const handleMarkRunPaid = async (runId) => {
    try {
      await apiClient.put(`/api/hr/payroll-runs/${runId}/status`, { status: 'paid' });
      toast.success('Payroll run marked as paid');
      fetchData();
    } catch {
      toast.error('Failed to update payroll run');
    }
  };

  const handleViewPayslip = async (payslipId) => {
    try {
      await openAuthenticatedFile(`/api/hr/payslips/${payslipId}/pdf`);
    } catch {
      toast.error('Could not open payslip');
    }
  };

  const fetchAllForExport = async () => {
    if (viewMode === "rates") {
      const res = await apiClient.get(`/api/user/get?hasSalary=true&limit=5000&search=${debouncedSearch}`);
      return res.data.users || [];
    }
    const res = await apiClient.get(
      `/api/hr/payslips?month=${monthFilter}&year=${yearFilter}&limit=5000&search=${debouncedSearch}`
    );
    return res.data.data || [];
  };

  const exportToExcel = async () => {
    const dataToExport = await fetchAllForExport();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, viewMode === "rates" ? "Salary Rates" : "Payroll");
    XLSX.writeFile(workbook, `Salary_Report_${monthFilter}_${yearFilter}.xlsx`);
  };

  const exportToPDF = async () => {
    const items = await fetchAllForExport();
    const doc = new jsPDF();
    doc.text(`Salary Report - ${monthFilter} ${yearFilter}`, 14, 15);
    let y = 30;
    items.forEach((item, index) => {
      const name = item.name || item.user?.name;
      const amount = viewMode === "rates" ? `$${item.salary}` : `$${item.netPay || 0}`;
      doc.text(`${index + 1}. ${name} - ${amount}`, 14, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save(`Salary_Report_${monthFilter}_${yearFilter}.pdf`);
  };

  const totalMonthlyPayroll = summary.totalNetPay || 0;
  const pendingPayroll = summary.pendingPayroll || 0;
  const paidRunCount = summary.paidRunCount || 0;

  if (loading && tableData.length === 0) return <Loader />;

  return (
    <Box sx={{ py: 2 }}>
      <UserModal
        open={modalOpen}
        mode="edit"
        userProfile={selectedUser}
        onClose={() => setModalOpen(false)}
        onSave={() => { setModalOpen(false); fetchData(); }}
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Payroll ({monthFilter})</Typography>
                <Typography variant="h5" fontWeight={600}>${Number(totalMonthlyPayroll).toLocaleString()}</Typography>
              </Box>
              <Payments fontSize="large" sx={{ opacity: 0.5 }} />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Unpaid (draft runs)</Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>${Number(pendingPayroll).toLocaleString()}</Typography>
              </Box>
              <History fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Paid Runs</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{paidRunCount}</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={3}>
        <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
          <Tab label="Salary Rates" value="rates" icon={<Description />} iconPosition="start" />
          <Tab label="Monthly Payroll" value="payroll" icon={<Payments />} iconPosition="start" />
        </Tabs>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Export PDF">
            <IconButton onClick={exportToPDF} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Description fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Excel">
            <IconButton onClick={exportToExcel} color="success" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <FileDownload fontSize="small" />
            </IconButton>
          </Tooltip>
          {viewMode === "payroll" && (
            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleGeneratePayrollRun}>
              Generate Payroll Run
            </Button>
          )}
        </Stack>
      </Stack>

      {viewMode === "payroll" && payrollRuns.length > 0 && (
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {payrollRuns.map((run) => (
            <Chip
              key={run.id}
              label={`${run.month} ${run.year} — ${run.status} (${run.payslips?.length || 0} payslips)`}
              color={run.status === 'locked' ? 'default' : 'primary'}
              onClick={() => run.status !== 'locked' && handleLockPayrollRun(run.id)}
            />
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={2} mb={3} alignItems="center" flexWrap="wrap">
        {viewMode === "payroll" && (
          <>
            <TextField select size="small" label="Month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} sx={{ minWidth: 150 }}>
              {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} sx={{ minWidth: 120 }}>
              {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Pay Period" value={selectedPayPeriodId} onChange={(e) => setSelectedPayPeriodId(e.target.value)} sx={{ minWidth: 220 }}>
              <MenuItem value="">All approved timesheets</MenuItem>
              {payPeriods.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>{p.startDate} — {p.endDate}</MenuItem>
              ))}
            </TextField>
          </>
        )}
        <TextField
          size="small"
          placeholder="Search employee or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{viewMode === 'rates' ? 'Monthly Rate (NZD)' : 'Net Pay (NZD)'}</TableCell>
              {viewMode === 'payroll' && (
                <>
                  <TableCell sx={{ fontWeight: 'bold' }}>Breakdown</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.length > 0 ? (
              tableData.map((item) => {
                const isUser = viewMode === "rates";
                const userObj = isUser ? item : item.user;
                const displayName = userObj?.name || `Employee #${item.userId || item.id}`;
                const displayRole = userObj?.Role?.name || "N/A";
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
                          {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">{displayName}</Typography>
                          <Typography variant="caption" color="text.secondary">{userObj?.email || "—"}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{displayRole}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        ${Number(isUser ? item.salary : item.netPay || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    {!isUser && (
                      <>
                        <TableCell>
                          <Tooltip title={`Gross: $${item.grossPay}, PAYE: $${item.payeTax}, KS: $${item.kiwiSaverEmployee}`}>
                            <Chip size="small" label="NZ breakdown" variant="outlined" sx={{ cursor: 'help' }} />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={(item.runStatus || 'draft').toUpperCase()}
                            color={item.runStatus === 'paid' ? 'success' : item.runStatus === 'locked' ? 'default' : 'warning'}
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell align="right">
                      {isUser ? (
                        <Tooltip title="Edit Rate">
                          <IconButton size="small" color="primary" onClick={() => { setSelectedUser(item); setModalOpen(true); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View payslip">
                            <IconButton size="small" color="primary" onClick={() => handleViewPayslip(item.id)}>
                              <Description fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {item.runStatus === 'draft' && (
                            <Tooltip title="Mark run as paid">
                              <IconButton size="small" color="success" onClick={() => handleMarkRunPaid(item.runId)}>
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={viewMode === 'payroll' ? 7 : 5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No records found matching current criteria.</Typography>
                </TableCell>
              </TableRow>
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};

export default Salary;
