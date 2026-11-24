"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";

const DocumentRejectDialog = ({ open, onClose, request, onConfirm, loading }) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose?.();
  };

  const handleSubmit = () => {
    onConfirm?.(reason.trim());
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Reject Document</DialogTitle>
      <DialogContent>
        {request && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {request.documentName} ({request.documentType})
          </Typography>
        )}
        <TextField
          label="Rejection reason"
          placeholder="Explain what needs to be corrected or resubmitted..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="error"
          variant="contained"
          disabled={loading || !reason.trim()}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentRejectDialog;
