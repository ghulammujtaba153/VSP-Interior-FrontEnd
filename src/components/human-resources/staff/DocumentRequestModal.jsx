"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";

const DocumentRequestModal = ({ open, onClose, data = null, employeeId, onSaved }) => {
  const isEdit = Boolean(data);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    documentType: "",
    documentName: "",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        documentType: data.documentType || "",
        documentName: data.documentName || "",
        reason: data.reason || "",
        status: data.status || "pending",
      });
    } else {
      setForm({
        documentType: "",
        documentName: "",
        reason: "",
        status: "pending",
      });
    }
  }, [data, isEdit, open]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.documentType || !form.documentName) {
      toast.error("Document type & name are required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`${BASE_URL}/api/employee-document/update/${data.id}`, {
          ...form,
        });
        toast.success("Request updated");
      } else {
        await axios.post(`${BASE_URL}/api/employee-document/create`, {
          ...form,
          employeeId,
        });
        toast.success("Document request created");
      }
      onSaved?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Document Request" : "New Document Request"}</DialogTitle>
      <DialogContent>
        <Box mt={1} display="grid" gap={16}>
          <FormControl fullWidth margin="dense">
            <InputLabel id="doc-type-label">Document Type</InputLabel>
            <Select
              labelId="doc-type-label"
              label="Document Type"
              name="documentType"
              value={form.documentType}
              onChange={handleChange}
            >
              <MenuItem value="ID Proof">ID Proof</MenuItem>
              <MenuItem value="CV">CV</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Document Name"
            name="documentName"
            fullWidth
            margin="dense"
            value={form.documentName}
            onChange={handleChange}
          />

          <TextField
            label="Reason / Notes"
            name="reason"
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            value={form.reason}
            onChange={handleChange}
          />

          {/* status is editable only when editing (admin use). When creating keep pending */}
          {isEdit && (
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-label">Status</InputLabel>
              <Select labelId="status-label" label="Status" name="status" value={form.status} onChange={handleChange}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {isEdit ? "Update" : "Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentRequestModal;