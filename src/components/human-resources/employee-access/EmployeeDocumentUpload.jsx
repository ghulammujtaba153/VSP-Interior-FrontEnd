"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  LinearProgress,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";

const EmployeeDocumentUpload = ({ open, onClose, request = null, employeeId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("uploaded"); // schema status
  const [documentId, setDocumentId] = useState(""); // optional: link to a master document if exists

  console.log("employee id", employeeId, request)
  useEffect(() => {
    if (!open) {
      setFile(null);
      setProgress(0);
      setUploading(false);
      setStatus("uploaded");
      setDocumentId("");
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
    if (documentId) form.append("documentId", documentId);
    form.append("status", status);

    setUploading(true);
    setProgress(0);
    toast.loading("Uploading document...");

    try {
      // Do not set Content-Type header; let browser set the multipart boundary
      const res = await axios.post(`${BASE_URL}/api/employee-document/upload`, form, {
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      toast.dismiss();
      toast.success("Document uploaded");
      onUploaded?.(res.data);
      onClose?.();
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Upload failed");
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
            <Typography variant="subtitle2">Request:</Typography>
            <Typography>{request.documentName} — {request.documentType}</Typography>
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
            accept="application/pdf,image/*"
            onChange={handleFileChange}
          />

          {/* optional fields */}
          <FormControl fullWidth size="small">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="uploaded">Uploaded</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Document Id (optional)"
            size="small"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
          />

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
          {uploading ? `Uploading ${progress}%` : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDocumentUpload;
