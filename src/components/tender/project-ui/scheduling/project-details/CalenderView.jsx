"use client";

import Loader from "@/components/loader/Loader";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Typography,
  Box,
  Modal,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  Comment as CommentIcon
} from "@mui/icons-material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const CalendarView = ({ projectId, data }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch tasks from API
  const getTasks = async () => {
    if (!data?.id) return;

    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`);
      const tasksData = res.data || [];

      // Generate separate events for each day of the task duration
      const calendarEvents = tasksData.flatMap((task) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const events = [];

        // Create events for each day between start and end date
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const currentDate = new Date(date);
          events.push({
            id: `${task.id}-${currentDate.toISOString().split('T')[0]}`,
            title: task.title,
            start: currentDate.toISOString().split('T')[0],
            extendedProps: {
              taskId: task.id,
              description: task.description,
              status: task.status,
              priority: task.priority,
              stage: task.stage,
              assignedWorker: task.assignedWorker,
              comments: task.comments,
              startDate: task.startDate,
              endDate: task.endDate,
              isFirstDay: currentDate.toDateString() === startDate.toDateString(),
              isLastDay: currentDate.toDateString() === endDate.toDateString(),
              fullTask: task
            },
            backgroundColor: getStatusColor(task.status),
            borderColor: getPriorityColor(task.priority),
            classNames: [
              'custom-event',
              task.status === 'completed' && 'completed-event',
              task.status === 'inProgress' && 'inprogress-event',
              task.priority === 'high' && 'high-priority'
            ]
          });
        }
        return events;
      });

      setTasks(calendarEvents);
      console.log("Calendar Events:", calendarEvents);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Color functions
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#4caf50";
      case "inProgress": return "#2196f3";
      case "upcoming": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#f44336";
      case "medium": return "#ff9800";
      case "low": return "#4caf50";
      default: return "#9e9e9e";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "inProgress": return "In Progress";
      case "upcoming": return "Upcoming";
      default: return status;
    }
  };

  // Handle event click
  const handleEventClick = (info) => {
    setSelectedTask(info.event.extendedProps.fullTask);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    getTasks();
  }, [data?.id]);

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
  };

  if (loading) return <Loader />;

  return (
    <Box className="bg-white p-4 rounded shadow">
      <Typography variant="h5" gutterBottom className="flex items-center gap-2">
        📅 Project Calendar
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        View all project tasks in calendar format. Each day shows individual task progress.
      </Typography>

      {/* Legend */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="Upcoming" 
          size="small" 
          sx={{ bgcolor: '#ff9800', color: 'white' }} 
        />
        <Chip 
          label="In Progress" 
          size="small" 
          sx={{ bgcolor: '#2196f3', color: 'white' }} 
        />
        <Chip 
          label="Completed" 
          size="small" 
          sx={{ bgcolor: '#4caf50', color: 'white' }} 
        />
        <Chip 
          label="High Priority" 
          size="small" 
          variant="outlined"
          sx={{ borderColor: '#f44336', color: '#f44336' }} 
        />
      </Box>

      {tasks.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tasks found for this project
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create tasks to see them in the calendar view
          </Typography>
        </Box>
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            height="75vh"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            events={tasks}
            eventClick={handleEventClick}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            dayMaxEvents={3}
            moreLinkClick="popover"
          />

          {/* Task Details Modal */}
          <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            aria-labelledby="task-details-modal"
            aria-describedby="task-details-description"
          >
            <Card sx={modalStyle}>
              {selectedTask && (
                <>
                  <Box sx={{ 
                    p: 3, 
                    pb: 2,
                    borderBottom: 1, 
                    borderColor: 'divider',
                    bgcolor: getStatusColor(selectedTask.status) + '15'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {selectedTask.title}
                      </Typography>
                      <IconButton onClick={handleCloseModal} size="small">
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={getStatusText(selectedTask.status)} 
                        size="small"
                        sx={{ 
                          bgcolor: getStatusColor(selectedTask.status),
                          color: 'white'
                        }}
                      />
                      <Chip 
                        label={selectedTask.priority} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: getPriorityColor(selectedTask.priority),
                          color: getPriorityColor(selectedTask.priority)
                        }}
                      />
                      <Chip 
                        label={selectedTask.stage} 
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    {/* Description */}
                    {selectedTask.description && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom className="flex items-center gap-1">
                          <DescriptionIcon fontSize="small" />
                          Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedTask.description}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                      {/* Dates */}
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="h6" gutterBottom className="flex items-center gap-1">
                          <CalendarIcon fontSize="small" />
                          Dates
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Start:</strong> {formatDate(selectedTask.startDate)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>End:</strong> {formatDate(selectedTask.endDate)}
                        </Typography>
                      </Box>

                      {/* Assigned Worker */}
                      {selectedTask.assignedWorker && (
                        <Box sx={{ minWidth: 200 }}>
                          <Typography variant="h6" gutterBottom className="flex items-center gap-1">
                            <PersonIcon fontSize="small" />
                            Assigned To
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: getStatusColor(selectedTask.status) }}>
                              {selectedTask.assignedWorker.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedTask.assignedWorker.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedTask.assignedWorker.jobTitle}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Comments */}
                    {selectedTask.comments && selectedTask.comments.length > 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom className="flex items-center gap-1">
                          <CommentIcon fontSize="small" />
                          Comments ({selectedTask.comments.length})
                        </Typography>
                        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                          {selectedTask.comments.map((comment, index) => (
                            <ListItem key={index} alignItems="flex-start">
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                                  {comment.author ? comment.author[0].toUpperCase() : 'U'}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    {comment.content}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(comment.timestamp).toLocaleDateString()} • {comment.author || 'Unknown'}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          </Modal>
        </>
      )}

      {/* Custom CSS for calendar events */}
      <style jsx global>{`
        .custom-event {
          border-left-width: 3px !important;
          border-radius: 4px;
          margin: 1px 0;
          font-size: 0.85em;
          font-weight: 500;
        }
        .completed-event {
          opacity: 0.8;
        }
        .inprogress-event {
          border-left-width: 4px !important;
        }
        .high-priority {
          border-color: #f44336 !important;
          font-weight: 600;
        }
        .fc-event {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </Box>
  );
};

export default CalendarView;