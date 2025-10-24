"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { DateCalendar, LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isWithinInterval, isSameDay } from "date-fns";
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from "@/configs/url";

// Define process columns with stages
const processColumns = {
  installation: { stage: "Installation", color: "primary" },
  machining: { stage: "Machining", color: "secondary" },
  assembly: { stage: "Assembly", color: "info" },
  delivery: { stage: "Delivery", color: "success" },
};

// Custom Day component to highlight date ranges
function CustomDay(props) {
  const { tasks, selectedDate, day, ...other } = props;
  
  const isInTaskRange = tasks.some(task => {
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.endDate);
    
    return isWithinInterval(day, {
      start: taskStartDate,
      end: taskEndDate
    });
  });

  const isTaskStart = tasks.some(task => 
    isSameDay(day, new Date(task.startDate))
  );

  const isTaskEnd = tasks.some(task => 
    isSameDay(day, new Date(task.endDate))
  );

  const isSelected = isSameDay(day, selectedDate);

  return (
    <Box
      sx={{
        position: 'relative',
        ...(isInTaskRange && {
          backgroundColor: 'primary.light',
          '&:hover': {
            backgroundColor: 'primary.main',
          },
        }),
        ...(isTaskStart && {
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
          backgroundColor: 'primary.main',
          color: 'white',
        }),
        ...(isTaskEnd && {
          borderTopRightRadius: '50%',
          borderBottomRightRadius: '50%',
          backgroundColor: 'primary.main',
          color: 'white',
        }),
        ...(isSelected && {
          border: '2px solid',
          borderColor: 'secondary.main',
        }),
      }}
    >
      <PickersDay 
        {...other} 
        day={day}
        selected={isSelected}
        sx={{
          ...(isInTaskRange && !isTaskStart && !isTaskEnd && {
            backgroundColor: 'primary.light',
            color: 'primary.dark',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }),
          ...(isTaskStart && {
            backgroundColor: 'primary.main',
            color: 'white',
            borderTopLeftRadius: '50%',
            borderBottomLeftRadius: '50%',
          }),
          ...(isTaskEnd && {
            backgroundColor: 'primary.main',
            color: 'white',
            borderTopRightRadius: '50%',
            borderBottomRightRadius: '50%',
          }),
          ...(isSelected && {
            border: '2px solid',
            borderColor: 'secondary.main',
            zIndex: 1,
          }),
        }}
      />
    </Box>
  );
}

const Calender = ({ projectId, data }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [organizedColumns, setOrganizedColumns] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);

  const getTasks = async () => {
    if (!data?.id) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`);
      const tasksData = res.data || [];
      setTasks(tasksData);

      // Organize tasks by stage
      const organized = {};
      Object.keys(processColumns).forEach(processId => {
        const columnConfig = processColumns[processId];
        const columnTasks = tasksData.filter(task => task.stage === columnConfig.stage);
        
        organized[processId] = {
          ...columnConfig,
          tasks: columnTasks
        };
      });
      setOrganizedColumns(organized);
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

  // Get tasks for selected date
  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);
      const selected = new Date(selectedDate);
      
      return isWithinInterval(selected, {
        start: taskStartDate,
        end: taskEndDate
      });
    });
  };

  const tasksForSelectedDate = getTasksForSelectedDate();

  // Get tasks to highlight in calendar (either selected task or all tasks for the date)
  const getTasksToHighlight = () => {
    if (selectedTask) {
      return [selectedTask];
    }
    return tasksForSelectedDate;
  };

  const tasksToHighlight = getTasksToHighlight();

  const getStatusColor = (status) => {
    switch (status) {
      case 'inProgress': return 'primary';
      case 'upcoming': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTask(null); // Clear task selection when date changes
  };

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Calendar Section */}
      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar 
                value={selectedDate} 
                onChange={handleDateChange}
                slots={{
                  day: CustomDay,
                }}
                slotProps={{
                  day: {
                    tasks: tasksToHighlight,
                    selectedDate,
                  },
                }}
              />
            </LocalizationProvider>
          </CardContent>
        </Card>

        {/* Selected Task Info */}
        {selectedTask && (
          <Card sx={{ mt: 2, p: 2, bgcolor: 'primary.light' }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Task:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {selectedTask.title}
            </Typography>
            <Typography variant="caption" display="block">
              {format(new Date(selectedTask.startDate), "MMM d")} - {format(new Date(selectedTask.endDate), "MMM d, yyyy")}
            </Typography>
            <Chip
              size="small"
              label={selectedTask.stage}
              color={
                processColumns[
                  Object.keys(processColumns).find(key => 
                    processColumns[key].stage === selectedTask.stage
                  )
                ]?.color || 'default'
              }
              sx={{ mt: 1 }}
            />
            {selectedTask.assignedWorker && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Avatar 
                  sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                >
                  {getInitials(selectedTask.assignedWorker.name)}
                </Avatar>
                <Typography variant="caption">
                  {selectedTask.assignedWorker.name}
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {/* Task Summary by Stage */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Tasks by Stage
          </Typography>
          {Object.keys(organizedColumns).map(columnId => {
            const column = organizedColumns[columnId];
            return (
              <Card key={columnId} sx={{ mb: 1, p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight="medium">
                    {column.stage}
                  </Typography>
                  <Chip 
                    label={column.tasks.length} 
                    size="small" 
                    color={column.color}
                  />
                </Box>
              </Card>
            );
          })}
        </Box>
      </Grid>

      {/* Tasks Section */}
      <Grid item xs={12} md={8}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </Typography>
            <Box display="flex" gap={1}>
              {selectedTask && (
                <Chip 
                  label="Viewing selected task" 
                  color="primary" 
                  onDelete={() => setSelectedTask(null)}
                />
              )}
              <Chip 
                label={`${tasksForSelectedDate.length} tasks`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          </Box>

          {tasksForSelectedDate.length === 0 ? (
            <Card sx={{ p: 5, textAlign: "center" }}>
              <Typography color="text.secondary">
                No tasks scheduled for this date.
              </Typography>
            </Card>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {tasksForSelectedDate.map((task) => (
                <Card
                  key={task.id}
                  variant="outlined"
                  onClick={() => handleTaskSelect(task)}
                  sx={{ 
                    p: 2.5, 
                    "&:hover": { 
                      boxShadow: 3,
                      cursor: 'pointer',
                      backgroundColor: selectedTask?.id === task.id ? 'action.hover' : 'background.paper'
                    }, 
                    transition: "all 0.2s ease",
                    borderLeft: `4px solid ${
                      processColumns[
                        Object.keys(processColumns).find(key => 
                          processColumns[key].stage === task.stage
                        )
                      ]?.color || 'grey'
                    }`,
                    backgroundColor: selectedTask?.id === task.id ? 'action.selected' : 'background.paper',
                    border: selectedTask?.id === task.id ? '2px solid' : '1px solid',
                    borderColor: selectedTask?.id === task.id ? 'primary.main' : 'divider'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {task.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={task.status}
                          color={getStatusColor(task.status)}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`Priority: ${task.priority}`}
                          color={getPriorityColor(task.priority)}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={3} color="text.secondary" fontSize="0.875rem" flexWrap="wrap">
                        <Typography variant="body2">
                          📅 Start: {format(new Date(task.startDate), "MMM d, yyyy")}
                        </Typography>
                        <Typography variant="body2">
                          📅 End: {format(new Date(task.endDate), "MMM d, yyyy")}
                        </Typography>
                        <Typography variant="body2">
                          🏷️ Stage: {task.stage}
                        </Typography>
                      </Box>

                      {/* Assigned Worker Information */}
                      {task.assignedWorker && (
                        <Box display="flex" alignItems="center" gap={1} mt={1.5}>
                          <Avatar 
                            sx={{ width: 28, height: 28, fontSize: '0.8rem' }}
                          >
                            {getInitials(task.assignedWorker.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {task.assignedWorker.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.assignedWorker.jobTitle} • {task.assignedWorker.email}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    
                    <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
                      <Chip
                        label={task.stage}
                        color={
                          processColumns[
                            Object.keys(processColumns).find(key => 
                              processColumns[key].stage === task.stage
                            )
                          ]?.color || 'default'
                        }
                        size="small"
                      />
                      {selectedTask?.id === task.id && (
                        <Chip
                          label="Selected"
                          color="primary"
                          size="small"
                          variant="filled"
                        />
                      )}
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}

          {/* All Tasks Overview */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              All Tasks Overview
            </Typography>
            <Grid container spacing={2}>
              {Object.keys(organizedColumns).map(columnId => {
                const column = organizedColumns[columnId];
                return (
                  <Grid item xs={12} sm={6} key={columnId}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color={column.color}>
                        {column.stage} ({column.tasks.length})
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {column.tasks.map(task => (
                          <Box 
                            key={task.id} 
                            onClick={() => handleTaskSelect(task)}
                            sx={{ 
                              p: 1, 
                              bgcolor: selectedTask?.id === task.id ? 'primary.light' : 'grey.50', 
                              borderRadius: 1,
                              borderLeft: `3px solid ${
                                tasksForSelectedDate.some(t => t.id === task.id) ? 'primary.main' : 'transparent'
                              }`,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              }
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(task.startDate), "MMM d")} - {format(new Date(task.endDate), "MMM d, yyyy")}
                            </Typography>
                            {task.assignedWorker && (
                              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <Avatar 
                                  sx={{ width: 20, height: 20, fontSize: '0.6rem' }}
                                >
                                  {getInitials(task.assignedWorker.name)}
                                </Avatar>
                                <Typography variant="caption">
                                  {task.assignedWorker.name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Calender;