"use client";

import { BASE_URL } from '@/configs/url';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';

import {
    Box,
    Button,
    IconButton,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Tooltip,
    Switch,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

import ClientsModal from './ClientsModal';
import ContactModal from './ContactModal';
import ViewClient from './ViewClient';

const ClientsTable = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editClient, setEditClient] = useState(null);

    const [openContactModal, setOpenContactModal] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);

    const [openViewClient, setOpenViewClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/client/get`);
            setClients(response.data);
        } catch (error) {
            toast.error("Error fetching clients");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (client) => {
        toast.info(`Viewing ${client.companyName}`);
        setSelectedClient(client);
        setOpenViewClient(true);
    };

    const handleAdd = () => {
        setEditClient(null);
        setOpenModal(true);
    };

    const handleEdit = (client) => {
        setEditClient(client);
        setOpenModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/api/client/delete/${id}`);
            toast.success("Client deleted successfully");
            fetchClients();
        } catch (err) {
            toast.error("Error deleting client");
        }
    };

    const handleAddContact = (clientId) => {
        setSelectedClientId(clientId);
        setOpenContactModal(true);
    };


    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${BASE_URL}/api/client/status/${id}`, { status });
            toast.success("Status updated successfully");
            fetchClients();
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    if (loading) return <Loader />;

    return (
        <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Clients</Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
                    Add Client
                </Button>
            </Box>

            <ClientsModal
                open={openModal}
                handleClose={() => setOpenModal(false)}
                editClient={editClient}
                refreshClients={fetchClients}
            />

            {openContactModal && <ContactModal
                open={openContactModal}
                onClose={() => setOpenContactModal(false)}
                clientId={selectedClientId}
                refreshContacts={fetchClients}
            />}

            {openViewClient && <ViewClient
                open={openViewClient}
                onClose={() => setOpenViewClient(false)}
                client={selectedClient}
            />}

            <Paper elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Company Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell>{client.companyName}</TableCell>
                                <TableCell>{client.emailAddress}</TableCell>
                                <TableCell>{client.phoneNumber}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={client.accountStatus === "active"}
                                        onChange={() => handleStatusUpdate(client.id, client.accountStatus === "active" ? "inactive" : "active")}
                                        color="success"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Add Contact">
                                        <IconButton color="success" onClick={() => handleAddContact(client.id)}>
                                            <PersonAddAlt1Icon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View">
                                        <IconButton onClick={() => handleView(client)} color="info">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEdit(client)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => handleDelete(client.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {clients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default ClientsTable;
