"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Switch,
    FormControlLabel
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationDialog from '../ConfirmationDialog';
import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";
import { MuiTelInput } from "mui-tel-input";

const defaultData = {
    name: "",
    email: "",
    phone: "",
    address: "",
    postCode: "",
    notes: "",
    isCompany: false,
};

const SupplierModal = ({ open, onClose, fetchSuppliers, selectedSupplier }) => {
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Confirmation dialog states
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({
        title: '',
        message: '',
        action: null,
        severity: 'warning'
    });

    useEffect(() => {
        if (selectedSupplier) {
            setData(selectedSupplier);
        } else {
            setData(defaultData);
        }
    }, [selectedSupplier, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const showConfirmation = (config) => {
        setConfirmationConfig(config);
        setConfirmationOpen(true);
    };

    const handleConfirmationClose = () => {
        setConfirmationOpen(false);
        setConfirmationConfig({ title: '', message: '', action: null, severity: 'warning' });
    };

    const handleSubmit = async () => {
        const isCreateMode = !selectedSupplier;
        const isEditMode = !!selectedSupplier;

        if (isCreateMode) {
            showConfirmation({
                title: 'Create New Supplier',
                message: `Are you sure you want to create a new supplier "${data.name}"?`,
                action: () => submitSupplier(),
                severity: 'info'
            });
        } else if (isEditMode) {
            showConfirmation({
                title: 'Update Supplier',
                message: `Are you sure you want to update supplier "${data.name}"? This will modify the existing supplier information.`,
                action: () => submitSupplier(),
                severity: 'warning'
            });
        }
    };

    const submitSupplier = async () => {
        setLoading(true);

        try {
            toast.loading(selectedSupplier ? "Updating supplier..." : "Creating supplier...");
            data.userId = user.id;

            if (selectedSupplier) {
                await axios.put(`${BASE_URL}/api/suppliers/update/${selectedSupplier.id}`, data);
                toast.dismiss();
                toast.success("Supplier updated successfully");
            } else {
                await axios.post(`${BASE_URL}/api/suppliers/create`, data);
                toast.dismiss();
                toast.success("Supplier created successfully");
            }

            fetchSuppliers();
            onClose();
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{selectedSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin="dense"
                    label="Name"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={data.isCompany}
                            onChange={(_, checked) => setData(prev => ({ ...prev, isCompany: checked }))}
                            color="primary"
                        />
                    }
                    label="Is Company?"
                    sx={{ mb: 1 }}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                />
                <MuiTelInput
                    fullWidth
                    margin="dense"
                    label="Phone Number"
                    name="phone"
                    value={data.phone}
                    onChange={(value) => setData({ ...data, phone: value })}
                    defaultCountry="NZ"
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Address"
                    name="address"
                    value={data.address}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Post Code"
                    name="postCode"
                    value={data.postCode}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Notes"
                    name="notes"
                    value={data.notes}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : selectedSupplier ? "Update" : "Create"}
                </Button>
            </DialogActions>

            <ConfirmationDialog
                open={confirmationOpen}
                onClose={handleConfirmationClose}
                onConfirm={confirmationConfig.action}
                title={confirmationConfig.title}
                message={confirmationConfig.message}
                severity={confirmationConfig.severity}
                confirmText={selectedSupplier ? 'Update' : 'Create'}
                cancelText="Cancel"
            />
        </Dialog>
    );
};

export default SupplierModal;
