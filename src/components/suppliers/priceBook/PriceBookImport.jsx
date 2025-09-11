"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Button,
} from "@mui/material";
import * as XLSX from "xlsx";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import { useParams } from "next/navigation";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  DeleteOutline as DeleteIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

// ✅ Required fields for PriceBook (per schema); Description optional
const requiredFields = ["Name", "Category", "Unit", "Price", "Status"];
const allFields = ["Name", "Description", "Category", "Unit", "Price", "Status"]; 

// ✅ Sample template (Title Case headers)
const templateData = [
  {
    Name: "Oak Wood Plank",
    Description: "High quality oak wood plank, 2x4 inches",
    Category: "Wood",
    Unit: "piece",
    Price: "25.50",
    Status: "Active",
  },
  {
    Name: "Steel Handle",
    Description: "Durable stainless steel cabinet handle",
    Category: "Hardware",
    Unit: "set",
    Price: "12.00",
    Status: "Active",
  },
  {
    Name: "Paint Bucket",
    Description: "5-liter white wall paint",
    Category: "Paint",
    Unit: "bucket",
    Price: "35.00",
    Status: "Inactive",
  },
];

const PriceBookImport = () => {
    const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();
  const params = useParams();
  const supplierId = params?.id || params?.supplierId || null;

  // ✅ Validate PriceBook rows
  const validateRows = (data) => {
    let newErrors = {};
    data.forEach((row, idx) => {
      let rowErrors = [];

      requiredFields.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          rowErrors.push(`${field} is required`);
        }
      });

      if (row.Price && isNaN(Number(row.Price))) {
        rowErrors.push("Price must be a valid number");
      }

      if (row.Status && !["active", "inactive"].includes(String(row.Status).toLowerCase())) {
        rowErrors.push("Status must be Active or Inactive");
      }

      if (rowErrors.length > 0) {
        newErrors[idx] = rowErrors;
      }
    });
    setErrors(newErrors);
  };

  // ✅ Download template
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PriceBook Template");
    XLSX.writeFile(wb, "Supplier Pricebook VSP.xlsx");
    toast.success("PriceBook template downloaded successfully!");
  };

  // ✅ File type validation
  const validateFile = (file) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Only Excel/CSV files allowed");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return false;
    }
    return true;
  };

  // ✅ Handle file upload
  const handleFileUpload = (file) => {
    if (!file || !validateFile(file)) return;
    setSelectedFile(file);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result );
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet);

        if (parsed.length === 0) {
          toast.error("File is empty or invalid");
          setUploading(false);
          return;
        }

        setRows(parsed );
        validateRows(parsed);
        toast.success(`Loaded ${parsed.length} price book items`);
      } catch (err) {
        toast.error("Error reading file");
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (e) => {
    if (e.target.files) handleFileUpload(e.target.files[0]);
  };

  // ✅ Drag-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setRows([]);
    setErrors({});
    setUploading(false);
  };

  const handleEdit = (rowIdx, field, value) => {
    const updated = [...rows];
    updated[rowIdx][field] = value;
    setRows(updated);
    validateRows(updated);
  };

  // ✅ Confirm upload
  const handleConfirm = async () => {
    toast.loading("Importing PriceBook...");
    try {
      const validRows = rows.filter((_, idx) => !errors[idx]);
      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to import");
        return;
      }

      // Normalize and build payload per schema
      const items = validRows.map((row) => ({
        name: String(row.Name || '').trim(),
        description: String(row.Description || '').trim(),
        category: String(row.Category || '').trim(),
        unit: String(row.Unit || '').trim(),
        price: Number(row.Price),
        status: String(row.Status || 'Active').toLowerCase(),
      }))

      const res= await axios.post(`${BASE_URL}/api/pricebook/import`, {
        userId: user?.id,
        supplierId,
        items,
      });

      toast.dismiss();
      toast.success(res.data.message);
      clearFile();
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to import PriceBook");
    }
  };

  return (
    <Box p={4}>
      {/* Page Header */}
      <Typography variant="h5" mb={3} display="flex" alignItems="center" gap={1}>
        <CategoryIcon /> Import PriceBook Data
      </Typography>

      {/* Template Download */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: "warning.50", border: "1px solid", borderColor: "warning.200" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="warning.main">
              📦 Download PriceBook Template
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download Excel template with sample PriceBook items
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadTemplate} color="warning">
            Download Template
          </Button>
        </Stack>
      </Paper>

      {/* File Upload Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: `2px dashed ${dragOver ? "warning.main" : "grey.300"}`,
          bgcolor: dragOver ? "warning.50" : "background.paper",
          textAlign: "center",
          cursor: "pointer",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("pricebook-file-input")?.click()}
      >
        <input
          id="pricebook-file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
        <UploadIcon sx={{ fontSize: 48, color: dragOver ? "warning.main" : "grey.400" }} />
        <Typography variant="h6">
          {dragOver ? "Drop your PriceBook file here" : "Drag & drop PriceBook file or click to browse"}
        </Typography>
      </Paper>

      {uploading && (
        <Box mb={2}>
          <Typography>Processing file...</Typography>
          <LinearProgress color="warning" />
        </Box>
      )}

      {selectedFile && !uploading && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "success.50", border: "1px solid", borderColor: "success.200" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <SuccessIcon color="success" />
              <Box>
                <Typography>{selectedFile.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {rows.length} items loaded
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Remove file">
              <IconButton onClick={clearFile}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      )}

      {rows.length > 0 && (
        <Alert severity={Object.keys(errors).length === 0 ? "success" : "warning"} sx={{ mb: 2 }}>
          {Object.keys(errors).length === 0
            ? `✅ All ${rows.length} items valid`
            : `⚠️ ${Object.keys(errors).length} rows have errors`}
        </Alert>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <Paper>
          <Box sx={{ overflow: "auto", maxHeight: "500px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: "#fff3e0" }}>
                <tr>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>#</th>
                  {allFields.map((field) => (
                    <th key={field} style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {field}
                    </th>
                  ))}
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Validation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} style={{ background: errors[idx] ? "#ffebee" : "white" }}>
                    <td style={{ padding: "4px", border: "1px solid #ddd", fontWeight: "bold" }}>{idx + 1}</td>
                    {allFields.map((field) => (
                      <td key={field} style={{ padding: "4px", border: "1px solid #ddd" }}>
                        <TextField
                          value={row[field] || ""}
                          onChange={(e) => handleEdit(idx, field, e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </td>
                    ))}
                    <td style={{ padding: "4px", border: "1px solid #ddd" }}>
                      {errors[idx] ? (
                        <Stack spacing={0.5}>
                          {errors[idx].map((err, i) => (
                            <Chip key={i} label={err} size="small" color="error" />
                          ))}
                        </Stack>
                      ) : (
                        <Chip label="✓ Valid" size="small" color="success" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Actions */}
      {rows.length > 0 && (
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="outlined" onClick={downloadTemplate} startIcon={<DownloadIcon />} color="warning">
            Download Template
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={rows.length === 0 || Object.keys(errors).length > 0}
            startIcon={<UploadIcon />}
            color="warning"
          >
            {Object.keys(errors).length > 0
              ? `Fix ${Object.keys(errors).length} Errors First`
              : `Import ${rows.length} Items`}
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default PriceBookImport;
