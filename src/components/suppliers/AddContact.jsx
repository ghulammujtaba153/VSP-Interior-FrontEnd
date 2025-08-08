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

import { BASE_URL } from "@/configs/url";

const AddContact = ({ open, onClose, supplierId, onContactAdded }) => {
  const [data, setData] = useState({
    supplierId: "", // Set after mount
    firstName: "",
    lastName: "",
    role: "",
    emailAddress: "",
    phoneNumber: "",
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

  const handleSubmit = async () => {
    try {
      toast.loading("Adding contact...");

      const res = await axios.post(`${BASE_URL}/api/supplier-contacts/create`, {
        ...data,
        phoneNumber: parseInt(data.phoneNumber),
        supplierId: parseInt(data.supplierId),
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
          Add Contact
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContact;
