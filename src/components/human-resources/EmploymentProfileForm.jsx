"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import apiClient from "@/lib/axios";

import EmployeePicker from "./EmployeePicker";

const defaultProfile = {
  employeeNumber: "",
  department: "",
  jobTitle: "",
  costCentre: "",
  managerId: "",
  employmentType: "full_time",
  startDate: "",
  endDate: "",
  standardHoursPerWeek: 40,
  standardHoursPerDay: 8,
  hourlyRate: "",
  annualSalary: "",
  irdTaxCode: "M",
  kiwiSaverEnrolled: false,
  kiwiSaverRate: 3,
  kiwiSaverEmployerRate: 3,
  bankAccount: "",
};

export default function EmploymentProfileForm({ userId, initialProfile, linkedWorker, onSaved }) {
  const [form, setForm] = useState({ ...defaultProfile, ...initialProfile });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...defaultProfile, ...initialProfile });
  }, [initialProfile, userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/api/hr/employees/${userId}/profile`, form);
      toast.success("Employment profile saved");
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Employment Profile
          </Typography>
          {linkedWorker && (
            <Typography variant="body2" color="text.secondary">
              Linked worker: {linkedWorker.firstName} {linkedWorker.lastName} (ID {linkedWorker.id})
            </Typography>
          )}
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Employee #" name="employeeNumber" value={form.employeeNumber || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Department" name="department" value={form.department || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Job Title" name="jobTitle" value={form.jobTitle || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Cost Centre" name="costCentre" value={form.costCentre || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <EmployeePicker
              label="Line Manager"
              name="managerId"
              value={form.managerId ? String(form.managerId) : ""}
              onChange={(e) => setForm((prev) => ({ ...prev, managerId: e.target.value ? Number(e.target.value) : null }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth size="small" label="Employment Type" name="employmentType" value={form.employmentType || "full_time"} onChange={handleChange}>
              <MenuItem value="full_time">Full time</MenuItem>
              <MenuItem value="part_time">Part time</MenuItem>
              <MenuItem value="contractor">Contractor</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="IRD Tax Code" name="irdTaxCode" value={form.irdTaxCode || "M"} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="date" label="Start Date" name="startDate" InputLabelProps={{ shrink: true }} value={form.startDate?.slice?.(0, 10) || form.startDate || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="number" label="Hours / week" name="standardHoursPerWeek" value={form.standardHoursPerWeek || 40} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="number" label="Hours / day" name="standardHoursPerDay" value={form.standardHoursPerDay || 8} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="number" label="Hourly Rate" name="hourlyRate" value={form.hourlyRate || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" type="number" label="Annual Salary" name="annualSalary" value={form.annualSalary || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Bank Account" name="bankAccount" value={form.bankAccount || ""} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="number" label="KS %" name="kiwiSaverRate" value={form.kiwiSaverRate || 3} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="number" label="KS Employer %" name="kiwiSaverEmployerRate" value={form.kiwiSaverEmployerRate || 3} onChange={handleChange} />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Employment Profile"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
