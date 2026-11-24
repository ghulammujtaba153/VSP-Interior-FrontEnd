"use client"

import apiClient from "@/lib/axios";
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import PermissionWrapper from "@/components/PermissionWrapper";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack
} from "@mui/material";

const ViewRequestModal = ({ fetch, selectedRequest, setOpen, open }) => {
  const [loading, setLoading] = useState(false);

  if (!selectedRequest) return null;

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/api/employee-leave/update/${selectedRequest.id}`, {
        status: newStatus.toLowerCase(),
      });
      toast.success(`Leave ${newStatus.toLowerCase()}`);
      fetch();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const statusLower = (selectedRequest.status || '').toLowerCase();

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Leave Request Details</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" gutterBottom>
          Employee: {selectedRequest.employeeName || selectedRequest.employee?.name || "-"}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Type: {selectedRequest.leaveType || selectedRequest.type}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Start Date: {selectedRequest.startDate}
        </Typography>
        <Typography variant="body2" gutterBottom>
          End Date: {selectedRequest.endDate}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Reason: {selectedRequest.reason}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Status: <Chip label={selectedRequest.status} size="small" />
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2}>
          <PermissionWrapper resource="human resource" action="canEdit">
            <Button
              variant="contained"
              color="success"
              disabled={statusLower === "approved" || loading}
              onClick={() => handleStatusChange("approved")}
            >
              Approve
            </Button>
          </PermissionWrapper>
          <PermissionWrapper resource="human resource" action="canEdit">
            <Button
              variant="contained"
              color="error"
              disabled={statusLower === "rejected" || loading}
              onClick={() => handleStatusChange("rejected")}
            >
              Reject
            </Button>
          </PermissionWrapper>
          <Button onClick={() => setOpen(false)} color="inherit">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRequestModal;
