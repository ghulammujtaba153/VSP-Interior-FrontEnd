"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import { BASE_URL } from "@/configs/url";
import { useState, useEffect } from "react";

const EmployeeTimeSheetModal = ({ open, onClose, fetchData, editData }) => {
  const { user } = useAuth();
  const edit = Boolean(editData);

  const [formData, setFormData] = useState({
    employeeId: user?.id || "",
    date: "",
    startTime: "",
    endTime: "",
    breakTime: "",
    overWork: "00:00:00",
    status: "pending",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        employeeId: editData.employeeId,
        date: editData.date,
        startTime: editData.startTime,
        endTime: editData.endTime,
        breakTime: editData.breakTime,
        overWork: editData.overWork,
        status: editData.status,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      toast.loading(edit ? "Updating..." : "Creating...");
      if (edit) {
        await axios.put(
          `${BASE_URL}/api/employee-timesheet/update/${editData.id}`,
          formData
        );
        toast.dismiss();
        toast.success("Record updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/employee-timesheet/create`, formData);
        toast.dismiss();
        toast.success("Record created successfully");
      }

      fetchData();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to save record");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {edit ? "Edit Employee Timesheet" : "Add Employee Timesheet"}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Break Time"
            name="breakTime"
            type="time"
            value={formData.breakTime}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Over Work"
            name="overWork"
            type="time"
            value={formData.overWork}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {/* <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField> */}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {edit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeTimeSheetModal;
