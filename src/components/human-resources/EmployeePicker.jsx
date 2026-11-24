"use client";

import React, { useEffect, useState } from "react";
import { TextField, MenuItem, CircularProgress } from "@mui/material";
import apiClient from "@/lib/axios";

const EmployeePicker = ({
  value,
  onChange,
  label = "Employee",
  name = "employeeId",
  fullWidth = true,
  margin = "dense",
  required = false,
  size,
}) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get("/api/user/get?limit=500");
        setStaff(res.data.users || res.data.data || []);
      } catch {
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <TextField
        fullWidth={fullWidth}
        margin={margin}
        label={label}
        disabled
        InputProps={{ endAdornment: <CircularProgress size={18} /> }}
      />
    );
  }

  return (
    <TextField
      select
      fullWidth={fullWidth}
      margin={margin}
      size={size}
      required={required}
      label={label}
      name={name}
      value={value ?? ""}
      onChange={onChange}
    >
      <MenuItem value="">Select employee</MenuItem>
      {staff.map((u) => (
        <MenuItem key={u.id} value={String(u.id)}>
          {u.name} ({u.email})
        </MenuItem>
      ))}
    </TextField>
  );
};

export default EmployeePicker;
