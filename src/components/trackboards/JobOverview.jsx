"use client";


import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Button,
  LinearProgress,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import JobCard from "./JobCard";
import JobDetailsModal from "./JobDetailsModal";

const mockAllJobs = [
  {
    id: "VSP-001",
    title: "Steel Frame Assembly",
    client: "ACME Corporation",
    type: "assembly",
    status: "to-start",
    priority: "green",
    assignedTo: ["John Smith", "Sarah Wilson"],
    estimatedCompletion: "2 days",
    progress: 0,
    dueDate: "2024-01-15",
    notes: 3,
  },
  {
    id: "VSP-002",
    title: "CNC Machining - Housing",
    client: "Tech Solutions Ltd",
    type: "machining",
    status: "in-progress",
    priority: "amber",
    assignedTo: ["Mike Johnson"],
    estimatedCompletion: "1 day",
    progress: 65,
    dueDate: "2024-01-12",
    notes: 1,
    photos: 2,
  },
  {
    id: "VSP-005",
    title: "Steel Frame Delivery",
    client: "ACME Corporation",
    type: "delivery",
    status: "ready-dispatch",
    priority: "green",
    assignedTo: ["Delivery Team A"],
    estimatedCompletion: "Tomorrow",
    progress: 95,
    dueDate: "2024-01-13",
    location: "Downtown Office Complex",
    notes: 2,
    photos: 1,
  },
  {
    id: "VSP-007",
    title: "Precision Parts Install",
    client: "Global Manufacturing",
    type: "installation",
    status: "on-site",
    priority: "red",
    assignedTo: ["Sarah Wilson", "Team C"],
    estimatedCompletion: "2 days",
    progress: 75,
    dueDate: "2024-01-11",
    location: "Factory Floor 3",
    notes: 8,
    photos: 15,
  },
];

export default function JobOverview({ searchQuery, filters }) {
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter jobs
  const filteredJobs = mockAllJobs.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !job.id.toLowerCase().includes(query) &&
        !job.title.toLowerCase().includes(query) &&
        !job.client.toLowerCase().includes(query) &&
        !(job.location && job.location.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    if (filters?.status && filters.status !== "all-statuses" && job.status !== filters.status) return false;
    if (
      filters?.assignedTo &&
      filters.assignedTo !== "all-staff" &&
      !job.assignedTo.some(
        (person) => person.toLowerCase().replace(" ", "-") === filters.assignedTo
      )
    )
      return false;
    if (
      filters?.client &&
      filters.client !== "all-clients" &&
      job.client.toLowerCase().replace(/[^a-z]/g, "-") !== filters.client
    )
      return false;

    return true;
  });

  // Stats
  const totalJobs = filteredJobs.length;
  const completedJobs = filteredJobs.filter(
    (job) => job.status === "complete" || job.status === "installed"
  ).length;
  const inProgressJobs = filteredJobs.filter(
    (job) =>
      job.status === "in-progress" ||
      job.status === "in-transit" ||
      job.status === "on-site"
  ).length;
  const delayedJobs = filteredJobs.filter((job) => job.priority === "red").length;
  const atRiskJobs = filteredJobs.filter((job) => job.priority === "amber").length;

  const overallProgress =
    totalJobs > 0
      ? Math.round(
          filteredJobs.reduce((sum, job) => sum + job.progress, 0) / totalJobs
        )
      : 0;

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold">
          Job Status Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Combined view of all jobs across Factory and Site operations
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Total Jobs"
              action={<BarChartIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5">{totalJobs}</Typography>
              <Typography variant="caption" color="text.secondary">
                Active projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="In Progress"
              action={<AccessTimeIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {inProgressJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Currently active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="At Risk"
              action={<WarningAmberIcon fontSize="small" color="warning" />}
            />
            <CardContent>
              <Typography variant="h5" color="warning.main">
                {atRiskJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Need attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Delayed"
              action={<WarningAmberIcon fontSize="small" color="error" />}
            />
            <CardContent>
              <Typography variant="h5" color="error">
                {delayedJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Require action
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overall Progress */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="subtitle1">Overall Progress</Typography>
            </Box>
          }
        />
        <CardContent>
          <Box mb={2} display="flex" justifyContent="space-between">
            <Typography variant="body2">Total Completion</Typography>
            <Typography variant="body2" fontWeight="bold">
              {overallProgress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={overallProgress} />
          <Grid container spacing={2} mt={2}>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6" color="success.main">
                {completedJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6" color="primary">
                {inProgressJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6" color="text.secondary">
                {totalJobs - completedJobs - inProgressJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight="bold">
          All Jobs
        </Typography>
        <Box>
          <Button variant="outlined" size="small" sx={{ mr: 1 }}>
            Export CSV
          </Button>
          <Button variant="contained" size="small">
            Create New Job
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {filteredJobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <JobCard job={job} onClick={() => handleJobClick(job)} />
          </Grid>
        ))}
      </Grid>

      {filteredJobs.length === 0 && (
        <Box textAlign="center" py={6}>
          <BarChartIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
          <Typography color="text.secondary">
            No jobs match the current filters
          </Typography>
        </Box>
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </Box>
  );
}
