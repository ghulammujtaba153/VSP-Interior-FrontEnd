"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Stack,
  Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const CompletedTab = ({ tasks = [] }) => {
  // accept both 'complete' and 'completed'
  const completedTasks = tasks.filter((task) => {
    const s = (task.status || "").toString().toLowerCase();
    return s === "complete" || s === "completed";
  });

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <CheckCircleIcon color="success" fontSize="medium" />
          <Typography variant="h6" fontWeight={600}>
            Completed Tasks
          </Typography>
        </Box>
        <Chip
          label={`${completedTasks.length} completed`}
          color="success"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* If no completed tasks */}
      {completedTasks.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ textAlign: "center", p: 6, mt: 3, color: "text.secondary" }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography>No completed tasks yet.</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Your completed work will appear here.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {completedTasks.map((task) => (
            <Grid item xs={12} key={task.id || task._id}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  opacity: 0.95,
                  transition: "opacity 0.2s, transform 0.2s",
                  "&:hover": { opacity: 1, transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    {/* Task Info */}
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1.2} mb={1}>
                        <Avatar
                          sx={{ bgcolor: "success.main" }}
                        >{(task.assignedWorker?.name || "U").charAt(0)}</Avatar>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {task.title || task.name}
                        </Typography>
                      </Box>

                      <Box ml={6}>
                        {task.stage && (
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <strong>Stage:</strong>
                            <Chip
                              label={task.stage}
                              size="small"
                              variant="outlined"
                            />
                          </Typography>
                        )}

                        {task.assignedWorker && (
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <strong>Worker:</strong> {task.assignedWorker.name} (
                            {task.assignedWorker.jobTitle})
                          </Typography>
                        )}

                        {task.endDate && (
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <strong>Completed:</strong>{" "}
                            {new Date(task.endDate).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Status Badge */}
                    <Chip
                      label="Complete"
                      color="success"
                      sx={{ fontWeight: 600, alignSelf: "flex-start" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CompletedTab;
