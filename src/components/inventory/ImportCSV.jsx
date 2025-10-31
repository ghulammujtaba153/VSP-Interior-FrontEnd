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
  Inventory as InventoryIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import ConfirmationDialog from "../ConfirmationDialog";

// ✅ Inventory schema fields (first letter capitalized for CSV)
const schemaFields = [
  "Name",
  "Description",
  "Category",
  "Supplier Name",
  "PriceBook",
  "Unit",
  "CostPrice",
  "Quantity",
  "Notes",
  "Status",
];

// Sample template data for inventory (first letter capitalized) - aligned with inventory schema
const templateData = [
  {
    Name: "Wood Screws 2 inch",
    Description: "Phillips head wood screws for cabinet assembly",
    Category: "Hardware",
    "Supplier Name": "Premier hardware co.",
    PriceBook: "Cabinet hinges",
    Unit: "pieces",
    CostPrice: 0.25,
    Quantity: 500,
    Notes: "For cabinet jobs",
    Status: "active"
  },
  {
    Name: "Cabinet Hinges",
    Description: "Soft-close hinges for cabinet doors",
    Category: "Hardware",
    "Supplier Name": "Premier hardware co.",
    PriceBook: "Cabinet hinges",
    Unit: "pairs",
    CostPrice: 12.50,
    Quantity: 75,
    Notes: "Quality hinges",
    Status: "active"
  },
  {
    Name: "Oak Wood Board",
    Description: "Premium oak board 1x6x8 feet",
    Category: "Materials",
    "Supplier Name": "Premier hardware co.",
    PriceBook: "Cabinet hinges",
    Unit: "pieces",
    CostPrice: 45.00,
    Quantity: 25,
    Notes: "Premium stock",
    Status: "active"
  }
];

const ImportCSV = ({ open, onClose, fetchData }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const { user } = useAuth();

  // Validate rows according to schema
  const validateRows = (data) => {
    let newErrors = {};
    data.forEach((row, idx) => {
      let rowErrors = [];
      // Required fields (exclude Notes and Description)
      const optionalFields = ["Notes", "Description"];
      schemaFields.forEach((field) => {
        if (
          !optionalFields.includes(field) && // Notes and Description are optional
          (!row[field] && row[field] !== 0)
        ) {
          rowErrors.push(`${field} is required`);
        }
      });
      // Numeric validation
      ["CostPrice", "Quantity"].forEach((field) => {
        if (row[field] && (isNaN(row[field]) || Number(row[field]) < 0)) {
          rowErrors.push(`${field} must be a positive number`);
        }
      });
      // Status validation
      if (
        row.Status &&
        !["active", "inactive"].includes(String(row.Status).toLowerCase())
      ) {
        rowErrors.push("Status must be Active or Inactive");
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
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");
    XLSX.writeFile(wb, "Inventory VSP.xlsx");
    toast.success("Inventory template downloaded successfully!");
  };

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB for inventory files

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
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
        toast.success(`Successfully loaded ${parsed.length} inventory items`);
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

  // Edit a cell
  const handleEdit = (rowIdx, field, value) => {
    const updated = [...rows];
    updated[rowIdx][field] = value;
    setRows(updated);
    validateRows(updated);
  };

  // Confirm upload
  const handleConfirm = async () => {
    toast.loading("Importing inventory...");
    try {
      const validRows = rows.filter((_, idx) => !errors[idx]);
      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to insert");
        return;
      }
      // Convert keys to match backend schema (lowercase first letter)
      const backendRows = validRows.map(row => {
        const mapped = {};
        schemaFields.forEach(field => {
          // Special handling for specific fields
          if (field === "Supplier Name") {
            mapped["supplierName"] = row[field];
          } else if (field === "PriceBook") {
            mapped["priceBook"] = row[field]; // Send to backend for lookup
            mapped["unit"] = row["Unit"]; // Include unit for pricebook
          } else if (field === "Category") {
            mapped["category"] = row[field]; // Send to backend for lookup
          } else if (field === "Unit") {
            // Unit is already handled in PriceBook mapping, skip adding it again
            return;
          } else {
            const backendKey = field.charAt(0).toLowerCase() + field.slice(1);
            mapped[backendKey] = row[field];
          }
        });
        return mapped;
      });

      const res = await axios.post(`${BASE_URL}/api/inventory/import`, {
        userId: user.id,
        inventory: backendRows,
      });

      toast.dismiss();
      toast.success(res.data.message);
      fetchData();
      onClose();
    } catch (error) {
      console.error("Error importing inventory:", error);
      toast.dismiss();
      
      // Handle validation errors with detailed information
      if (error.response?.data?.skippedSuppliers) {
        toast.error(
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {error.response.data.message}
            </div>
            <div style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
              {error.response.data.skippedSuppliers.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: idx < error.response.data.skippedSuppliers.length - 1 ? '1px solid #ddd' : 'none' }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Item: {item.itemName}</div>
                  <div style={{ marginLeft: '10px', fontSize: '10px' }}>
                    <div>• Supplier: <strong>{item.supplierName}</strong></div>
                    <div>• Category: <strong>{item.category}</strong></div>
                    <div>• Price Book: <strong>{item.priceBook}</strong></div>
                    <div style={{ color: '#d32f2f', marginTop: '4px' }}>❌ {item.reason}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
              Please add the missing suppliers, categories, or pricebooks in the database first.
            </div>
          </div>,
          { autoClose: 15000 }
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to import inventory");
      }
    }
  };

  // Handle close with confirmation
  const handleCloseRequest = () => {
    // Only show confirmation if there's data loaded
    if (rows.length > 0) {
      setCloseConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setCloseConfirmOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseRequest} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InventoryIcon />
          Import Inventory Data
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Template Download Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="info.main" gutterBottom>
                📦 Download Inventory Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with sample inventory data and proper field format
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
            border: `2px dashed ${dragOver ? 'info.main' : 'grey.300'}`,
            bgcolor: dragOver ? 'info.50' : 'background.paper',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'info.main',
              bgcolor: 'info.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('inventory-file-input').click()}
        >
          <input
            id="inventory-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          
          <Stack alignItems="center" spacing={2}>
            <UploadIcon sx={{ fontSize: 48, color: dragOver ? 'info.main' : 'grey.400' }} />
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {dragOver ? 'Drop your inventory file here' : 'Drag & drop your inventory file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                <Chip label="Excel (.xlsx)" size="small" variant="outlined" color="info" />
                <Chip label="Excel (.xls)" size="small" variant="outlined" color="info" />
                <Chip label="CSV" size="small" variant="outlined" color="info" />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Maximum file size: 10MB
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Upload Progress */}
        {uploading && (
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>Processing inventory file...</Typography>
            <LinearProgress color="info" />
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
                    {(selectedFile.size / 1024).toFixed(1)} KB • {rows.length} inventory items loaded
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
                ? `✅ All ${rows.length} inventory items are valid and ready for import`
                : `⚠️ ${Object.keys(errors).length} items have errors out of ${rows.length} total items`
              }
            </Typography>
          </Alert>
        )}

        {/* Table with inline editing */}
        {rows.length > 0 && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
              📋 Inventory Data Preview & Edit
            </Typography>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflow: 'auto', maxHeight: '500px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#e3f2fd', zIndex: 1 }}>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                        #
                      </th>
                       {schemaFields.map((field) => {
                         const isRequired = field !== "Notes";
                         return (
                           <th
                             key={field}
                             style={{ 
                               border: '1px solid #ddd', 
                               padding: '8px', 
                               fontWeight: 'bold', 
                               fontSize: '12px', 
                               minWidth: field === 'Description' ? '200px' : '120px' 
                             }}
                           >
                             {field}
                             {isRequired && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}
                             {!isRequired && <span style={{ color: '#4caf50', marginLeft: '4px', fontSize: '10px' }}>(Optional)</span>}
                           </th>
                         );
                       })}
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
                        {schemaFields.map((field) => (
                          <td key={field} style={{ border: '1px solid #ddd', padding: '4px' }}>
                            <TextField
                              value={row[field] || ""}
                              onChange={(e) => handleEdit(idx, field, e.target.value)}
                              size="small"
                              variant="outlined"
                              fullWidth
                              multiline={field === 'Description'}
                              rows={field === 'Description' ? 2 : 1}
                              error={errors[idx]?.some(err => err.includes(field))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  fontSize: '12px',
                                  '& fieldset': {
                                    borderWidth: '1px'
                                  }
                                }
                              }}
                              type={['CostPrice', 'Quantity'].includes(field) ? 'number' : 'text'}
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
                              label="✓ Valid Item" 
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
        <Button onClick={handleCloseRequest} size="large">
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
          color="info"
        >
          {Object.keys(errors).length > 0 
            ? `Fix ${Object.keys(errors).length} Errors First` 
            : `Import ${rows.length} Items`
          }
        </Button>
      </DialogActions>
      
      <ConfirmationDialog
        open={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        onConfirm={handleConfirmClose}
        title="Close Import Modal"
        message="Are you sure you want to close the import modal? All unsaved data will be lost."
        severity="warning"
        confirmText="Close"
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default ImportCSV;
