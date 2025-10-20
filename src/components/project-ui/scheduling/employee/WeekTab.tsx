"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// ✅ Mock data (can be moved to a separate file later)
const mockTasks = [
  {
    id: "1",
    projectName: "Community Center Renovation",
    phase: "Painting",
    location: "Main Street, Downtown",
    dueDate: "2025-10-20",
    status: "in-progress",
  },
  {
    id: "2",
    projectName: "School Expansion Project",
    phase: "Foundation",
    location: "Elm Avenue, East Side",
    dueDate: "2025-10-22",
    status: "to-start",
  },
  {
    id: "3",
    projectName: "Park Lighting Setup",
    phase: "Inspection",
    location: "Riverside Park",
    dueDate: "2025-10-24",
    status: "complete",
  },
];

const WeekTab = () => {
  const getWeekDates = () => {
    const today = new Date();
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return mockTasks.filter((task) => task.dueDate === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "success";
      case "in-progress":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <CalendarMonthIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          This Week's Schedule
        </Typography>
      </Box>

      {/* Week Grid */}
      <Grid container spacing={2}>
        {weekDates.map((date) => {
          const tasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <Grid item xs={12} key={date.toISOString()}>
              <Card
                sx={{
                  border: isToday ? "2px solid" : "1px solid",
                  borderColor: isToday ? "primary.main" : "divider",
                  boxShadow: 2,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  {/* Date Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {date.toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                        {isToday && (
                          <Chip
                            label="Today"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      variant="outlined"
                      label={`${tasks.length} ${
                        tasks.length === 1 ? "task" : "tasks"
                      }`}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Task List */}
                  {tasks.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {tasks.map((task) => (
                        <Box
                          key={task.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "action.hover",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={500}>
                              {task.projectName}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "flex", gap: 1 }}
                            >
                              <span>{task.phase}</span>•<span>{task.location}</span>
                            </Typography>
                          </Box>
                          <Chip
                            label={task.status.replace("-", " ")}
                            color={getStatusColor(task.status)}
                            sx={{ textTransform: "capitalize" }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ py: 3 }}
                    >
                      No tasks scheduled
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default WeekTab;
