"use client"

import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';
import axios from 'axios';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
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

const ViewRequestModal = ({ fetch, user, selectedRequest, setOpen, open }) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!selectedRequest) return null;

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/employee-leave/update/${selectedRequest.id}`, {
        status: newStatus,
        employeeId: authUser?.id || user?.id
      });
      toast.success("Status updated successfully");
      fetch();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

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
          <Button
            variant="contained"
            color="success"
            disabled={selectedRequest.status === "Approved" || loading}
            onClick={() => handleStatusChange("Approved")}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={selectedRequest.status === "Rejected" || loading}
            onClick={() => handleStatusChange("Rejected")}
          >
            Reject
          </Button>
          <Button onClick={() => setOpen(false)} color="inherit">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRequestModal;
