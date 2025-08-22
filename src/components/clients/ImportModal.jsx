"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import * as XLSX from "xlsx";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";

// ✅ Required fields (notes removed)
const requiredFields = [
  "companyName",
  "emailAddress",
  "phoneNumber",
  "address",
  "postCode",
  "status",
];

// ✅ All fields (for table display)
const allFields = [
  ...requiredFields,
  "notes", // optional, still shown in table
];

const ImportModal = ({ open, onClose, refreshClients }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  // ✅ Row-level validation
  const validateRows = (data) => {
    let newErrors = {};
    let seenEmails = new Set();

    data.forEach((row, idx) => {
      let rowErrors = [];

      // 1. Required fields
      requiredFields.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          rowErrors.push(`${field} is required`);
        }
      });

      // 2. Email validation
      if (row.emailAddress && !/\S+@\S+\.\S+/.test(row.emailAddress)) {
        rowErrors.push("Invalid email format");
      }

      // 3. Phone validation
      if (row.phoneNumber && !/^[0-9+\-()\s]+$/.test(row.phoneNumber)) {
        rowErrors.push("Invalid phone number");
      }

      // 4. Status validation
      if (
        row.status &&
        !["active", "inactive"].includes(String(row.status).toLowerCase())
      ) {
        rowErrors.push("status must be Active or Inactive");
      }

      // 5. Duplicate email in file
      if (row.emailAddress) {
        if (seenEmails.has(row.emailAddress.toLowerCase())) {
          rowErrors.push("Duplicate email in file");
        } else {
          seenEmails.add(row.emailAddress.toLowerCase());
        }
      }

      if (rowErrors.length > 0) {
        newErrors[idx] = rowErrors;
      }
    });

    setErrors(newErrors);
  };

  // ✅ Handle Excel/CSV upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);

      setRows(parsed);
      validateRows(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  // ✅ Edit a cell
  const handleEdit = (rowIdx, field, value) => {
    const updated = [...rows];
    updated[rowIdx][field] = value;
    setRows(updated);
    validateRows(updated);
  };

  // ✅ Confirm upload
  const handleConfirm = async () => {
    toast.loading("Importing clients...");
    try {
      const validRows = rows.filter((_, idx) => !errors[idx]);

      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to insert");
        return;
      }

      await axios.post(`${BASE_URL}/api/client/import`, {
        userId: user.id,
        clients: validRows,
      });

      toast.dismiss();
      toast.success("Clients imported successfully");
      refreshClients();
      onClose();
    } catch (error) {
      console.error("Error importing clients:", error);
      toast.dismiss();
      toast.error("Failed to import clients");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Import Clients (Excel/CSV)</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
          />
        </Box>

        {/* Table with inline editing */}
        {rows.length > 0 && (
          <Box>
            <Typography variant="h6" mb={1}>
              Preview & Edit
            </Typography>
            <table className="border-collapse border border-gray-400 w-full text-sm">
              <thead>
                <tr>
                  {allFields.map((field) => (
                    <th
                      key={field}
                      className="border border-gray-400 px-2 py-1 bg-gray-100"
                    >
                      {field}
                    </th>
                  ))}
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {allFields.map((field) => (
                      <td
                        key={field}
                        className="border border-gray-300 px-2 py-1"
                      >
                        <TextField
                          value={row[field] || ""}
                          onChange={(e) =>
                            handleEdit(idx, field, e.target.value)
                          }
                          size="small"
                          variant="outlined"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 px-2 py-1 text-red-600">
                      {errors[idx]?.map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={rows.length === 0}
        >
          Confirm & Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
