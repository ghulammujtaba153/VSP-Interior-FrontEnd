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

// ✅ Text transformation helper - capitalize first letter, rest lowercase
const capitalizeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// ✅ Transform address - capitalize first letter of each word
const capitalizeAddress = (address) => {
  if (!address || typeof address !== 'string') return address;
  return address
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ✅ Supplier required fields
const supplierRequiredFields = [
  "Name",
  "Email",
  "Phone",
  "Address",
  "Post Code",
  "Status",
  "Is Company",
];

// ✅ Contact fields (optional - can be empty if no contacts)
const contactFields = [
  "Contact First Name",
  "Contact Last Name",
  "Contact Role",
  "Contact Email",
  "Contact Phone",
];

// ✅ All fields (for table display)
const allFields = [
  ...supplierRequiredFields,
  "Notes", // optional
  ...contactFields,
];

const ImportModal = ({ open, onClose, fetchSuppliers }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();

  // Sample template data for suppliers with contacts
  const templateData = [
    {
      "Name": "ABC Wood Supplies",
      "Email": "contact@abcwood.com",
      "Phone": "+1-555-0123",
      "Address": "123 Industrial Blvd, Woodville, State 12345",
      "Post Code": "12345",
      "Status": "Active",
      "Is Company": "TRUE",
      "Notes": "Primary supplier for hardwood materials",
      "Contact First Name": "John",
      "Contact Last Name": "Anderson",
      "Contact Role": "Sales Manager",
      "Contact Email": "john.anderson@abcwood.com",
      "Contact Phone": "+1-555-0124"
    },
    {
      "Name": "ABC Wood Supplies",
      "Email": "contact@abcwood.com",
      "Phone": "+1-555-0123",
      "Address": "123 Industrial Blvd, Woodville, State 12345",
      "Post Code": "12345",
      "Status": "Active",
      "Is Company": "TRUE",
      "Notes": "Primary supplier for hardwood materials",
      "Contact First Name": "Sarah",
      "Contact Last Name": "Miller",
      "Contact Role": "Account Manager",
      "Contact Email": "sarah.miller@abcwood.com",
      "Contact Phone": "+1-555-0125"
    },
    {
      "Name": "Premier Hardware Co.",
      "Email": "sales@premierhardware.com", 
      "Phone": "+1-555-0456",
      "Address": "456 Commerce Street, Hardware City, State 67890",
      "Post Code": "67890",
      "Status": "Active",
      "Is Company": "TRUE",
      "Notes": "Specializes in cabinet hardware and hinges",
      "Contact First Name": "Mike",
      "Contact Last Name": "Thompson",
      "Contact Role": "Director",
      "Contact Email": "mike.thompson@premierhardware.com",
      "Contact Phone": "+1-555-0457"
    },
    {
      "Name": "Quality Tools Inc.",
      "Email": "info@qualitytools.net",
      "Phone": "+1-555-0789",
      "Address": "789 Tool Way, Craftsman Valley, State 54321",
      "Post Code": "54321", 
      "Status": "Inactive",
      "Is Company": "FALSE",
      "Notes": "Secondary supplier for power tools and accessories",
      "Contact First Name": "",
      "Contact Last Name": "",
      "Contact Role": "",
      "Contact Email": "",
      "Contact Phone": ""
    }
  ];

  // ✅ Enhanced row-level validation for suppliers with contacts
  const validateRows = (data) => {
    let newErrors = {};
    let seenEmails = new Set();
    let seenCompanyNames = new Set();

    data.forEach((row, idx) => {
      let rowErrors = [];

      // 1. Supplier Required fields validation
      supplierRequiredFields.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          rowErrors.push(`${field} is required`);
        }
      });

      // 2. Supplier Email validation
      if (row.Email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.Email)) {
          rowErrors.push("Invalid supplier email format");
        }
      }

      // 3. Supplier Phone validation
      if (row.Phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(row.Phone)) {
          rowErrors.push("Invalid supplier phone format");
        }
      }

      // 4. Status validation
      if (
        row.Status &&
        !["active", "inactive"].includes(String(row.Status).toLowerCase())
      ) {
        rowErrors.push("Status must be Active or Inactive");
      }

      // 5. Postal code validation
      if (row["Post Code"] && !/^[A-Za-z0-9\s\-]{3,10}$/.test(row["Post Code"])) {
        rowErrors.push("Invalid postal code format");
      }

      // 6. Skip duplicate email check within file - duplicates are EXPECTED for suppliers with multiple contacts
      // The system will automatically group rows by email during import
      if (row.Email) {
        seenEmails.add(row.Email.toLowerCase());
      }

      // 7. Skip duplicate name check within file - duplicates are EXPECTED for suppliers with multiple contacts
      // The system will automatically group rows by email during import
      if (row.Name) {
        seenCompanyNames.add(row.Name.toLowerCase());
      }

      // 8. Name length validation
      if (row.Name && row.Name.length < 2) {
        rowErrors.push("Name must be at least 2 characters");
      }

      // 9. Address length validation
      if (row.Address && row.Address.length < 10) {
        rowErrors.push("Address must be at least 10 characters");
      }

      // 10. Contact validation (if any contact field is filled, validate all contact required fields)
      const hasAnyContactData = contactFields.some(field => row[field] && row[field].toString().trim());
      
      if (hasAnyContactData) {
        // If there's any contact data, validate contact fields
        if (!row["Contact First Name"] || !row["Contact First Name"].toString().trim()) {
          rowErrors.push("Contact First Name is required when contact data is provided");
        }
        if (!row["Contact Last Name"] || !row["Contact Last Name"].toString().trim()) {
          rowErrors.push("Contact Last Name is required when contact data is provided");
        }
        if (!row["Contact Role"] || !row["Contact Role"].toString().trim()) {
          rowErrors.push("Contact Role is required when contact data is provided");
        }
        if (!row["Contact Email"] || !row["Contact Email"].toString().trim()) {
          rowErrors.push("Contact Email is required when contact data is provided");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row["Contact Email"])) {
          rowErrors.push("Invalid contact email format");
        }
        if (!row["Contact Phone"] || !row["Contact Phone"].toString().trim()) {
          rowErrors.push("Contact Phone is required when contact data is provided");
        } else if (!/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(row["Contact Phone"])) {
          rowErrors.push("Invalid contact phone format");
        }
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
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 18 }, // Phone
      { wch: 40 }, // Address
      { wch: 12 }, // Post Code
      { wch: 10 }, // Status
      { wch: 12 }, // Is Company
      { wch: 35 }, // Notes
      { wch: 18 }, // Contact First Name
      { wch: 18 }, // Contact Last Name
      { wch: 20 }, // Contact Role
      { wch: 30 }, // Contact Email
      { wch: 18 }, // Contact Phone
    ];
    ws['!cols'] = columnWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers & Contacts");
    XLSX.writeFile(wb, "Suppliers And SuppliersContacts VSP.xlsx");
    toast.success("Suppliers & Contacts template downloaded successfully!");
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

        // Normalize keys and apply text transformations
        const normalized = parsed.map((row) => {
          const out = {}
          Object.entries(row).forEach(([k, v]) => {
            // Keep provided keys as-is; if lower-case versions match our headers, upcase them
            const keyMap = {
              companyName: 'Name',
              name: 'Name',
              email: 'Email',
              phone: 'Phone',
              address: 'Address',
              postCode: 'Post Code',
              status: 'Status',
              notes: 'Notes',
              isCompany: 'Is Company',
              'contact first name': 'Contact First Name',
              'contact last name': 'Contact Last Name',
              'contact role': 'Contact Role',
              'contact email': 'Contact Email',
              'contact phone': 'Contact Phone'
            }
            const lowerKey = k.toLowerCase();
            const mapped = keyMap[lowerKey] || keyMap[k] || k;
            out[mapped] = v;
          })
          
          // Apply text transformations (capitalize first letter of name and address fields)
          out["Name"] = capitalizeText(out["Name"] || out["name"] || "");
          out["Address"] = capitalizeAddress(out["Address"] || out["address"] || "");
          out["Contact First Name"] = capitalizeText(out["Contact First Name"] || "");
          out["Contact Last Name"] = capitalizeText(out["Contact Last Name"] || "");
          
          return out;
        })
        setRows(normalized);
        validateRows(normalized);
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

  // ✅ Confirm upload with contact grouping
  const handleConfirm = async () => {
    toast.loading("Importing suppliers with contacts...");
    try {
      const validRows = rows.filter((_, idx) => !errors[idx]);

      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to insert");
        return;
      }

      // Group rows by supplier (using email as unique identifier)
      const suppliersMap = new Map();
      
      validRows.forEach(row => {
        const supplierEmail = row["Email"];
        
        if (!suppliersMap.has(supplierEmail)) {
          // Create new supplier entry
          const statusRaw = (row["Status"] || "").toString().trim().toLowerCase();
          const isCompanyRaw = (row["Is Company"] || "").toString().trim().toLowerCase();
          
          suppliersMap.set(supplierEmail, {
            name: row["Name"]?.toString().trim() || "",
            email: row["Email"]?.toString().trim() || "",
            phone: row["Phone"]?.toString().trim() || "",
            address: row["Address"]?.toString().trim() || "",
            postCode: row["Post Code"]?.toString().trim() || "",
            status: ["active", "inactive"].includes(statusRaw) ? statusRaw : "active",
            notes: row["Notes"]?.toString().trim() || "",
            isCompany: isCompanyRaw === "yes" || isCompanyRaw === "true" || isCompanyRaw === "TRUE",
            contacts: []
          });
        }
        
        // Add contact if contact data exists
        const hasContactData = row["Contact First Name"] && row["Contact Last Name"];
        if (hasContactData) {
          suppliersMap.get(supplierEmail).contacts.push({
            firstName: row["Contact First Name"],
            lastName: row["Contact Last Name"],
            role: row["Contact Role"],
            emailAddress: row["Contact Email"],
            phoneNumber: row["Contact Phone"]
          });
        }
      });

      const suppliersArray = Array.from(suppliersMap.values());
      const totalContactsCount = suppliersArray.reduce((sum, supplier) => sum + supplier.contacts.length, 0);

      const res = await axios.post(`${BASE_URL}/api/suppliers/import`, {
        userId: user.id,
        suppliers: suppliersArray,
      });

      toast.dismiss();
      toast.success(`Successfully imported ${suppliersArray.length} suppliers with ${totalContactsCount} contacts!`);
      fetchSuppliers();
      onClose();
    } catch (error) {
      console.error("Error importing suppliers:", error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to import suppliers");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon />
          Import Suppliers & Contacts Data
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Template Download Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="warning.main" gutterBottom>
                🏢 Download Suppliers & Contacts Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with sample supplier and contact data. One supplier can have multiple contacts (repeat supplier info for each contact row).
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
                {dragOver ? 'Drop your suppliers & contacts file here' : 'Drag & drop your suppliers & contacts file here'}
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
                Maximum file size: 5MB • Contact fields are optional
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Upload Progress */}
        {uploading && (
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>Processing suppliers & contacts file...</Typography>
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
                ? `✅ All ${rows.length} rows are valid and ready for import`
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
              🏢 Suppliers & Contacts Data Preview & Edit
            </Typography>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflow: 'auto', maxHeight: '500px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff3e0', zIndex: 1 }}>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                        #
                      </th>
                      {allFields.map((field) => {
                        const isSupplierRequired = supplierRequiredFields.includes(field);
                        const isContactField = contactFields.includes(field);
                        
                        return (
                          <th
                            key={field}
                            style={{ 
                              border: '1px solid #ddd', 
                              padding: '8px', 
                              fontWeight: 'bold', 
                              fontSize: '11px', 
                              minWidth: 
                                field === 'Address' ? '250px' : 
                                field === 'Notes' ? '200px' :
                                field === 'Name' ? '200px' :
                                field === 'Email' || field === 'Contact Email' ? '180px' :
                                field === 'Contact First Name' || field === 'Contact Last Name' ? '140px' :
                                field === 'Contact Role' ? '150px' : '130px',
                              backgroundColor: isContactField ? '#e8f5e9' : '#fff3e0'
                            }}
                          >
                            {field}
                            {isSupplierRequired && (
                              <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
                            )}
                            {isContactField && (
                              <span style={{ color: '#4caf50', marginLeft: '4px', fontSize: '10px' }}>(Optional)</span>
                            )}
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
                        {allFields.map((field) => (
                          <td key={field} style={{ border: '1px solid #ddd', padding: '4px' }}>
                            <TextField
                              value={row[field] || ""}
                              onChange={(e) => handleEdit(idx, field, e.target.value)}
                              size="small"
                              variant="outlined"
                              fullWidth
                              multiline={['Address', 'Notes'].includes(field)}
                              rows={
                                field === 'Address' ? 2 : 
                                field === 'Notes' ? 2 : 1
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
                              type={field === 'Email' || field === 'Contact Email' ? 'email' : field === 'Phone' || field === 'Contact Phone' ? 'tel' : 'text'}
                              placeholder={
                                field === 'Email' ? 'example@company.com' :
                                field === 'Phone' ? '+1-555-0123' :
                                field === 'Post Code' ? '12345' :
                                field === 'Name' ? 'Supplier Name' :
                                field === 'Contact Email' ? 'contact@company.com' :
                                field === 'Contact Phone' ? '+1-555-0124' :
                                field === 'Contact First Name' ? 'John' :
                                field === 'Contact Last Name' ? 'Doe' :
                                field === 'Contact Role' ? 'Sales Manager' : ''
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
            : `Import Suppliers & Contacts`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
