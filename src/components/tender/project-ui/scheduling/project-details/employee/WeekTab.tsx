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

const WeekTab = ({ tasks = [] }) => {
  // ✅ Generate next 7 days (starting today)
  const getWeekDates = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  // ✅ Filter tasks based on matching date overlap
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      const s = new Date(task.startDate);
      const e = new Date(task.endDate);
      const target = new Date(dateStr);
      target.setHours(12, 0, 0, 0);
      return s <= target && e >= target;
    });
  };

  const getStatusColor = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s.includes("complete")) return "success";
    if (s.includes("progress")) return "primary";
    if (s.includes("start")) return "warning";
    return "default";
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
          const tasksForDay = getTasksForDate(date);
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
                      label={`${tasksForDay.length} ${
                        tasksForDay.length === 1 ? "task" : "tasks"
                      }`}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Task List */}
                  {tasksForDay.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {tasksForDay.map((task) => (
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
                              {task.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "flex", gap: 1 }}
                            >
                              <span>{task.stage}</span>•<span>{task.assignedWorker?.name || "Unassigned"}</span>
                            </Typography>
                          </Box>
                          <Chip
                            label={task.status?.replace(/([a-z])([A-Z])/g, "$1 $2")}
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
