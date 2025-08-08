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

import { BASE_URL } from "@/configs/url";

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

const ContactModal = ({ open, onClose, clientId, refreshContacts }) => {
  const [contact, setContact] = useState({
    clientId: null,
    firstName: "",
    lastName: "",
    role: "",
    emailAddress: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  // Reset form and update clientId when modal opens or clientId changes
  useEffect(() => {
    if (open) {
      setContact({
        clientId,
        firstName: "",
        lastName: "",
        role: "",
        emailAddress: "",
        phone: "",
      });
    }
  }, [open, clientId]);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/contact/create`, contact);
      toast.success("Contact created successfully");
      refreshContacts && refreshContacts();
      onClose(); // ✅ Close the modal
    } catch (error) {
      console.error(error);
      toast.error("Error creating contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>
          Add Contact
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
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            type="number"
            value={contact.phone}
            onChange={handleChange}
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
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default ContactModal;
