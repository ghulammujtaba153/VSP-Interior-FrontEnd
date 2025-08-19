'use client'

import { useEffect, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";


import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Switch,
    Typography,
    Box,
    Button
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

import SupplierModal from "./SupplierModal";
import ViewSupplier from "./ViewSupplier";
import AddContact from "./AddContact";
import PermissionWrapper from "../PermissionWrapper";
import { useAuth } from "@/context/authContext";

const SupplierTable = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [openView, setOpenView] = useState(false);
    const [openAddContact, setOpenAddContact] = useState(false);
    const [selectedContactSupplier, setSelectedContactSupplier] = useState(null);
    const { user } = useAuth();



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

    const handleDelete = async (id) => {
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

    if (loading) {
        return <Loader />;
    }

    return (
        <Box p={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" gutterBottom>Suppliers</Typography>
                <Button variant="contained" color="primary" onClick={handleAdd}>Add Supplier</Button>
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

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Company Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>{supplier.companyName}</TableCell>
                                <TableCell>{supplier.email}</TableCell>
                                <TableCell>{supplier.phone}</TableCell>
                                <TableCell>{supplier.address}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={supplier.status === "active"}
                                        onChange={() => handleStatusChange(supplier.id, supplier.status)}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>
                                    <PermissionWrapper resource="supplier-contacts" action="canCreate">
                                        <IconButton color="primary" onClick={() => handleAddContact(supplier)}>
                                            <AddIcon />
                                        </IconButton>
                                    </PermissionWrapper>


                                    <PermissionWrapper resource="suppliers" action="canView">
                                    <IconButton color="primary" onClick={() => handleView(supplier)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    </PermissionWrapper>

                                    <PermissionWrapper resource="suppliers" action="canEdit">
                                    <IconButton color="secondary" onClick={() => handleEdit(supplier)}>
                                        <EditIcon />
                                    </IconButton>
                                    </PermissionWrapper>

                                    <PermissionWrapper resource="suppliers" action="canDelete">
                                    <IconButton color="error" onClick={() => handleDelete(supplier.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    </PermissionWrapper>
                                </TableCell>
                            </TableRow>
                        ))}
                        {suppliers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No suppliers found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SupplierTable;
