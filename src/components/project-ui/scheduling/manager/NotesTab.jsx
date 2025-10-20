"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LabelIcon from "@mui/icons-material/Label";
import { toast } from "react-toastify";

// 🧩 Mock Data
const mockProjects = [
  { id: "p1", name: "Website Redesign" },
  { id: "p2", name: "Mobile App Development" },
  { id: "p3", name: "Marketing Campaign" },
];

const mockNotes = [
  {
    id: "n1",
    author: "Ghulam Mujtaba",
    content: "Updated homepage layout. Need feedback from @Ali.",
    projectId: "p1",
    mentions: ["Ali"],
    timestamp: "2025-10-18T10:30:00Z",
  },
  {
    id: "n2",
    author: "Ali Raza",
    content: "App crash fixed on Android 13. Tested and verified by QA team.",
    projectId: "p2",
    mentions: [],
    timestamp: "2025-10-19T14:45:00Z",
  },
  {
    id: "n3",
    author: "Fatima Khan",
    content: "Scheduled campaign launch for next Monday.",
    projectId: "p3",
    mentions: ["Hassan"],
    timestamp: "2025-10-17T09:15:00Z",
  },
  {
    id: "n4",
    author: "Hassan Ahmed",
    content: "Added new banner design. Waiting for @Ghulam to review.",
    projectId: "p1",
    mentions: ["Ghulam"],
    timestamp: "2025-10-20T08:00:00Z",
  },
];

const NotesTab = () => {
  const [newNote, setNewNote] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    toast.success("Note added successfully!");
    setNewNote("");
  };

  const filteredNotes =
    selectedProject === "all"
      ? mockNotes
      : mockNotes.filter((note) => note.projectId === selectedProject);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Project Notes
        </Typography>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Filter by project</InputLabel>
          <Select
            value={selectedProject}
            label="Filter by project"
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {mockProjects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* New Note Card */}
      <Card elevation={3}>
        <CardContent>
          <TextField
            label="Add a new note..."
            placeholder="Use @name to mention team members"
            multiline
            fullWidth
            minRows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNote}
          >
            Add Note
          </Button>
        </CardActions>
      </Card>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        filteredNotes.map((note) => {
          const project = mockProjects.find((p) => p.id === note.projectId);
          return (
            <Card
              key={note.id}
              elevation={2}
              sx={{
                p: 2,
                "&:hover": { boxShadow: 4 },
                transition: "0.2s ease",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {note.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(note.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  {project && (
                    <Chip
                      icon={<LabelIcon sx={{ fontSize: 16 }} />}
                      label={project.name}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {note.content}
                </Typography>

                {note.mentions && note.mentions.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {note.mentions.map((mention, idx) => (
                      <Chip
                        key={idx}
                        label={`@${mention}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card elevation={1}>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
            >
              No notes found for this filter.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default NotesTab;
