"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  Switch,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Loader from '../loader/Loader';
import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';
import ClientsModal from './ClientsModal';
import ContactModal from './ContactModal';
import ViewClient from './ViewClient';
import PermissionWrapper from '../PermissionWrapper';
import ConfirmationDialog from '../ConfirmationDialog';
import ImportModal from './ImportModal';

// ✅ Import XLSX for export
import * as XLSX from "xlsx";

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const [openContactModal, setOpenContactModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedContactForEdit, setSelectedContactForEdit] = useState(null);

  const [openImportModal, setOpenImportModal] = useState(false);

  const [openViewClient, setOpenViewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Expanded rows state for nested table
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  });

  const { user } = useAuth();

  const fetchClients = async (currentPage = page, currentRowsPerPage = rowsPerPage, search = searchTerm) => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: (currentPage + 1).toString(),
        limit: currentRowsPerPage.toString(),
        ...(search && { search })
      });
      const response = await axios.get(`${BASE_URL}/api/client/get?${searchParams}`);
      setClients(response.data.data);
      setTotalCount(response.data.pagination?.totalItems || 0);
    } catch (error) {
      toast.error("Error fetching clients");
    } finally {
      setLoading(false);
    }
  };


  const showConfirmation = (config) => {
    setConfirmationConfig(config);
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
  };

  const handleImportModalOpen = () => {
    showConfirmation({
      title: 'Import Clients',
      message: 'Are you sure you want to import clients? This will add new client records to your database.',
      action: () => setOpenImportModal(true),
      severity: 'info'
    });
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

  const handleDelete = (clientRow) => {
    showConfirmation({
      title: 'Delete Client',
      message: `Are you sure you want to delete client "${clientRow.companyName}"? This action cannot be undone and will remove all associated data.`,
      action: () => confirmDeleteClient(clientRow.id),
      severity: 'error'
    });
  };

  const confirmDeleteClient = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/client/delete/${id}`, {
        data: { userId: user.id }
      });
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (err) {
      toast.error("Error deleting client");
    }
  };

  const handleAddContact = (clientId) => {
    setSelectedContactForEdit(null); // Clear any existing edit data
    setSelectedClientId(clientId);
    setOpenContactModal(true);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/api/client/status/${id}`, { status, userId: user.id });
      toast.success("Status updated successfully");
      fetchClients();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const toggleRowExpansion = (clientId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(clientId)) {
      newExpandedRows.delete(clientId);
    } else {
      newExpandedRows.add(clientId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Fetch all clients for export (without pagination)
  const fetchAllClients = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/client/get?page=1&limit=10000`); // Large limit to get all
      return response.data.data;
    } catch (error) {
      toast.error("Failed to fetch clients for export");
      return [];
    }
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    showConfirmation({
      title: 'Export All Clients to Excel',
      message: `Are you sure you want to export all client records with their contacts to Excel? This will download a comprehensive file with all client and contact data.`,
      action: () => confirmExportExcel(),
      severity: 'info'
    });
  };

  const confirmExportExcel = async () => {
    try {
      toast.loading("Preparing export data...");

      // Fetch all clients for export
      const allClients = await fetchAllClients();

      // Create flattened data structure with client and contact information
      const exportData = [];

      allClients.forEach((client) => {
        if (client.contacts && client.contacts.length > 0) {
          // For clients with contacts, create a row for each contact
          client.contacts.forEach((contact, index) => {
            exportData.push({
              "Client ID": client.id,
              "Company Name": client.companyName,
              "Client Email": client.emailAddress,
              "Client Phone": client.phoneNumber,
              "Address": client.address,
              "City": client.postCode,
              "Client Status": client.accountStatus,
              "Client Created At": client.createdAt ? new Date(client.createdAt).toLocaleString() : "N/A",
              "Contact #": index + 1,
              "Contact ID": contact.id,
              "Contact First Name": contact.firstName || "N/A",
              "Contact Last Name": contact.lastName || "N/A",
              "Contact Full Name": `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "N/A",
              "Contact Role": contact.role || "N/A",
              "Contact Email": contact.emailAddress || "N/A",
              "Contact Phone": contact.phoneNumber || "N/A",
              "Contact Created At": contact.createdAt ? new Date(contact.createdAt).toLocaleString() : "N/A",
            });
          });
        } else {
          // For clients without contacts, create a single row
          exportData.push({
            "Client ID": client.id,
            "Company Name": client.companyName,
            "Client Email": client.emailAddress,
            "Client Phone": client.phoneNumber,
            "Address": client.address,
            "City": client.postCode,
            "Client Status": client.accountStatus,
            "Client Created At": client.createdAt ? new Date(client.createdAt).toLocaleString() : "N/A",
            "Contact #": "No Contacts",
            "Contact ID": "N/A",
            "Contact First Name": "N/A",
            "Contact Last Name": "N/A",
            "Contact Full Name": "N/A",
            "Contact Role": "N/A",
            "Contact Email": "N/A",
            "Contact Phone": "N/A",
            "Contact Created At": "N/A",
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clients & Contacts");
      XLSX.writeFile(workbook, "clients_with_contacts.xlsx");

      toast.dismiss();
      toast.success(`Successfully exported ${allClients.length} clients with contacts to Excel`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export client data");
    }
  };


  const handleDeleteContact = (contact) => {
    showConfirmation({
      title: 'Delete Contact',
      message: `Are you sure you want to delete contact "${contact.firstName} ${contact.lastName}" (${contact.role})? This action cannot be undone.`,
      action: () => confirmDeleteContact(contact.id),
      severity: 'error'
    });
  };

  const confirmDeleteContact = async (contactId) => {
    try {
      await axios.delete(`${BASE_URL}/api/contact/delete/${contactId}`, {
        data: { userId: user.id }
      });
      toast.success("Contact deleted successfully");
      fetchClients();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting contact");
    }
  };

  const handleEditContact = (contact) => {
    // Set the contact data for editing and open the contact modal
    setSelectedContactForEdit(contact);
    setSelectedClientId(contact.clientId);
    setOpenContactModal(true);
  };

  const handleResetSearch = () => {
    setSearchTerm('')
    setPage(0)
    fetchClients(0, rowsPerPage, '') // Immediately fetch all results when clearing
  }

  useEffect(() => {
    fetchClients();
  }, []);

  // Refetch data when page or rowsPerPage changes
  useEffect(() => {
    if (!loading) {
      fetchClients();
    }
  }, [page, rowsPerPage]);

  // Remove automatic debounced search - now using Apply button

  // Pagination event handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setExpandedRows(new Set()); // Clear expanded rows when changing pages
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setExpandedRows(new Set()); // Clear expanded rows when changing page size
  };

  // Search event handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchApply = () => {
    setPage(0); // Reset to first page when searching
    fetchClients(0, rowsPerPage, searchTerm);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setPage(0);
    fetchClients(0, rowsPerPage, ''); // Immediately fetch all results when clearing
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchApply();
    }
  };

  // ContactsTable component for nested table
  const ContactsTable = ({ contacts, clientId }) => {
    if (!contacts || contacts.length === 0) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            No contacts found for this client.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ margin: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ marginLeft: 1 }}>
          Contacts ({contacts.length})
        </Typography>
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Contact ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Created Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>{contact.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {contact.firstName} {contact.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contact.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{contact.emailAddress || 'N/A'}</TableCell>
                  <TableCell>{contact.phoneNumber || 'N/A'}</TableCell>
                  <TableCell>
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <PermissionWrapper resource="clients" action="canEdit">
                        <Tooltip title="Edit Contact">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditContact(contact)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </PermissionWrapper>
                      <PermissionWrapper resource="clients" action="canDelete">
                        <Tooltip title="Delete Contact">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteContact(contact)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </PermissionWrapper>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  if (loading) return <Loader />;



  return (
    <Paper p={2} sx={{ padding: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Clients</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" color="success" onClick={handleImportModalOpen}>
            Import Clients
          </Button>

          <Button variant="outlined" color="success" onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Client
          </Button>
        </Box>
      </Box>

      {/* Search Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Search clients by name, email, phone, address..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            variant="outlined"
            size="small"
            sx={{ width: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleSearchClear}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSearchApply}
            sx={{ height: '40px' }}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetSearch}
          >
            Reset
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {totalCount > 0 ? `${totalCount} client${totalCount !== 1 ? 's' : ''} found` : 'No clients found'}
          {searchTerm && ` for "${searchTerm}"`}
        </Typography>
      </Box>

      <ClientsModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        editClient={editClient}
        refreshClients={fetchClients}
      />

      {openContactModal && (
        <ContactModal
          open={openContactModal}
          onClose={() => {
            setOpenContactModal(false);
            setSelectedContactForEdit(null);
          }}
          clientId={selectedClientId}
          editContact={selectedContactForEdit}
          refreshContacts={fetchClients}
        />
      )}

      {openViewClient && (
        <ViewClient
          open={openViewClient}
          onClose={() => setOpenViewClient(false)}
          client={selectedClient}
        />
      )}


      {
        openImportModal && (
          <ImportModal
            open={openImportModal}
            onClose={() => setOpenImportModal(false)}
            refreshClients={fetchClients}
          />
        )
      }

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width="50px"></TableCell>
                <TableCell><strong>Client ID</strong></TableCell>
                <TableCell><strong>Company Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Address</strong></TableCell>
                <TableCell><strong>City</strong></TableCell>
                <TableCell><strong>Contacts</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <React.Fragment key={client.id}>
                  {/* Main client row */}
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(client.id)}
                        color="primary"
                      >
                        {expandedRows.has(client.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {client.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>{client.emailAddress}</TableCell>
                    <TableCell>{client.phoneNumber}</TableCell>
                    <TableCell>{client.address}</TableCell>
                    <TableCell>{client.postCode}</TableCell>
                    <TableCell>
                      <Chip
                        label={client.contacts?.length || 0}
                        size="small"
                        color={client.contacts?.length > 0 ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={client.accountStatus === "active"}
                        onChange={() =>
                          handleStatusUpdate(client.id, client.accountStatus === "active" ? "inactive" : "active")
                        }
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <PermissionWrapper resource="clients" action="canView">
                          <Tooltip title="Add Contact">
                            <IconButton size="small" color="success" onClick={() => handleAddContact(client.id)}>
                              <PersonAddAlt1Icon />
                            </IconButton>
                          </Tooltip>
                        </PermissionWrapper>
                        <PermissionWrapper resource="clients" action="canView">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleView(client)} color="info">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionWrapper>
                        <PermissionWrapper resource="clients" action="canEdit">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(client)} color="primary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionWrapper>
                        <PermissionWrapper resource="clients" action="canDelete">
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(client)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </PermissionWrapper>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expanded contacts row */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                      <Collapse in={expandedRows.has(client.id)} timeout="auto" unmountOnExit>
                        <ContactsTable contacts={client.contacts} clientId={client.id} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={confirmationConfig.severity === 'error' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
      />
    </Paper>
  );
};

export default ClientsTable;
