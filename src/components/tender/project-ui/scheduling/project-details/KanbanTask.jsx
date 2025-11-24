"use client"

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  ChatBubbleOutline as ChatIcon,
} from '@mui/icons-material'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-toastify'
import { statusConfig, processColumns, isTaskOverdue, formatDateRange } from './kanbanConstants'

/**
 * KanbanTask Component
 * 
 * A draggable task card component for the Kanban board.
 * Displays task information including status, title, description, dates, priority, assigned worker, and comments.
 * Provides edit and delete actions via a context menu.
 * 
 * @param {Object} task - The task object to display
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {Function} onDelete - Callback when delete button is clicked
 * @param {Array} workers - Array of available workers
 * @param {Function} onViewComments - Callback when comments button is clicked
 */
const KanbanTask = ({ task, onEdit, onDelete, workers, onViewComments }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    onEdit(task)
    handleMenuClose()
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setDeleteLoading(true)
      try {
        await onDelete(task.id)
        toast.success('Task deleted successfully')
      } catch (error) {
        toast.error('Failed to delete task')
      } finally {
        setDeleteLoading(false)
        handleMenuClose()
      }
    }
  }

  // Get assigned worker for this task (single worker from your schema)
  const assignedWorker = task.workerId ? workers.find(worker => worker.id === task.workerId) : null

  // Check if task is overdue
  const overdue = task.endDate ? isTaskOverdue(task.endDate) : false

  // Find which process column this task belongs to based on stage
  const taskProcess = Object.values(processColumns).find(col => col.stage === task.stage)?.id || 'todo'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        '&:hover': { boxShadow: 3 },
        borderLeft: `4px solid ${processColumns[taskProcess]?.color || '#ccc'}`,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            {/* Status Chip */}
            <Chip
              icon={statusConfig[task.status]?.icon}
              label={statusConfig[task.status]?.label}
              color={statusConfig[task.status]?.color}
              size="small"
              sx={{ mb: 1 }}
            />
            
            <Typography variant="h6" fontSize="1rem" gutterBottom>
              {task.title}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {task.description}
            </Typography>

            {/* Date Range */}
            {(task.startDate || task.endDate) && (
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography 
                  variant="caption" 
                  color={overdue ? 'error.main' : 'text.secondary'}
                  fontWeight={overdue ? 'bold' : 'normal'}
                >
                  {formatDateRange(task.startDate, task.endDate)}
                  {overdue && ' (Overdue)'}
                </Typography>
              </Box>
            )}

            {/* Priority */}
            {task.priority && (
              <Chip
                label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5, mr: 1 }}
                color={
                  task.priority === 'high' ? 'error' :
                  task.priority === 'medium' ? 'warning' : 'default'
                }
              />
            )}

            {/* Assigned Worker */}
            {assignedWorker && (
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Avatar 
                  sx={{ width: 24, height: 24 }}
                  title={`${assignedWorker.name} (${assignedWorker.jobTitle})`}
                >
                  {assignedWorker.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {assignedWorker.name}
                </Typography>
              </Box>
            )}

            {/* Duration Info */}
            {task.startDate && task.endDate && (
              <Chip
                icon={<CalendarIcon />}
                label={`${Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24))} days`}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            )}

            {/* Comments Section */}
            <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Comments Button */}
              <Chip
                icon={<ChatIcon />}
                label={task.comments && task.comments.length > 0 ? "View Comments" : "Add Comment"}
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onViewComments(task)}
                sx={{ cursor: "pointer", '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
              />
              
              {/* Show existing comments count if any */}
              {task.comments && task.comments.length > 0 && (
                <Chip
                  label={`${task.comments.length} comment${task.comments.length === 1 ? '' : 's'}`}
                  size="small"
                  variant="filled"
                  color="secondary"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : <MoreVertIcon fontSize="small" />}
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }} disabled={deleteLoading}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  )
}

export default KanbanTask

