"use client"

import { BASE_URL } from '@/configs/url';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Loader from '../loader/Loader';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Schedule as UpcomingIcon,
  Warning as DelayIcon,
  Error as IssueIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const processColumns = {
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

const TaskOverviewSection = ({ data }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageProgress, setStageProgress] = useState({});

  // Calculate task status based on dates and completion
  const getTaskStatus = (task) => {
    const now = new Date();
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    // If task is marked as completed, it's completed
    if (task.status === 'completed') return 'completed';
    
    // If current date is before start date, it's upcoming
    if (now < startDate) return 'upcoming';
    
    // If current date is between start and end date, it's in progress
    if (now >= startDate && now <= endDate) return 'in-progress';
    
    // If current date is after end date, it's overdue
    if (now > endDate) return 'overdue';
    
    return 'upcoming';
  };

  // Calculate progress for each stage
  const calculateStageProgress = (stageTasks) => {
    if (!stageTasks || stageTasks.length === 0) return { percentage: 0, status: 'upcoming' };
    
    const completed = stageTasks.filter(task => getTaskStatus(task) === 'completed').length;
    const inProgress = stageTasks.filter(task => getTaskStatus(task) === 'in-progress').length;
    const overdue = stageTasks.filter(task => getTaskStatus(task) === 'overdue').length;
    const total = stageTasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    // Determine overall stage status
    let status = 'upcoming';
    if (percentage === 100) status = 'completed';
    else if (inProgress > 0 || completed > 0) status = 'in-progress';
    if (overdue > 0) status = 'delayed';
    
    return { 
      percentage, 
      status, 
      completed, 
      inProgress,
      overdue,
      total 
    };
  };

  // Get traffic light indicator
  const getTrafficLight = (status, percentage) => {
    switch (status) {
      case 'completed':
        return { icon: <CompletedIcon />, color: '#4caf50', text: 'On Track' };
      case 'in-progress':
        if (percentage >= 80) return { icon: <CompletedIcon />, color: '#4caf50', text: 'On Track' };
        if (percentage >= 50) return { icon: <UpcomingIcon />, color: '#ff9800', text: 'In Progress' };
        return { icon: <DelayIcon />, color: '#f44336', text: 'Delay or reschedule required' };
      case 'delayed':
        return { icon: <DelayIcon />, color: '#f44336', text: 'Delay or reschedule required' };
      default:
        return { icon: <UpcomingIcon />, color: '#757575', text: 'Not Started' };
    }
  };

  // Get status color for individual tasks
  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  // Get status text for individual tasks
  const getTaskStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'overdue': return 'Overdue';
      case 'upcoming': return 'Upcoming';
      default: return 'Upcoming';
    }
  };

  // API functions
  const getTasks = async () => {
    if (!data?.id) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`);
      const fetchedTasks = res.data || [];
      setTasks(fetchedTasks);
      
      // Calculate progress for each stage
      const progress = {};
      Object.keys(processColumns).forEach(processId => {
        const columnConfig = processColumns[processId];
        const stageTasks = fetchedTasks.filter(task => task.stage === columnConfig.stage);
        progress[processId] = calculateStageProgress(stageTasks);
      });
      
      setStageProgress(progress);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, [data?.id]);

  if (loading) return <Loader />;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Task Overview & Progress
        </Typography>
        
        <Box>
          {Object.keys(processColumns).map(processId => {
            const columnConfig = processColumns[processId];
            const progress = stageProgress[processId] || { 
              percentage: 0, 
              status: 'upcoming', 
              completed: 0, 
              inProgress: 0,
              overdue: 0,
              total: 0 
            };
            const trafficLight = getTrafficLight(progress.status, progress.percentage);
            const stageTasks = tasks.filter(task => task.stage === columnConfig.stage);
            
            return (
              <Paper 
                key={processId}
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 2,
                  borderLeft: `4px solid ${columnConfig.color}`
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  {/* Stage Info */}
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="bold">
                        {columnConfig.title}
                      </Typography>
                      <Tooltip title={trafficLight.text}>
                        <Avatar sx={{ bgcolor: trafficLight.color, width: 32, height: 32 }}>
                          {trafficLight.icon}
                        </Avatar>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {progress.completed} completed • {progress.inProgress} in progress • {progress.overdue} overdue
                    </Typography>
                  </Grid>
                  
                  {/* Progress Info */}
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {progress.completed}/{progress.total} tasks
                    </Typography>
                    <Typography variant="h5" color={trafficLight.color} fontWeight="bold">
                      {progress.percentage}%
                    </Typography>
                  </Grid>
                  
                  {/* Progress Bar */}
                  <Grid item xs={12} sm={4}>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress.percentage} 
                      sx={{ 
                        height: 12,
                        borderRadius: 6,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: trafficLight.color,
                          borderRadius: 6
                        }
                      }} 
                    />
                  </Grid>
                  
                  {/* Status Text */}
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color={trafficLight.color} fontWeight="medium">
                      {trafficLight.text}
                    </Typography>
                  </Grid>
                </Grid>
                
                {/* Tasks List */}
                {stageTasks.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      Tasks:
                    </Typography>
                    <Grid container spacing={1}>
                      {stageTasks.map(task => {
                        const taskStatus = getTaskStatus(task);
                        const statusColor = getTaskStatusColor(taskStatus);
                        const statusText = getTaskStatusText(taskStatus);
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={task.id}>
                            <Box display="flex" alignItems="center" p={1} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Chip 
                                size="small" 
                                label={statusText} 
                                color={statusColor}
                                sx={{ mr: 1, fontSize: '0.7rem', minWidth: 80 }}
                              />
                              <Typography variant="body2" noWrap title={task.title}>
                                {task.title}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                              {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Overall Project Status */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Overall Project Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {tasks.filter(t => getTaskStatus(t) === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Tasks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main">
                  {tasks.filter(t => getTaskStatus(t) === 'in-progress').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {tasks.filter(t => getTaskStatus(t) === 'upcoming').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Tasks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">
                  {tasks.filter(t => getTaskStatus(t) === 'overdue').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue Tasks
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskOverviewSection;