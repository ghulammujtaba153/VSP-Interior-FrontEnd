"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

import { BASE_URL } from "@/configs/url";

const defaultData = {
    companyName: "",
    email: "",
    phone: "",
    address: "",
    postCode: "",
    notes: "",
};

const SupplierModal = ({ open, onClose, fetchSuppliers, selectedSupplier }) => {
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async () => {
        setLoading(true);

        try {
            toast.loading(selectedSupplier ? "Updating supplier..." : "Creating supplier...");

            if (selectedSupplier) {
                await axios.put(`${BASE_URL}/api/suppliers/update/${selectedSupplier.id}`, data);
                toast.dismiss();
                toast.success("Supplier updated successfully");
            } else {
                await axios.post(`${BASE_URL}/api/suppliers/create`, data);
                toast.dismiss();
                toast.success("Supplier created successfully");
            }

            fetchSuppliers(); // refresh table
            onClose(); // close modal
        } catch (error) {
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
                    label="Company Name"
                    name="companyName"
                    value={data.companyName}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Phone"
                    name="phone"
                    value={data.phone}
                    onChange={handleChange}
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
        </Dialog>
    );
};

export default SupplierModal;
