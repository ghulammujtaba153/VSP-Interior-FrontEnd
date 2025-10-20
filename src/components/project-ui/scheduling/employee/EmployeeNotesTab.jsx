"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Chip,
  Grid,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { toast } from "react-toastify";


const EmployeeNotesTab = () => {
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([
    {
      id: "1",
      content:
        "Completed machining for cabinet frames. Material quality is excellent.",
      timestamp: "2025-10-15T14:30:00",
      hasPhoto: true,
    },
    {
      id: "2",
      content:
        "Site measurement completed. Will need additional hardware for installation.",
      timestamp: "2025-10-14T11:20:00",
    },
  ]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date().toISOString(),
    };

    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Note added successfully!");
  };

  const handleAddPhoto = () => {
    toast.info("Photo upload feature coming soon!");
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", mt: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <ChatBubbleOutlineIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          My Notes
        </Typography>
      </Box>

      {/* Input Card */}
      <Card variant="outlined" sx={{ p: 3, mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <TextField
            multiline
            minRows={4}
            fullWidth
            variant="outlined"
            label="Add a note about your work, observations, or updates..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNote}
            >
              Add Note
            </Button>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={handleAddPhoto}
            >
              Add Photo
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} key={note.id}>
            <Card
              variant="outlined"
              sx={{
                p: 3,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 3 },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1.5}
                >
                  <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <Typography variant="body2">
                      {new Date(note.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>

                  {note.hasPhoto && (
                    <Chip
                      variant="outlined"
                      size="small"
                      icon={<PhotoCameraIcon fontSize="small" />}
                      label="Photo"
                      color="primary"
                    />
                  )}
                </Box>

                <Typography variant="body1" color="text.primary">
                  {note.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {notes.length === 0 && (
        <Card
          variant="outlined"
          sx={{ textAlign: "center", p: 6, mt: 3, color: "text.secondary" }}
        >
          <ChatBubbleOutlineIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography>No notes yet.</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Add notes to keep track of your work and observations.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default EmployeeNotesTab;
