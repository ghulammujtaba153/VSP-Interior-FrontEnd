"use client";

import React, { useEffect, useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

export default function GanttTry() {
  const { id } = useParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: "",
    start: "",
    end: "",
    dependsOn: "",
    description: "",
    priority: "",
    progress: 0, // <-- add this
  });
  const [pendingTaskUpdate, setPendingTaskUpdate] = useState(null);

  // Map backend data -> Gantt task format
  const mapToGanttTasks = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((t) => ({
      id: t.id?.toString(),
      name: t.taskName || "Untitled Task",
      start: t.startDate ? new Date(t.startDate) : new Date(),
      end: t.endDate
        ? new Date(t.endDate)
        : new Date(new Date().setDate(new Date().getDate() + 1)),
      type: "task",
      progress: t.progress || 0,
      dependencies: t.taskDependency ? [t.taskDependency.toString()] : [],
      dependsOn: t.taskDependency ? t.taskDependency.toString() : "", // <-- Add this line
      description: t.description || "",
      priority: t.priority || "medium",
    }));
  };

  // Fetch tasks
  const getDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project-management/get/${id}`);
      let mapped = mapToGanttTasks(res.data);

      // Sort: tasks with no dependencies first, then by creation order (assuming lower id = older)
      mapped = [
        ...mapped.filter((t) => !t.dependencies || t.dependencies.length === 0),
        ...mapped.filter((t) => t.dependencies && t.dependencies.length > 0),
      ];

      setTasks(mapped);
    } catch (error) {
      console.error("Error fetching project management data:", error);
      toast.error("Failed to load project tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
    // eslint-disable-next-line
  }, []);

  // Add Task
  const handleAddTask = async () => {
    if (!newTask.name || !newTask.start || !newTask.end) return;

    toast.loading("loading...");

    try {
      const res = await axios.post(`${BASE_URL}/api/project-management/create`, {
        projectId: id,
        taskName: newTask.name,
        startDate: newTask.start,
        endDate: newTask.end,
        status: "pending",
        description: newTask.description || "",
        priority: newTask.priority || "medium",
        progress: newTask.progress || 0, // <-- send progress
        taskDependency: newTask.dependsOn || null,
      });

      const newMappedTask = mapToGanttTasks([res.data.project])[0];
      setTasks([...tasks, newMappedTask]);
      toast.dismiss();
      toast.success("Task added successfully");

      setNewTask({
        name: "",
        start: "",
        end: "",
        dependsOn: "",
        description: "",
        priority: "",
        progress: 0, // reset progress
      });
      setOpen(false);
    } catch (error) {
      toast.dismiss();
      console.error("Error creating task:", error);
      toast.error("Failed to add task");
    }
  };

  // Remove Task
  const handleRemoveTask = async (id) => {
    toast.loading("loading...");
    try {
      await axios.delete(`${BASE_URL}/api/project-management/delete/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.dismiss();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.dismiss();
      toast.error("Failed to delete task");
    }
  };

  // Update task (drag/resize/progress)
  const handleDateChange = (task) => {
    setPendingTaskUpdate(task); // Store the updated task, but don't save yet
    // Optionally, visually update the chart immediately:
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))
    );
  };

  // Save the pending update to backend
  const handleSaveTaskUpdate = async () => {
    if (!pendingTaskUpdate) return;
    try {
      await axios.put(`${BASE_URL}/api/project-management/update/${pendingTaskUpdate.id}`, {
        startDate: pendingTaskUpdate.start,
        endDate: pendingTaskUpdate.end,
        progress: pendingTaskUpdate.progress,
      });
      toast.success("Task updated successfully");
      setPendingTaskUpdate(null);
      getDetails();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  // Open edit dialog when clicking a task in the chart
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditDialog(true);
  };

  // Save edits from modal
  const handleEditSave = async () => {
    if (!selectedTask) return;
    toast.loading("loading...");
    try {
      await axios.put(`${BASE_URL}/api/project-management/update/${selectedTask.id}`, {
        taskName: selectedTask.name,
        startDate: selectedTask.start,
        endDate: selectedTask.end,
        description: selectedTask.description,
        priority: selectedTask.priority,
        progress: selectedTask.progress,
        taskDependency: selectedTask.dependsOn || null,
      });
      toast.dismiss();
      toast.success("Task updated successfully");
      setEditDialog(false);
      setSelectedTask(null);
      getDetails();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to update task");
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: 16 }} className="bg-white p-4 rounded shadow">
      <div style={{ marginBottom: 16 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Task
        </Button>
      </div>

      <div style={{ height: "600px", width: "100%" }}>
        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            viewMode={ViewMode.Week}
            onDateChange={handleDateChange}
            onProgressChange={handleDateChange}
            onDelete={(task) => handleRemoveTask(task.id)}
            onClick={handleTaskClick}
          />
        ) : (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            No tasks available. Click <b>+ Add Task</b> to create one.
          </p>
        )}
      </div>

      {/* Save button for drag/resize update */}
      {pendingTaskUpdate && (
        <div style={{ margin: "16px 0", textAlign: "right" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTaskUpdate}
          >
            Save Gantt Changes
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            style={{ marginLeft: 8 }}
            onClick={() => setPendingTaskUpdate(null)}
          >
            Cancel
          </Button>
        </div>
      )}

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveTask(task.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
            button
            onClick={() => handleTaskClick(task)}
          >
            <ListItemText
              primary={task.name}
              secondary={`${task.start.toLocaleDateString()} → ${task.end.toLocaleDateString()} ${
                task.dependencies.length
                  ? `(depends on ${task.dependencies.join(", ")})`
                  : ""
              }`}
            />
          </ListItem>
        ))}
      </List>

      {/* Add Task Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8, minWidth: 500 }}
        >
          <TextField
            label="Task name"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
          />
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newTask.start}
            onChange={(e) => setNewTask({ ...newTask, start: e.target.value })}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newTask.end}
            onChange={(e) => setNewTask({ ...newTask, end: e.target.value })}
          />
          {/* Dropdown for Depends On */}
          <FormControl fullWidth>
            <InputLabel>Depends on (Task)</InputLabel>
            <Select
              value={newTask.dependsOn}
              label="Depends on (Task)"
              onChange={(e) => setNewTask({ ...newTask, dependsOn: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          {/* Dropdown for Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          {/* Dropdown for Progress */}
          <FormControl fullWidth>
            <InputLabel>Progress</InputLabel>
            <Select
              value={newTask.progress}
              label="Progress"
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  progress: Number(e.target.value),
                }))
              }
            >
              <MenuItem value={0}>0%</MenuItem>
              <MenuItem value={25}>25%</MenuItem>
              <MenuItem value={50}>50%</MenuItem>
              <MenuItem value={75}>75%</MenuItem>
              <MenuItem value={100}>100%</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTask}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8, minWidth: 500 }}
        >
          <TextField
            label="Task name"
            value={selectedTask?.name || ""}
            onChange={(e) =>
              setSelectedTask((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              selectedTask?.start
                ? new Date(selectedTask.start).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) =>
              setSelectedTask((prev) => ({
                ...prev,
                start: e.target.value,
              }))
            }
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              selectedTask?.end
                ? new Date(selectedTask.end).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) =>
              setSelectedTask((prev) => ({
                ...prev,
                end: e.target.value,
              }))
            }
          />
          {/* Dropdown for Depends On */}
          <FormControl fullWidth>
            <InputLabel>Depends on (Task)</InputLabel>
            <Select
              value={selectedTask?.dependsOn || ""}
              label="Depends on (Task)"
              onChange={(e) =>
                setSelectedTask((prev) => ({
                  ...prev,
                  dependsOn: e.target.value,
                }))
              }
            >
              <MenuItem value="">None</MenuItem>
              {tasks
                .filter((task) => task.id !== selectedTask?.id)
                .map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={selectedTask?.description || ""}
            onChange={(e) =>
              setSelectedTask((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
          {/* Dropdown for Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={selectedTask?.priority || ""}
              label="Priority"
              onChange={(e) =>
                setSelectedTask((prev) => ({
                  ...prev,
                  priority: e.target.value,
                }))
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          {/* Dropdown for Progress */}
          <FormControl fullWidth>
            <InputLabel>Progress</InputLabel>
            <Select
              value={selectedTask?.progress ?? 0}
              label="Progress"
              onChange={(e) =>
                setSelectedTask((prev) => ({
                  ...prev,
                  progress: Number(e.target.value),
                }))
              }
            >
              <MenuItem value={0}>0%</MenuItem>
              <MenuItem value={25}>25%</MenuItem>
              <MenuItem value={50}>50%</MenuItem>
              <MenuItem value={75}>75%</MenuItem>
              <MenuItem value={100}>100%</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
