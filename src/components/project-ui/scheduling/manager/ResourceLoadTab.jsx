"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  LinearProgress,
  Grid,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// 🔹 Mock project data (you can replace with API data later)
const mockProjects = [
  {
    id: "1",
    name: "Bridge Construction",
    assignedWorkers: ["Ali", "Hamza", "Sara"],
    phases: [
      { name: "Planning", estimatedHours: 40, status: "completed" },
      { name: "Construction", estimatedHours: 80, status: "in-progress" },
      { name: "Inspection", estimatedHours: 20, status: "pending" },
    ],
  },
  {
    id: "2",
    name: "Road Expansion Project",
    assignedWorkers: ["Ahmed", "Bilal", "Sara"],
    phases: [
      { name: "Survey", estimatedHours: 50, status: "completed" },
      { name: "Machinery Setup", estimatedHours: 60, status: "in-progress" },
      { name: "Paving", estimatedHours: 70, status: "pending" },
    ],
  },
  {
    id: "3",
    name: "Office Complex Build",
    assignedWorkers: ["Ali", "Zainab", "Hassan", "Ayesha"],
    phases: [
      { name: "Foundation", estimatedHours: 90, status: "in-progress" },
      { name: "Interior Design", estimatedHours: 40, status: "pending" },
    ],
  },
  {
    id: "4",
    name: "Solar Plant Installation",
    assignedWorkers: ["Hina", "Tariq"],
    phases: [
      { name: "Panel Setup", estimatedHours: 60, status: "completed" },
      { name: "Testing", estimatedHours: 40, status: "in-progress" },
    ],
  },
];

const ResourceLoadTab = () => {
  // Extract unique worker names
  const workers = Array.from(
    new Set(mockProjects.flatMap((p) => p.assignedWorkers))
  );

  // Calculate workload for each worker
  const getWorkerLoad = (workerName) => {
    const projects = mockProjects.filter((p) =>
      p.assignedWorkers.includes(workerName)
    );

    const totalEstimatedHours = projects.reduce((sum, project) => {
      return (
        sum +
        project.phases
          .filter((phase) => phase.status !== "completed")
          .reduce((phaseSum, phase) => phaseSum + phase.estimatedHours, 0)
      );
    }, 0);

    const availableHours = 160; // standard monthly hours
    const loadPercentage = (totalEstimatedHours / availableHours) * 100;

    return {
      totalEstimatedHours,
      availableHours,
      loadPercentage: Math.min(loadPercentage, 150),
      isOverloaded: loadPercentage > 100,
      projects: projects.length,
    };
  };

  // Count overloaded workers
  const overloadedCount = workers.filter(
    (w) => getWorkerLoad(w).isOverloaded
  ).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Resource Load Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estimated hours vs available hours per team member
          </Typography>
        </Box>

        <Chip
          label={`${overloadedCount} overloaded`}
          icon={<WarningAmberIcon />}
          variant="outlined"
          color={overloadedCount > 0 ? "warning" : "success"}
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* Worker Cards */}
      <Grid container spacing={3}>
        {workers.map((worker) => {
          const load = getWorkerLoad(worker);
          const color =
            load.isOverloaded
              ? "error"
              : load.loadPercentage > 80
              ? "warning"
              : "success";

          return (
            <Grid item xs={12} md={6} key={worker}>
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 2,
                  borderColor:
                    load.isOverloaded
                      ? "error.main"
                      : load.loadPercentage > 80
                      ? "warning.main"
                      : "success.main",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {worker}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {load.projects} active{" "}
                      {load.projects === 1 ? "project" : "projects"}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${load.loadPercentage.toFixed(0)}% capacity`}
                    color={color}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">
                      {load.totalEstimatedHours}h estimated
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {load.availableHours}h available
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(load.loadPercentage, 100)}
                    color={color}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mt: 1,
                    }}
                  />
                </Box>

                {load.isOverloaded && (
                  <Alert
                    severity="error"
                    icon={<ErrorOutlineIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      fontSize: 14,
                    }}
                  >
                    This worker is overallocated. Consider redistributing tasks.
                  </Alert>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary Card */}
      <Card
        sx={{
          p: 3,
          backgroundColor: "action.hover",
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Team Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} textAlign="center">
          <Grid item xs={4}>
            <Typography variant="h5" fontWeight="bold">
              {workers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Workers
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h5" fontWeight="bold">
              {mockProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Projects
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h5" color="error" fontWeight="bold">
              {overloadedCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overloaded
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default ResourceLoadTab;
