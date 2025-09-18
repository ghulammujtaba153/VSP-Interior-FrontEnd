"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Tabs,
  Tab,
  TextField,
  LinearProgress,
  Chip,
  Box,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  Person,
  LocationOn,
  PhotoCamera,
  ChatBubbleOutline,
  CloudUpload,
  Edit,
  Close,
} from "@mui/icons-material";
import { Job } from "./JobCard";

export default function JobDetailsModal({ job, isOpen, onClose }) {
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState(0);
  const [notes] = useState([
    {
      id: 1,
      author: "John Smith",
      time: "2 hours ago",
      text: "Started machining process. Material quality looks good.",
    },
    {
      id: 2,
      author: "Sarah Wilson",
      time: "4 hours ago",
      text: "Received materials from supplier. Everything checked and verified.",
    },
    {
      id: 3,
      author: "Mike Johnson",
      time: "1 day ago",
      text: "Job scheduled for tomorrow morning. Tools prepared.",
    },
  ]);

  const statusConfig = {
    "to-start": { label: "To Start", color: "default" },
    "in-progress": { label: "In Progress", color: "primary" },
    "on-hold": { label: "On Hold", color: "warning" },
    complete: { label: "Complete", color: "success" },
    "ready-dispatch": { label: "Ready Dispatch", color: "secondary" },
    "in-transit": { label: "In Transit", color: "primary" },
    "on-site": { label: "On Site", color: "warning" },
    installed: { label: "Installed", color: "success" },
  };

  const priorityConfig = {
    green: { label: "On Track", color: "success" },
    amber: { label: "At Risk", color: "warning" },
    red: { label: "Delayed", color: "error" },
  };

  const statusInfo = statusConfig[job.status];
  const priorityInfo = priorityConfig[job.priority];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6">{job.id}</Typography>
          <Typography variant="body2" color="text.secondary">
            {job.title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip label={statusInfo.label} color={statusInfo.color} />
          <Chip label={priorityInfo.label} color={priorityInfo.color} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Job Overview */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Client Information
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {job.client}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={job.progress}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption">{job.progress}% Complete</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CalendarToday fontSize="small" />
                  Due Date
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.dueDate}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AccessTime fontSize="small" />
                  ETA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.estimatedCompletion}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
              gutterBottom
            >
              <Person fontSize="small" />
              Assigned Team
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {job.assignedTo.map((person, idx) => (
                <Chip
                  key={idx}
                  avatar={<Avatar>{person[0]}</Avatar>}
                  label={person}
                  variant="outlined"
                />
              ))}
            </Box>

            {job.location && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  gutterBottom
                >
                  <LocationOn fontSize="small" />
                  Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.location}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ mt: 4 }}>
          <Tabs value={tab} onChange={(e, val) => setTab(val)}>
            <Tab
              icon={<ChatBubbleOutline fontSize="small" />}
              label={`Notes (${notes.length})`}
            />
            <Tab
              icon={<PhotoCamera fontSize="small" />}
              label={`Photos (${job.photos || 0})`}
            />
            <Tab
              icon={<CloudUpload fontSize="small" />}
              label="Files"
            />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Add a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button disabled={!newNote.trim()} variant="contained" size="small">
                  Add Note
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                {notes.map((note) => (
                  <Box
                    key={note.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {note.author[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight="500">
                          {note.author}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {note.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {note.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {Array.from({ length: job.photos || 0 }).map((_, idx) => (
                <Grid
                  key={idx}
                  item
                  xs={6}
                  md={4}
                  sx={{
                    bgcolor: "grey.100",
                    aspectRatio: "1 / 1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 2,
                  }}
                >
                  <PhotoCamera color="disabled" />
                </Grid>
              ))}
              <Grid
                item
                xs={6}
                md={4}
                sx={{
                  border: "2px dashed",
                  borderColor: "divider",
                  aspectRatio: "1 / 1",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <CloudUpload color="disabled" />
                <Typography variant="caption">Upload Photo</Typography>
              </Grid>
            </Grid>
          )}

          {tab === 2 && (
            <Box
              sx={{
                mt: 2,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                textAlign: "center",
                p: 4,
              }}
            >
              <CloudUpload fontSize="large" color="disabled" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Drop files here or click to upload
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                Browse Files
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button variant="contained" startIcon={<Edit />}>
          Edit Job
        </Button>
      </DialogActions>
    </Dialog>
  );
}
