"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Divider,
  Avatar,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  LinearProgress,
  Alert,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "@/context/authContext";

const statusOptions = [
  { value: "to-start", label: "To Start" },
  { value: "inProgress", label: "In Progress" },
  { value: "in-progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "completed", label: "Completed" },
];

const TodayTab = ({ tasks: initialTasks = [], onStatusChange }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(initialTasks);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Persist status change to backend (optimistic)
  const updateTaskStatus = async (taskId, newStatus) => {
    const prev = tasks.map((t) => ({ ...t }));
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );

    toast.loading("Updating task status...");

    try {
      await axios.put(`${BASE_URL}/api/project-kanban/update/${taskId}`, { status: newStatus });
      toast.dismiss();
      toast.success("Task status updated");
      if (typeof onStatusChange === "function") onStatusChange();
    } catch (err) {
      toast.dismiss();
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
      // rollback
      setTasks(prev);
    }
  };

  const getStatusColor = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s.includes("complete")) return "success";
    if (s.includes("progress")) return "primary";
    if (s.includes("start")) return "warning";
    return "default";
  };

  const formatRange = (s, e) => {
    try {
      const sd = new Date(s);
      const ed = new Date(e);
      const opts = { month: "short", day: "numeric" };
      return `${sd.toLocaleDateString(undefined, opts)} → ${ed.toLocaleDateString(undefined, opts)}`;
    } catch {
      return `${s} - ${e}`;
    }
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      let fileData = null;
      
      // Upload file if attached
      if (commentFile) {
        const formData = new FormData();
        formData.append("file", commentFile);
        formData.append("taskId", selectedTask.id);
        toast.loading("Uploading file...");

        const response = await axios.post(`${BASE_URL}/api/project-kanban/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });
        toast.dismiss();
        fileData = {
          name: commentFile.name,
          size: commentFile.size,
          type: commentFile.type,
          url: response.data.fileUrl,
        };
      }

      const commentData = {
        content: newComment.trim(),
        file: fileData,
        timestamp: new Date().toISOString(),
        author: user?.name || "Current User", // Use actual user name from auth context
      };

      // Get existing comments or initialize empty array
      const existingComments = selectedTask.comments || [];
      const updatedComments = [...existingComments, commentData];

      await axios.put(`${BASE_URL}/api/project-kanban/update/${selectedTask.id}`, {
        comments: updatedComments,
      });
      toast.dismiss();
      toast.success("Comment added successfully");
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? { ...task, comments: updatedComments }
            : task
        )
      );

      setNewComment("");
      setCommentFile(null);
      setCommentDialogOpen(false);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("Failed to add comment");
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };


  // Open comment dialog
  const openCommentDialog = (task) => {
    setSelectedTask(task);
    setNewComment("");
    setCommentFile(null);
    setCommentDialogOpen(true);
  };

  // Handle file selection for comments
  const handleCommentFileSelect = (event) => {
    const file = event.target.files[0];
    setCommentFile(file);
  };


  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Today's Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tasks overlapping today
          </Typography>
        </Box>
        <Chip label={`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`} variant="outlined" color="primary" />
      </Box>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <Card
            key={task.id}
            sx={{
              mb: 2,
              p: 2,
              boxShadow: 2,
              borderRadius: 3,
              transition: "0.3s",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={9} sm={10}>
                  <Box display="flex" gap={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>{(task.assignedWorker?.name || "A").charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.stage ? `${task.stage} • ` : ""}{task.priority ? `Priority: ${task.priority}` : ""} • {formatRange(task.startDate, task.endDate)}
                      </Typography>
                      {task.assignedWorker && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Assigned: {task.assignedWorker.name} • {task.assignedWorker.jobTitle || ""}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={3} sm={2} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <Stack direction="column" alignItems="flex-end" spacing={1} sx={{ minWidth: 120 }}>
                    <Chip
                      label={task.status?.replace(/([a-z])([A-Z])/g, "$1 $2")}
                      color={getStatusColor(task.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id={`status-${task.id}`}>Status</InputLabel>
                      <Select
                        labelId={`status-${task.id}`}
                        value={task.status}
                        label="Status"
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {task.description || "No description"}
                </Typography>
                
                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <Tooltip title={task.comments && task.comments.length > 0 ? "View Comments" : "Add Comment"}>
                    <IconButton
                      size="small"
                      onClick={() => openCommentDialog(task)}
                      color="primary"
                    >
                      <ChatBubbleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Comments Section */}
              {task.comments && task.comments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Comments ({task.comments.length})
                  </Typography>
                  <List dense>
                    {task.comments.slice(-3).map((comment, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {comment.author?.charAt(0) || "U"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                {comment.content || comment.text}
                              </Typography>
                              {comment.file && (
                                <Chip
                                  icon={<DownloadIcon />}
                                  label={comment.file.name}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => window.open(`${BASE_URL}${comment.file.url}`, "_blank")}
                                  sx={{ cursor: "pointer", mt: 0.5, fontSize: "0.75rem" }}
                                />
                              )}
                            </Box>
                          }
                          secondary={`${comment.author} • ${new Date(comment.timestamp).toLocaleString()}`}
                          secondaryTypographyProps={{ fontSize: "0.75rem" }}
                        />
                      </ListItem>
                    ))}
                    {task.comments.length > 3 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                        +{task.comments.length - 3} more comments
                      </Typography>
                    )}
                  </List>
                </Box>
              )}

            </CardContent>
          </Card>
        ))
      ) : (
        <Card sx={{ p: 4, textAlign: "center", boxShadow: 1 }}>
          <Typography color="text.secondary">No tasks scheduled for today.</Typography>
        </Card>
      )}

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Comment
          <IconButton
            onClick={() => setCommentDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {selectedTask.title}
              </Typography>
              
              {/* Existing Comments */}
              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Previous Comments
                  </Typography>
                  <Paper sx={{ p: 2, maxHeight: 200, overflow: "auto" }}>
                    {selectedTask.comments.map((comment, index) => (
                      <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < selectedTask.comments.length - 1 ? 1 : 0, borderColor: "divider" }}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {comment.author?.charAt(0) || "U"}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {comment.author} • {new Date(comment.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {comment.content || comment.text}
                        </Typography>
                        {comment.file && (
                          <Chip
                            icon={<DownloadIcon />}
                            label={comment.file.name}
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(`${BASE_URL}${comment.file.url}`, "_blank")}
                            sx={{ cursor: "pointer", fontSize: "0.75rem" }}
                          />
                        )}
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}

              {/* New Comment Input */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                />
              </Box>

              {/* File Upload for Comment */}
              <Box sx={{ mb: 2 }}>
                <input
                  id="comment-file-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleCommentFileSelect}
                  accept="*/*"
                />
                <label htmlFor="comment-file-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Attach File
                  </Button>
                </label>
                {commentFile && (
                  <Chip
                    label={commentFile.name}
                    onDelete={() => setCommentFile(null)}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {/* Upload Progress */}
              {uploadingFile && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" color="text.secondary">
                    Uploading file... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!newComment.trim() || uploadingFile}
          >
            {uploadingFile ? "Uploading..." : "Add Comment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodayTab;
