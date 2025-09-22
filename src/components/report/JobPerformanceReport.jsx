"use client"

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

export default function JobPerformanceReport({ period, project }) {
  const performanceData = {
    averageEfficiency: 87.3,
    onTimeDelivery: 92,
    totalProjects: 24,
    completedProjects: 18,
    projects: [
      {
        name: "Office Renovation",
        estimatedTime: 480,
        actualTime: 456,
        estimatedCost: 125000,
        actualCost: 118500,
        efficiency: 105.3,
        status: "Completed",
      },
      {
        name: "Warehouse Construction",
        estimatedTime: 720,
        actualTime: 798,
        estimatedCost: 275000,
        actualCost: 292000,
        efficiency: 90.2,
        status: "Completed",
      },
      {
        name: "Retail Store Fit-out",
        estimatedTime: 320,
        actualTime: 285,
        estimatedCost: 85000,
        actualCost: 78000,
        efficiency: 112.3,
        status: "Completed",
      },
      {
        name: "Apartment Complex",
        estimatedTime: 960,
        actualTime: 720,
        estimatedCost: 450000,
        actualCost: 420000,
        efficiency: 75.0,
        status: "In Progress",
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Job Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Actual vs estimated time/costs and project efficiency
          </Typography>
        </Box>
        <Button variant="contained">Generate Report</Button>
      </Box>

      {/* Key Performance Metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Average Efficiency"
              action={<TrackChangesIcon color="action" />}
              titleTypographyProps={{ variant: "subtitle2" }}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {performanceData.averageEfficiency}%
              </Typography>
              <Typography variant="caption" color="success.main" display="flex" alignItems="center">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +5.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="On-Time Delivery"
              action={<AccessTimeIcon color="action" />}
              titleTypographyProps={{ variant: "subtitle2" }}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {performanceData.onTimeDelivery}%
              </Typography>
              <Typography variant="caption" color="success.main" display="flex" alignItems="center">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +2.8% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Total Projects"
              action={<TrackChangesIcon color="action" />}
              titleTypographyProps={{ variant: "subtitle2" }}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {performanceData.totalProjects}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {performanceData.completedProjects} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Projects At Risk"
              action={<WarningAmberIcon color="action" />}
              titleTypographyProps={{ variant: "subtitle2" }}
            />
            <CardContent>
              <Typography variant="h6" color="error">
                3
              </Typography>
              <Typography variant="caption" color="error">
                Behind schedule or budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Performance Details */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Project Performance Analysis"
          subheader="Detailed breakdown of time and cost performance by project"
        />
        <CardContent>
          {performanceData.projects.map((project, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #eee", borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {project.name}
                  </Typography>
                  <Chip
                    label={project.status}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: project.status === "Completed" ? "success.light" : "primary.light",
                      color: project.status === "Completed" ? "success.main" : "primary.main",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      project.efficiency >= 100
                        ? "success.main"
                        : project.efficiency >= 80
                        ? "primary.main"
                        : "error.main",
                  }}
                >
                  {project.efficiency}%
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Time Performance */}
                <Grid item xs={12} md={6}>
                  <Typography fontWeight="bold">Time Performance</Typography>
                  <Typography variant="body2">Estimated: {project.estimatedTime}h</Typography>
                  <Typography
                    variant="body2"
                    color={project.actualTime <= project.estimatedTime ? "success.main" : "error.main"}
                  >
                    Actual: {project.actualTime}h
                  </Typography>
                  <Typography
                    variant="body2"
                    color={project.actualTime <= project.estimatedTime ? "success.main" : "error.main"}
                  >
                    Variance: {project.actualTime <= project.estimatedTime ? "-" : "+"}
                    {Math.abs(project.actualTime - project.estimatedTime)}h
                  </Typography>
                </Grid>

                {/* Cost Performance */}
                <Grid item xs={12} md={6}>
                  <Typography fontWeight="bold">Cost Performance</Typography>
                  <Typography variant="body2">
                    Estimated: ${project.estimatedCost.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={project.actualCost <= project.estimatedCost ? "success.main" : "error.main"}
                  >
                    Actual: ${project.actualCost.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={project.actualCost <= project.estimatedCost ? "success.main" : "error.main"}
                  >
                    Variance: {project.actualCost <= project.estimatedCost ? "-" : "+"}$
                    {Math.abs(project.actualCost - project.estimatedCost).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="caption">Overall Performance</Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(project.efficiency, 100)}
                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader title="Performance Trends" subheader="Historical performance metrics over time" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                <Typography variant="h6" color="success.main">
                  +12%
                </Typography>
                <Typography variant="body2">Efficiency improvement</Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last quarter
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={2}>
                <Typography variant="h6" color="primary.main">
                  -8%
                </Typography>
                <Typography variant="body2">Cost variance reduction</Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last quarter
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                <Typography variant="h6" color="success.main">
                  +5%
                </Typography>
                <Typography variant="body2">On-time delivery rate</Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last quarter
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
