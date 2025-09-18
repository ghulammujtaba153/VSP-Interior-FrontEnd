"use client";



import React, { useState } from "react";
import { Card, CardContent, CardHeader, Typography, Badge, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import JobCard from "./JobCard";

export default function KanbanBoard({ columns, onJobMove, onJobClick }) {
  const [draggedJob, setDraggedJob] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedJob && onJobMove) {
      const fromColumn = columns.find((col) =>
        col.jobs.some((job) => job.id === draggedJob.id)
      )?.id;
      if (fromColumn && fromColumn !== columnId) {
        onJobMove(draggedJob.id, fromColumn, columnId);
      }
    }

    setDraggedJob(null);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(4, 1fr)" },
        p: 3,
      }}
    >
      {columns.map((column) => (
        <Card
          key={column.id}
          variant="outlined"
          sx={{
            minHeight: 600,
            transition: "all 0.2s ease",
            border:
              dragOverColumn === column.id ? "2px solid #1976d2" : "1px solid #ddd",
            backgroundColor: dragOverColumn === column.id ? "action.hover" : "white",
          }}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <CardHeader
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{column.title}</Typography>
                <Badge
                  badgeContent={column.jobs.length}
                  color="primary"
                  sx={{ "& .MuiBadge-badge": { fontSize: "0.75rem" } }}
                />
              </Box>
            }
          />

          <CardContent>
            {column.jobs.map((job) => (
              <Box
                key={job.id}
                draggable
                onDragStart={(e) => handleDragStart(e, job)}
                sx={{ cursor: "grab", mb: 2 }}
              >
                <JobCard
                  job={job}
                  onClick={onJobClick}
                  isDragging={draggedJob?.id === job.id}
                />
              </Box>
            ))}

            {/* Add New Job Button */}
            <Box
              sx={{
                border: "2px dashed #ccc",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <AddIcon sx={{ fontSize: 28, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Add New Job
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
