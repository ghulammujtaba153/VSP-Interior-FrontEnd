"use client";

import React, { useEffect, useState } from "react";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";
import axios from "axios";

const AddScheduleDialog = ({ open, onOpenChange, editData, refreshList }) => {
  const isEditMode = Boolean(editData);
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("edit data", editData)

  const [form, setForm] = useState({
    projectSetupId: "",
    startDate: "",
    endDate: "",
    workerAssignments: [], // [{ workerId, hoursAssigned }]
    notes: "",
  });

  // ✅ Fetch projects and workers
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project-setup/get`);
      setProjects(res.data.data || []);
    } catch {
      toast.error("Error fetching projects");
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/workers/get`);
      const activeWorkers = (res.data.workers || []).filter(
        (worker) => worker.status === "active"
      );
      setWorkers(activeWorkers);
    } catch {
      toast.error("Error fetching workers");
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([fetchProjects(), fetchWorkers()]).finally(() =>
        setLoading(false)
      );
    }
  }, [open]);

  // ✅ Prefill data in Edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setForm({
        projectSetupId: editData.projectSetupId || "",
        startDate: editData.startDate?.split("T")[0] || "",
        endDate: editData.endDate?.split("T")[0] || "",
        notes: editData.notes || "",
        workerAssignments:
          editData.workers?.map((w) => ({
            workerId: w.id,
            hoursAssigned: w.ProjectSetupJobWorker?.hoursAssigned || 0,
          })) || [],
      });
    } else {
      setForm({
        projectSetupId: "",
        startDate: "",
        endDate: "",
        workerAssignments: [],
        notes: "",
      });
    }
  }, [editData, isEditMode, open]);

  // ✅ Handle worker selection
  const handleWorkerSelection = (e) => {
    const selectedIds =
      typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;

    setForm((prev) => {
      const updatedAssignments = selectedIds.map((workerId) => {
        const existing = prev.workerAssignments.find(
          (w) => w.workerId === workerId
        );
        return existing || { workerId, hoursAssigned: 0 };
      });
      return { ...prev, workerAssignments: updatedAssignments };
    });
  };

  // ✅ Handle hours change per worker
  const handleHourChange = (workerId, value) => {
    setForm((prev) => ({
      ...prev,
      workerAssignments: prev.workerAssignments.map((w) =>
        w.workerId === workerId ? { ...w, hoursAssigned: Number(value) } : w
      ),
    }));
  };

  // ✅ Handle submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { projectSetupId, startDate, endDate, workerAssignments, notes } = form;

    if (!projectSetupId || !startDate || !endDate || workerAssignments.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    const payload = {
      projectSetupId,
      startDate,
      endDate,
      notes,
      workerIds: workerAssignments, // matches backend expected format
    };

    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/api/job-scheduling/update/${editData.id}`, payload);
        toast.success("Schedule updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/job-scheduling/create`, payload);
        toast.success("Schedule created successfully!");
      }

      refreshList?.();
      handleClose();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    }
  };

  // ✅ Handle close
  const handleClose = () => {
    setForm({
      projectSetupId: "",
      startDate: "",
      endDate: "",
      workerAssignments: [],
      notes: "",
    });
    onOpenChange(false);
  };

  const selectedWorkerIds = form.workerAssignments.map((w) => w.workerId);

  if (loading) return <Loader />;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditMode ? "Edit Schedule" : "Add New Schedule"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isEditMode
            ? "Update the project schedule and adjust worker assignments."
            : "Create a new project schedule and assign workers with hours."}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Project */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="project-label">Project</InputLabel>
                <Select
                  labelId="project-label"
                  value={form.projectSetupId}
                  sx={{ minWidth: 120 }}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, projectSetupId: e.target.value }))
                  }
                  label="Project"
                  disabled={isEditMode} // prevent changing project on edit
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Dates */}
            <Grid item xs={6}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </Grid>

            {/* Worker Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="workers-label">Assign Workers</InputLabel>
                <Select
                  labelId="workers-label"
                  multiple
                  sx={{ minWidth: 150}}
                  value={selectedWorkerIds}
                  onChange={handleWorkerSelection}
                  input={<OutlinedInput label="Assign Workers" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {workers
                        .filter((w) => selected.includes(w.id))
                        .map((w) => (
                          <Chip key={w.id} label={w.name} size="small" />
                        ))}
                    </Box>
                  )}
                >
                  {workers.map((worker) => (
                    <MenuItem key={worker.id} value={worker.id}>
                      <Checkbox checked={selectedWorkerIds.includes(worker.id)} />
                      <ListItemText
                        primary={worker.name}
                        secondary={`${worker.jobTitle} - ${worker.status}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Worker Hours Input */}
            {form.workerAssignments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                  Assign Hours:
                </Typography>
                {form.workerAssignments.map((assignment) => {
                  const worker = workers.find((w) => w.id === assignment.workerId);
                  return (
                    <Box
                      key={assignment.workerId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ flex: 1 }}>{worker?.name}</Typography>
                      <TextField
                        type="number"
                        label="Hours"
                        size="small"
                        sx={{ width: 100 }}
                        value={assignment.hoursAssigned}
                        onChange={(e) =>
                          handleHourChange(assignment.workerId, e.target.value)
                        }
                      />
                    </Box>
                  );
                })}
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any additional notes..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEditMode ? "Update Schedule" : "Create Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddScheduleDialog;
