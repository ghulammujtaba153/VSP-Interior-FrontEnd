"use client";

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Loader from '../loader/Loader';
import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';
import ClientsModal from './ClientsModal';
import ContactModal from './ContactModal';
import ViewClient from './ViewClient';
import PermissionWrapper from '../PermissionWrapper';
import { DataGrid } from '@mui/x-data-grid';
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

  const [openImportModal, setOpenImportModal] = useState(false);
  

  const [openViewClient, setOpenViewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { user } = useAuth();

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


  const handleImportModalOpen = () => {
    setOpenImportModal(true);
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

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const exportData = clients.map(c => ({
      "Client ID": c.id,
      "Company Name": c.companyName,
      "Email": c.emailAddress,
      "Phone": c.phoneNumber,
      "Address": c.address,
      "City": c.postCode,
      "Status": c.accountStatus,
      "Created At": c.createdAt ? new Date(c.createdAt).toLocaleString() : "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "clients.xlsx");
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) return <Loader />;

  const columns = [
    { field: "id", headerName: "Client Id", flex: 0.5 },
    { field: "companyName", headerName: "Company Name", flex: 1.5 },
    { field: "emailAddress", headerName: "Email", flex: 1.5 },
    { field: "phoneNumber", headerName: "Phone", flex: 1 },
    { field: "address", headerName: "Address", flex: 2 },
    { field: "postCode", headerName: "City", flex: 1 },
    {
      field: "accountStatus",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Switch
          checked={params.value === "active"}
          onChange={() =>
            handleStatusUpdate(params.row.id, params.value === "active" ? "inactive" : "active")
          }
          color="success"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <PermissionWrapper resource="clients" action="canView">
            <Tooltip title="Add Contact">
              <IconButton color="success" onClick={() => handleAddContact(params.row.id)}>
                <PersonAddAlt1Icon />
              </IconButton>
            </Tooltip>
          </PermissionWrapper>
          <PermissionWrapper resource="clients" action="canView">
            <Tooltip title="View">
              <IconButton onClick={() => handleView(params.row)} color="info">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </PermissionWrapper>
          <PermissionWrapper resource="clients" action="canEdit">
            <Tooltip title="Edit">
              <IconButton onClick={() => handleEdit(params.row)} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          </PermissionWrapper>
          <PermissionWrapper resource="clients" action="canDelete">
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </PermissionWrapper>
        </Box>
      ),
    },
  ];

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

      <ClientsModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        editClient={editClient}
        refreshClients={fetchClients}
      />

      {openContactModal && (
        <ContactModal
          open={openContactModal}
          onClose={() => setOpenContactModal(false)}
          clientId={selectedClientId}
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
        <DataGrid
          rows={clients.map((client) => ({
            ...client,
            id: client.id, // DataGrid expects a unique 'id' field
          }))}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Paper>
  );
};

export default ClientsTable;
