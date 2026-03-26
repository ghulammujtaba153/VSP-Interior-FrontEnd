"use client";

import React, { useEffect, useState } from "react";
import Loader from "../loader/Loader";
import NoticeModal from "./NoticeModal";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Box,
  Container,
  MenuItem,
  CardHeader,
  Grid,
  Chip,
  Stack,
  TextField,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { 
  Campaign, 
  NotificationsActive, 
  Event, 
  Label,
  Search,
  Add,
  CheckCircle
} from "@mui/icons-material";

const Notices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all notices
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/notices/get`);
      const notices = res.data?.data || res.data || [];
      setData(notices);
      setPage(0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedNotice(null);
    setOpenModal(false);
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    toast.loading("Deleting notice...");
    try {
      await axios.delete(`${BASE_URL}/api/notices/delete/${noticeId}`);
      toast.dismiss();
      toast.success("Notice deleted");
      // close modal if deleted item was open
      if (selectedNotice?.id === noticeId) {
        handleCloseModal();
      }
      fetchNotices();
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Failed to delete notice");
    }
  };

  // pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 🔍 Filter logic
  const filteredData = data.filter((notice) => {
    const matchesSearch = notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notice.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || notice.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Stats
  const stats = {
    total: data.length,
    active: data.filter(n => n.status === 'active').length,
    urgent: data.filter(n => n.category === 'emergency').length,
    holidays: data.filter(n => n.category === 'holiday').length
  };

  const getCategoryChip = (cat) => {
    const configs = {
      announcement: { color: "primary", label: "Announcement" },
      hr_policy: { color: "info", label: "HR Policy" },
      emergency: { color: "error", label: "Urgent" },
      holiday: { color: "warning", label: "Holiday" },
      event: { color: "secondary", label: "Event" }
    };
    const config = configs[cat] || { color: "default", label: cat };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Notice Board</Typography>
          <Typography variant="body1" color="text.secondary">Corporate announcements and official updates</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} size="large" onClick={() => setOpenModal(true)}>
          Create Notice
        </Button>
      </Stack>

      {/* Stats Summary Section */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Notices</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{stats.total}</Typography>
              </Box>
              <Campaign fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Active Feed</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{stats.active}</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Urgent Alerts</Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>{stats.urgent}</Typography>
              </Box>
              <NotificationsActive fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Holidays</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>{stats.holidays}</Typography>
              </Box>
              <Event fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search notices by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="announcement">Announcements</MenuItem>
                <MenuItem value="hr_policy">HR Policies</MenuItem>
                <MenuItem value="emergency">Urgent Alerts</MenuItem>
                <MenuItem value="holiday">Holidays</MenuItem>
                <MenuItem value="event">Events</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Live Notice Feed" />
        <CardContent sx={{ p: 0 }}>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow><TableCell>Date</TableCell><TableCell>Category</TableCell><TableCell>Title</TableCell><TableCell>Content</TableCell><TableCell>Status</TableCell><TableCell>Attachments</TableCell><TableCell align="center">Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {paginatedData?.length > 0 ? (
                  paginatedData.map((notice) => (
                    <TableRow key={notice.id} hover><TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell><TableCell>{getCategoryChip(notice.category)}</TableCell><TableCell sx={{ fontWeight: 600 }}>{notice.title}</TableCell><TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notice.content}</TableCell><TableCell><Chip label={notice.status} color={notice.status === 'active' ? 'success' : 'default'} size="small" /></TableCell><TableCell>{notice.fileUrl ? (<a href={`${BASE_URL}${notice.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a>) : ("-")}</TableCell><TableCell><Box display="flex" alignItems="center" gap={1}><Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleEdit(notice)}><EditIcon /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(notice.id)}><DeleteIcon /></IconButton></Tooltip></Box></TableCell></TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} align="center">No notices found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

           <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Notice */}
      <NoticeModal
        open={openModal}
        onClose={handleCloseModal}
        notice={selectedNotice}
        refresh={fetchNotices}
      />
    </Container>
  );
};

export default Notices;
