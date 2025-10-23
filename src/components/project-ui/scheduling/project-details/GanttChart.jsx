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

  return (
    <div 
      className="flex items-center border-b hover:bg-gray-50 cursor-pointer group relative"
      style={{ height: '44px' }}
      onClick={() => onTaskClick(task)}
    >
      {/* Task Name Column */}
      <div className="flex-1 min-w-0 px-2 py-1 border-r">
        <div className="truncate" title={task.name}>
          {task.name}
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
        <div className="flex-1 min-w-0 px-2 py-1 border-r">Name</div>
        <div className="w-32 px-2 py-1 border-r">From</div>
        <div className="w-32 px-2 py-1 border-r">To</div>
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

// Alternative approach: Use the default TaskListTable but add actions
const TaskListWithActions = (props) => {
  const { onTaskClick, onEditTask, onDeleteTask, ...restProps } = props;

  return (
    <table className="gantt-tasklist-table">
      <thead>
        <tr>
          <th className="gantt-tasklist-name-header">Name</th>
          <th className="gantt-tasklist-from-header">From</th>
          <th className="gantt-tasklist-to-header">To</th>
          <th className="gantt-tasklist-actions-header">Actions</th>
        </tr>
      </thead>
      <tbody>
        {restProps.tasks.map((task) => (
          <tr 
            key={task.id} 
            className="gantt-tasklist-row group hover:bg-gray-50 cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <td className="gantt-tasklist-name-cell">
              <div className="truncate" title={task.name}>
                {task.name}
              </div>
            </td>
            <td className="gantt-tasklist-from-cell">
              {new Date(task.start).toLocaleDateString()}
            </td>
            <td className="gantt-tasklist-to-cell">
              {new Date(task.end).toLocaleDateString()}
            </td>
            <td className="gantt-tasklist-actions-cell">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 justify-center">
                <Tooltip title="Edit Task">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                    color="primary"
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
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

      console.log("API Response:", response.data);

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

      console.log("Mapped tasks:", chartData);
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

      const modifiedTasks = tasks.filter(task => {
        const o = task.originalData || {};
        return (
          task.name !== o.name ||
          new Date(task.start).toISOString() !== new Date(o.start).toISOString() ||
          new Date(task.end).toISOString() !== new Date(o.end).toISOString() ||
          task.progress !== o.progress ||
          task.project !== o.project ||
          task.description !== o.description ||
          task.status !== o.status ||
          JSON.stringify(task.dependencies || []) !== JSON.stringify(o.dependencies || [])
        );
      });

      if (modifiedTasks.length === 0) {
        toast.info("No changes to save");
        return;
      }

      const updatePromises = modifiedTasks.map(task => {
        const payload = {
          name: task.name,
          start: new Date(task.start),
          end: new Date(task.end),
          progress: task.progress,
          dependencies: task.dependencies || [],
          project: task.project || "General",
          description: task.description || "",
          status: task.status || "pending",
        };

        return axios
          .put(`${BASE_URL}/api/project-gantt-chart/update/${task.id}`, payload)
          .then(() => {
            setTasks(prev =>
              prev.map(t =>
                t.id === task.id
                  ? { ...t, originalData: { ...t.originalData, ...payload } }
                  : t
              )
            );
          })
          .catch(err => {
            console.error("Failed to update task:", task.name, err);
            toast.error(`Failed to update "${task.name}"`);
          });
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
    console.log("Editing task:", task);
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
    console.log("Task clicked:", task);
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
      name: "",
      start: "",
      end: "",
      progress: 0,
      project: "Design",
      description: "",
      status: "pending",
      dependencies: []
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
      default:
        return "#cbd5e1";
    }
  };

  // Create sample tasks if no tasks exist (for testing)
  const createSampleTasks = () => {
    const sampleTasks = [
      {
        id: "1",
        name: "Project Planning",
        type: "task",
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 15),
        progress: 100,
        dependencies: [],
        project: "Design",
        description: "Initial project planning phase",
        status: "completed",
        originalData: {}
      },
      {
        id: "2",
        name: "Design Phase",
        type: "task",
        start: new Date(2024, 0, 16),
        end: new Date(2024, 1, 15),
        progress: 75,
        dependencies: ["1"],
        project: "Design",
        description: "Detailed design work",
        status: "in-progress",
        originalData: {}
      },
      {
        id: "3",
        name: "Production",
        type: "task",
        start: new Date(2024, 1, 16),
        end: new Date(2024, 2, 15),
        progress: 0,
        dependencies: ["2"],
        project: "Production",
        description: "Manufacturing phase",
        status: "pending",
        originalData: {}
      }
    ];
    setTasks(sampleTasks);
  };

  useEffect(() => {
    if (data?.id) {
      getGanttChart();
    } else {
      setLoading(false);
      createSampleTasks();
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

          {tasks.length === 0 && (
            <Button
              variant="outlined"
              onClick={createSampleTasks}
            >
              Load Sample Tasks
            </Button>
          )}
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
        Tasks loaded: {tasks.length}
      </div>

      {/* Gantt Chart */}
      {tasks.length > 0 ? (
        <div className="overflow-x-auto min-w-[1000px] border rounded">
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            onDateChange={(task, changes) => handleTaskChange(task, changes)}
            onProgressChange={(task, changes) => handleTaskChange(task, changes)}
            onDelete={(task) => handleDeleteTask(task.id)}
            onTaskClick={handleTaskClick}
            listCellWidth="150px"
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
            // Use the custom task list with dates
            TaskListTable={(props) => (
              <CustomTaskListTable
                {...props}
                tasks={tasks}
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
            Click "Add Task" to create your first task or "Load Sample Tasks" to see demo data
          </Typography>
          <Button
            variant="contained"
            onClick={createSampleTasks}
            startIcon={<AddIcon />}
          >
            Load Sample Tasks
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
        projectStages={projectStages}
        tasks={tasks}
      />
    </div>
  );
}