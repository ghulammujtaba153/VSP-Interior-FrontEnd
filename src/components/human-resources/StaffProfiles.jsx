"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  TextField,
  Button,
  Stack,
  Switch,
  Pagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import {
  PersonOutline,
  Block,
  Add,
  Search,
  CheckCircle,
  TrendingUp,
  Edit,
  Delete,
  Mail,
  CalendarToday
} from "@mui/icons-material";
import Loader from "../loader/Loader";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import UserModal from "../users/UserModal";
import { toast } from "react-toastify";
import { useAuth } from '@/context/authContext';
import Link from "next/link";

const StaffProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // cards per page
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  // UserModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedUser, setSelectedUser] = useState(null);

  // Delete confirmation dialog state
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/user/get?page=${page}&limit=${limit}`
      );
      setStaff(response.data.users || response.data.data || (Array.isArray(response.data) ? response.data : []));
      setTotalPages(response.data.total ? Math.ceil(response.data.total / limit) : response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/role/get`);
      setRoles(res.data || []);
    } catch (error) {
      console.error("Error roles:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
    // eslint-disable-next-line
  }, [page]);

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    toast.loading("Updating status...");
    try {
      await axios.put(`${BASE_URL}/api/user/update-status/${id}`, {
        status: newStatus,
        userId: user.id
      });

      
      setStaff((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus } : s
        )
      );
      toast.dismiss();
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Error updating status");
    }
  };

  // Open modal for add or edit
  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Save user (add or edit)
  const handleSaveUser = async (formData) => {
    toast.loading("Saving user...");
    try {
      if (modalMode === "edit") {
        await axios.put(`${BASE_URL}/api/user/update/${formData.id}`, formData);
        toast.success("User updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/user/create`, formData);
        toast.success("User created successfully");
      }
      fetchStaff();
      handleCloseModal();
    } catch (error) {
      toast.error("Error saving user");
    } finally {
      toast.dismiss();
    }
  };

  // Open confirmation dialog for deletion
  const handleDeleteUser = (userRow) => {
    setUserToDelete(userRow);
    setConfirmationOpen(true);
  };

  // Confirm deletion
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    toast.loading("Deleting user...");
    try {
      await axios.delete(`${BASE_URL}/api/user/delete/${userToDelete.id}`);
      fetchStaff();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Error deleting user");
    } finally {
      toast.dismiss();
      setConfirmationOpen(false);
      setUserToDelete(null);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setUserToDelete(null);
  };

  const filteredStaff = (Array.isArray(staff) ? staff : []).filter(
    (member) => {
      const matchesSearch =
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.Role?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus =
        statusFilter === "all" ||
        member.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    }
  );

  const activeCount = (Array.isArray(staff) ? staff : []).filter(s => s.status === 'active').length;
  const suspendedCount = (Array.isArray(staff) ? staff : []).filter(s => s.status === 'suspended').length;
  const totalCount = (Array.isArray(staff) ? staff : []).length;

  if(loading) return <Loader/>

  return (
    <Box sx={{ py: 2 }}>
      {/* User Modal for Add/Edit */}
      <UserModal
        open={modalOpen}
        mode={modalMode}
        userProfile={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmationOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Delete Staff Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <b>{userToDelete?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Stats Summary */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Staff</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={600}>{totalCount}</Typography>
              </Box>
              <PersonOutline fontSize="large" color="primary" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Active Members</Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>{activeCount}</Typography>
              </Box>
              <TrendingUp fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Suspended Account</Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>{suspendedCount}</Typography>
              </Box>
              <Block fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Staff Profiles Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Full directory of project teams and employee roles
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} width={{ xs: "100%", sm: "auto" }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              select
              size="small"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              label="Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
            onClick={() => handleOpenModal("create")}
            sx={{ height: 40 }}
          >
            Add Staff
          </Button>
        </Stack>
      </Stack>

      {/* Staff Cards */}
      <Grid container spacing={4}>
        {filteredStaff.map((member) => (
          <Grid item xs={12} sm={6} md={6} lg={6} key={member.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    {member.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                }
                action={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 'medium', color: member.status === 'active' ? 'success.main' : 'error.main' }}>
                        {member.status === "active" ? "Active" : "Suspended"}
                      </Typography>
                      <Switch
                        size="small"
                        checked={member.status === "active"}
                        onChange={() => handleStatusToggle(member.id, member.status)}
                        color="primary"
                      />
                    </Stack>
                    <Stack direction="row" spacing={0}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenModal("edit", member)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(member)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                }
                title={
                  <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '200px' }}>
                    {member.name}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {member.Role?.name || "No Role"}
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Mail fontSize="small" color="action" />
                    <Typography variant="body2" color="text.primary" noWrap>
                      {member.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Joined {member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Link href={`/human-resource/staff/${member.id}`} passHref style={{ textDecoration: 'none' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        View Full Profile
                      </Button>
                    </Link>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredStaff.length === 0 && (
          <Box textAlign="center" py={6} width="100%">
            <Typography color="text.secondary">
              No staff members found matching your search.
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default StaffProfiles;
