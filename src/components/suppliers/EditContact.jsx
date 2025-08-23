"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationDialog from '../ConfirmationDialog';
import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";

const EditContact = ({ open, onClose, contact, onContactUpdated }) => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    emailAddress: "",
    phoneNumber: "",
  });
  const { user } = useAuth();

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  // Populate form when contact is provided
  useEffect(() => {
    if (contact) {
      setData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        role: contact.role || "",
        emailAddress: contact.emailAddress || "",
        phoneNumber: contact.phoneNumber?.toString() || "",
      });
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleSubmit = async () => {
    showConfirmation({
      title: 'Update Contact',
      message: `Are you sure you want to update contact "${data.firstName} ${data.lastName}"?`,
      action: () => submitContactUpdate(),
      severity: 'info'
    });
  };

  const submitContactUpdate = async () => {
    try {
      toast.loading("Updating contact...");

      await axios.put(`${BASE_URL}/api/supplier-contacts/update/${contact.id}`, {
        ...data,
        phoneNumber: parseInt(data.phoneNumber),
        userId: user.id,
      });

      toast.dismiss();
      toast.success("Contact updated successfully");
      onContactUpdated?.();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to update contact");
      console.error("Failed to update contact:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Contact</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            name="firstName"
            label="First Name"
            value={data.firstName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={data.lastName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="role"
            label="Role"
            value={data.role}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="emailAddress"
            label="Email Address"
            value={data.emailAddress}
            onChange={handleChange}
            fullWidth
            type="email"
          />
          <TextField
            name="phoneNumber"
            label="Phone Number"
            value={data.phoneNumber}
            onChange={handleChange}
            fullWidth
            type="tel"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Update Contact
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText="Update"
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default EditContact;
