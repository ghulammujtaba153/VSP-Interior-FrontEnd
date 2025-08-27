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
  People as PeopleIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();

  // Sample template data for clients
  const templateData = [
    {
      companyName: "Modern Kitchen Designs LLC",
      emailAddress: "contact@modernkitchens.com",
      phoneNumber: "+1-555-0123",
      address: "123 Design Avenue, Kitchen City, State 12345",
      postCode: "12345",
      status: "active",
      notes: "Premium residential kitchen design services"
    },
    {
      companyName: "Home Renovation Pros",
      emailAddress: "info@homerenovationpros.com", 
      phoneNumber: "+1-555-0456",
      address: "456 Renovation Street, Home Valley, State 67890",
      postCode: "67890",
      status: "active",
      notes: "Full-service home renovation and remodeling"
    },
    {
      companyName: "Luxury Cabinet Solutions",
      emailAddress: "sales@luxurycabinets.net",
      phoneNumber: "+1-555-0789",
      address: "789 Luxury Lane, Cabinet Heights, State 54321",
      postCode: "54321", 
      status: "inactive",
      notes: "High-end custom cabinet installations"
    }
  ];

  // ✅ Enhanced row-level validation for clients
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
      if (row.emailAddress) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.emailAddress)) {
          rowErrors.push("Invalid email format");
        }
      }

      // 3. Enhanced phone validation
      if (row.phoneNumber) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(row.phoneNumber)) {
          rowErrors.push("Invalid phone number format");
        }
      }

      // 4. Status validation
      if (
        row.status &&
        !["active", "inactive"].includes(String(row.status).toLowerCase())
      ) {
        rowErrors.push("status must be Active or Inactive");
      }

      // 5. Postal code validation
      if (row.postCode && !/^[A-Za-z0-9\s\-]{3,10}$/.test(row.postCode)) {
        rowErrors.push("Invalid postal code format");
      }

      // 6. Duplicate email in file
      if (row.emailAddress) {
        if (seenEmails.has(row.emailAddress.toLowerCase())) {
          rowErrors.push("Duplicate email in file");
        } else {
          seenEmails.add(row.emailAddress.toLowerCase());
        }
      }

      // 7. Duplicate company name in file
      if (row.companyName) {
        if (seenCompanyNames.has(row.companyName.toLowerCase())) {
          rowErrors.push("Duplicate company name in file");
        } else {
          seenCompanyNames.add(row.companyName.toLowerCase());
        }
      }

      // 8. Company name length validation
      if (row.companyName && row.companyName.length < 2) {
        rowErrors.push("Company name must be at least 2 characters");
      }

      // 9. Address length validation
      if (row.address && row.address.length < 10) {
        rowErrors.push("Address must be at least 10 characters");
      }

      // 10. Business email domain validation (optional enhancement)
      if (row.emailAddress && /^[^\s@]+@(gmail|yahoo|hotmail|outlook)\./.test(row.emailAddress.toLowerCase())) {
        // This is just a warning, not an error - many small businesses use personal email domains
        // We could add this as a warning system later
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
    XLSX.utils.book_append_sheet(wb, ws, "Clients Template");
    XLSX.writeFile(wb, "clients_template.xlsx");
    toast.success("Clients template downloaded successfully!");
  };

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB for client files

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
        toast.success(`Successfully loaded ${parsed.length} clients`);
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
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon />
          Import Clients Data
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Template Download Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'secondary.50', border: '1px solid', borderColor: 'secondary.200' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="secondary.main" gutterBottom>
                👥 Download Clients Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with sample client data and proper field format
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              size="small"
              color="secondary"
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
            border: `2px dashed ${dragOver ? 'secondary.main' : 'grey.300'}`,
            bgcolor: dragOver ? 'secondary.50' : 'background.paper',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'secondary.main',
              bgcolor: 'secondary.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('clients-file-input').click()}
        >
          <input
            id="clients-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          
          <Stack alignItems="center" spacing={2}>
            <UploadIcon sx={{ fontSize: 48, color: dragOver ? 'secondary.main' : 'grey.400' }} />
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {dragOver ? 'Drop your clients file here' : 'Drag & drop your clients file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                <Chip label="Excel (.xlsx)" size="small" variant="outlined" color="secondary" />
                <Chip label="Excel (.xls)" size="small" variant="outlined" color="secondary" />
                <Chip label="CSV" size="small" variant="outlined" color="secondary" />
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
            <Typography variant="body2" gutterBottom>Processing clients file...</Typography>
            <LinearProgress color="secondary" />
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
                    {(selectedFile.size / 1024).toFixed(1)} KB • {rows.length} clients loaded
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
                ? `✅ All ${rows.length} clients are valid and ready for import`
                : `⚠️ ${Object.keys(errors).length} clients have errors out of ${rows.length} total clients`
              }
            </Typography>
          </Alert>
        )}

        {/* Table with inline editing */}
        {rows.length > 0 && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
              👥 Clients Data Preview & Edit
            </Typography>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflow: 'auto', maxHeight: '500px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f3e5f5', zIndex: 1 }}>
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
                              field === 'companyName' ? '180px' :
                              field === 'emailAddress' ? '180px' : '130px'
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
                              type={field === 'emailAddress' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'}
                              placeholder={
                                field === 'emailAddress' ? 'contact@company.com' :
                                field === 'phoneNumber' ? '+1-555-0123' :
                                field === 'postCode' ? '12345' :
                                field === 'companyName' ? 'Company Name LLC' : ''
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
                              label="✓ Valid Client" 
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
          color="secondary"
        >
          Download Template
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={rows.length === 0 || Object.keys(errors).length > 0}
          size="large"
          startIcon={<UploadIcon />}
          color="secondary"
        >
          {Object.keys(errors).length > 0 
            ? `Fix ${Object.keys(errors).length} Errors First` 
            : `Import ${rows.length} Clients`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
