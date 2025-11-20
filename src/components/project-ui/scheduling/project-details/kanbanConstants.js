import {
  Schedule as ScheduleIcon,
  PlayArrow as InProgressIcon,
  Warning as DelayedIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material'

// Status options with icons and colors
export const statusConfig = {
  upcoming: { label: 'Upcoming', icon: <ScheduleIcon />, color: 'default' },
  inProgress: { label: 'In Progress', icon: <InProgressIcon />, color: 'primary' },
  delayed: { label: 'Delayed', icon: <DelayedIcon />, color: 'warning' },
  completed: { label: 'Completed', icon: <CompletedIcon />, color: 'success' },
}

// Process columns configuration - Updated to match your backend stages
export const processColumns = {
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
export const isTaskOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

// Helper function to format date range
export const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return null
  if (!endDate) return `Start: ${new Date(startDate).toLocaleDateString()}`
  if (!startDate) return `Due: ${new Date(endDate).toLocaleDateString()}`
  return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
}

