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
} from "@mui/material";
import {
  Search,
  Add,
  Mail,
  CalendarToday,
  Delete,
  Edit,
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

  const filteredStaff = staff.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.Role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if(loading) return <Loader/>

  return (
    <Container sx={{ py: 6 }}>
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
            Staff Profiles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee information and roles
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} width={{ xs: "100%", sm: "auto" }}>
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
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
            onClick={() => handleOpenModal("create")}
          >
            Add Staff
          </Button>
        </Stack>
      </Stack>

      {/* Staff Cards */}
      <Grid container spacing={3}>
        {filteredStaff.map((member) => (
          <Grid item xs={12} md={6} lg={4} key={member.id}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar>
                    {member.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                }
                action={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {/* Status Toggle */}
                    <Typography variant="body2">
                      {member.status === "active" ? "Active" : "Suspended"}
                    </Typography>
                    <Switch
                      checked={member.status === "active"}
                      onChange={() =>
                        handleStatusToggle(member.id, member.status)
                      }
                      color="primary"
                    />
                    {/* Edit Button */}
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal("edit", member)}
                    >
                      <Edit />
                    </IconButton>
                    {/* Delete Button */}
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(member)}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                }
                title={<Typography variant="h6">{member.name}</Typography>}
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {member.Role?.name || "No Role"}
                  </Typography>
                }
              />
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Mail fontSize="small" />
                    <Typography variant="body2">{member.email}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      Joined{" "}
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString("en-US")
                        : ""}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Link href={`/human-resource/staff/${member.id}`} passHref>
                      <Button
                        size="small"
                        variant="outlined"
                        >View Profile
                      </Button>
                    </Link>
                    </Stack>


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
    </Container>
  );
};

export default StaffProfiles;
