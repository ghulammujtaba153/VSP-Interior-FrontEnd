"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

const AddScheduleDialog = ({ open, onOpenChange }) => {
  const [form, setForm] = useState({
    projectName: "",
    client: "",
    location: "",
    startDate: "",
    endDate: "",
    workers: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Schedule created successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Add New Schedule</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a new project schedule with milestones and resource allocation.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                id="projectName"
                label="Project Name"
                fullWidth
                value={form.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="client"
                label="Client"
                fullWidth
                value={form.client}
                onChange={handleChange}
                placeholder="Enter client name"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="location"
                label="Location"
                fullWidth
                value={form.location}
                onChange={handleChange}
                placeholder="Enter project location"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                id="startDate"
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                id="endDate"
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="workers"
                label="Assigned Workers"
                fullWidth
                value={form.workers}
                onChange={handleChange}
                placeholder="Enter worker names (comma separated)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="notes"
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="outlined" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddScheduleDialog;
