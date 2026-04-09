"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import { BASE_URL } from "@/configs/url";
import { useState, useEffect, useMemo } from "react";

const EmployeeTimeSheetModal = ({ open, onClose, fetchData, editData }) => {
  const { user } = useAuth();
  const edit = Boolean(editData);
  
  // Decide if this is a "Check Out" operation
  const isCheckOut = edit && !editData.endTime;
  const isCheckIn = !edit;

  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const d = new Date();
    return d.toTimeString().slice(0, 5); // "HH:mm"
  };

  const [formData, setFormData] = useState({
    employeeId: user?.id || "",
    date: getTodayDate(),
    startTime: getCurrentTime(),
    endTime: "",
    overWork: "0",
    status: "pending",
  });

  // helper to convert HH:MM(:SS) to decimal hours
  const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours + minutes / 60;
  };

  // helper to convert decimal hours to HH:MM:00
  const decimalToTime = (decimalHours) => {
    if (decimalHours === "" || isNaN(decimalHours)) return "00:00:00";
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
        startTime: editData.startTime || "",
        endTime: isCheckOut ? getCurrentTime() : (editData.endTime || ""),
        overWork: editData.overWork ? (timeToDecimal(editData.overWork).toFixed(2)) : "0",
        status: editData.status,
      });
    } else {
      setFormData({
        employeeId: user?.id || "",
        date: getTodayDate(),
        startTime: getCurrentTime(),
        endTime: "",
        overWork: "0",
        status: "pending",
      });
    }
  }, [editData, open]);

  // Handle Automatic Overwork Calculation
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = timeToDecimal(formData.startTime);
      const end = timeToDecimal(formData.endTime);
      let duration = end - start;
      if (duration < 0) duration += 24; // Handle overnight shifts if any

      // Assuming standard 9 hours work day (including breaks/lunch which is often 1h)
      const standardHours = 9;
      if (duration > standardHours) {
        setFormData(prev => ({ ...prev, overWork: (duration - standardHours).toFixed(2) }));
      } else {
        setFormData(prev => ({ ...prev, overWork: "0" }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      toast.loading(isCheckIn ? "Checking In..." : isCheckOut ? "Checking Out..." : "Updating...");
      const payload = {
        ...formData,
        endTime: formData.endTime || null, // Fix: Send null instead of empty string
        overWork: decimalToTime(formData.overWork)
      };

      if (edit) {
        await axios.put(
          `${BASE_URL}/api/employee-timesheet/update/${editData.id}`,
          payload
        );
        toast.dismiss();
        toast.success(isCheckOut ? "Checked out successfully" : "Record updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/employee-timesheet/create`, payload);
        toast.dismiss();
        toast.success("Checked in successfully");
      }

      fetchData();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to save record");
    }
  };

  const title = isCheckIn ? "Daily Check In" : isCheckOut ? "Daily Check Out" : "Edit Timesheet";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <Divider />

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={isCheckIn || isCheckOut} // Fix date for check in/out
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Start Time"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={isCheckOut} // Don't change check-in time during check-out
            />
            <TextField
              label="End Time"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={isCheckIn} // Can't set end time during check-in
            />
          </Stack>

          <TextField
            label="Calculated Overtime (Hours)"
            name="overWork"
            type="number"
            inputProps={{ step: "0.1", min: "0" }}
            value={formData.overWork}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Auto-calculated based on 9-hour work day"
            color="warning"
          />

          {isCheckOut && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Shift Summary:</Typography>
              <Typography variant="body2">
                Duration: {((timeToDecimal(formData.endTime) - timeToDecimal(formData.startTime) + 24) % 24).toFixed(2)} hours
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          color={isCheckOut ? "warning" : "primary"}
        >
          {isCheckIn ? "Check In" : isCheckOut ? "Check Out" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeTimeSheetModal;

