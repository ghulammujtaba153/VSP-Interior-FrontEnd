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
    Stack,
    Chip
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
    Close
} from '@mui/icons-material';

const ViewClient = ({ open, onClose, client }) => {
    const capitalizeName = (name) => {
        if (!name) return 'N/A';
        return String(name)
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (!client) return null;

    const InfoRow = ({ icon: Icon, label, value, color }) => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                py: 1.5,
                px: 2,
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
                }
            }}
        >
            <Box
                sx={{
                    minWidth: 42,
                    height: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.08)',
                    color: 'primary.main',
                    borderRadius: 1.5,
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
            >
                <Icon fontSize="small" />
            </Box>
            <Box flex={1} minWidth={0}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontWeight: 700,
                        fontSize: '0.65rem'
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        mt: 0.2,
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        color: color || 'text.primary',
                        fontSize: '0.95rem'
                    }}
                >
                    {value || 'N/A'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle
                sx={{
                    pb: 2,
                    pt: 3,
                    px: 3,
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Business sx={{ fontSize: 28 }} />
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {capitalizeName(client.companyName) || 'Client Details'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                            Complete client and contact information
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    label={client.accountStatus || 'N/A'}
                    size="small"
                    sx={{
                        bgcolor:
                            client.accountStatus === 'active'
                                ? 'success.light'
                                : 'error.light',
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem'
                    }}
                />
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                <Stack spacing={0}>
                    {/* Company Information Section */}
                    <Box sx={{ p: 3 }}>
                        <Typography
                            variant="subtitle1"
                            color="primary"
                            fontWeight="bold"
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2
                            }}
                        >
                            <Box component="span" sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 4 }} />
                            <Business />
                            Information
                        </Typography>

                        <Paper
                            variant="outlined"
                            sx={{ borderRadius: 2, overflow: 'hidden' }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={2}>
                                    {/* Row 1 */}
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={Email}
                                            label="Email Address"
                                            value={capitalizeName(client.emailAddress)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={Phone}
                                            label="Phone Number"
                                            value={client.phoneNumber}
                                        />
                                    </Grid>

                                    {/* Row 2 */}
                                    <Grid item xs={12}>
                                        <InfoRow
                                            icon={LocationOn}
                                            label="Address"
                                            value={capitalizeName(client.address)}
                                        />
                                    </Grid>

                                    {/* Row 3 */}
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={LocalPostOffice}
                                            label="Post Code"
                                            value={capitalizeName(client.postCode)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={Business}
                                            label="Company Type"
                                            value={
                                                typeof client.isCompany === 'boolean'
                                                    ? client.isCompany
                                                        ? 'Registered Company'
                                                        : 'Individual'
                                                    : 'N/A'
                                            }
                                        />
                                    </Grid>

                                    {/* Row 4 */}
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={AccountCircle}
                                            label="Account Status"
                                            value={capitalizeName(client.accountStatus)}
                                            color={
                                                client.accountStatus === 'active'
                                                    ? 'success.main'
                                                    : 'error.main'
                                            }
                                        />
                                    </Grid>
                                    {client.notes && (
                                        <Grid item xs={12}>
                                            <InfoRow
                                                icon={Notes}
                                                label="Notes"
                                                value={capitalizeName(client.notes)}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Paper>
                    </Box>

                    <Divider />

                    {/* Contacts Section */}
                    <Box sx={{ p: 3 }}>
                        <Typography
                            variant="subtitle1"
                            color="primary"
                            fontWeight="bold"
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2
                            }}
                        >
                            <Box component="span" sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 4 }} />
                            <ContactPhone />
                            Contact Persons
                            <Chip
                                label={client.contacts?.length || 0}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ ml: 1 }}
                            />
                        </Typography>

                        {client.contacts && client.contacts.length > 0 ? (
                            <Grid container spacing={2}>
                                {client.contacts.map((contact) => (
                                    <Grid item xs={12} md={6} key={contact.id}>
                                        <Paper
                                            elevation={2}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                height: '100%',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 6
                                                }
                                            }}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1.5}
                                                mb={2}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(144, 202, 249, 0.1)',
                                                        color: 'primary.main',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.2rem',
                                                        border: '2px solid',
                                                        borderColor: 'primary.main'
                                                    }}
                                                >
                                                    {contact.firstName?.[0] || '?'}
                                                    {contact.lastName?.[0] || ''}
                                                </Box>
                                                <Box flex={1}>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        noWrap
                                                    >
                                                        {capitalizeName(`${contact.firstName || ''} ${contact.lastName || ''}`)}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={700}
                                                        color="primary"
                                                        noWrap
                                                        sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}
                                                    >
                                                        {capitalizeName(contact.role) || 'No Role Specified'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Stack spacing={1.5}>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1.5}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: 32,
                                                            height: 32,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(144, 202, 249, 0.1)',
                                                            color: 'primary.main',
                                                            borderRadius: 1,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <Email fontSize="small" />
                                                    </Box>
                                                    <Box flex={1} minWidth={0}>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Email
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                            noWrap
                                                        >
                                                            {capitalizeName(contact.emailAddress) || '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1.5}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: 32,
                                                            height: 32,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(144, 202, 249, 0.1)',
                                                            color: 'primary.main',
                                                            borderRadius: 1,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <Phone fontSize="small" />
                                                    </Box>
                                                    <Box flex={1} minWidth={0}>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Phone
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                            noWrap
                                                        >
                                                            {contact.phoneNumber || '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <ContactPhone
                                    color="disabled"
                                    sx={{ fontSize: 48, mb: 1 }}
                                />
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    fontWeight={500}
                                >
                                    No contacts available
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Add contact persons to keep track of your connections
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    justifyContent: 'flex-end',
                    bgcolor: 'background.paper'
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Close />}
                    sx={{
                        minWidth: 120,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewClient;
