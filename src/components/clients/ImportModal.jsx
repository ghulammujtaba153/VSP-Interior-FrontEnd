"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
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
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

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

// ✅ Client required fields
const clientRequiredFields = [
  "Name",
  "Is Company",
  "Email Address",
  "Phone Number",
  "Address",
  "Post Code",
  "Status",
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
  ...clientRequiredFields,
  "Notes", // optional
  ...contactFields,
];

// ✅ Optimized validation functions (moved outside component to prevent recreation)
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

const validatePostCode = (postCode) => {
  return /^[A-Za-z0-9\s\-]{3,10}$/.test(postCode);
};

const validateStatus = (status) => {
  return ["active", "inactive"].includes(String(status).toLowerCase());
};

// ✅ Batch validation function
const validateRowsBatch = (data, batchSize = 1000) => {
  return new Promise((resolve) => {
    let errors = {};
    let seenEmails = new Set();
    let seenNames = new Set();
    let processedRows = 0;

    const processBatch = () => {
      const startIdx = processedRows;
      const endIdx = Math.min(startIdx + batchSize, data.length);

      for (let idx = startIdx; idx < endIdx; idx++) {
        const row = data[idx];
        let rowErrors = [];

        // 1. Client Required fields validation
        clientRequiredFields.forEach((field) => {
          if (!row[field] && row[field] !== 0) {
            rowErrors.push(`${field} is required`);
          }
        });

        // 2. Client Email validation
        if (row["Email Address"] && !validateEmail(row["Email Address"])) {
          rowErrors.push("Invalid client email format");
        }

        // 3. Client Phone validation
        if (row["Phone Number"] && !validatePhone(row["Phone Number"])) {
          rowErrors.push("Invalid client phone format");
        }

        // 4. Status validation
        if (row["Status"] && !validateStatus(row["Status"])) {
          rowErrors.push("Status must be Active or Inactive");
        }

        // 5. Postal code validation
        if (row["Post Code"] && !validatePostCode(row["Post Code"])) {
          rowErrors.push("Invalid postal code format");
        }

        // 6. Skip duplicate email check within file - duplicates are EXPECTED for clients with multiple contacts
        // The system will automatically group rows by email during import
        if (row["Email Address"]) {
          seenEmails.add(row["Email Address"].toLowerCase());
        }

        // 7. Skip duplicate name check within file - duplicates are EXPECTED for clients with multiple contacts
        // The system will automatically group rows by email during import
        if (row["Name"]) {
          seenNames.add(row["Name"].toLowerCase());
        }

        // 8. Name length validation
        if (row["Name"] && row["Name"].length < 2) {
          rowErrors.push("Name must be at least 2 characters");
        }

        // 9. Address length validation
        if (row["Address"] && row["Address"].length < 10) {
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
          } else if (!validateEmail(row["Contact Email"])) {
            rowErrors.push("Invalid contact email format");
          }
          if (!row["Contact Phone"] || !row["Contact Phone"].toString().trim()) {
            rowErrors.push("Contact Phone is required when contact data is provided");
          } else if (!validatePhone(row["Contact Phone"])) {
            rowErrors.push("Invalid contact phone format");
          }
        }

        if (rowErrors.length > 0) {
          errors[idx] = rowErrors;
        }
      }

      processedRows = endIdx;

      if (processedRows < data.length) {
        // Continue processing in next tick
        setTimeout(processBatch, 0);
      } else {
        resolve(errors);
      }
    };

    processBatch();
  });
};

const ImportModal = ({ open, onClose, refreshClients }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapping, setMapping] = useState(false); // <-- Add this
  const { user } = useAuth();
  
  // ✅ Use ref for debounced validation
  const validationTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample template data for clients with contacts
  const templateData = [
    {
      "Name": "Modern Kitchen Designs LLC",
      "Is Company": "TRUE",
      "Email Address": "contact@modernkitchens.com",
      "Phone Number": "+1-555-0123",
      "Address": "123 Design Avenue, Kitchen City, State 12345",
      "Post Code": "12345",
      "Status": "Active",
      "Notes": "Premium residential kitchen design services",
      "Contact First Name": "John",
      "Contact Last Name": "Smith",
      "Contact Role": "Manager",
      "Contact Email": "john.smith@modernkitchens.com",
      "Contact Phone": "+1-555-0124"
    },
    {
      "Name": "Modern Kitchen Designs LLC",
      "Is Company": "TRUE",
      "Email Address": "contact@modernkitchens.com",
      "Phone Number": "+1-555-0123",
      "Address": "123 Design Avenue, Kitchen City, State 12345",
      "Post Code": "12345",
      "Status": "Active",
      "Notes": "Premium residential kitchen design services",
      "Contact First Name": "Sarah",
      "Contact Last Name": "Johnson",
      "Contact Role": "Assistant Manager",
      "Contact Email": "sarah.johnson@modernkitchens.com",
      "Contact Phone": "+1-555-0125"
    },
    {
      "Name": "Home Renovation Pros",
      "Is Company": "TRUE",
      "Email Address": "info@homerenovationpros.com", 
      "Phone Number": "+1-555-0456",
      "Address": "456 Renovation Street, Home Valley, State 67890",
      "Post Code": "67890",
      "Status": "Active",
      "Notes": "Full-service home renovation and remodeling",
      "Contact First Name": "Mike",
      "Contact Last Name": "Davis",
      "Contact Role": "Director",
      "Contact Email": "mike.davis@homerenovationpros.com",
      "Contact Phone": "+1-555-0457"
    },
    {
      "Name": "Luxury Cabinet Solutions",
      "Is Company": "TRUE",
      "Email Address": "sales@luxurycabinets.net",
      "Phone Number": "+1-555-0789",
      "Address": "789 Luxury Lane, Cabinet Heights, State 54321",
      "Post Code": "54321", 
      "Status": "Inactive",
      "Notes": "High-end custom cabinet installations",
      "Contact First Name": "",
      "Contact Last Name": "",
      "Contact Role": "",
      "Contact Email": "",
      "Contact Phone": ""
    }
  ];

  // ✅ Memoized filtered and paginated data
  const { paginatedRows, totalPages, validRowsCount, errorRowsCount } = useMemo(() => {
    let filteredRows = rows;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredRows = rows.filter((row, idx) => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchLower)
        ) || String(idx + 1).includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'valid') {
        filteredRows = filteredRows.filter((_, idx) => !errors[idx]);
      } else if (filterStatus === 'invalid') {
        filteredRows = filteredRows.filter((_, idx) => errors[idx]);
      }
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredRows.slice(startIndex, endIndex);

    // Calculate statistics
    const validCount = rows.filter((_, idx) => !errors[idx]).length;
    const errorCount = Object.keys(errors).length;

    return {
      paginatedRows: paginatedData,
      totalPages: Math.ceil(filteredRows.length / rowsPerPage),
      validRowsCount: validCount,
      errorRowsCount: errorCount
    };
  }, [rows, errors, currentPage, rowsPerPage, filterStatus, searchTerm]);

  // ✅ Debounced validation function
  const debouncedValidate = useCallback((data) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(async () => {
      setValidating(true);
      try {
        const newErrors = await validateRowsBatch(data);
        setErrors(newErrors);
      } catch (error) {
        console.error('Validation error:', error);
        toast.error('Error validating data');
      } finally {
        setValidating(false);
      }
    }, 500);
  }, []);

  // Download template function
  const downloadTemplate = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Name
      { wch: 12 }, // Is Company
      { wch: 30 }, // Email Address
      { wch: 18 }, // Phone Number
      { wch: 40 }, // Address
      { wch: 12 }, // Post Code
      { wch: 10 }, // Status
      { wch: 35 }, // Notes
      { wch: 18 }, // Contact First Name
      { wch: 18 }, // Contact Last Name
      { wch: 20 }, // Contact Role
      { wch: 30 }, // Contact Email
      { wch: 18 }, // Contact Phone
    ];
    ws['!cols'] = columnWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients & Contacts");
    XLSX.writeFile(wb, "Clients And Client Contacts VSP.xlsx");
    toast.success("Clients & Contacts template downloaded successfully!");
  }, []);

  // ✅ Optimized file validation
  const validateFile = useCallback((file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const maxSize = 50 * 1024 * 1024; // Increased to 50MB for large files

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return false;
    }

    return true;
  }, []);

  // ✅ Optimized file upload with streaming for large files
  const handleFileUpload = useCallback(async (file) => {
    if (!file || !validateFile(file)) return;

    setSelectedFile(file);
    setUploading(true);
    setRows([]);
    setErrors({});
    setMapping(true); // <-- Start mapping loader

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { 
        type: "array",
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet, {
        raw: false, // Convert everything to strings for consistency
        defval: "" // Default value for empty cells
      });

      if (parsed.length === 0) {
        toast.error("The file appears to be empty or invalid");
        setMapping(false); // <-- End mapping loader
        return;
      }

      if (parsed.length > 10000) {
        const proceed = window.confirm(
          `This file contains ${parsed.length} rows. Processing large files may take some time. Continue?`
        );
        if (!proceed) {
          setMapping(false); // <-- End mapping loader
          return;
        }
      }

      // Apply text transformations (capitalize first letter of name and address fields)
      const transformedData = parsed.map(row => ({
        ...row,
        "Name": capitalizeText(row["Name"] || row["name"] || ""),
        "Address": capitalizeAddress(row["Address"] || row["address"] || ""),
        "Contact First Name": capitalizeText(row["Contact First Name"] || row["contact first name"] || ""),
        "Contact Last Name": capitalizeText(row["Contact Last Name"] || row["contact last name"] || ""),
      }));

      setRows(transformedData);
      setCurrentPage(1); // Reset to first page
      toast.success(`Successfully loaded ${transformedData.length} rows`);
      
      // Start validation
      debouncedValidate(transformedData);

    } catch (error) {
      toast.error("Error reading file. Please check the file format.");
      console.error("File reading error:", error);
    } finally {
      setUploading(false);
      setMapping(false); // <-- End mapping loader
    }
  }, [validateFile, debouncedValidate]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  // Clear uploaded file
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setRows([]);
    setErrors({});
    setUploading(false);
    setValidating(false);
    setCurrentPage(1);
    setSearchTerm('');
    setFilterStatus('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ✅ Optimized edit handler with debounced validation
  const handleEdit = useCallback((rowIdx, field, value) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      updated[rowIdx][field] = value;
      
      // Trigger validation for the entire dataset
      debouncedValidate(updated);
      
      return updated;
    });
  }, [debouncedValidate]);

  // ✅ Batch upload with progress tracking
  const handleConfirm = useCallback(async () => {
    const validRows = rows.filter((_, idx) => !errors[idx]);

    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    // Group rows by client (using email as unique identifier)
    const clientsMap = new Map();
    
    validRows.forEach(row => {
      const clientEmail = row["Email Address"];
      
      if (!clientsMap.has(clientEmail)) {
        // Create new client entry
        clientsMap.set(clientEmail, {
          companyName: row["Name"],
          isCompany: String(row["Is Company"]).toLowerCase() === 'true' || row["Is Company"] === true,
          emailAddress: row["Email Address"],
          phoneNumber: row["Phone Number"],
          address: row["Address"],
          postCode: row["Post Code"],
          status: String(row["Status"]).toLowerCase(),
          notes: row["Notes"] || "",
          contacts: []
        });
      }
      
      // Add contact if contact data exists
      const hasContactData = row["Contact First Name"] && row["Contact Last Name"];
      if (hasContactData) {
        clientsMap.get(clientEmail).contacts.push({
          firstName: row["Contact First Name"],
          lastName: row["Contact Last Name"],
          role: row["Contact Role"],
          emailAddress: row["Contact Email"],
          phoneNumber: row["Contact Phone"]
        });
      }
    });

    const clientsArray = Array.from(clientsMap.values());
    const batchSize = 50; // Process in smaller batches
    const totalBatches = Math.ceil(clientsArray.length / batchSize);
    let successCount = 0;
    let totalContactsCount = 0;

    try {
      toast.loading(`Importing ${clientsArray.length} clients with their contacts...`);

      let res;
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = clientsArray.slice(i * batchSize, (i + 1) * batchSize);
        const batchContactsCount = batch.reduce((sum, client) => sum + client.contacts.length, 0);
        
        try {
          res = await axios.post(`${BASE_URL}/api/client/import`, {
            userId: user.id,
            clients: batch,
          }, {
            timeout: 60000 // 60 second timeout for larger batches
          });
          
          successCount += batch.length;
          totalContactsCount += batchContactsCount;
          
          // Update progress
          toast.loading(
            `Imported ${successCount}/${clientsArray.length} clients (Batch ${i + 1}/${totalBatches})`
          );
        } catch (batchError) {
          console.error(`Batch ${i + 1} failed:`, batchError);
          toast.error(`Batch ${i + 1} failed: ${batchError.response?.data?.message || batchError.message}`);
          // Continue with next batch
        }
      }

      toast.dismiss();

      
      if (res && res.status == 201) {
        toast.success(`Successfully imported ${successCount} clients with ${totalContactsCount} contacts!`);
      } else {
        toast.warning(`Imported ${successCount} out of ${clientsArray.length} clients. Some batches may have failed.`);
      }
      
      refreshClients();
      onClose();

    } catch (error) {
      console.error("Error importing clients:", error);
      toast.dismiss();
      toast.error("Failed to import clients: " + (error.response?.data?.message || error.message));
    }
  }, [rows, errors, user.id, refreshClients, onClose]);

  // ✅ Memoized table rows to prevent unnecessary re-renders
  const TableRows = useMemo(() => {
    const getOriginalIndex = (displayIndex) => {
      // If we're filtering, we need to map back to original index
      if (searchTerm || filterStatus !== 'all') {
        // This is simplified - in a real app you'd want to maintain this mapping
        return displayIndex;
      }
      return (currentPage - 1) * rowsPerPage + displayIndex;
    };

    return paginatedRows.map((row, displayIdx) => {
      const originalIdx = getOriginalIndex(displayIdx);
      
      
      return (
        <tr key={originalIdx} style={{ backgroundColor: errors[originalIdx] ? '#ffebee' : 'white' }}>
          <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
            {(currentPage - 1) * rowsPerPage + displayIdx + 1}
          </td>
          {allFields.map((field) => (
            <td key={field} style={{ border: '1px solid #ddd', padding: '4px' }}>
              <TextField
                value={row[field] || ""}
                onChange={(e) => handleEdit(originalIdx, field, e.target.value)}
                size="small"
                variant="outlined"
                fullWidth
                multiline={['Address', 'Notes'].includes(field)}
                rows={
                  field === 'Address' ? 2 : 
                  field === 'Notes' ? 2 : 1
                }
                error={errors[originalIdx]?.some(err => err.includes(field))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    fontSize: '12px',
                    '& fieldset': {
                      borderWidth: '1px'
                    }
                  }
                }}
                type={field === 'Email Address' || field === 'Contact Email' ? 'email' : field === 'Phone Number' || field === 'Contact Phone' ? 'tel' : 'text'}
                placeholder={
                  field === 'Email Address' ? 'contact@company.com' :
                  field === 'Phone Number' ? '+1-555-0123' :
                  field === 'Post Code' ? '12345' :
                  field === 'Name' ? 'Company Name LLC' :
                  field === 'Contact Email' ? 'john@company.com' :
                  field === 'Contact Phone' ? '+1-555-0124' :
                  field === 'Contact First Name' ? 'John' :
                  field === 'Contact Last Name' ? 'Doe' :
                  field === 'Contact Role' ? 'Manager' : ''
                }
              />
            </td>
          ))}
          <td style={{ border: '1px solid #ddd', padding: '4px' }}>
            {errors[originalIdx] ? (
              <Stack spacing={0.5}>
                {errors[originalIdx].map((err, i) => (
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
      );
    });
  }, [paginatedRows, errors, currentPage, rowsPerPage, handleEdit, searchTerm, filterStatus]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon />
          Import Clients & Contacts Data
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Loader while mapping */}
        {mapping && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
            <CircularProgress color="secondary" size={48} />
            <Typography variant="body1" mt={2} color="secondary">
              Mapping and processing file, please wait...
            </Typography>
          </Box>
        )}

        {!mapping && (
          <>
            {/* Template Download Section */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'secondary.50', border: '1px solid', borderColor: 'secondary.200' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="secondary.main" gutterBottom>
                    👥 Download Clients & Contacts Template
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download the Excel template with sample client and contact data. One client can have multiple contacts (repeat client info for each contact row).
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
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
              
              <Stack alignItems="center" spacing={2}>
                <UploadIcon sx={{ fontSize: 48, color: dragOver ? 'secondary.main' : 'grey.400' }} />
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    {dragOver ? 'Drop your clients & contacts file here' : 'Drag & drop your clients & contacts file here'}
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
                    Maximum file size: 50MB • Supports up to 10,000+ rows • Contact fields are optional
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Upload Progress */}
            {(uploading || validating) && (
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  {uploading ? 'Processing clients file...' : 'Validating data...'}
                </Typography>
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
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB • {rows.length} rows loaded
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

            {/* Enhanced Validation Summary */}
            {rows.length > 0 && (
              <>
                <Alert 
                  severity={errorRowsCount === 0 ? "success" : "warning"} 
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    {errorRowsCount === 0 
                      ? `✅ All ${rows.length} rows are valid and ready for import`
                      : `⚠️ ${errorRowsCount} rows have errors out of ${rows.length} total rows`
                    }
                    {validating && " (Validation in progress...)"}
                  </Typography>
                </Alert>

                {/* Filters and Controls */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search clients and contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'grey.400', mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Filter"
                      >
                        <MenuItem value="all">All ({rows.length})</MenuItem>
                        <MenuItem value="valid">Valid ({validRowsCount})</MenuItem>
                        <MenuItem value="invalid">Invalid ({errorRowsCount})</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Per Page</InputLabel>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(e.target.value);
                          setCurrentPage(1);
                        }}
                        label="Per Page"
                      >
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Page {currentPage} of {totalPages}
                      </Typography>
                      {totalPages > 1 && (
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={(e, page) => setCurrentPage(page)}
                          size="small"
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Optimized Table with pagination */}
            {rows.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                  👥 Clients & Contacts Data Preview & Edit 
                  <Chip 
                    label={`Showing ${paginatedRows.length} of ${rows.length}`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Typography>
                <Paper sx={{ overflow: 'hidden' }}>
                  <Box sx={{ overflow: 'auto', maxHeight: '600px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f3e5f5', zIndex: 1 }}>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                            #
                          </th>
                          {allFields.map((field) => {
                            const isClientRequired = clientRequiredFields.includes(field);
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
                                    field === 'Email Address' || field === 'Contact Email' ? '180px' :
                                    field === 'Contact First Name' || field === 'Contact Last Name' ? '140px' :
                                    field === 'Contact Role' ? '150px' : '130px',
                                  backgroundColor: isContactField ? '#e8f5e9' : '#f3e5f5'
                                }}
                              >
                                {field}
                                {isClientRequired && (
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
                        {TableRows}
                      </tbody>
                    </table>
                  </Box>
                </Paper>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="secondary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </Box>
            )}
          </>
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
          disabled={rows.length === 0 || errorRowsCount > 0 || validating}
          size="large"
          startIcon={<UploadIcon />}
          color="secondary"
        >
          {validating ? 'Validating...' :
           errorRowsCount > 0 ? `Fix ${errorRowsCount} Errors First` : 
           `Import Clients & Contacts`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;