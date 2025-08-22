'use client'

import { useEffect, useState } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";
import SupplierModal from "./SupplierModal";
import ViewSupplier from "./ViewSupplier";
import AddContact from "./AddContact";
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
    const { user } = useAuth();
    const [importCSV, setImportCSV] = useState(false);

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

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/suppliers/get`);
            setSuppliers(res.data.data);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch suppliers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

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

    // ✅ Export to Excel
    const handleExportExcel = () => {
        showConfirmation({
            title: 'Export Suppliers to Excel',
            message: `Are you sure you want to export ${suppliers.length} supplier records to Excel? This will download a file with all supplier data.`,
            action: () => confirmExportExcel(),
            severity: 'info'
        });
    };

    const confirmExportExcel = () => {
        const exportData = suppliers.map((s) => ({
            "Supplier ID": s.id,
            "Company Name": s.companyName,
            "Email": s.email,
            "Phone": s.phone,
            "Address": s.address,
            "Post Code": s.postCode,
            "Status": s.status,
            "Created At": s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
        XLSX.writeFile(workbook, "suppliers.xlsx");
        toast.success("Supplier data exported successfully");
    };

    if (loading) {
        return <Loader />;
    }

    const columns = [
        { field: "id", headerName: "ID", flex: 1 },
        { field: "companyName", headerName: "Company Name", flex: 1.5 },
        { field: "email", headerName: "Email", flex: 1.5 },
        { field: "phone", headerName: "Phone", flex: 1 },
        { field: "address", headerName: "Address", flex: 1.5 },
        { field: "postCode", headerName: "Post Code", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.value === "active"}
                    onChange={() => handleStatusChange(params.row.id, params.value)}
                    color="primary"
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
                    <PermissionWrapper resource="supplier-contacts" action="canCreate">
                        <Tooltip title="Add Contact">
                            <IconButton color="primary" onClick={() => handleAddContact(params.row)}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </PermissionWrapper>
                    <PermissionWrapper resource="suppliers" action="canView">
                        <Tooltip title="View">
                            <IconButton color="primary" onClick={() => handleView(params.row)}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    </PermissionWrapper>
                    <PermissionWrapper resource="suppliers" action="canEdit">
                        <Tooltip title="Edit">
                            <IconButton color="secondary" onClick={() => handleEdit(params.row)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </PermissionWrapper>
                    <PermissionWrapper resource="suppliers" action="canDelete">
                        <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDelete(params.row)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </PermissionWrapper>
                </Box>
            ),
        },
    ];

    return (
        <Paper p={2} sx={{p:2}}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" gutterBottom>Suppliers</Typography>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" color="primary" onClick={handleImportCSV}>Import CSV</Button>
                    <Button variant="outlined" color="success" onClick={handleExportExcel}>
                        Export Excel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleAdd}>
                        Add Supplier
                    </Button>
                </Box>
            </Box>

            {/* Modals */}
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
                open={importCSV} // This can be controlled by a state if you want to show/hide it
                onClose={() => setImportCSV(false)} // Implement close logic if needed
                fetchSuppliers={fetchSuppliers}
            />

            <Paper>
                <DataGrid
                    rows={suppliers.map((supplier) => ({
                        ...supplier,
                        id: supplier.id, // DataGrid expects a unique 'id' field
                    }))}
                    columns={columns}
                    autoHeight
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    disableRowSelectionOnClick
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
