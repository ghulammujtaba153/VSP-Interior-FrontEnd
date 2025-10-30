"use client";

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Divider,
    Paper,
    Box,
    Stack
} from '@mui/material';
import {
    Business,
    Email,
    Phone,
    LocationOn,
    LocalPostOffice,
    AccountCircle,
    Notes,
    ContactPhone,
    Person,
    Badge,
    Work
} from '@mui/icons-material';

const ViewClient = ({ open, onClose, client }) => {
    if (!client) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Business color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                        Client Details
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Company Information Section */}
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business fontSize="small" />
                            Company Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Stack spacing={2}>
                            {/* Company Name */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Business color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Company Name
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {client.companyName || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Email Address */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Email color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {client.emailAddress || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Phone Number */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Phone color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Phone Number
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {client.phoneNumber || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Address */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <LocationOn color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {client.address || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Post Code */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <LocalPostOffice color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Post Code
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {client.postCode || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Account Status */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <AccountCircle color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Account Status
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        fontWeight={600}
                                        color={client.accountStatus === 'active' ? 'success.main' : 'error.main'}
                                    >
                                        {client.accountStatus || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Is Company */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Business color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Company Type
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {typeof client.isCompany === "boolean" 
                                            ? (client.isCompany ? "Registered Company" : "Individual") 
                                            : "N/A"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Notes */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Notes color="action" sx={{ mt: 0.5 }} />
                                <Box flex={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Notes
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {client.notes || 'No notes available'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Contacts Section */}
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ContactPhone fontSize="small" />
                            Contacts
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({client.contacts?.length || 0})
                            </Typography>
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {client.contacts && client.contacts.length > 0 ? (
                            <Stack spacing={2}>
                                {client.contacts.map((contact, index) => (
                                    <Paper key={contact.id} variant="outlined" sx={{ p: 2 }}>
                                        <Stack spacing={2}>
                                            {/* Contact Header */}
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Person color="primary" fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    Contact {index + 1}
                                                </Typography>
                                            </Box>

                                            {/* Contact Details */}
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                                        <Badge color="action" fontSize="small" sx={{ mt: 0.5 }} />
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Full Name
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600}>
                                                                {contact.firstName || '—'} {contact.lastName || '—'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                                        <Work color="action" fontSize="small" sx={{ mt: 0.5 }} />
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Role
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600}>
                                                                {contact.role || '—'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                                        <Email color="action" fontSize="small" sx={{ mt: 0.5 }} />
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Email
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600}>
                                                                {contact.emailAddress || '—'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                                        <Phone color="action" fontSize="small" sx={{ mt: 0.5 }} />
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Phone
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600}>
                                                                {contact.phoneNumber || '—'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                                <ContactPhone color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="body1" color="text.secondary">
                                    No contacts available for this client
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    color="primary"
                    size="large"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewClient;