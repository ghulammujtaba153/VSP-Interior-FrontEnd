"use client";

import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import {
  Edit,
  Search,
  Payments,
  TrendingUp,
  AccountBalanceWallet,
  History,
  Description,
  AddCircleOutline,
  CheckCircle,
  Delete,
  FileDownload,
  FilterList,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";
import UserModal from "../users/UserModal";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const Salary = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("rates"); // "rates" or "payroll"
  const [users, setUsers] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [payrollFormData, setPayrollFormData] = useState({
    userId: "",
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    baseSalary: 0,
    overtimeSalary: 0,
    bonus: 0,
    deduction: 0,
    notes: "",
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users with salaries
      const usersRes = await axios.get(`${BASE_URL}/api/user/get?limit=1000`);
      const staffWithSalary = (usersRes.data.users || usersRes.data.data || []).filter(
        (user) => user.salary !== null && user.salary !== undefined && user.salary !== ""
      );
      setUsers(staffWithSalary);

      // Fetch payroll if in payroll view
      if (viewMode === "payroll") {
        const payrollRes = await axios.get(`${BASE_URL}/api/payroll/get?month=${monthFilter}&year=${yearFilter}`);
        setPayrolls(payrollRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, monthFilter, yearFilter]);

  const handleEditSalary = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleOpenPayrollDialog = (user = null) => {
    if (user) {
      setPayrollFormData({
        ...payrollFormData,
        userId: user.id,
        baseSalary: user.salary,
        month: monthFilter,
        year: yearFilter,
      });
    }
    setPayrollDialogOpen(true);
  };

  const handleSavePayroll = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/payroll/create`, payrollFormData);
      toast.success("Payroll record created successfully");
      setPayrollDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving payroll");
    }
  };

  const handleUpdatePayrollStatus = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/api/payroll/update/${id}`, { status, paymentDate: status === 'paid' ? new Date() : null });
      toast.success(`Payroll marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Error updating payroll status");
    }
  };

  const handleDeletePayroll = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/payroll/delete/${id}`);
      toast.success("Payroll record deleted");
      fetchData();
    } catch (error) {
      toast.error("Error deleting record");
    }
  };

  const exportToExcel = () => {
    const dataToExport = viewMode === "rates" ? users : payrolls;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, viewMode === "rates" ? "Salary Rates" : "Payroll");
    XLSX.writeFile(workbook, `Salary_Report_${monthFilter}_${yearFilter}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Salary Report - ${monthFilter} ${yearFilter}`, 14, 15);
    
    let y = 30;
    (viewMode === "rates" ? users : payrolls).forEach((item, index) => {
      const name = item.name || item.user?.name;
      const amount = viewMode === "rates" ? `$${item.salary}` : `$${item.netSalary}`;
      doc.text(`${index + 1}. ${name} - ${amount}`, 14, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Salary_Report_${monthFilter}_${yearFilter}.pdf`);
  };

  const filteredData = (viewMode === "rates" ? users : payrolls).filter(
    (item) => {
      const name = item.name || item.user?.name || "";
      const role = item.Role?.name || item.user?.Role?.name || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             role.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  const totalMonthlyPayroll = payrolls.reduce((acc, p) => acc + Number(p.netSalary), 0);
  const pendingPayroll = payrolls.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.netSalary), 0);

  if (loading) return <Loader />;

  return (
    <Box sx={{ py: 2 }}>
      {/* Modals */}
      <UserModal
        open={modalOpen}
        mode="edit"
        userProfile={selectedUser}
        onClose={() => setModalOpen(false)}
        onSave={() => { setModalOpen(false); fetchData(); }}
      />

      <Dialog open={payrollDialogOpen} onClose={() => setPayrollDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Process Payroll - {payrollFormData.month} {payrollFormData.year}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Select Employee"
              fullWidth
              value={payrollFormData.userId}
              onChange={(e) => {
                const u = users.find(u => u.id === e.target.value);
                setPayrollFormData({...payrollFormData, userId: e.target.value, baseSalary: u.salary});
              }}
            >
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Base Salary" type="number" fullWidth value={payrollFormData.baseSalary} disabled />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Overtime/Extra" 
                  type="number" 
                  fullWidth 
                  value={payrollFormData.overtimeSalary}
                  onChange={(e) => setPayrollFormData({...payrollFormData, overtimeSalary: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Bonus" 
                  type="number" 
                  fullWidth 
                  value={payrollFormData.bonus}
                  onChange={(e) => setPayrollFormData({...payrollFormData, bonus: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Deductions" 
                  type="number" 
                  fullWidth 
                  value={payrollFormData.deduction}
                  onChange={(e) => setPayrollFormData({...payrollFormData, deduction: e.target.value})}
                />
              </Grid>
            </Grid>
            <TextField 
              label="Notes" 
              multiline 
              rows={2} 
              fullWidth 
              value={payrollFormData.notes}
              onChange={(e) => setPayrollFormData({...payrollFormData, notes: e.target.value})}
            />
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">Net Payable:</Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                ${(Number(payrollFormData.baseSalary) + Number(payrollFormData.overtimeSalary) + Number(payrollFormData.bonus) - Number(payrollFormData.deduction)).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayrollDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePayroll} variant="contained" color="primary">Save Record</Button>
        </DialogActions>
      </Dialog>

      {/* Overview Stats */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Payroll ({monthFilter})</Typography>
                <Typography variant="h5" fontWeight={600}>${totalMonthlyPayroll.toLocaleString()}</Typography>
              </Box>
              <Payments fontSize="large" sx={{ opacity: 0.5 }} />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Remaining Due</Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>${pendingPayroll.toLocaleString()}</Typography>
              </Box>
              <History fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Paid Count</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{payrolls.filter(p => p.status === 'paid').length}</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabs & Header */}
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
            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={() => handleOpenPayrollDialog()}>
              Process Payroll
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Filters (only for Payroll mode) */}
      {viewMode === "payroll" && (
        <Stack direction="row" spacing={2} mb={3} alignItems="center">
          <TextField
            select
            size="small"
            label="Month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
        </Stack>
      )}

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{viewMode === 'rates' ? 'Monthly Rate' : 'Net Salary'}</TableCell>
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
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isUser = viewMode === "rates";
                const userObj = isUser ? item : item.user;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
                          {(userObj?.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">{userObj?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{userObj?.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{userObj?.Role?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        ${Number(isUser ? item.salary : item.netSalary).toLocaleString()}
                      </Typography>
                    </TableCell>
                    {!isUser && (
                      <>
                        <TableCell>
                          <Tooltip title={`Base: ${item.baseSalary}, OT: ${item.overtimeSalary}, Bonus: ${item.bonus}, Ded: ${item.deduction}`}>
                            <Chip size="small" label="View Details" variant="outlined" sx={{ cursor: 'help' }} />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={item.status.toUpperCase()} 
                            color={item.status === 'paid' ? 'success' : 'warning'}
                            icon={item.status === 'paid' ? <CheckCircle fontSize="small" /> : undefined}
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell align="right">
                      {isUser ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit Rate">
                            <IconButton size="small" color="primary" onClick={() => handleEditSalary(item)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Process this Month">
                            <IconButton size="small" color="success" onClick={() => handleOpenPayrollDialog(item)}>
                              <Payments fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {item.status === 'pending' && (
                            <Tooltip title="Mark as Paid">
                              <IconButton size="small" color="success" onClick={() => handleUpdatePayrollStatus(item.id, 'paid')}>
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Record">
                            <IconButton size="small" color="error" onClick={() => handleDeletePayroll(item.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No records found matching current criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Salary;
