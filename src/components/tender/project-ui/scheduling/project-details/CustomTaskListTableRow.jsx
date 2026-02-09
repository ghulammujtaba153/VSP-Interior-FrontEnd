"use client";

import { Chip, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * CustomTaskListTableRow Component
 * 
 * Displays a single task row in the Gantt chart task list.
 * Shows task name, status, priority, assigned worker, and date range.
 * Provides edit and delete actions on hover.
 * 
 * @param {Object} task - The task object to display
 * @param {Function} onTaskClick - Callback when the task row is clicked
 * @param {Function} onEditTask - Callback when edit button is clicked
 * @param {Function} onDeleteTask - Callback when delete button is clicked
 */
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

export default CustomTaskListTableRow;

