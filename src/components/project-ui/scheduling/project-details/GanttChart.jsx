"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import { toast } from "react-toastify";

export default function GanttChart({ projectId, data }) {
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    name: "",
    start: "",
    end: "",
    progress: 0,
    project: "Design",
    description: "",
    status: "pending",
    dependencies: []
  });

  // Project stages for categorization
  const projectStages = [
    "Design",
    "Production", 
    "Logistics",
    "Installation",
    "General"
  ];

  // Helper function to safely convert date strings to Date objects
  const convertToDate = (dateString) => {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;
    return new Date(dateString);
  };

  // Helper function to format date for input fields
  const formatDateForInput = (date) => {
    if (!date) return "";
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  };

  // Fetch existing Gantt chart tasks
  const getGanttChart = async () => {
    if (!data?.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/project-gantt-chart/get/${data.id}`
      );

      // Map API data to Gantt chart format
      const chartData = response.data.chart.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        type: "task",
        start: convertToDate(item.start),
        end: convertToDate(item.end),
        progress: item.progress || 0,
        dependencies: item.dependencies || [],
        project: item.project || "General",
        description: item.description || "",
        status: item.status || "pending",
        originalData: item // Keep original data for updates
      }));

      setTasks(chartData);
    } catch (error) {
      console.error("Error fetching Gantt chart:", error);
      toast.error("Failed to fetch project tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new task via API
  const handleAddTask = async () => {
    const { name, start, end, progress, project, description, status, dependencies } = newTask;
    
    if (!name || !start || !end) {
      return toast.error("Please fill all required fields");
    }

    if (new Date(end) < new Date(start)) {
      return toast.error("End date cannot be before start date");
    }

    try {
      setSaving(true);
      const payload = {
        projectSetupJobId: data.id,
        name,
        start: new Date(start),
        end: new Date(end),
        progress: parseFloat(progress) || 0,
        dependencies: dependencies || [],
        project: project || "General",
        description: description || "",
        status: status || "pending"
      };

      const response = await axios.post(`${BASE_URL}/api/project-gantt-chart/create`, payload);
      
      // Add the new task to the local state
      const newTaskData = {
        id: response.data.chart.id.toString(),
        name,
        type: "task",
        start: convertToDate(start),
        end: convertToDate(end),
        progress: parseFloat(progress) || 0,
        dependencies: dependencies || [],
        project: project || "General",
        description: description || "",
        status: status || "pending",
        originalData: response.data.chart
      };

      setTasks(prev => [...prev, newTaskData]);
      setNewTask({
        name: "",
        start: "",
        end: "",
        progress: 0,
        project: "Design",
        description: "",
        status: "pending",
        dependencies: []
      });
      setOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  // Update task via API
  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      setSaving(true);
      const payload = {
        name: updatedData.name,
        start: updatedData.start,
        end: updatedData.end,
        progress: updatedData.progress,
        dependencies: updatedData.dependencies || [],
        project: updatedData.project || "General",
        description: updatedData.description || "",
        status: updatedData.status || "pending"
      };

      await axios.put(`${BASE_URL}/api/project-gantt-chart/update/${taskId}`, payload);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updatedData, originalData: { ...task.originalData, ...updatedData } }
          : task
      ));
      
      setHasChanges(false);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  // Delete task via API
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setSaving(true);
      await axios.delete(`${BASE_URL}/api/project-gantt-chart/delete/${taskId}`);
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setSaving(false);
    }
  };

  // Handle task changes (drag and drop, progress changes)
  const handleTaskChange = (task, changes) => {
    const updatedTask = { ...task, ...changes };
    
    // Update local state immediately for UI responsiveness
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    setHasChanges(true);
  };

  // Save all changes
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Update all tasks that have been modified
      const updatePromises = tasks.map(task => {
        if (task.originalData) {
          // Check if task has been modified
          const hasChanged = JSON.stringify(task) !== JSON.stringify({
            ...task,
            originalData: task.originalData
          });
          
          if (hasChanged) {
            return handleUpdateTask(task.id, {
              name: task.name,
              start: task.start,
              end: task.end,
              progress: task.progress,
              dependencies: task.dependencies,
              project: task.project,
              description: task.description,
              status: task.status
            });
          }
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      setHasChanges(false);
      toast.success("All changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      name: task.name,
      start: formatDateForInput(task.start),
      end: formatDateForInput(task.end),
      progress: task.progress,
      project: task.project,
      description: task.description || "",
      status: task.status,
      dependencies: task.dependencies || []
    });
    setOpen(true);
  };

  // Handle task click to open edit modal
  const handleTaskClick = (task) => {
    handleEditTask(task);
  };

  // Handle update existing task
  const handleUpdateExistingTask = async () => {
    if (!editingTask) return;

    const { name, start, end, progress, project, description, status, dependencies } = newTask;
    
    if (!name || !start || !end) {
      return toast.error("Please fill all required fields");
    }

    if (new Date(end) < new Date(start)) {
      return toast.error("End date cannot be before start date");
    }

    try {
      setSaving(true);
      const updatedData = {
        name,
        start: convertToDate(start),
        end: convertToDate(end),
        progress: parseFloat(progress) || 0,
        dependencies: dependencies || [],
        project: project || "General",
        description: description || "",
        status: status || "pending"
      };

      await handleUpdateTask(editingTask.id, updatedData);
      
      setNewTask({
        name: "",
        start: "",
        end: "",
        progress: 0,
        project: "Design",
        description: "",
        status: "pending",
        dependencies: []
      });
      setEditingTask(null);
      setOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const getBarStyle = (stage) => {
    const baseStyle = {
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        opacity: 0.8,
        transform: "scale(1.02)",
      },
    };

    switch (stage) {
      case "Design":
        return { ...baseStyle, backgroundColor: "#93c5fd" };
      case "Production":
        return { ...baseStyle, backgroundColor: "#86efac" };
      case "Logistics":
        return { ...baseStyle, backgroundColor: "#fde68a" };
      case "Installation":
        return { ...baseStyle, backgroundColor: "#fca5a5" };
      default:
        return { ...baseStyle, backgroundColor: "#cbd5e1" };
    }
  };

  useEffect(() => {
    if (data?.id) {
      getGanttChart();
    }
  }, [data?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Header with Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(ViewMode.Day)}
            className={`px-3 py-1 rounded ${
              viewMode === ViewMode.Day ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Month)}
            className={`px-3 py-1 rounded ${
              viewMode === ViewMode.Month
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveChanges}
              disabled={saving}
              color="primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTask(null);
              setNewTask({
                name: "",
                start: "",
                end: "",
                progress: 0,
                project: "Design",
                description: "",
                status: "pending",
                dependencies: []
              });
              setOpen(true);
            }}
            color="success"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 text-sm">
          {projectStages.map(stage => (
            <Chip
              key={stage}
              label={stage}
              size="small"
              style={{ backgroundColor: getBarStyle(stage).backgroundColor }}
            />
          ))}
        </div>
        <Typography variant="caption" color="textSecondary">
          💡 Click on any task to edit it
        </Typography>
      </div>

      {/* Gantt Chart */}
      {tasks.length > 0 ? (
        <div className="overflow-x-auto min-w-[1000px]">
          <Gantt
            tasks={tasks.map((t) => ({
              ...t,
              styles: getBarStyle(t.project),
            }))}
            viewMode={viewMode}
            onDateChange={(task, changes) => handleTaskChange(task, changes)}
            onProgressChange={(task, changes) => handleTaskChange(task, changes)}
            onDelete={(task) => handleDeleteTask(task.id)}
            onTaskClick={handleTaskClick}
            listCellWidth="220px"
            columnWidth={viewMode === ViewMode.Day ? 80 : 120}
            locale="en-GB"
          />
        </div>
      ) : (
        <div className="text-center py-10">
          <Typography variant="h6" color="textSecondary">
            No tasks found
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mt-2">
            Click "Add Task" to create your first task
          </Typography>
        </div>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? `Edit Task: ${editingTask.name}` : "Add New Task"}
        </DialogTitle>
        <DialogContent className="space-y-3 mt-2">
          <TextField
            label="Task Name *"
            fullWidth
            value={newTask.name}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, name: e.target.value }))
            }
            required
          />
          
          <Box display="flex" gap={2}>
            <TextField
              label="Start Date *"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTask.start}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, start: e.target.value }))
              }
              required
            />
            <TextField
              label="End Date *"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTask.end}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, end: e.target.value }))
              }
              required
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Progress (%)"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 100 }}
              value={newTask.progress}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, progress: e.target.value }))
              }
            />
            <FormControl fullWidth>
              <InputLabel>Project Stage</InputLabel>
              <Select
                value={newTask.project}
                label="Project Stage"
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, project: e.target.value }))
                }
              >
                {projectStages.map(stage => (
                  <MenuItem key={stage} value={stage}>
                    {stage}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              label="Status"
              onChange={(e) =>
                setNewTask((p) => ({ ...p, status: e.target.value }))
              }
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Dependencies (optional)"
            select
            fullWidth
            value={newTask.dependencies[0] || ""}
            onChange={(e) =>
              setNewTask((p) => ({ 
                ...p, 
                dependencies: e.target.value ? [e.target.value] : [] 
              }))
            }
          >
            <MenuItem value="">None</MenuItem>
            {tasks.filter(t => t.id !== editingTask?.id).map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, description: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={editingTask ? handleUpdateExistingTask : handleAddTask} 
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : editingTask ? "Update Task" : "Add Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}