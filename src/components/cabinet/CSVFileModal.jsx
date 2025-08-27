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
  Alert,
  TextField,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import * as XLSX from "xlsx";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Description as FileIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

const requiredFields = [
  "modelName",
  "material",
  "height",
  "width",
  "depth",
  "basePrice",
  "pricePerSqft",
  "status",
];

const CSVFileModal = ({ open, onClose, onSuccess }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();

  // Sample template data
  const templateData = [
    {
      modelName: "Modern Kitchen Base",
      material: "Oak Wood",
      height: 36,
      width: 24,
      depth: 12,
      basePrice: 150.00,
      pricePerSqft: 12.50,
      status: "active"
    },
    {
      modelName: "Classic Wall Cabinet",
      material: "Maple Wood",
      height: 30,
      width: 18,
      depth: 12,
      basePrice: 120.00,
      pricePerSqft: 10.00,
      status: "active"
    },
    {
      modelName: "Premium Pantry",
      material: "Cherry Wood", 
      height: 84,
      width: 36,
      depth: 24,
      basePrice: 450.00,
      pricePerSqft: 18.75,
      status: "inactive"
    }
  ];

  // ✅ Row-level validation
  const validateRows = (data) => {
    let newErrors = {};
    let seenCombos = new Set();

    data.forEach((row, idx) => {
      let rowErrors = [];

      // 1. Required fields
      requiredFields.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          rowErrors.push(`${field} is required`);
        }
      });

      // 2. Numeric validation
      ["basePrice", "height", "width"].forEach((f) => {
        if (row[f] && (isNaN(row[f]) || Number(row[f]) <= 0)) {
          rowErrors.push(`${f} must be numeric > 0`);
        }
      });

      // 3. Status validation
      if (
        row.status &&
        !["active", "inactive"].includes(String(row.status).toLowerCase())
      ) {
        rowErrors.push("status must be Active or Inactive");
      }

      // 4. Duplicate check
      const combo = `${row.modelName || ""}-${row.material || ""}`;
      if (seenCombos.has(combo)) {
        rowErrors.push("Duplicate modelName + material");
      } else {
        seenCombos.add(combo);
      }

      if (rowErrors.length > 0) {
        newErrors[idx] = rowErrors;
      }
    });

    setErrors(newErrors);
  };

  // Download template function
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cabinet Template");
    XLSX.writeFile(wb, "cabinet_template.xlsx");
    toast.success("Template downloaded successfully!");
  };

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  // Handle file upload with validation
  const handleFileUpload = (file) => {
    if (!file || !validateFile(file)) return;

    setSelectedFile(file);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet);

        if (parsed.length === 0) {
          toast.error("The file appears to be empty or invalid");
          setUploading(false);
          return;
        }

        setRows(parsed);
        validateRows(parsed);
        toast.success(`Successfully loaded ${parsed.length} rows`);
      } catch (error) {
        toast.error("Error reading file. Please check the file format.");
        console.error("File reading error:", error);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  // Handle drag events
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
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  // Clear uploaded file
  const clearFile = () => {
    setSelectedFile(null);
    setRows([]);
    setErrors({});
    setUploading(false);
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
    toast.loading("Inserting data...");
    try {
      // only send valid rows
      const validRows = rows.filter((_, idx) => !errors[idx]);

      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to insert");
        return;
      }

      await axios.post(`${BASE_URL}/api/cabinet/csv`, {
        userId: user.id,
        cabinets: validRows,
      });

      toast.dismiss();
      toast.success("Data inserted successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.dismiss();
      toast.error("Failed to insert data");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FileIcon />
          Upload Cabinet Pricing
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Template Download Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="primary.main" gutterBottom>
                📋 Download Template First
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with sample data to understand the required format
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              size="small"
            >
              Download Template
            </Button>
          </Stack>
        </Paper>

        {/* File Upload Section */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            border: `2px dashed ${dragOver ? 'primary.main' : 'grey.300'}`,
            bgcolor: dragOver ? 'primary.50' : 'background.paper',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          
          <Stack alignItems="center" spacing={2}>
            <UploadIcon sx={{ fontSize: 48, color: dragOver ? 'primary.main' : 'grey.400' }} />
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {dragOver ? 'Drop your file here' : 'Drag & drop your file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                <Chip label="Excel (.xlsx)" size="small" variant="outlined" />
                <Chip label="Excel (.xls)" size="small" variant="outlined" />
                <Chip label="CSV" size="small" variant="outlined" />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Maximum file size: 5MB
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Upload Progress */}
        {uploading && (
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>Processing file...</Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Selected File Info */}
        {selectedFile && !uploading && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <SuccessIcon color="success" />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {rows.length} rows loaded
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Remove file">
                <IconButton onClick={clearFile} size="small">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        )}

        {/* Validation Summary */}
        {rows.length > 0 && (
          <Alert 
            severity={Object.keys(errors).length === 0 ? "success" : "warning"} 
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              {Object.keys(errors).length === 0 
                ? `✅ All ${rows.length} rows are valid and ready for upload`
                : `⚠️ ${Object.keys(errors).length} rows have errors out of ${rows.length} total rows`
              }
            </Typography>
          </Alert>
        )}

        {/* Table with inline editing */}
        {rows.length > 0 && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
              📊 Data Preview & Edit
            </Typography>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflow: 'auto', maxHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                        #
                      </th>
                      {requiredFields.map((field) => (
                        <th
                          key={field}
                          style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px', minWidth: '120px' }}
                        >
                          {field}
                        </th>
                      ))}
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px', minWidth: '150px' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} style={{ backgroundColor: errors[idx] ? '#ffebee' : 'white' }}>
                        <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                          {idx + 1}
                        </td>
                        {requiredFields.map((field) => (
                          <td key={field} style={{ border: '1px solid #ddd', padding: '4px' }}>
                            <TextField
                              value={row[field] || ""}
                              onChange={(e) => handleEdit(idx, field, e.target.value)}
                              size="small"
                              variant="outlined"
                              fullWidth
                              error={errors[idx]?.some(err => err.includes(field))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  fontSize: '12px',
                                  '& fieldset': {
                                    borderWidth: '1px'
                                  }
                                }
                              }}
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                          {errors[idx] ? (
                            <Stack spacing={0.5}>
                              {errors[idx].map((err, i) => (
                                <Chip
                                  key={i}
                                  label={err}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{ fontSize: '10px', height: '20px' }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Chip 
                              label="✓ Valid" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ fontSize: '10px', height: '20px' }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={downloadTemplate}
          startIcon={<DownloadIcon />}
          size="large"
        >
          Download Template
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={rows.length === 0 || Object.keys(errors).length > 0}
          size="large"
          startIcon={<UploadIcon />}
        >
          {Object.keys(errors).length > 0 
            ? `Fix ${Object.keys(errors).length} Errors First` 
            : `Upload ${rows.length} Records`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVFileModal;
