"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useTheme
} from "@mui/material";
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
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
  const theme = useTheme();
  
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
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
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
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            color: 'primary.main',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.4),
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
  const theme = useTheme();
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
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardHeader 
            title={
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Project Schedule
              </Typography>
            }
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
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
          <Card sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.08), 
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            borderRadius: 2
          }}>
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
        <Card sx={{ mt: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                Tasks by Stage
              </Typography>
            }
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent sx={{ p: 0 }}>
            <List sx={{ p: 0 }}>
              {Object.keys(organizedColumns).map((columnId, index, arr) => {
                const column = organizedColumns[columnId];
                return (
                  <Box key={columnId}>
                    <ListItem sx={{ py: 1.5, borderLeft: `4px solid`, borderColor: `${column.color}.main` }}>
                      <ListItemText
                        primary={
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
                        }
                      />
                    </ListItem>
                    {index < arr.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Tasks Section */}
      <Grid item xs={12} md={8}>
        <Box>
          {/* Tasks for Selected Date */}
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                  <EventIcon sx={{ mr: 1 }} />
                  Tasks for {format(selectedDate, "MMMM d, yyyy")}
                </Typography>
              }
              subheader={`${tasksForSelectedDate.length} task${tasksForSelectedDate.length !== 1 ? 's' : ''} found`}
              action={
                <Box display="flex" gap={1} alignItems="center" mt={1}>
                  {selectedTask && (
                    <Chip
                      label="Viewing selected task"
                      color="primary"
                      size="small"
                      onDelete={() => setSelectedTask(null)}
                    />
                  )}
                  <Chip
                    label={`${tasksForSelectedDate.length} tasks`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              }
              sx={{ borderBottom: 1, borderColor: "divider" }}
            />
            <CardContent sx={{ p: 0 }}>
              {tasksForSelectedDate.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <EventIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No tasks scheduled for this date.</Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {tasksForSelectedDate.map((task, index) => (
                    <Box key={task.id}>
                      <ListItem
                        alignItems="flex-start"
                        onClick={() => handleTaskSelect(task)}
                        sx={{
                          py: 3,
                          cursor: 'pointer',
                          borderLeft: `4px solid`,
                          borderColor: `${processColumns[Object.keys(processColumns).find(k => processColumns[k].stage === task.stage)]?.color || 'grey'}.main`,
                          bgcolor: selectedTask?.id === task.id ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                          transition: 'background 0.2s',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <AssignmentIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                              <Typography variant="h6">{task.title}</Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip size="small" label={task.status} color={getStatusColor(task.status)} variant="outlined" />
                                <Chip size="small" label={`Priority: ${task.priority}`} color={getPriorityColor(task.priority)} />
                                <Chip
                                  label={task.stage}
                                  color={processColumns[Object.keys(processColumns).find(k => processColumns[k].stage === task.stage)]?.color || 'default'}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body1" paragraph>{task.description}</Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <ScheduleIcon sx={{ mr: 0.5, fontSize: 16, color: "text.secondary" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {format(new Date(task.startDate), "MMM d, yyyy")} → {format(new Date(task.endDate), "MMM d, yyyy")}
                                  </Typography>
                                </Box>
                                {task.assignedWorker && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: 'secondary.main' }}>
                                      {getInitials(task.assignedWorker.name)}
                                    </Avatar>
                                    <Typography variant="caption" color="text.secondary">
                                      {task.assignedWorker.name} • {task.assignedWorker.jobTitle}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < tasksForSelectedDate.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* All Tasks Overview */}
          <Grid container spacing={2}>
            {Object.keys(organizedColumns).map(columnId => {
              const column = organizedColumns[columnId];
              return (
                <Grid item xs={12} sm={6} key={columnId}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardHeader
                      title={
                        <Typography variant="subtitle1" fontWeight="bold" color={`${column.color}.main`}>
                          {column.stage}
                        </Typography>
                      }
                      subheader={`${column.tasks.length} task${column.tasks.length !== 1 ? 's' : ''}`}
                      sx={{ borderBottom: 1, borderColor: "divider", borderLeft: 4, borderLeftColor: `${column.color}.main` }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      {column.tasks.length === 0 ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">No tasks</Typography>
                        </Box>
                      ) : (
                        <List sx={{ p: 0 }}>
                          {column.tasks.map((task, idx) => (
                            <Box key={task.id}>
                              <ListItem
                                onClick={() => handleTaskSelect(task)}
                                sx={{
                                  py: 1.5,
                                  cursor: 'pointer',
                                  bgcolor: selectedTask?.id === task.id
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : tasksForSelectedDate.some(t => t.id === task.id)
                                      ? alpha(theme.palette.success.main, 0.05)
                                      : 'transparent',
                                  borderLeft: tasksForSelectedDate.some(t => t.id === task.id)
                                    ? `3px solid ${theme.palette.success.main}`
                                    : '3px solid transparent',
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                  transition: 'background 0.2s'
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: `${column.color}.main` }}>
                                    {getInitials(task.assignedWorker?.name || task.title)}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" fontWeight="medium" noWrap>
                                      {task.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                      <ScheduleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {format(new Date(task.startDate), "MMM d")} – {format(new Date(task.endDate), "MMM d")}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                              {idx < column.tasks.length - 1 && <Divider variant="inset" component="li" />}
                            </Box>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Calender;