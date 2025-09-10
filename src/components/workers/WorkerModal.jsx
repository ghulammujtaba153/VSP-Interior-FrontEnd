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
  });

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
      });
    }
  }, [edit]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    toast.loading("Processing...");

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
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {view ? "View Worker" : edit ? "Edit Worker" : "Add Worker"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
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
                disabled={view}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
        {!view && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {edit ? "Update" : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WorkerModal;
