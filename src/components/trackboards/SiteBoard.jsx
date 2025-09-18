"use client";

import React, { useState } from "react";
import KanbanBoard from "./KanbanBoard";
import JobDetailsModal from "./JobDetailsModal";
import { Typography, Box } from "@mui/material";

// Mock site jobs data
const mockSiteJobs = [
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
    id: "VSP-006",
    title: "Equipment Installation",
    client: "Tech Solutions Ltd",
    type: "installation",
    status: "in-transit",
    priority: "amber",
    assignedTo: ["Install Team B", "Mike Johnson"],
    estimatedCompletion: "3 hours",
    progress: 40,
    dueDate: "2024-01-12",
    location: "Manufacturing Plant B",
    notes: 4,
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
  {
    id: "VSP-008",
    title: "Final System Setup",
    client: "Premier Construction",
    type: "installation",
    status: "installed",
    priority: "green",
    assignedTo: ["Install Team A"],
    estimatedCompletion: "Complete",
    progress: 100,
    dueDate: "2024-01-09",
    location: "Site Office Building",
    notes: 3,
    photos: 8,
  },
];

export default function SiteBoard({ searchQuery, filters }) {
  const [jobs, setJobs] = useState(mockSiteJobs);
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
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

    if (filters.status && filters.status !== "all-statuses" && job.status !== filters.status)
      return false;

    if (
      filters.assignedTo &&
      filters.assignedTo !== "all-staff" &&
      !job.assignedTo.some(
        (person) => person.toLowerCase().replace(" ", "-") === filters.assignedTo
      )
    )
      return false;

    if (
      filters.client &&
      filters.client !== "all-clients" &&
      job.client.toLowerCase().replace(/[^a-z]/g, "-") !== filters.client
    )
      return false;

    return true;
  });

  // Group jobs by status for Kanban columns
  const columns = [
    {
      id: "ready-dispatch",
      title: "Ready for Dispatch",
      jobs: filteredJobs.filter((job) => job.status === "ready-dispatch"),
    },
    {
      id: "in-transit",
      title: "In Transit",
      jobs: filteredJobs.filter((job) => job.status === "in-transit"),
    },
    {
      id: "on-site",
      title: "On Site",
      jobs: filteredJobs.filter((job) => job.status === "on-site"),
    },
    {
      id: "installed",
      title: "Installed",
      jobs: filteredJobs.filter((job) => job.status === "installed"),
    },
  ];

  const handleJobMove = (jobId, fromColumn, toColumn) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: toColumn } : job
      )
    );
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Site Delivery & Installation Board
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track jobs from dispatch through installation completion
        </Typography>
      </Box>

      <KanbanBoard
        columns={columns}
        onJobMove={handleJobMove}
        onJobClick={handleJobClick}
      />

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
