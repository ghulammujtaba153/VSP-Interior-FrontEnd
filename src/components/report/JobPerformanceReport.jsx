"use client"

import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

export default function JobPerformanceReport({ period, project }) {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period?.startDate) params.append('startDate', period.startDate);
      if (period?.endDate) params.append('endDate', period.endDate);
      
      const url = `${BASE_URL}/api/project-setup/get/job/performance/stats${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(url);
      
      if (res.data.success) {
        setPerformanceData(res.data.data);
      } else {
        setPerformanceData(null);
      }
    } catch (error) {
      console.error("Error fetching job performance data:", error);
      setPerformanceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [period, project, refreshKey]);

  if (loading) return <Loader />;

  if (!performanceData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load job performance data
        </Typography>
        <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

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
        <Button variant="contained" onClick={() => setRefreshKey(prev => prev + 1)}>Refresh Data</Button>
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
              <Typography variant="caption" color="text.secondary">
                Based on {performanceData.totalProjects} projects
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
              <Typography variant="caption" color="text.secondary">
                {performanceData.completedProjects} completed projects
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
                {performanceData.projectsAtRisk}
              </Typography>
              <Typography variant="caption" color="error">
                Projects with delayed jobs
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
          {performanceData.projects && performanceData.projects.length > 0 ? (
            performanceData.projects.map((project, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #eee", borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {project.name}
                  </Typography>
                  <Chip
                    label={project.status === "completed" ? "Completed" : project.status === "in-progress" ? "In Progress" : project.status}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: project.status === "completed" ? "success.light/80" : "primary.light/80",
                      color: project.status === "completed" ? "success.main" : "primary.main",
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
          ))
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No project performance data available
            </Typography>
          )}
        </CardContent>
      </Card>

    </Box>
  );
}
