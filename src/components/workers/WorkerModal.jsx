"use client";

import { BASE_URL } from "@/configs/url";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";

const WorkerModal = ({ open, onClose, refresh, edit, view }) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    jobTitle: "",
    weeklyHours: "",
    hourlyRate: "",
    status: "active",
    userId: "",
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  // Reset or populate data on modal open
  useEffect(() => {
    if (edit) {
      setData(edit);
    } else {
      setData({
        name: "",
        email: "",
        phone: "",
        address: "",
        jobTitle: "",
        weeklyHours: "",
        hourlyRate: "",
        status: "active",
        userId: "",
      });
    }
  }, [edit, open]);

  // Fetch Users (only once per open)
  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get?page=1&limit=1000`);
      // Filter only users having roles 'Manager' or 'Worker'
      const filtered = res.data.filter(
        (u) =>
          u?.Role?.name?.toLowerCase() == "project manager" ||
          u?.Role?.name?.toLowerCase() == "worker"
      );
      setUsers(filtered);
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // When selecting userId, auto-fill name & email
    if (name === "userId") {
      const selectedUser = users.find((u) => u.id === value);
      if (selectedUser) {
        setData({
          ...data,
          userId: value,
          name: selectedUser.name,
          email: selectedUser.email,
        });
      }
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const handleSubmit = async () => {
    toast.dismiss();
    toast.loading("Processing...");
    setLoading(true);

    try {
      if (edit) {
        await axios.put(`${BASE_URL}/api/workers/update/${data.id || data._id}`, data);
        toast.dismiss();
        toast.success("Worker updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/workers/create`, data);
        toast.dismiss();
        toast.success("Worker added successfully");
      }
      refresh();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {view ? "View Worker" : edit ? "Edit Worker" : "Add Worker"}
      </DialogTitle>

      <DialogContent dividers>
        {fetchingUsers ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Assign User Dropdown */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" disabled={view}>
                <InputLabel>Select User</InputLabel>
                <Select
                  sx={{ minWidth: "200px" }}
                  name="userId"
                  value={data.userId || ""}
                  onChange={handleChange}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {[
              { name: "name", label: "Name" },
              { name: "email", label: "Email" },
              { name: "phone", label: "Phone" },
              { name: "address", label: "Address" },
              { name: "jobTitle", label: "Job Title" },
              { name: "weeklyHours", label: "Weekly Hours", type: "number" },
              { name: "hourlyRate", label: "Hourly Rate", type: "number" },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  fullWidth
                  margin="dense"
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  value={data[field.name] || ""}
                  onChange={handleChange}
                  disabled={view || field.name === "name" || field.name === "email"}
                />
              </Grid>
            ))}

            {/* Status Dropdown */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" disabled={view}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={data.status}
                  onChange={handleChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
        {!view && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : edit ? "Update" : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WorkerModal;
