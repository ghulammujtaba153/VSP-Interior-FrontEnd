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
import { MuiTelInput } from "mui-tel-input";

const AddContact = ({ open, onClose, supplierId, onContactAdded }) => {
  const [data, setData] = useState({
    supplierId: "", // Set after mount
    firstName: "",
    lastName: "",
    role: "",
    emailAddress: "",
    phoneNumber: "",
  });
  const {user} = useAuth()

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  // Update supplierId when the prop is received
  useEffect(() => {
    if (supplierId) {
      setData((prev) => ({ ...prev, supplierId }));
    }
  }, [supplierId]);

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
      title: 'Add New Contact',
      message: `Are you sure you want to add a new contact "${data.firstName} ${data.lastName}" with role "${data.role}"?`,
      action: () => submitContact(),
      severity: 'info'
    });
  };

  const submitContact = async () => {
    try {
      toast.loading("Adding contact...");

      const res = await axios.post(`${BASE_URL}/api/supplier-contacts/create`, {
        ...data,
        phoneNumber: parseInt(data.phoneNumber),
        supplierId: parseInt(data.supplierId),
        userId: user.id,
      });

      toast.dismiss();
      toast.success("Contact added successfully");
      onContactAdded?.();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to add contact");
      console.error("Failed to add contact:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Contact</DialogTitle>

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
          <MuiTelInput
            name="phoneNumber"
            label="Phone Number"
            value={data.phoneNumber}
            onChange={(value) => setData({ ...data, phoneNumber: value })}
            fullWidth
            type="tel"
            defaultCountry="NZ"
            limit={11}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Add Contact
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText="Add Contact"
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default AddContact;
