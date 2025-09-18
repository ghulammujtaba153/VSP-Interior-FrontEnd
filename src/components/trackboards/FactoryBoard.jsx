"use client";


import React, { useState } from "react";
import { Grid, Typography, Box, Paper } from "@mui/material";
import JobCard from "./JobCard";
import JobDetailsModal from "./JobDetailsModal";

const mockFactoryJobs = [
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
    id: "VSP-003",
    title: "Precision Milling",
    client: "Global Manufacturing",
    type: "machining",
    status: "on-hold",
    priority: "red",
    assignedTo: ["Team A", "Sarah Wilson"],
    estimatedCompletion: "3 days",
    progress: 25,
    dueDate: "2024-01-10",
    notes: 5,
  },
  {
    id: "VSP-004",
    title: "Quality Control Check",
    client: "Premier Construction",
    type: "assembly",
    status: "complete",
    priority: "green",
    assignedTo: ["John Smith"],
    estimatedCompletion: "Complete",
    progress: 100,
    dueDate: "2024-01-08",
    notes: 2,
    photos: 4,
  },
];

export default function FactoryBoard({ searchQuery, filters }) {
  const [jobs, setJobs] = useState(mockFactoryJobs);
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !job.id.toLowerCase().includes(query) &&
        !job.title.toLowerCase().includes(query) &&
        !job.client.toLowerCase().includes(query)
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

  // Group jobs by status
  const columns = [
    {
      id: "to-start",
      title: "To Start",
      color: "#e0e0e0",
      jobs: filteredJobs.filter((job) => job.status === "to-start"),
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "#bbdefb",
      jobs: filteredJobs.filter((job) => job.status === "in-progress"),
    },
    {
      id: "on-hold",
      title: "On Hold",
      color: "#ffe082",
      jobs: filteredJobs.filter((job) => job.status === "on-hold"),
    },
    {
      id: "complete",
      title: "Complete",
      color: "#c8e6c9",
      jobs: filteredJobs.filter((job) => job.status === "complete"),
    },
  ];

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold">
          Factory Production Board
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track machining and assembly jobs through the production pipeline
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {columns.map((col) => (
          <Grid item xs={12} sm={6} md={3} key={col.id}>
            <Paper sx={{ p: 2, bgcolor: col.color }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                {col.title}
              </Typography>
              {col.jobs.map((job) => (
                <Box key={job.id} mb={2}>
                  <JobCard job={job} onClick={() => handleJobClick(job)} />
                </Box>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>

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
