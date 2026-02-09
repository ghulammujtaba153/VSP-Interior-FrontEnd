"use client";

import { useState, useEffect } from "react";
import {
  Button,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import { toast } from "react-toastify";
import GanttTaskModal from "./GanttTaskModal";

// Custom Task List Item Component
const CustomTaskListTableRow = ({ task, onTaskClick, onEditTask, onDeleteTask }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'inProgress': return '#3b82f6';
      case 'upcoming': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div 
      className="flex items-center border-b hover:bg-gray-50 cursor-pointer group relative"
      style={{ height: '44px' }}
      onClick={() => onTaskClick(task)}
    >
      {/* Task Name Column */}
      <div className="flex-1 min-w-0 px-2 py-1 border-r">
        <div className="truncate font-medium" title={task.name}>
          {task.name}
        </div>
        <div className="flex gap-1 mt-1">
          <Chip 
            label={task.status} 
            size="small" 
            style={{ 
              backgroundColor: getStatusColor(task.status),
              color: 'white',
              fontSize: '10px',
              height: '18px'
            }} 
          />
          <Chip 
            label={task.priority} 
            size="small" 
            style={{ 
              backgroundColor: getPriorityColor(task.priority),
              color: 'white',
              fontSize: '10px',
              height: '18px'
            }} 
          />
        </div>
      </div>
      
      {/* Worker Column */}
      <div className="w-40 px-2 py-1 border-r">
        <div className="text-sm text-gray-600 truncate" title={task.assignedWorker?.name || 'Unassigned'}>
          {task.assignedWorker?.name || 'Unassigned'}
        </div>
        <div className="text-xs text-gray-400 truncate">
          {task.assignedWorker?.jobTitle || ''}
        </div>
      </div>
      
      {/* From Date Column */}
      <div className="w-32 px-2 py-1 border-r">
        <div className="text-sm text-gray-600 truncate" title={formatDate(task.start)}>
          {formatDate(task.start)}
        </div>
      </div>
      
      {/* To Date Column */}
      <div className="w-32 px-2 py-1 border-r">
        <div className="text-sm text-gray-600 truncate" title={formatDate(task.end)}>
          {formatDate(task.end)}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <Tooltip title="Edit Task">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEditTask(task);
            }}
            color="primary"
            sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Task">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            color="error"
            sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

// Custom Task List Component
const CustomTaskListTable = ({ 
  tasks, 
  onTaskClick, 
  onEditTask, 
  onDeleteTask 
}) => {
  return (
    <div className="border-r bg-white">
      {/* Header */}
      <div className="flex items-center border-b font-semibold bg-gray-50" style={{ height: '44px' }}>
        <div className="flex-1 min-w-0 px-2 py-1 border-r">Task Name</div>
        <div className="w-40 px-2 py-1 border-r">Assigned To</div>
        <div className="w-32 px-2 py-1 border-r">Start Date</div>
        <div className="w-32 px-2 py-1 border-r">End Date</div>
      </div>
      
      {/* Task Rows */}
      {tasks.map((task) => (
        <CustomTaskListTableRow
          key={task.id}
          task={task}
          onTaskClick={onTaskClick}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default function GanttChart({ projectId, data }) {
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    workerId: null,
    status: "upcoming",
    priority: "medium",
    stage: "Design"
  });

  // Helper function to convert API task to Gantt task format
  const convertApiTaskToGanttTask = (apiTask) => {
    const progress = apiTask.status === 'completed' ? 100 : 
                    apiTask.status === 'inProgress' ? 50 : 0;
    
    return {
      id: apiTask.id.toString(),
      name: apiTask.title,
      type: "task",
      start: new Date(apiTask.startDate),
      end: new Date(apiTask.endDate),
      progress: progress,
      dependencies: [], // Always initialize as empty array since we don't have dependencies
      project: apiTask.stage,
      description: apiTask.description,
      status: apiTask.status,
      priority: apiTask.priority,
      assignedWorker: apiTask.assignedWorker,
      // Store original API data for reference
      originalData: apiTask
    };
  };

  // Helper function to convert Gantt task back to API format
  const convertGanttTaskToApiTask = (ganttTask) => {
    return {
      title: ganttTask.name,
      description: ganttTask.description,
      startDate: ganttTask.start,
      endDate: ganttTask.end,
      status: ganttTask.status,
      priority: ganttTask.priority,
      stage: ganttTask.project
    };
  };

  // API functions
  const getTasks = async () => {
    if (!data?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`);
      const apiTasks = res.data || [];
      console.log("Fetched tasks from API:", apiTasks);
      
      // Convert API tasks to Gantt format
      const ganttTasks = apiTasks.map(convertApiTaskToGanttTask);
      console.log("Converted Gantt tasks:", ganttTasks);
      
      setTasks(ganttTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const payload = {
        projectSetupJobId: data.id,
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate || null,
        endDate: taskData.endDate || null,
        workerId: taskData.workerId || null,
        status: taskData.status,
        priority: taskData.priority,
        stage: taskData.stage
      };

      console.log("Creating task with payload:", payload);
      const res = await axios.post(`${BASE_URL}/api/project-kanban/create`, payload);
      toast.success('Task created successfully');
      await getTasks(); // Refresh the task list
      return res.data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const payload = {
        title: taskData.name,
        description: taskData.description,
        startDate: taskData.start,
        endDate: taskData.end,
        workerId: taskData.assignedWorker?.id || null,
        status: taskData.status,
        priority: taskData.priority,
        stage: taskData.project
      };

      console.log("Updating task with payload:", payload);
      const res = await axios.put(`${BASE_URL}/api/project-kanban/update/${taskId}`, payload);
      toast.success('Task updated successfully');
      await getTasks(); // Refresh the task list
      return res.data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${BASE_URL}/api/project-kanban/${taskId}`);
      toast.success('Task deleted successfully');
      await getTasks(); // Refresh the task list
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  // Handle task changes (drag and drop, progress changes)
  const handleTaskChange = async (task, changes) => {
    try {
      // Ensure dependencies is always an array
      const updatedTask = { 
        ...task, 
        ...changes,
        dependencies: task.dependencies || [] // Ensure dependencies exists
      };
      
      // Update local state immediately for UI responsiveness
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      setHasChanges(true);

      // Auto-save changes
      await updateTask(task.id, updatedTask);
      setHasChanges(false);
    } catch (error) {
      // Revert on error
      await getTasks();
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle add new task
  const handleAddTask = async () => {
    const { title, description, startDate, endDate, status, priority, stage } = newTask;
    
    if (!title || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setSaving(true);
      await createTask(newTask);
      setNewTask({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        workerId: null,
        status: "upcoming",
        priority: "medium",
        stage: "Design"
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    console.log("Editing task:", task);
    setEditingTask(task);
    setNewTask({
      title: task.name,
      description: task.description || "",
      startDate: task.start.toISOString().split('T')[0],
      endDate: task.end.toISOString().split('T')[0],
      workerId: task.assignedWorker?.id || null,
      status: task.status,
      priority: task.priority,
      stage: task.project
    });
    setOpen(true);
  };

  // Handle task click to open edit modal
  const handleTaskClick = (task) => {
    console.log("Task clicked:", task);
    handleEditTask(task);
  };

  // Handle update existing task
  const handleUpdateExistingTask = async () => {
    if (!editingTask) return;

    const { title, description, startDate, endDate, status, priority, stage } = newTask;
    
    if (!title || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setSaving(true);
      const updatedTask = {
        ...editingTask,
        name: title,
        description: description,
        start: new Date(startDate),
        end: new Date(endDate),
        status: status,
        priority: priority,
        project: stage,
        dependencies: editingTask.dependencies || [] // Ensure dependencies exists
      };

      await updateTask(editingTask.id, updatedTask);
      setEditingTask(null);
      setOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle modal save action
  const handleModalSave = () => {
    if (editingTask) {
      handleUpdateExistingTask();
    } else {
      handleAddTask();
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    setEditingTask(null);
    setNewTask({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      workerId: null,
      status: "upcoming",
      priority: "medium",
      stage: "Design"
    });
  };

  const getBarStyle = (stage) => {
    switch (stage) {
      case "Design":
        return "#93c5fd";
      case "Production":
        return "#86efac";
      case "Logistics":
        return "#fde68a";
      case "Installation":
        return "#fca5a5";
      case "Delivery":
        return "#d8b4fe";
      case "Assembly":
        return "#f9a8d4";
      default:
        return "#cbd5e1";
    }
  };

  // Get all unique stages from tasks for legend
  const getUniqueStages = () => {
    const stages = [...new Set(tasks.map(task => task.project))];
    return stages.length > 0 ? stages : ["Design", "Production", "Logistics", "Installation", "Delivery", "Assembly"];
  };

  // Safe task processing to ensure all required fields exist
  const processTasksForGantt = (ganttTasks) => {
    return ganttTasks.map(task => ({
      ...task,
      dependencies: task.dependencies || [], // Ensure dependencies is always an array
      type: task.type || "task",
      progress: task.progress || 0
    }));
  };

  useEffect(() => {
    if (data?.id) {
      getTasks();
    }
  }, [data?.id]);

  // Process tasks before passing to Gantt component
  const processedTasks = processTasksForGantt(tasks);

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
            Day
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Week)}
            className={`px-3 py-1 rounded ${
              viewMode === ViewMode.Week ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Month)}
            className={`px-3 py-1 rounded ${
              viewMode === ViewMode.Month
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Month
          </button>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={getTasks}
              disabled={saving}
              color="primary"
            >
              {saving ? "Refreshing..." : "Refresh"}
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTask(null);
              setNewTask({
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                workerId: null,
                status: "upcoming",
                priority: "medium",
                stage: "Design"
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
        <div className="flex flex-wrap gap-2 text-sm">
          {getUniqueStages().map(stage => (
            <Chip
              key={stage}
              label={stage}
              size="small"
              style={{ backgroundColor: getBarStyle(stage) }}
            />
          ))}
        </div>
        <Typography variant="caption" color="textSecondary">
          💡 Click on any task to edit it, or hover in the task list for edit/delete buttons
        </Typography>
      </div>

      {/* Debug Info */}
      <div className="mb-2 text-sm text-gray-600">
        Tasks loaded: {processedTasks.length} | Project ID: {data?.id}
      </div>

      {/* Gantt Chart */}
      {processedTasks.length > 0 ? (
        <div className="overflow-x-auto min-w-[1000px] border rounded">
          <Gantt
            tasks={processedTasks}
            viewMode={viewMode}
            onDateChange={(task, changes) => handleTaskChange(task, changes)}
            onProgressChange={(task, changes) => handleTaskChange(task, changes)}
            onTaskClick={handleTaskClick}
            listCellWidth="180px"
            columnWidth={viewMode === ViewMode.Day ? 80 : 120}
            locale="en-GB"
            barBackgroundColor={(task) => getBarStyle(task.project)}
            barBackgroundSelectedColor={(task) => getBarStyle(task.project)}
            barProgressColor="#374151"
            barProgressSelectedColor="#1f2937"
            barCornerRadius={4}
            handleWidth={8}
            fontFamily="inherit"
            fontSize="12"
            // Use the custom task list
            TaskListTable={(props) => (
              <CustomTaskListTable
                {...props}
                tasks={processedTasks}
                onTaskClick={handleTaskClick}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          />
        </div>
      ) : (
        <div className="text-center py-10 border rounded">
          <Typography variant="h6" color="textSecondary" className="mb-2">
            No tasks found
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mb-4">
            Click "Add Task" to create your first task
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditingTask(null);
              setNewTask({
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                workerId: null,
                status: "upcoming",
                priority: "medium",
                stage: "Design"
              });
              setOpen(true);
            }}
            startIcon={<AddIcon />}
          >
            Add Task
          </Button>
        </div>
      )}

      {/* Gantt Task Modal */}
      <GanttTaskModal
        open={open}
        onClose={handleModalClose}
        editingTask={editingTask}
        newTask={newTask}
        setNewTask={setNewTask}
        onSave={handleModalSave}
        saving={saving}
        projectStages={getUniqueStages()}
        tasks={processedTasks}
      />
    </div>
  );
}
