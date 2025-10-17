"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "@/configs/url";

const NoticeModal = ({ open, onClose, notice, refresh }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "active",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill data when editing
  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || "",
        content: notice.content || "",
        status: notice.status || "active",
        file: null,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        status: "active",
        file: null,
      });
    }
  }, [notice]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    form.append("status", formData.status || "active");
    if (formData.file) {
      form.append("file", formData.file);
    }

    try {
      if (notice) {
        // Update existing notice - do NOT set Content-Type header manually
        await axios.put(`${BASE_URL}/api/notices/update/${notice.id}`, form);
        toast.success("Notice updated successfully");
      } else {
        // Create new notice - let browser/axios set multipart boundary
        await axios.post(`${BASE_URL}/api/notices/create`, form);
        toast.success("Notice added successfully");
      }
      refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{notice ? "Edit Notice" : "Add Notice"}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          {formData.file ? formData.file.name : "Upload PDF"}
          <input
            hidden
            accept="application/pdf"
            type="file"
            name="file"
            onChange={handleChange}
          />
        </Button>

        {/* If editing, show existing file link */}
        {notice?.fileUrl && (
          <div className="mt-2">
            <a
              href={`${BASE_URL}/${notice.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Current File
            </a>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Saving..." : notice ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoticeModal;
