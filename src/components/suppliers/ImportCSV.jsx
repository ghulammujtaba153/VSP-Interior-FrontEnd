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
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import * as XLSX from "xlsx";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

// ✅ Required fields (notes is optional)
const requiredFields = [
  "Name",
  "Email",
  "Phone",
  "Address",
  "Post Code",
  "Status",
  "Is Company",
];

// ✅ All fields (for table display)
const allFields = [...requiredFields, "Notes"]; // notes shown but optional

const ImportModal = ({ open, onClose, fetchSuppliers }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();

  // Sample template data for suppliers
  const templateData = [
    {
      "Name": "ABC Wood Supplies",
      "Email": "contact@abcwood.com",
      "Phone": "+1-555-0123",
      "Address": "123 Industrial Blvd, Woodville, State 12345",
      "Post Code": "12345",
      "Status": "Active",
      "Is Company": "Yes",
      "Notes": "Primary supplier for hardwood materials"
    },
    {
      "Name": "Premier Hardware Co.",
      "Email": "sales@premierhardware.com", 
      "Phone": "+1-555-0456",
      "Address": "456 Commerce Street, Hardware City, State 67890",
      "Post Code": "67890",
      "Status": "Active",
      "Is Company": "Yes",
      "Notes": "Specializes in cabinet hardware and hinges"
    },
    {
      "Name": "Quality Tools Inc.",
      "Email": "info@qualitytools.net",
      "Phone": "+1-555-0789",
      "Address": "789 Tool Way, Craftsman Valley, State 54321",
      "Post Code": "54321", 
      "Status": "Inactive",
      "Is Company": "No",
      "Notes": "Secondary supplier for power tools and accessories"
    }
  ];

  // ✅ Enhanced row-level validation for suppliers
  const validateRows = (data) => {
    let newErrors = {};
    let seenEmails = new Set();
    let seenCompanyNames = new Set();

    data.forEach((row, idx) => {
      let rowErrors = [];

      // 1. Required fields
      requiredFields.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          rowErrors.push(`${field} is required`);
        }
      });

      // 2. Enhanced email validation
      if (row.Email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.Email)) {
          rowErrors.push("Invalid email format");
        }
      }

      // 3. Enhanced phone validation
      if (row.Phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(row.Phone)) {
          rowErrors.push("Invalid phone number format");
        }
      }

      // 4. Status validation
      if (
        row.Status &&
        !["active", "inactive"].includes(String(row.Status).toLowerCase())
      ) {
        rowErrors.push("status must be Active or Inactive");
      }

      // 5. Postal code validation
      if (row["Post Code"] && !/^[A-Za-z0-9\s\-]{3,10}$/.test(row["Post Code"])) {
        rowErrors.push("Invalid postal code format");
      }

      // 6. Duplicate email in file
      if (row.Email) {
        if (seenEmails.has(row.Email.toLowerCase())) {
          rowErrors.push("Duplicate email in file");
        } else {
          seenEmails.add(row.Email.toLowerCase());
        }
      }

      // 7. Duplicate company name in file
      if (row.Name) {
        if (seenCompanyNames.has(row.Name.toLowerCase())) {
          rowErrors.push("Duplicate company name in file");
        } else {
          seenCompanyNames.add(row.Name.toLowerCase());
        }
      }

      // 8. Company name length validation
      if (row.Name && row.Name.length < 2) {
        rowErrors.push("Company name must be at least 2 characters");
      }

      // 9. Address length validation
      if (row.Address && row.Address.length < 10) {
        rowErrors.push("Address must be at least 10 characters");
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
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers Template");
    XLSX.writeFile(wb, "Suppliers VSP.xlsx");
    toast.success("Suppliers template downloaded successfully!");
  };

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB for supplier files

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

        // Normalize keys to match our template headers capitalization for preview/edit
        const normalized = parsed.map((row) => {
          const out = {}
          Object.entries(row).forEach(([k, v]) => {
            // Keep provided keys as-is; if lower-case versions match our headers, upcase them
            const keyMap = {
              companyName: 'Name',
              email: 'Email',
              phone: 'Phone',
              address: 'Address',
              postCode: 'Post Code',
              status: 'Status',
              notes: 'Notes',
              isCompany: 'Is Company'
            }
            const mapped = keyMap[k] || k
            out[mapped] = v
          })
          return out
        })
        setRows(normalized);
        validateRows(normalized);
        toast.success(`Successfully loaded ${parsed.length} suppliers`);
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
    toast.loading("Importing suppliers...");
    try {
      const validRows = rows.filter((_, idx) => !errors[idx]);

      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to insert");
        return;
      }

      // Map Title Case CSV fields to API schema (lower camelCase + types)
      const suppliersPayload = validRows.map((row) => {
        const statusRaw = (row["Status"] || "").toString().trim().toLowerCase();
        const isCompanyRaw = (row["Is Company"] || "").toString().trim().toLowerCase();
        return {
          name: row["Name"]?.toString().trim() || "",
          email: row["Email"]?.toString().trim() || "",
          phone: row["Phone"]?.toString().trim() || "",
          address: row["Address"]?.toString().trim() || "",
          postCode: row["Post Code"]?.toString().trim() || "",
          status: ["active", "inactive"].includes(statusRaw) ? statusRaw : "active",
          notes: row["Notes"]?.toString().trim() || "",
          isCompany: isCompanyRaw === "yes" || isCompanyRaw === "true",
        };
      });

      const res = await axios.post(`${BASE_URL}/api/suppliers/import`, {
        userId: user.id,
        suppliers: suppliersPayload,
      });

      toast.dismiss();
      toast.success(res.data.message);
      fetchSuppliers();
      onClose();
    } catch (error) {
      console.error("Error importing suppliers:", error);
      toast.dismiss();
      toast.error("Failed to import suppliers");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon />
          Import Suppliers Data
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Template Download Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="warning.main" gutterBottom>
                🏢 Download Suppliers Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with sample supplier data and proper field format
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              size="small"
              color="warning"
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
            border: `2px dashed ${dragOver ? 'warning.main' : 'grey.300'}`,
            bgcolor: dragOver ? 'warning.50' : 'background.paper',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'warning.main',
              bgcolor: 'warning.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('suppliers-file-input').click()}
        >
          <input
            id="suppliers-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          
          <Stack alignItems="center" spacing={2}>
            <UploadIcon sx={{ fontSize: 48, color: dragOver ? 'warning.main' : 'grey.400' }} />
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {dragOver ? 'Drop your suppliers file here' : 'Drag & drop your suppliers file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                <Chip label="Excel (.xlsx)" size="small" variant="outlined" color="warning" />
                <Chip label="Excel (.xls)" size="small" variant="outlined" color="warning" />
                <Chip label="CSV" size="small" variant="outlined" color="warning" />
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
            <Typography variant="body2" gutterBottom>Processing suppliers file...</Typography>
            <LinearProgress color="warning" />
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
                    {(selectedFile.size / 1024).toFixed(1)} KB • {rows.length} suppliers loaded
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
                ? `✅ All ${rows.length} suppliers are valid and ready for import`
                : `⚠️ ${Object.keys(errors).length} suppliers have errors out of ${rows.length} total suppliers`
              }
            </Typography>
          </Alert>
        )}

        {/* Table with inline editing */}
        {rows.length > 0 && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
              🏢 Suppliers Data Preview & Edit
            </Typography>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflow: 'auto', maxHeight: '500px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff3e0', zIndex: 1 }}>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                        #
                      </th>
                      {allFields.map((field) => (
                        <th
                          key={field}
                          style={{ 
                            border: '1px solid #ddd', 
                            padding: '8px', 
                            fontWeight: 'bold', 
                            fontSize: '12px', 
                            minWidth: 
                              field === 'address' ? '250px' : 
                              field === 'notes' ? '200px' :
                              field === 'companyName' ? '180px' : '130px'
                          }}
                        >
                          {field}
                        </th>
                      ))}
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px', minWidth: '180px' }}>
                        Validation Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} style={{ backgroundColor: errors[idx] ? '#ffebee' : 'white' }}>
                        <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                          {idx + 1}
                        </td>
                        {allFields.map((field) => (
                          <td key={field} style={{ border: '1px solid #ddd', padding: '4px' }}>
                            <TextField
                              value={row[field] || ""}
                              onChange={(e) => handleEdit(idx, field, e.target.value)}
                              size="small"
                              variant="outlined"
                              fullWidth
                              multiline={['address', 'notes'].includes(field)}
                              rows={
                                field === 'address' ? 2 : 
                                field === 'notes' ? 2 : 1
                              }
                              error={errors[idx]?.some(err => err.includes(field))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  fontSize: '12px',
                                  '& fieldset': {
                                    borderWidth: '1px'
                                  }
                                }
                              }}
                              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                              placeholder={
                                field === 'email' ? 'example@company.com' :
                                field === 'phone' ? '+1-555-0123' :
                                field === 'postCode' ? '12345' : ''
                              }
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
                                  sx={{ fontSize: '9px', height: '18px' }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Chip 
                              label="✓ Valid Supplier" 
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
          color="warning"
        >
          Download Template
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={rows.length === 0 || Object.keys(errors).length > 0}
          size="large"
          startIcon={<UploadIcon />}
          color="warning"
        >
          {Object.keys(errors).length > 0 
            ? `Fix ${Object.keys(errors).length} Errors First` 
            : `Import ${rows.length} Suppliers`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
