'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Box,
    Button,
    IconButton,
    Typography,
    Paper,
    Switch,
    Tooltip,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";
import SupplierModal from "./SupplierModal";
import ViewSupplier from "./ViewSupplier";
import AddContact from "./AddContact";
import EditContact from "./EditContact";
import PermissionWrapper from "../PermissionWrapper";
import { useAuth } from "@/context/authContext";
import ImportCSV from "./ImportCSV";
import ConfirmationDialog from '../ConfirmationDialog';

// ✅ Import XLSX for exporting
import * as XLSX from "xlsx";

const SupplierTable = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [openView, setOpenView] = useState(false);
    const [openAddContact, setOpenAddContact] = useState(false);
    const [selectedContactSupplier, setSelectedContactSupplier] = useState(null);
    const [openEditContact, setOpenEditContact] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const { user } = useAuth();
    const [importCSV, setImportCSV] = useState(false);

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Confirmation dialog states
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({
        title: '',
        message: '',
        action: null,
        severity: 'warning'
    });


    const showConfirmation = (config) => {
        setConfirmationConfig(config);
        setConfirmationOpen(true);
    };

    const handleConfirmationClose = () => {
        setConfirmationOpen(false);
        setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
    };

    const handleImportCSV = () => {
        showConfirmation({
            title: 'Import Suppliers',
            message: 'Are you sure you want to import suppliers from CSV? This will add new supplier records to your database.',
            action: () => setImportCSV(true),
            severity: 'info'
        });
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setOpenModal(true);
    };

    const handleAdd = () => {
        setSelectedSupplier(null);
        setOpenModal(true);
    };

    const handleView = (supplier) => {
        setSelectedSupplier(supplier);
        setOpenView(true);
    };

    const handleAddContact = (supplier) => {
        setSelectedContactSupplier(supplier);
        setOpenAddContact(true);
    };

    const handleEditContact = (contact) => {
        setSelectedContact(contact);
        setOpenEditContact(true);
    };

    const handleDeleteContact = (contact) => {
        showConfirmation({
            title: 'Delete Contact',
            message: `Are you sure you want to delete contact "${contact.firstName} ${contact.lastName}"? This action cannot be undone.`,
            action: () => confirmDeleteContact(contact.id),
            severity: 'error'
        });
    };

    const confirmDeleteContact = async (contactId) => {
        try {
            toast.loading("Deleting contact...");
            await axios.delete(`${BASE_URL}/api/supplier-contacts/delete/${contactId}`, {
                data: { userId: user.id }
            });
            toast.dismiss();
            toast.success("Contact deleted successfully");
            fetchSuppliers();
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const toggleRowExpansion = (supplierId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(supplierId)) {
            newExpandedRows.delete(supplierId);
        } else {
            newExpandedRows.add(supplierId);
        }
        setExpandedRows(newExpandedRows);
    };

    const handleDelete = (supplierRow) => {
        showConfirmation({
            title: 'Delete Supplier',
            message: `Are you sure you want to delete supplier "${supplierRow.companyName}"? This action cannot be undone and will remove all associated data.`,
            action: () => confirmDeleteSupplier(supplierRow.id),
            severity: 'error'
        });
    };

    const confirmDeleteSupplier = async (id) => {
        toast.loading("Deleting supplier...");
        try {
            await axios.delete(`${BASE_URL}/api/suppliers/delete/${id}`, {
                data: {
                    userId: user.id
                }
            });
            toast.dismiss();
            toast.success("Supplier deleted successfully");
            fetchSuppliers();
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/api/suppliers/get?page=${currentPage + 1}&limit=${currentRowsPerPage}`);
            setSuppliers(res.data.data);
            setTotalCount(res.data.pagination?.totalItems || 0);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch suppliers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Refetch data when page or rowsPerPage changes
    useEffect(() => {
        if (!loading) {
            fetchSuppliers();
        }
    }, [page, rowsPerPage]);

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

    const handleStatusChange = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "active" ? "inactive" : "active";
            await axios.put(`${BASE_URL}/api/suppliers/update/${id}`, { status: newStatus, userId: user.id });
            setSuppliers((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, status: newStatus } : s
                )
            );
            toast.success("Status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Fetch all suppliers for export (without pagination)
    const fetchAllSuppliers = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/suppliers/get?page=1&limit=10000`); // Large limit to get all
            return res.data.data;
        } catch (error) {
            toast.error("Failed to fetch suppliers for export");
            return [];
        }
    };

    // ✅ Export to Excel
    const handleExportExcel = () => {
        showConfirmation({
            title: 'Export All Suppliers to Excel',
            message: `Are you sure you want to export all supplier records with their contacts to Excel? This will download a comprehensive file with all supplier and contact data.`,
            action: () => confirmExportExcel(),
            severity: 'info'
        });
    };

    const confirmExportExcel = async () => {
        try {
            toast.loading("Preparing export data...");
            
            // Fetch all suppliers for export
            const allSuppliers = await fetchAllSuppliers();
            
            // Create flattened data structure with supplier and contact information
            const exportData = [];
            
            allSuppliers.forEach((supplier) => {
                if (supplier.contacts && supplier.contacts.length > 0) {
                    // For suppliers with contacts, create a row for each contact
                    supplier.contacts.forEach((contact, index) => {
                        exportData.push({
                            "Supplier ID": supplier.id,
                            "Company Name": supplier.companyName,
                            "Supplier Email": supplier.email,
                            "Supplier Phone": supplier.phone,
                            "Address": supplier.address,
                            "Post Code": supplier.postCode,
                            "Supplier Status": supplier.status,
                            "Supplier Created At": supplier.createdAt ? new Date(supplier.createdAt).toLocaleString() : "N/A",
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
                    // For suppliers without contacts, create a single row
                    exportData.push({
                        "Supplier ID": supplier.id,
                        "Company Name": supplier.companyName,
                        "Supplier Email": supplier.email,
                        "Supplier Phone": supplier.phone,
                        "Address": supplier.address,
                        "Post Code": supplier.postCode,
                        "Supplier Status": supplier.status,
                        "Supplier Created At": supplier.createdAt ? new Date(supplier.createdAt).toLocaleString() : "N/A",
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
            XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers & Contacts");
            XLSX.writeFile(workbook, "suppliers_with_contacts.xlsx");
            
            toast.dismiss();
            toast.success(`Successfully exported ${allSuppliers.length} suppliers with contacts to Excel`);
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to export supplier data");
        }
    };

    // ContactsTable component for nested table
    const ContactsTable = ({ contacts, supplierId }) => {
        if (!contacts || contacts.length === 0) {
            return (
                <Box p={2}>
                    <Typography variant="body2" color="textSecondary" align="center">
                        No contacts found for this supplier.
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
                                            <PermissionWrapper resource="supplier-contacts" action="canEdit">
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
                                            <PermissionWrapper resource="supplier-contacts" action="canDelete">
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
                <Typography variant="h5">Suppliers</Typography>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" color="success" onClick={handleImportCSV}>
                        Import CSV
                    </Button>
                    <Button variant="outlined" color="success" onClick={handleExportExcel}>
                        Export Excel
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
                        Add Supplier
                    </Button>
                </Box>
            </Box>

            <SupplierModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                fetchSuppliers={fetchSuppliers}
                selectedSupplier={selectedSupplier}
            />

            <ViewSupplier
                open={openView}
                onClose={() => setOpenView(false)}
                selectedSupplier={selectedSupplier}
            />

            <AddContact
                open={openAddContact}
                onClose={() => setOpenAddContact(false)}
                supplierId={selectedContactSupplier?.id}
                onContactAdded={() => {
                    setOpenAddContact(false);
                    fetchSuppliers();
                }}
            />

            <ImportCSV
                open={importCSV}
                onClose={() => setImportCSV(false)}
                fetchSuppliers={fetchSuppliers}
            />

            <EditContact
                open={openEditContact}
                onClose={() => setOpenEditContact(false)}
                contact={selectedContact}
                onContactUpdated={() => {
                    setOpenEditContact(false);
                    fetchSuppliers();
                }}
            />

            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell width="50px"></TableCell>
                                <TableCell><strong>Supplier ID</strong></TableCell>
                                <TableCell><strong>Company Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Phone</strong></TableCell>
                                <TableCell><strong>Address</strong></TableCell>
                                <TableCell><strong>Post Code</strong></TableCell>
                                <TableCell><strong>Contacts</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map((supplier) => (
                                <React.Fragment key={supplier.id}>
                                    {/* Main supplier row */}
                                    <TableRow hover>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleRowExpansion(supplier.id)}
                                                color="primary"
                                            >
                                                {expandedRows.has(supplier.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{supplier.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {supplier.companyName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.address}</TableCell>
                                        <TableCell>{supplier.postCode}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={supplier.contacts?.length || 0}
                                                size="small"
                                                color={supplier.contacts?.length > 0 ? "success" : "default"}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={supplier.status === "active"}
                                                onChange={() =>
                                                    handleStatusChange(supplier.id, supplier.status)
                                                }
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5}>
                                                <PermissionWrapper resource="supplier-contacts" action="canCreate">
                                                    <Tooltip title="Add Contact">
                                                        <IconButton size="small" color="success" onClick={() => handleAddContact(supplier)}>
                                                            <PersonAddAlt1Icon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </PermissionWrapper>
                                                <PermissionWrapper resource="suppliers" action="canView">
                                                    <Tooltip title="View">
                                                        <IconButton size="small" onClick={() => handleView(supplier)} color="info">
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </PermissionWrapper>
                                                <PermissionWrapper resource="suppliers" action="canEdit">
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleEdit(supplier)} color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </PermissionWrapper>
                                                <PermissionWrapper resource="suppliers" action="canDelete">
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => handleDelete(supplier)} color="error">
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
                                            <Collapse in={expandedRows.has(supplier.id)} timeout="auto" unmountOnExit>
                                                <ContactsTable contacts={supplier.contacts} supplierId={supplier.id} />
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

export default SupplierTable;
