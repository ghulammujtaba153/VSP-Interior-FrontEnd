"use client"


import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

import { BASE_URL } from '@/configs/url';

const initialClientState = {
  companyName: '',
  emailAddress: '',
  phoneNumber: '',
  address: '',
  postCode: '',
  notes: '',
};

const ClientsModal = ({ open, handleClose, editClient, refreshClients }) => {
  const [client, setClient] = useState(initialClientState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editClient) {
      setClient(editClient);
    } else {
      setClient(initialClientState);
    }
  }, [editClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setClient({ ...client, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editClient) {
        await axios.put(`${BASE_URL}/api/client/update/${client.id}`, client);
        toast.success('Client updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/client/create`, client);
        toast.success('Client created successfully');
      }

      refreshClients();
      handleClose();
    } catch (error) {
      toast.error('Failed to submit client data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Company Name"
            name="companyName"
            value={client.companyName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            name="emailAddress"
            type="email"
            value={client.emailAddress}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={client.phoneNumber}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={client.address}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Post Code"
            name="postCode"
            value={client.postCode}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={client.notes}
            onChange={handleChange}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editClient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClientsModal;
