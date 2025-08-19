"use client";

import React, { useState, useEffect } from 'react';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Divider,
    TextField,
    IconButton
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

import SaveIcon from '@mui/icons-material/Save';

import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';

const ViewClient = ({ open, onClose, client }) => {
    const [contacts, setContacts] = useState([]);
    const {user} = useAuth()

    useEffect(() => {
        if (client && client.contacts) {
            setContacts(client.contacts.map(contact => ({ ...contact }))); // Clone
        }
    }, [client]);

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...contacts];

        updatedContacts[index][field] = value;
        setContacts(updatedContacts);
    };

    const handleUpdateContact = async (contactId, updatedData) => {
        toast.loading("Updating contact...");

        try {
            const response = await axios.put(`${BASE_URL}/api/contact/update/${contactId}`, {
                ...updatedData,
                userId: user.id,
            });

            toast.dismiss();
            toast.success("Contact updated successfully");
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to update contact");
            console.error(error);
        }
    };

    if (!client) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Client Details</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Company Name</Typography>
                        <Typography>{client.companyName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Email Address</Typography>
                        <Typography>{client.emailAddress}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Phone Number</Typography>
                        <Typography>{client.phoneNumber}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Address</Typography>
                        <Typography>{client.address}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Post Code</Typography>
                        <Typography>{client.postCode}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Account Status</Typography>
                        <Typography>{client.accountStatus}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2">Notes</Typography>
                        <Typography>{client.notes || 'N/A'}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" mt={2}>Contacts</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {contacts.length > 0 ? (
                            contacts.map((contact, index) => (
                                <Grid container spacing={2} key={contact.id} sx={{ mb: 2, borderBottom: '1px solid #ccc', pb: 1 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="First Name"
                                            fullWidth
                                            value={contact.firstName}
                                            onChange={(e) => handleContactChange(index, 'firstName', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Last Name"
                                            fullWidth
                                            value={contact.lastName}
                                            onChange={(e) => handleContactChange(index, 'lastName', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Role"
                                            fullWidth
                                            value={contact.role}
                                            onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Email"
                                            fullWidth
                                            value={contact.emailAddress}
                                            onChange={(e) => handleContactChange(index, 'emailAddress', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Phone"
                                            fullWidth
                                            value={contact.phoneNumber || ''}
                                            onChange={(e) => handleContactChange(index, 'phoneNumber', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} display="flex" alignItems="center">
                                        <IconButton
                                            onClick={() => handleUpdateContact(contact.id, contact)}
                                            color="primary"
                                            size="large"
                                        >
                                            <SaveIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))
                        ) : (
                            <Typography>No contacts available.</Typography>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewClient;
