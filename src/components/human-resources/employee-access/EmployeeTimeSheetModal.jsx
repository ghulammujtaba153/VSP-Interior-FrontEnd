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

  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    employeeId: user?.id || "",
    date: getTodayDate(),
    startTime: "",
    endTime: "",
    overWork: "",
    status: "pending",
  });

  // helper to convert HH:MM(:SS) to decimal hours
  const timeToDecimal = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return Number((hours + minutes / 60).toFixed(2));
  };

  // helper to convert decimal hours to HH:MM:00
  const decimalToTime = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours)) return "00:00:00";
    const num = Number(decimalHours);
    const hours = Math.floor(Math.abs(num));
    const minutes = Math.round((Math.abs(num) - hours) * 60);
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}:00`;
  };

  useEffect(() => {
    if (editData) {
      setFormData({
        employeeId: editData.employeeId,
        date: editData.date,
        startTime: editData.startTime,
        endTime: editData.endTime,
        overWork: timeToDecimal(editData.overWork) || "",
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
      const payload = {
        ...formData,
        overWork: decimalToTime(formData.overWork)
      };

      if (edit) {
        await axios.put(
          `${BASE_URL}/api/employee-timesheet/update/${editData.id}`,
          payload
        );
        toast.dismiss();
        toast.success("Record updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/employee-timesheet/create`, payload);
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
            label="Overtime (Total Hours)"
            name="overWork"
            type="number"
            inputProps={{ step: "0.1", min: "0" }}
            value={formData.overWork}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder="e.g. 2.5"
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
