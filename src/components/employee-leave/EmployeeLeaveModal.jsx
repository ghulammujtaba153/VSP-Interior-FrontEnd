"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";
import { toast } from 'react-toastify';

const EmployeeLeaveModal = ({ open, handleClose, onLeaveAdded, editLeave }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [error, setError] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setError("");
    if (editLeave) {
      setForm({
        leaveType: editLeave.leaveType || "",
        startDate: editLeave.startDate || "",
        endDate: editLeave.endDate || "",
        reason: editLeave.reason || "",
      });
    } else {
      setForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
    }
  }, [editLeave, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.startDate || form.startDate < today) {
      setError("Start date cannot be earlier than today.");
      return;
    }
    if (!form.endDate || form.endDate < form.startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }
    toast.loading("Please wait...");
    try {
      if (editLeave) {
        await axios.put(`${BASE_URL}/api/employee-leave/update/${editLeave.id}`, {
          ...form,
          employeeId: user.id,
        });
        toast.dismiss();
        toast.success("Leave updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/employee-leave/create`, {
          ...form,
          employeeId: user.id,
        });
        toast.dismiss();
        toast.success("Leave requested successfully");
      }
      onLeaveAdded(); // refresh list
      handleClose();
    } catch (error) {
      toast.dismiss();
      setError("Error saving leave.");
      console.error("Error saving leave:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>{editLeave ? "Edit Leave" : "Request Leave"}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          margin="dense"
          label="Leave Type"
          name="leaveType"
          value={form.leaveType}
          onChange={handleChange}
          fullWidth
          select
        >
          <MenuItem value="sick">Sick Leave</MenuItem>
          <MenuItem value="casual">Casual Leave</MenuItem>
          <MenuItem value="annual">Annual Leave</MenuItem>
        </TextField>

        <TextField
          margin="dense"
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: today,
          }}
        />

        <TextField
          margin="dense"
          label="End Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: form.startDate || today,
          }}
        />

        <TextField
          margin="dense"
          label="Reason"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {editLeave ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeLeaveModal;
