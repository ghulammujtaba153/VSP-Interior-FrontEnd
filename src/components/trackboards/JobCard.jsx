"use client"

import React from "react"
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  Typography,
  Box,
  IconButton,
} from "@mui/material"
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationOnIcon,
  PhotoCamera as CameraIcon,
  ChatBubbleOutline as MessageIcon,
} from "@mui/icons-material"

export default function JobCard({ job, onClick, isDragging }) {
  const statusConfig = {
    "to-start": { label: "To Start", color: "default" },
    "in-progress": { label: "In Progress", color: "primary" },
    "on-hold": { label: "On Hold", color: "warning" },
    complete: { label: "Complete", color: "success" },
    "ready-dispatch": { label: "Ready for Dispatch", color: "secondary" },
    "in-transit": { label: "In Transit", color: "info" },
    "on-site": { label: "On Site", color: "warning" },
    installed: { label: "Installed", color: "success" },
  }

  const priorityConfig = {
    green: { icon: <CheckCircleIcon fontSize="small" color="success" /> },
    amber: { icon: <ErrorOutlineIcon fontSize="small" color="warning" /> },
    red: { icon: <ErrorOutlineIcon fontSize="small" color="error" /> },
  }

  const statusInfo = statusConfig[job.status] || {}
  const priorityInfo = priorityConfig[job.priority] || {}

  return (
    <Card
      onClick={() => onClick?.(job)}
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { boxShadow: 4, bgcolor: "action.hover" },
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? "rotate(2deg)" : "none",
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              {job.id}
            </Typography>
            {priorityInfo.icon}
          </Box>
        }
        subheader={<Typography variant="caption">{job.client}</Typography>}
        action={<Chip label={statusInfo.label} color={statusInfo.color} size="small" />}
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {/* Title */}
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          {job.title}
        </Typography>

        {/* Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption">Progress</Typography>
            <Typography variant="caption">{job.progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={job.progress} />
        </Box>

        {/* Assigned users */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <PersonIcon fontSize="small" color="action" />
          <AvatarGroup max={3}>
            {job.assignedTo.map((person, index) => (
              <Avatar key={index} sx={{ width: 24, height: 24 }}>
                {person
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>

        {/* Due date */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="caption">Due: {job.dueDate}</Typography>
        </Box>

        {/* Location */}
        {job.location && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="caption">{job.location}</Typography>
          </Box>
        )}

        {/* Footer */}
        <Box display="flex" justifyContent="space-between" alignItems="center" pt={1} borderTop={1} borderColor="divider">
          <Box display="flex" gap={2}>
            {job.notes && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <MessageIcon fontSize="small" color="action" />
                <Typography variant="caption">{job.notes}</Typography>
              </Box>
            )}
            {job.photos && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CameraIcon fontSize="small" color="action" />
                <Typography variant="caption">{job.photos}</Typography>
              </Box>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="caption">ETA: {job.estimatedCompletion}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
