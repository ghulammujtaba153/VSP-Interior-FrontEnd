"use client"

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  AvatarGroup,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  PlayArrow as InProgressIcon,
  Warning as DelayedIcon,
  CheckCircle as CompletedIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  ChatBubbleOutline as ChatIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import axios from 'axios'
import { BASE_URL } from '@/configs/url'
import { toast } from 'react-toastify'

// Status options with icons and colors
const statusConfig = {
  upcoming: { label: 'Upcoming', icon: <ScheduleIcon />, color: 'default' },
  inProgress: { label: 'In Progress', icon: <InProgressIcon />, color: 'primary' },
  delayed: { label: 'Delayed', icon: <DelayedIcon />, color: 'warning' },
  completed: { label: 'Completed', icon: <CompletedIcon />, color: 'success' },
}

// Process columns configuration - Updated to match your backend stages
const processColumns = {
  // todo: {
  //   id: 'todo',
  //   title: 'To Do',
  //   color: '#757575',
  //   stage: 'To Do', // Map to your backend stage
  // },
  machining: {
    id: 'machining',
    title: 'Machining',
    color: '#1976d2',
    stage: 'Machining',
  },
  assembly: {
    id: 'assembly',
    title: 'Assembly',
    color: '#2e7d32',
    stage: 'Assembly',
  },
  delivery: {
    id: 'delivery',
    title: 'Delivery',
    color: '#ed6c02',
    stage: 'Delivery',
  },
  installation: {
    id: 'installation',
    title: 'Installation',
    color: '#9c27b0',
    stage: 'Installation',
  },
}

// Helper function to check if task is overdue
const isTaskOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

// Helper function to format date range
const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return null
  if (!endDate) return `Start: ${new Date(startDate).toLocaleDateString()}`
  if (!startDate) return `Due: ${new Date(endDate).toLocaleDateString()}`
  return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
}

// Sortable Task Component
const SortableTask = ({ task, onEdit, onDelete, workers, onViewComments }) => {
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

            {/* Comments Button - only show if comments exist */}
            {task.comments && task.comments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<ChatIcon />}
                  label={`${task.comments.length} comment${task.comments.length === 1 ? '' : 's'}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => onViewComments(task)}
                  sx={{ cursor: "pointer", '&:hover': { backgroundColor: 'action.hover' } }}
                />
              </Box>
            )}
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

// Column Component
const Column = ({ column, tasks, onAddTask, onEditTask, onDeleteTask, workers, isOver, loading, onViewComments }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })
  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'upcoming',
    workerId: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
  })

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      try {
        await onAddTask(column.id, newTask)
        setNewTask({
          title: '',
          description: '',
          status: 'upcoming',
          workerId: '',
          startDate: '',
          endDate: '',
          priority: 'medium',
        })
        setIsAdding(false)
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  }

  const handleStartDateChange = (date) => {
    setNewTask(prev => ({
      ...prev,
      startDate: date,
      // Auto-set end date if it's before start date
      endDate: prev.endDate && new Date(prev.endDate) < new Date(date) ? date : prev.endDate
    }))
  }

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        minHeight: 500,
        p: 2,
        bgcolor: isOver ? 'action.hover' : 'background.default',
        borderTop: `4px solid ${column.color}`,
        border: isOver ? '2px dashed #1976d2' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {column.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setIsAdding(true)}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {isAdding && (
        <Card sx={{ mb: 2, p: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Task Title *"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            multiline
            rows={2}
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={newTask.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                error={newTask.startDate && newTask.endDate && new Date(newTask.endDate) < new Date(newTask.startDate)}
                helperText={
                  newTask.startDate && newTask.endDate && new Date(newTask.endDate) < new Date(newTask.startDate)
                    ? "End date cannot be before start date"
                    : ""
                }
              />
            </Grid>
          </Grid>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              label="Status"
              onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  <Box display="flex" alignItems="center">
                    {config.icon}
                    <Typography sx={{ ml: 1 }}>{config.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Assign Worker</InputLabel>
            <Select
              value={newTask.workerId}
              label="Assign Worker"
              onChange={(e) => setNewTask(prev => ({ ...prev, workerId: e.target.value }))}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {workers.map(worker => (
                <MenuItem key={worker.id} value={worker.id}>
                  {worker.name} ({worker.jobTitle})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box display="flex" gap={1}>
            <Button 
              size="small" 
              variant="contained" 
              onClick={handleAddTask}
              disabled={!newTask.title.trim()}
            >
              Add Task
            </Button>
            <Button size="small" variant="outlined" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </Box>
        </Card>
      )}

      <Box 
        sx={{ 
          minHeight: 100,
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={100}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  workers={workers}
                  onViewComments={onViewComments}
                />
              ))}
            </SortableContext>

            {/* Empty state with drop hint */}
            {tasks.length === 0 && !isAdding && (
              <Box
                sx={{
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  color: 'text.secondary',
                  backgroundColor: isOver ? 'action.hover' : 'transparent',
                }}
              >
                <Typography variant="body2" textAlign="center">
                  Drop tasks here
                  <br />
                  <Typography variant="caption">
                    or click + to add a task
                  </Typography>
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  )
}

// Main Kanban Component
const Kanban = ({ projectId, data }) => {
  const [columns, setColumns] = useState({})
  const [activeTask, setActiveTask] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'upcoming',
    workerId: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    stage: 'todo', // Default to first stage
  })
  const [activeColumn, setActiveColumn] = useState(null)
  
  // Comment dialog state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [commentFile, setCommentFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  console.log("data from parent", data)

  // Test function to debug with sample data
  const testWithSampleData = () => {
    const sampleTasks = [
      {"id":1,"projectSetupJobId":6,"title":"task1-machine","description":"description","startDate":"2025-10-23T00:00:00.000Z","endDate":"2025-10-31T00:00:00.000Z","workerId":4,"status":"upcoming","priority":"medium","stage":"To Do","createdAt":"2025-10-22T09:22:20.390Z","updatedAt":"2025-10-22T09:22:20.390Z"},
      {"id":2,"projectSetupJobId":6,"title":"mnn","description":"mnmnmn","startDate":"2025-10-23T00:00:00.000Z","endDate":"2025-11-07T00:00:00.000Z","workerId":4,"status":"upcoming","priority":"medium","stage":"Machining","createdAt":"2025-10-22T09:30:22.835Z","updatedAt":"2025-10-22T09:30:22.835Z"},
      {"id":3,"projectSetupJobId":6,"title":"mnn","description":"mnmnm","startDate":"2025-10-23T00:00:00.000Z","endDate":"2025-10-31T00:00:00.000Z","workerId":4,"status":"upcoming","priority":"medium","stage":"Installation","createdAt":"2025-10-22T09:31:05.384Z","updatedAt":"2025-10-22T09:31:05.384Z"},
      {"id":4,"projectSetupJobId":6,"title":"nmnm","description":"mnmnm","startDate":"2025-10-23T00:00:00.000Z","endDate":"2025-10-23T00:00:00.000Z","workerId":4,"status":"upcoming","priority":"medium","stage":"Assembly","createdAt":"2025-10-22T09:31:35.742Z","updatedAt":"2025-10-22T09:31:35.742Z"}
    ]
    
    console.log("Testing with sample data:", sampleTasks)
    console.log("Available stages in sample tasks:", [...new Set(sampleTasks.map(t => t.stage))])
    
    // Organize tasks by stage
    const organizedColumns = {}
    Object.keys(processColumns).forEach(processId => {
      const columnConfig = processColumns[processId]
      const columnTasks = sampleTasks.filter(task => task.stage === columnConfig.stage)
      console.log(`Column ${processId} (${columnConfig.stage}):`, columnTasks.length, "tasks")
      
      organizedColumns[processId] = {
        ...columnConfig,
        tasks: columnTasks
      }
    })
    
    setColumns(organizedColumns)
    console.log("Organized columns with sample data:", organizedColumns)
  }

  // API functions
  const getTasks = async () => {
    if (!data?.id) return
    
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`)
      const tasks = res.data || []
      console.log("Fetched tasks:", tasks)
      console.log("Available stages in tasks:", [...new Set(tasks.map(t => t.stage))])
      
      // Organize tasks by stage
      const organizedColumns = {}
      Object.keys(processColumns).forEach(processId => {
        const columnConfig = processColumns[processId]
        const columnTasks = tasks.filter(task => task.stage === columnConfig.stage)
        console.log(`Column ${processId} (${columnConfig.stage}):`, columnTasks.length, "tasks")
        
        organizedColumns[processId] = {
          ...columnConfig,
          tasks: columnTasks
        }
      })
      
      setColumns(organizedColumns)
      console.log("Organized columns:", organizedColumns)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
      // Initialize empty columns
      const emptyColumns = {}
      Object.keys(processColumns).forEach(processId => {
        emptyColumns[processId] = {
          ...processColumns[processId],
          tasks: []
        }
      })
      setColumns(emptyColumns)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData) => {
    try {
      const columnConfig = processColumns[taskData.process]
      const payload = {
        projectSetupJobId: data.id,
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate || null,
        endDate: taskData.endDate || null,
        workerId: taskData.workerId || null,
        status: taskData.status,
        priority: taskData.priority,
        stage: columnConfig.stage // Use the stage from column config
      }

      console.log("Creating task with payload:", payload)
      toast.loading("Creating task...")
      const res = await axios.post(`${BASE_URL}/api/project-kanban/create`, payload)
      toast.dismiss()
      toast.success('Task created successfully')
      await getTasks() // Refresh the task list
      return res.data
    } catch (error) {
      toast.dismiss()
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
      throw error
    }
  }

  const updateTask = async (taskId, taskData) => {
    try {
      const columnConfig = processColumns[taskData.stage]
      const payload = {
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate || null,
        endDate: taskData.endDate || null,
        workerId: taskData.workerId || null,
        status: taskData.status,
        priority: taskData.priority,
        stage: columnConfig.stage // Use the stage from column config
      }

      console.log("Updating task with payload:", payload)
      const res = await axios.put(`${BASE_URL}/api/project-kanban/update/${taskId}`, payload)
      toast.success('Task updated successfully')
      await getTasks() // Refresh the task list
      return res.data
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${BASE_URL}/api/project-kanban/${taskId}`)
      await getTasks() // Refresh the task list
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const updateTaskStage = async (taskId, newProcess) => {
    try {
      const columnConfig = processColumns[newProcess]
      const payload = {
        stage: columnConfig.stage
      }
      toast.loading("Updating task stage...")
      console.log("Updating task stage:", payload)
      await axios.put(`${BASE_URL}/api/project-kanban/update/${taskId}`, payload)
      toast.dismiss()
      toast.success("Task stage updated successfully")
    } catch (error) {
      toast.dismiss()
      console.error('Error updating task stage:', error)
      throw error
    }
  }

  // Load tasks when component mounts or data changes
  useEffect(() => {
    if (data?.id) {
      getTasks()
    } else {
      // If no data.id, initialize empty columns
      const emptyColumns = {}
      Object.keys(processColumns).forEach(processId => {
        emptyColumns[processId] = {
          ...processColumns[processId],
          tasks: []
        }
      })
      setColumns(emptyColumns)
    }
  }, [data?.id])

  // Debug: Log columns state changes
  useEffect(() => {
    console.log("Columns state updated:", columns)
  }, [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    const taskId = active.id
    const taskColumn = Object.values(columns).find(column =>
      column.tasks.some(task => task.id === taskId)
    )
    
    if (taskColumn) {
      const task = taskColumn.tasks.find(t => t.id === taskId)
      setActiveTask(task)
      setActiveColumn(taskColumn)
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    
    if (!over) return

    const overId = over.id
    
    // First check if we're over a column directly (empty column case)
    let overColumn = Object.values(columns).find(column => column.id === overId)
    
    // If not a direct column match, check if we're over a task
    if (!overColumn) {
      overColumn = Object.values(columns).find(column =>
        column.tasks.some(task => task.id === overId)
      )
    }

    setActiveColumn(overColumn)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveColumn(null)

    if (!over) return

    const activeTaskId = active.id
    const overId = over.id

    // Find source column
    const activeColumn = Object.values(columns).find(column =>
      column.tasks.some(task => task.id === activeTaskId)
    )
    
    // Find destination column - check for direct column match first (empty column case)
    let overColumn = Object.values(columns).find(column => column.id === overId)
    
    // If not a direct column match, check if we're over a task
    if (!overColumn) {
      overColumn = Object.values(columns).find(column =>
        column.tasks.some(task => task.id === overId)
      )
    }

    if (!activeColumn || !overColumn) return

    // Moving within same column
    if (activeColumn.id === overColumn.id) {
      const activeIndex = activeColumn.tasks.findIndex(task => task.id === activeTaskId)
      const overIndex = overColumn.tasks.findIndex(task => task.id === overId)

      if (activeIndex !== overIndex) {
        const newTasks = arrayMove(activeColumn.tasks, activeIndex, overIndex)
        setColumns(prev => ({
          ...prev,
          [activeColumn.id]: {
            ...prev[activeColumn.id],
            tasks: newTasks,
          },
        }))
      }
    } else {
      // Moving to different column
      const activeIndex = activeColumn.tasks.findIndex(task => task.id === activeTaskId)
      const task = activeColumn.tasks[activeIndex]

      // Optimistically update UI
      setColumns(prev => ({
        ...prev,
        [activeColumn.id]: {
          ...prev[activeColumn.id],
          tasks: prev[activeColumn.id].tasks.filter(t => t.id !== activeTaskId),
        },
        [overColumn.id]: {
          ...prev[overColumn.id],
          tasks: [...prev[overColumn.id].tasks, { ...task, stage: overColumn.stage }],
        },
      }))

      // Update in backend
      try {
        await updateTaskStage(activeTaskId, overColumn.id)
        toast.success(`Task moved to ${overColumn.title}`)
      } catch (error) {
        // Revert on error
        getTasks() // Reload from server to revert changes
        toast.error('Failed to move task')
      }
    }
  }

  const handleDragCancel = () => {
    setActiveTask(null)
    setActiveColumn(null)
  }

  // Comment handling functions
  const handleViewComments = (task) => {
    setSelectedTask(task)
    setNewComment("")
    setCommentFile(null)
    setCommentDialogOpen(true)
  }

  const handleCommentFileSelect = (event) => {
    const file = event.target.files[0]
    setCommentFile(file)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return

    setUploadingFile(true)
    setUploadProgress(0)

    try {
      let fileData = null
      
      // Upload file if attached
      if (commentFile) {
        const formData = new FormData()
        formData.append("file", commentFile)
        formData.append("taskId", selectedTask.id)

        const response = await axios.post(`${BASE_URL}/api/project-kanban/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          },
        })

        fileData = {
          name: commentFile.name,
          size: commentFile.size,
          type: commentFile.type,
          url: response.data.fileUrl,
        }
      }

      const commentData = {
        content: newComment.trim(),
        file: fileData,
        timestamp: new Date().toISOString(),
        author: "Current User", // You can get this from auth context
      }

      // Get existing comments or initialize empty array
      const existingComments = selectedTask.comments || []
      const updatedComments = [...existingComments, commentData]

      await axios.put(`${BASE_URL}/api/project-kanban/update/${selectedTask.id}`, {
        comments: updatedComments,
      })

      // Update local state
      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns }
        Object.keys(updatedColumns).forEach(columnId => {
          const column = updatedColumns[columnId]
          const taskIndex = column.tasks.findIndex(task => task.id === selectedTask.id)
          if (taskIndex !== -1) {
            updatedColumns[columnId] = {
              ...column,
              tasks: column.tasks.map((task, index) => 
                index === taskIndex 
                  ? { ...task, comments: updatedComments }
                  : task
              )
            }
          }
        })
        return updatedColumns
      })

      setNewComment("")
      setCommentFile(null)
      setCommentDialogOpen(false)
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Failed to add comment", error)
      toast.error("Failed to add comment")
    } finally {
      setUploadingFile(false)
      setUploadProgress(0)
    }
  }

  const handleAddTask = async (columnId, taskData) => {
    try {
      await createTask({
        ...taskData,
        process: columnId
      })
    } catch (error) {
      // Error is handled in createTask function
    }
  }

  const handleEditTask = (task) => {
    // Find which process this task belongs to based on its stage
    const taskProcess = Object.values(processColumns).find(col => col.stage === task.stage)?.id || 'todo'
    
    setEditingTask(task)
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      workerId: task.workerId || '',
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      priority: task.priority || 'medium',
      stage: taskProcess, // Use the process ID for the form
    })
    setEditDialogOpen(true)
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return

    // Validate dates
    if (editForm.startDate && editForm.endDate && new Date(editForm.endDate) < new Date(editForm.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    if (!editForm.title.trim()) {
      toast.error("Task title is required")
      return
    }

    try {
      await updateTask(editingTask.id, editForm)
      setEditDialogOpen(false)
      setEditingTask(null)
    } catch (error) {
      // Error is handled in updateTask function
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      return true
    } catch (error) {
      throw error
    }
  }

  const workers = data?.workers || []


  if(loading) return <p>loadin..</p>

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {data?.projectSetup?.projectName || `Project ${projectId}`} - Kanban Board
        </Typography>
        
      </Box>
      
      {data && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">Project Details</Typography>
          <Typography variant="body2">
            Location: {data.projectSetup?.siteLocation} | 
            Dates: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()} |
            Workers: {workers.map(w => w.name).join(', ')}
          </Typography>
        </Box>
      )}

      

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))"
          gap={3}
        >
          {Object.values(columns).map((column) => (
            <Box key={column.id}>
              <Column
                column={column}
                tasks={column.tasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                workers={workers}
                isOver={activeColumn?.id === column.id}
                loading={loading}
                onViewComments={handleViewComments}
              />
            </Box>
          ))}
        </Box>

        <DragOverlay>
          {activeTask ? (
            <Card
              sx={{
                width: 300,
                cursor: 'grabbing',
                boxShadow: 3,
                borderLeft: `4px solid ${processColumns[Object.values(processColumns).find(col => col.stage === activeTask.stage)?.id || 'todo']?.color || '#ccc'}`,
                transform: 'rotate(5deg)',
              }}
            >
              <CardContent>
                <Chip
                  icon={statusConfig[activeTask.status]?.icon}
                  label={statusConfig[activeTask.status]?.label}
                  color={statusConfig[activeTask.status]?.color}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h6" fontSize="1rem" gutterBottom>
                  {activeTask.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTask.description}
                </Typography>
                {(activeTask.startDate || activeTask.endDate) && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateRange(activeTask.startDate, activeTask.endDate)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title *"
            fullWidth
            variant="outlined"
            value={editForm.title}
            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                error={editForm.startDate && editForm.endDate && new Date(editForm.endDate) < new Date(editForm.startDate)}
                helperText={
                  editForm.startDate && editForm.endDate && new Date(editForm.endDate) < new Date(editForm.startDate)
                    ? "End date cannot be before start date"
                    : ""
                }
              />
            </Grid>
          </Grid>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              label="Status"
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  <Box display="flex" alignItems="center">
                    {config.icon}
                    <Typography sx={{ ml: 1 }}>{config.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={editForm.priority}
              label="Priority"
              onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Stage</InputLabel>
            <Select
              value={editForm.stage}
              label="Stage"
              onChange={(e) => setEditForm(prev => ({ ...prev, stage: e.target.value }))}
            >
              {Object.values(processColumns).map(column => (
                <MenuItem key={column.id} value={column.id}>
                  {column.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Assign Worker</InputLabel>
            <Select
              value={editForm.workerId}
              label="Assign Worker"
              onChange={(e) => setEditForm(prev => ({ ...prev, workerId: e.target.value }))}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {workers.map(worker => (
                <MenuItem key={worker.id} value={worker.id}>
                  {worker.name} ({worker.jobTitle})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          View Comments
          <IconButton
            onClick={() => setCommentDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {selectedTask.title}
              </Typography>
              
              {/* Existing Comments */}
              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Comments ({selectedTask.comments.length})
                  </Typography>
                  <Paper sx={{ p: 2, maxHeight: 300, overflow: "auto" }}>
                    {selectedTask.comments.map((comment, index) => (
                      <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < selectedTask.comments.length - 1 ? 1 : 0, borderColor: "divider" }}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {comment.author?.charAt(0) || "U"}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {comment.author} • {new Date(comment.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {comment.content || comment.text}
                        </Typography>
                        {comment.file && (
                          <Chip
                            icon={<DownloadIcon />}
                            label={comment.file.name}
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(`${BASE_URL}${comment.file.url}`, "_blank")}
                            sx={{ cursor: "pointer", fontSize: "0.75rem" }}
                          />
                        )}
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}

              {/* New Comment Input */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                />
              </Box>

              {/* File Upload for Comment */}
              <Box sx={{ mb: 2 }}>
                <input
                  id="comment-file-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleCommentFileSelect}
                  accept="*/*"
                />
                <label htmlFor="comment-file-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Attach File
                  </Button>
                </label>
                {commentFile && (
                  <Chip
                    label={commentFile.name}
                    onDelete={() => setCommentFile(null)}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {/* Upload Progress */}
              {uploadingFile && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" color="text.secondary">
                    Uploading file... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!newComment.trim() || uploadingFile}
          >
            {uploadingFile ? "Uploading..." : "Add Comment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Kanban
