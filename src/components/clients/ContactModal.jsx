"use client";

import React, { useEffect, useState } from "react";

import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import ConfirmationDialog from '../ConfirmationDialog';

import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";
import { MuiTelInput } from 'mui-tel-input';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  p: 4,
  borderRadius: 2,
};

const ContactModal = ({ open, onClose, clientId, editContact, refreshContacts }) => {
  const [contact, setContact] = useState({
    clientId: null,
    firstName: "",
    lastName: "",
    role: "",
    emailAddress: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const { user } = useAuth()

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  // Reset form and update clientId when modal opens or clientId changes
  useEffect(() => {
    if (open) {
      if (editContact) {
        // Editing existing contact
        setContact({
          id: editContact.id,
          clientId: editContact.clientId,
          firstName: editContact.firstName,
          lastName: editContact.lastName,
          role: editContact.role,
          emailAddress: editContact.emailAddress,
          phoneNumber: editContact.phoneNumber || "",
        });
      } else {
        // Adding new contact
        setContact({
          clientId,
          firstName: "",
          lastName: "",
          role: "",
          emailAddress: "",
          phoneNumber: "",
        });
      }
    }
  }, [open, clientId, editContact]);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    // MuiTelInput returns the full E.164 format or user input
    // Ensure we capture the complete phone number string
    console.log("Raw phone input:", value);
    const phoneValue = String(value || "").trim();
    console.log("Phone value changed:", phoneValue);
    setContact({ ...contact, phoneNumber: phoneValue });
  };

  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditMode = !!editContact;

    if (isEditMode) {
      showConfirmation({
        title: 'Update Contact',
        message: `Are you sure you want to update contact "${contact.firstName} ${contact.lastName}"? This will modify the existing contact information.`,
        action: () => submitContact(),
        severity: 'warning'
      });
    } else {
      showConfirmation({
        title: 'Create New Contact',
        message: `Are you sure you want to create a new contact "${contact.firstName} ${contact.lastName}" with role "${contact.role}"?`,
        action: () => submitContact(),
        severity: 'info'
      });
    }
  };

  const submitContact = async () => {
    setLoading(true);
    console.log("Submitting contact:", contact);

    try {
      const isEditMode = !!editContact;

      if (isEditMode) {
        // Update existing contact
        await axios.put(`${BASE_URL}/api/contact/update/${contact.id}`, {
          ...contact,
          userId: user.id,
        });
        toast.success("Contact updated successfully");
      } else {
        // Create new contact
        await axios.post(`${BASE_URL}/api/contact/create`, {
          ...contact,
          userId: user.id,
        });
        toast.success("Contact created successfully");
      }

      refreshContacts && refreshContacts();
      onClose(); // ✅ Close the modal
    } catch (error) {
      console.error(error);
      toast.error(editContact ? "Error updating contact" : "Error creating contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>
          {editContact ? "Edit Contact1" : "Add Contact"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={contact.firstName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={contact.lastName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Role"
            name="role"
            value={contact.role}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            name="emailAddress"
            type="email"
            value={contact.emailAddress}
            onChange={handleChange}
            margin="normal"
            required
          />
          <MuiTelInput
            fullWidth
            defaultCountry="NZ"
            label="Phone Number"
            value={contact.phoneNumber || ""}
            onChange={handlePhoneChange}
            margin="normal"
            required
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? "Submitting..." : (editContact ? "Update" : "Submit")}
            </Button>
          </Box>
        </form>

        <ConfirmationDialog
          open={confirmationOpen}
          onClose={handleConfirmationClose}
          onConfirm={confirmationConfig.action}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          severity={confirmationConfig.severity}
          confirmText={editContact ? "Update" : "Create"}
          cancelText="Cancel"
        />
      </Box>
    </Modal>
  );
};

export default ContactModal;
