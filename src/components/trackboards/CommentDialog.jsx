"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from '@/configs/url';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/authContext';

const CommentDialog = ({ 
  open, 
  onClose, 
  task, 
  onCommentAdded 
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCommentFileSelect = (event) => {
    const file = event.target.files[0];
    setCommentFile(file);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      let fileData = null;
      
      // Upload file if attached
      if (commentFile) {
        const formData = new FormData();
        formData.append("file", commentFile);
        formData.append("taskId", task.id);
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
      const existingComments = task.comments || [];
      const updatedComments = [...existingComments, commentData];

      await axios.put(`${BASE_URL}/api/project-kanban/update/${task.id}`, {
        comments: updatedComments,
      });
      
      toast.success("Comment added successfully");
      
      // Call the callback to update parent component
      if (onCommentAdded) {
        onCommentAdded(task.id, updatedComments);
      }

      setNewComment("");
      setCommentFile(null);
      onClose();
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("Failed to add comment");
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setNewComment("");
    setCommentFile(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {task?.comments && task.comments.length > 0 ? 'View Comments' : 'Add Comment'}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {task && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {task.title}
            </Typography>
            
            {/* Existing Comments */}
            {task.comments && task.comments.length > 0 ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  All Comments ({task.comments.length})
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 400, overflow: "auto", bgcolor: 'grey.50' }}>
                  {task.comments.map((comment, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2, 
                        pb: 2, 
                        borderBottom: index < task.comments.length - 1 ? 1 : 0, 
                        borderColor: "divider",
                        bgcolor: 'white',
                        p: 2,
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>
                          {comment.author?.charAt(0) || "U"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, ml: 4 }}>
                        {comment.content || comment.text}
                      </Typography>
                      {comment.file && (
                        <Box sx={{ ml: 4 }}>
                          <Chip
                            icon={<DownloadIcon />}
                            label={comment.file.name}
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(`${BASE_URL}${comment.file.url}`, "_blank")}
                            sx={{ cursor: "pointer", fontSize: "0.75rem" }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Box>
            ) : (
              <Box sx={{ mb: 3, textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No comments yet. Be the first to add a comment!
                </Typography>
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
        <Button onClick={handleClose}>Cancel</Button>
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
  );
};

export default CommentDialog;
