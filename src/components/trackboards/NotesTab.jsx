"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Task as TaskIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as InProgressIcon,
  Warning as DelayedIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from '@/configs/url';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';

const NotesTab = ({ projectId, data }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  // Status configuration for task status display
  const statusConfig = {
    upcoming: { label: 'Upcoming', icon: <ScheduleIcon />, color: 'default' },
    inProgress: { label: 'In Progress', icon: <InProgressIcon />, color: 'primary' },
    delayed: { label: 'Delayed', icon: <DelayedIcon />, color: 'warning' },
    completed: { label: 'Completed', icon: <CompletedIcon />, color: 'success' },
  };

  // Stage configuration for task stage display
  const stageConfig = {
    Machining: { color: '#1976d2', label: 'Machining' },
    Assembly: { color: '#2e7d32', label: 'Assembly' },
    Delivery: { color: '#ed6c02', label: 'Delivery' },
    Installation: { color: '#9c27b0', label: 'Installation' },
  };

    const getTasks = async () => {
    if (!data?.id) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`);
      const fetchedTasks = res.data || [];
      setTasks(fetchedTasks);
      
      // Extract all comments from tasks and sort by timestamp
      const allComments = [];
      fetchedTasks.forEach(task => {
        if (task.comments && task.comments.length > 0) {
          task.comments.forEach(comment => {
            allComments.push({
              ...comment,
              taskId: task.id,
              taskTitle: task.title,
              taskStage: task.stage,
              taskStatus: task.status,
              taskStartDate: task.startDate,
              taskEndDate: task.endDate,
              assignedWorker: task.assignedWorker,
            });
          });
        }
      });
      
      // Sort comments by timestamp (newest first)
      allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setComments(allComments);
      
        } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
        } finally {
      setLoading(false);
        }
  };

    useEffect(() => {
        if (data?.id) getTasks();
    }, [data?.id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Project Timeline & Comments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          All comments and activities sorted by date
        </Typography>
      </Box>

      {data && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">Project Details</Typography>
          <Typography variant="body2">
            Project: {data.projectSetup?.projectName} | 
            Location: {data.projectSetup?.siteLocation} | 
            Dates: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
          </Typography>
        </Box>
      )}

      {comments.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No comments found for this project. Comments will appear here as they are added to tasks.
        </Alert>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              left: 24,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: 'divider',
              zIndex: 1,
            }}
          />
          
          <Stack spacing={3}>
            {comments.map((comment, index) => (
              <Box key={`${comment.taskId}-${comment.timestamp}`} sx={{ position: 'relative' }}>
                {/* Timeline dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: 24,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: stageConfig[comment.taskStage]?.color || 'primary.main',
                    border: '3px solid white',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CommentIcon sx={{ fontSize: 10, color: 'white' }} />
                </Box>
                
                {/* Comment content */}
                <Box sx={{ ml: 6 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    {/* Comment Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {comment.author?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            commented on
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Timestamp */}
                      <Box textAlign="right">
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDate(comment.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(comment.timestamp)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Task Information */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <TaskIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight="medium">
                          Task: {comment.taskTitle}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={1}>
                        <Grid item>
                          <Chip
                            label={comment.taskStage}
                            size="small"
                            sx={{ 
                              bgcolor: stageConfig[comment.taskStage]?.color || 'primary.main',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={statusConfig[comment.taskStatus]?.icon}
                            label={statusConfig[comment.taskStatus]?.label}
                            color={statusConfig[comment.taskStatus]?.color}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        {comment.assignedWorker && (
                          <Grid item>
                            <Chip
                              label={`Assigned: ${comment.assignedWorker.name}`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          </Grid>
                        )}
                      </Grid>
                      
                      {(comment.taskStartDate || comment.taskEndDate) && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Due: {comment.taskStartDate && new Date(comment.taskStartDate).toLocaleDateString()} - 
                          {comment.taskEndDate && new Date(comment.taskEndDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Comment Content */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                    </Box>

                    {/* File Attachment */}
                    {comment.file && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Attached file:
                        </Typography>
                        <Chip
                          icon={<DownloadIcon />}
                          label={comment.file.name}
                          size="small"
                          variant="outlined"
                          onClick={() => window.open(`${BASE_URL}${comment.file.url}`, "_blank")}
                          sx={{ cursor: "pointer", fontSize: "0.75rem" }}
                        />
                      </Box>
                    )}

                    <Divider sx={{ mt: 2 }} />
                    
                    
                  </Paper>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      
    </Box>
  );
};

export default NotesTab;