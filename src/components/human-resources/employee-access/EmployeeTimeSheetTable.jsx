"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Stack,
  TablePagination,
  TextField,
  Divider
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Add as AddIcon,
  Timer,
  AssignmentTurnedIn,
  TrendingUp,
  Search
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../loader/Loader";
import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";
import TimeSheetHeatMap from "../TimeSheetHeatMap";
import EmployeeTimeSheetModal from "./EmployeeTimeSheetModal";

const EmployeeTimeSheetTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const {user} = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/employee-timesheet/get/employee/${user.id}`);
      setData(res.data.data || res.data || []);
    } catch (error) {
      toast.error("Failed to fetch employee timesheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayEntry = (data || []).find(item => item.date === getTodayDate());
  const hasCheckedIn = !!todayEntry;
  const hasCheckedOut = !!todayEntry?.endTime;

  const sortedData = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) return dateB - dateA;
      return (b.id || 0) - (a.id || 0);
    });
  }, [data]);

  const filteredData = sortedData.filter(item => 
    item.date?.includes(searchTerm) || 
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper for Net Hours (same logic as main dashboard)
  const calculateNetHours = (start, end) => {
    if (!start || !end) return 0;
    try {
      const s = new Date(`1970-01-01T${start}`);
      const e = new Date(`1970-01-01T${end}`);
      let diff = (e - s) / (1000 * 60 * 60);
      if (diff < 0) diff += 24;
      return diff;
    } catch (err) { return 0; }
  };

  const stats = {
    total: data.length,
    approvedHours: data
      .filter(d => d.status === 'approved')
      .reduce((acc, d) => acc + calculateNetHours(d.startTime, d.endTime), 0),
    overworkDays: data.filter(d => d.overWork && d.overWork !== "00:00:00").length,
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
            My Timesheets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Today is <b>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
          </Typography>
        </Box>
        
        <Box>
          {!hasCheckedIn ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelected(null);
                setModalOpen(true);
              }}
              sx={{ borderRadius: 2, px: 4, height: 56, fontSize: '1.1rem', fontWeight: 600 }}
            >
              Check In
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              variant="contained"
              size="large"
              color="warning"
              startIcon={<Timer />}
              onClick={() => {
                setSelected(todayEntry);
                setModalOpen(true);
              }}
              sx={{ borderRadius: 2, px: 4, height: 56, fontSize: '1.1rem', fontWeight: 600 }}
            >
              Check Out
            </Button>
          ) : (
            <Chip 
              label="Completed for Today" 
              color="success" 
              variant="filled" 
              sx={{ height: 48, px: 2, fontSize: '1rem', fontWeight: 600, borderRadius: 2 }}
            />
          )}
        </Box>
      </Box>

      {/* 🟢 Personal Activity Heatmap */}
      <Box mb={4}>
        <TimeSheetHeatMap data={data} />
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, borderLeft: '4px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Submissions</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={700}>{stats.total}</Typography>
              </Box>
              <AssignmentTurnedIn fontSize="large" color="primary" sx={{ opacity: 0.8 }} />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, borderLeft: '4px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Approved Hours</Typography>
                <Typography variant="h5" color="success.main" fontWeight={700}>{stats.approvedHours.toFixed(1)}h</Typography>
              </Box>
              <Timer fontSize="large" color="success" sx={{ opacity: 0.8 }} />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1, borderLeft: '4px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Overtime Logs</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={700}>{stats.overworkDays} Days</Typography>
              </Box>
              <TrendingUp fontSize="large" color="warning" sx={{ opacity: 0.8 }} />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <Typography variant="h6" fontWeight="700">Detailed Logs</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search date or status..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                InputProps={{ 
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                  sx: { borderRadius: 2 }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelected(null);
                  setModalOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Log Entry
              </Button>
            </Stack>
          </Box>
          <Divider />

      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Shift Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Overtime</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row) => {
              const duration = calculateNetHours(row.startTime, row.endTime);
              const isActive = row.date === getTodayDate() && !row.endTime;
              
              return (
                <TableRow 
                  key={row.id} 
                  hover 
                  sx={{ 
                    ...(isActive && { 
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
                    })
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {row.date}
                      {isActive && (
                        <Chip 
                          label="LIVE" 
                          size="small" 
                          color="primary" 
                          sx={{ 
                            height: 18, 
                            fontSize: '0.65rem', 
                            fontWeight: 900,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.5 },
                              '100%': { opacity: 1 }
                            }
                          }} 
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600} color="primary.main">{row.startTime || "--:--"}</Typography>
                      <Typography variant="caption" color="text.secondary">to</Typography>
                      {isActive ? (
                        <Typography variant="body2" fontWeight={700} color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Active <Box sx={{ width: 6, height: 6, bgcolor: 'success.main', borderRadius: '50%' }} />
                        </Typography>
                      ) : (
                        <Typography variant="body2" fontWeight={600}>{row.endTime}</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={isActive ? "Calculating..." : `${duration.toFixed(1)}h`} 
                      size="small" 
                      color={isActive ? "success" : "primary"} 
                      variant={isActive ? "filled" : "outlined"} 
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    {row.overWork && row.overWork !== "00:00:00" ? (
                      <Chip label={row.overWork} size="small" color="warning" variant="tonal" />
                    ) : (
                      <Typography variant="caption" color="text.disabled">--</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color={isActive ? "warning" : "primary"} 
                      onClick={() => { setSelected(row); setModalOpen(true); }}
                      title={isActive ? "Check Out" : "Edit"}
                    >
                      {isActive ? <Timer fontSize="small" /> : <EditIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">No timesheets found for the selected criteria.</Typography>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
    </CardContent>
  </Card>

      {/* Modal */}
      {modalOpen && (
        <EmployeeTimeSheetModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fetchData={fetchData}
          editData={selected}
        />
      )}
    </Box>
  );
};

export default EmployeeTimeSheetTable;
