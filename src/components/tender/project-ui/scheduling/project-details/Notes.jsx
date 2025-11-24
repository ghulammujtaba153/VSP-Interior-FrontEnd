"use client";

import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, CardHeader, TextField, Button, IconButton,
  Chip, List, ListItem, ListItemText, ListItemIcon, Divider, Paper, Avatar,
  Tooltip, Grid
} from "@mui/material";
import {
  Add as AddIcon, AttachFile as AttachFileIcon, Delete as DeleteIcon,
  Description as DescriptionIcon, InsertDriveFile as FileIcon, Image as ImageIcon,
  PictureAsPdf as PdfIcon, VideoFile as VideoIcon, AudioFile as AudioIcon,
  Note as NoteIcon, Schedule as ScheduleIcon, Person as PersonIcon, Edit as EditIcon,
  CloudDownload as DownloadIcon, Close as CloseIcon
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";

const Notes = ({ projectId, data }) => {
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);


  const [newNote, setNewNote] = useState({ title: "", description: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [filesToRemove, setFilesToRemove] = useState([]); // filenames to remove when editing

  useEffect(() => {
    if (data?.id) fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  const fetchNotes = async () => {
    if (!data?.id) return;
    setLoadingNotes(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/note/job/${data.id}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error("Failed to load notes", err);
      toast.error("Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((p) => [...p, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((p) => p.filter((_, i) => i !== index));
  };

  const handleAddNote = async () => {
    if (!data?.id) {
      toast.error("No project data available");
      return;
    }

    console.log("Creating note with projectSetupJobId:", data.id);
    console.log("Note data:", newNote);
    toast.loading("Creating note...")

    try {
      const form = new FormData();
      form.append("projectSetupJobId", data.id);
      form.append("title", newNote.title);
      form.append("description", newNote.description || "");
      selectedFiles.forEach((f) => form.append("files", f));

      console.log("Form data being sent:", {
        projectSetupJobId: data.id,
        title: newNote.title,
        description: newNote.description,
        filesCount: selectedFiles.length
      });

      const res = await axios.post(`${BASE_URL}/api/note/create`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.dismiss()

      toast.success("Note created");
      setNewNote({ title: "", description: "" });
      setSelectedFiles([]);
      fetchNotes();
    } catch (err) {
      toast.dismiss()
      console.error("create note error", err);
      toast.error("Failed to create note");
    }
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, description: note.description });
    setSelectedFiles([]);
    setFilesToRemove([]);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setNewNote({ title: "", description: "" });
    setSelectedFiles([]);
    setFilesToRemove([]);
  };

  const toggleRemoveExistingFile = (filename) => {
    setFilesToRemove((prev) => {
      if (prev.includes(filename)) return prev.filter((f) => f !== filename);
      return [...prev, filename];
    });
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    toast.loading("Updating note...")
    try {
      const form = new FormData();
      form.append("title", newNote.title);
      form.append("description", newNote.description || "");
      if (filesToRemove.length > 0) form.append("removeFilenames", JSON.stringify(filesToRemove));
      selectedFiles.forEach((f) => form.append("files", f));

      await axios.put(`${BASE_URL}/api/note/update/${editingNote.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.dismiss()
      toast.success("Note updated");
      cancelEdit();
      fetchNotes();
    } catch (err) {
      toast.dismiss()
      console.error("update note error", err);
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm("Delete this note?")) return;
    toast.loading("Deleting note...")
    try {
      await axios.delete(`${BASE_URL}/api/note/delete/${id}`);
      toast.dismiss()
      toast.success("Note deleted");
      fetchNotes();
    } catch (err) {
      toast.dismiss()
      console.error("delete note error", err);
      toast.error("Failed to delete note");
    }
  };

  const handleDownloadFile = (file) => {
    if (!file || !file.url) return;
    // trigger blob download to avoid new-tab redirect if possible
    const fileUrl = `${BASE_URL}${file.url}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Debug logging
  console.log("Notes component - data:", data);
  console.log("Notes component - projectId:", projectId);

  // Show loading or error state if no data
  if (!data?.id) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main", mb: 4 }}>
          <NoteIcon sx={{ mr: 2, verticalAlign: "middle" }} />
          Notes & Activity Log
        </Typography>
        <Typography variant="body1" color="error">
          No project data available. Please ensure you're viewing a valid project.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Debug: data = {JSON.stringify(data)}, projectId = {projectId}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main", mb: 4 }}>
        <NoteIcon sx={{ mr: 2, verticalAlign: "middle" }} />
        Notes & Activity Log
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "fit-content", position: "sticky", top: 20 }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                  <AddIcon sx={{ mr: 1 }} />
                  {editingNote ? "Edit Note" : "Add New Note"}
                </Typography>
              }
              sx={{ borderBottom: 1, borderColor: "divider" }}
            />
            <CardContent sx={{ pt: 2 }}>
              <TextField fullWidth label="Title" value={newNote.title} onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))} margin="normal" />
              <TextField fullWidth label="Description" value={newNote.description} onChange={(e) => setNewNote((p) => ({ ...p, description: e.target.value }))} margin="normal" multiline rows={4} />

              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <AttachFileIcon sx={{ mr: 1, fontSize: 18 }} />
                  Attach Files
                </Typography>

                <Button variant="outlined" component="label" startIcon={<AttachFileIcon />} fullWidth sx={{ mb: 2 }}>
                  Select Files
                  <input type="file" hidden multiple onChange={handleFileSelect} />
                </Button>

                {selectedFiles.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: "auto" }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Selected Files:
                    </Typography>
                    {selectedFiles.map((file, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, mb: 0.5, borderRadius: 1, bgcolor: "action.hover" }}>
                        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                          <FileIcon />
                          <Box sx={{ ml: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => removeSelectedFile(index)} color="error"><CloseIcon fontSize="small" /></IconButton>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={editingNote ? handleUpdateNote : handleAddNote} disabled={!newNote.title.trim()}>
                  {editingNote ? "Update Note" : "Add Note"}
                </Button>
                {editingNote && <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title={<Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}><DescriptionIcon sx={{ mr: 1 }} />Recent Notes & Activity</Typography>} subheader={`${notes.length || 0} notes found`} sx={{ borderBottom: 1, borderColor: "divider" }} />
            <CardContent sx={{ p: 0 }}>
              {loadingNotes ? (
                <Box sx={{ p: 4, textAlign: "center" }}>Loading...</Box>
              ) : notes.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No notes yet</Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {notes.map((note, index) => (
                    <Box key={note.id}>
                      <ListItem alignItems="flex-start" sx={{ py: 3 }}>
                        <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}><Avatar sx={{ bgcolor: "primary.main" }}><NoteIcon /></Avatar></ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                              <Typography variant="h6">{note.title}</Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip label={note.type || "note"} size="small" variant="outlined" />
                                <Tooltip title="Edit note"><IconButton size="small" onClick={() => startEdit(note)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Delete note"><IconButton size="small" onClick={() => handleDeleteNote(note.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body1" paragraph>{note.description}</Typography>

                              {Array.isArray(note.files) && note.files.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center" }}><AttachFileIcon sx={{ mr: 1, fontSize: 16 }} />Attached Files:</Typography>
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {note.files.map((file, fi) => (
                                      <Chip
                                        key={fi}
                                        icon={<FileIcon />}
                                        label={file.name}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleDownloadFile(file)}
                                        clickable
                                        onDelete={editingNote?.id === note.id ? () => toggleRemoveExistingFile(file.filename) : undefined}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}><PersonIcon sx={{ mr: 0.5, fontSize: 16, color: "text.secondary" }} /><Typography variant="caption" color="text.secondary">{note.creator?.name || "Author"}</Typography></Box>
                                <Box sx={{ display: "flex", alignItems: "center" }}><ScheduleIcon sx={{ mr: 0.5, fontSize: 16, color: "text.secondary" }} /><Typography variant="caption" color="text.secondary">{new Date(note.createdAt).toLocaleString()}</Typography></Box>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notes.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Notes;