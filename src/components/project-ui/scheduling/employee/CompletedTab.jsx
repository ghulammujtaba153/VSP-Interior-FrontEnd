"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ✅ Mock Data (sample tasks)
const mockTasks = [
  {
    id: 1,
    projectName: "Community Center Renovation",
    phase: "Final Review",
    location: "Berlin, Germany",
    dueDate: "2025-03-15",
    status: "complete",
  },
  {
    id: 2,
    projectName: "School Library Upgrade",
    phase: "Inspection",
    location: "Paris, France",
    dueDate: "2025-04-05",
    status: "complete",
  },
  {
    id: 3,
    projectName: "Hospital Equipment Installation",
    phase: "Procurement",
    location: "Rome, Italy",
    dueDate: "2025-05-10",
    status: "in-progress",
  },
  {
    id: 4,
    projectName: "City Road Safety Campaign",
    phase: "Awareness Drive",
    location: "Amsterdam, Netherlands",
    dueDate: "2025-02-20",
    status: "complete",
  },
];



const CompletedTab = () => {
  const completedTasks = mockTasks.filter((task) => task.status === "complete");

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto", mt: 3 }}>
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

      {/* Completed Task Cards */}
      <Grid container spacing={2}>
        {completedTasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                opacity: 0.85,
                transition: "opacity 0.2s",
                "&:hover": { opacity: 1 },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  {/* Task Info */}
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1.2} mb={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {task.projectName}
                      </Typography>
                    </Box>

                    <Box ml={4}>
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <strong>Phase:</strong>
                        <Chip
                          label={task.phase}
                          size="small"
                          variant="outlined"
                        />
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <strong>Location:</strong> {task.location}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <strong>Completed:</strong>{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Badge */}
                  <Chip
                    label="Complete"
                    color="success"
                    sx={{
                      fontWeight: 600,
                      alignSelf: "flex-start",
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {completedTasks.length === 0 && (
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
      )}
    </Box>
  );
};

export default CompletedTab;
