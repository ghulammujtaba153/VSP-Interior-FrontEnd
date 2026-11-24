"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  LinearProgress,
  Typography,
} from "@mui/material";
import apiClient from "@/lib/axios";
import { toast } from "react-toastify";

const EmployeeDocumentUpload = ({ open, onClose, request = null, employeeId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setProgress(0);
      setUploading(false);
    }
  }, [open]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!request || !request.id) {
      toast.error("Invalid request selected");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("employeeId", employeeId);
    form.append("requestId", request.id);

    setUploading(true);
    setProgress(0);
    toast.loading("Uploading document...");

    try {
      const res = await apiClient.post(`/api/employee-document/upload`, form, {
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      toast.dismiss();
      toast.success("Document submitted for HR review");
      onUploaded?.(res.data);
      onClose?.();
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        {request ? (
          <Box mb={2}>
            <Typography variant="subtitle2">Request from HR</Typography>
            <Typography fontWeight={600}>{request.documentName}</Typography>
            <Typography variant="body2" color="text.secondary">{request.documentType}</Typography>
            {request.rejectionReason && (
              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                Previous rejection: {request.rejectionReason}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary" mb={2}>
            Select a request to upload document against.
          </Typography>
        )}

        <Box display="grid" gap={2}>
          <input
            id="employee-doc-file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          <Typography variant="caption" color="text.secondary">
            PDF or images up to 10MB. Your file will be sent to HR for review.
          </Typography>
          {uploading && <LinearProgress variant="determinate" value={progress} />}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={uploading || !file}
          color="primary"
        >
          {uploading ? `Uploading ${progress}%` : "Submit for Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDocumentUpload;
