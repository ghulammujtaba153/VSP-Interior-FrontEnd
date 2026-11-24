"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Stack,
} from "@mui/material";
import { toast } from "react-toastify";
import EmployeePicker from "./EmployeePicker";
import PermissionWrapper from "@/components/PermissionWrapper";

const statusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "valid") return "success";
  if (s === "expiring_soon") return "warning";
  if (s === "expired") return "error";
  return "default";
};

const Certifications = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    name: "",
    issuer: "",
    certificateNumber: "",
    issuedDate: "",
    expiryDate: "",
    renewalReminderDays: 30,
  });

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/hr/certifications");
      setCerts(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleSave = async () => {
    if (!form.userId || !form.name) {
      toast.error("Employee and certification name are required");
      return;
    }
    try {
      await apiClient.post("/api/hr/certifications", {
        ...form,
        userId: Number(form.userId),
      });
      toast.success("Certification added");
      setDialogOpen(false);
      setForm({
        userId: "",
        name: "",
        issuer: "",
        certificateNumber: "",
        issuedDate: "",
        expiryDate: "",
        renewalReminderDays: 30,
      });
      fetchCerts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    try {
      await apiClient.delete(`/api/hr/certifications/${id}`);
      toast.success("Deleted");
      fetchCerts();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Certifications & Licences
        </Typography>
        <PermissionWrapper resource="human resource" action="canCreate">
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Add Certification
          </Button>
        </PermissionWrapper>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Issuer</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No certifications recorded
                </TableCell>
              </TableRow>
            ) : (
              certs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.user?.name || c.userId}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.issuer || "—"}</TableCell>
                  <TableCell>{c.certificateNumber || "—"}</TableCell>
                  <TableCell>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={c.status} color={statusColor(c.status)} />
                  </TableCell>
                  <TableCell align="right">
                    <PermissionWrapper resource="human resource" action="canDelete">
                      <Button size="small" color="error" onClick={() => handleDelete(c.id)}>
                        Delete
                      </Button>
                    </PermissionWrapper>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Certification</DialogTitle>
        <DialogContent>
          <EmployeePicker
            label="Employee"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          />
          <TextField fullWidth margin="dense" label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth margin="dense" label="Issuer" name="issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
          <TextField fullWidth margin="dense" label="Certificate #" name="certificateNumber" value={form.certificateNumber} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} />
          <TextField fullWidth margin="dense" type="date" label="Issued" InputLabelProps={{ shrink: true }} value={form.issuedDate} onChange={(e) => setForm({ ...form, issuedDate: e.target.value })} />
          <TextField fullWidth margin="dense" type="date" label="Expiry" InputLabelProps={{ shrink: true }} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Certifications;
