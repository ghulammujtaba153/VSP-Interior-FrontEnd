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

// ✅ Required fields (notes removed)
const requiredFields = [
  "Name",
  "isCompany",
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

        // 1. Required fields
        requiredFields.forEach((field) => {
          if (!row[field] && row[field] !== 0) {
            rowErrors.push(`${field} is required`);
          }
        });

        // 2. Email validation
        if (row.emailAddress && !validateEmail(row.emailAddress)) {
          rowErrors.push("Invalid email format");
        }

        // 3. Phone validation
        if (row.phoneNumber && !validatePhone(row.phoneNumber)) {
          rowErrors.push("Invalid phone number format");
        }

        // 4. Status validation
        if (row.status && !validateStatus(row.status)) {
          rowErrors.push("status must be Active or Inactive");
        }

        // 5. Postal code validation
        if (row.postCode && !validatePostCode(row.postCode)) {
          rowErrors.push("Invalid postal code format");
        }

        // 6. Duplicate email in file
        if (row.emailAddress) {
          const lowerEmail = row.emailAddress.toLowerCase();
          if (seenEmails.has(lowerEmail)) {
            rowErrors.push("Duplicate email in file");
          } else {
            seenEmails.add(lowerEmail);
          }
        }

        // 7. Duplicate Name in file
        if (row.Name) {
          const lowerName = row.Name.toLowerCase();
          if (seenNames.has(lowerName)) {
            rowErrors.push("Duplicate Name in file");
          } else {
            seenNames.add(lowerName);
          }
        }

        // 8. Name length validation
        if (row.Name && row.Name.length < 2) {
          rowErrors.push("Name must be at least 2 characters");
        }

        // 9. Address length validation
        if (row.address && row.address.length < 10) {
          rowErrors.push("Address must be at least 10 characters");
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

  // Sample template data for clients
  const templateData = [
    {
      Name: "Modern Kitchen Designs LLC",
      isCompany: true,
      emailAddress: "contact@modernkitchens.com",
      phoneNumber: "+1-555-0123",
      address: "123 Design Avenue, Kitchen City, State 12345",
      postCode: "12345",
      status: "active",
      notes: "Premium residential kitchen design services"
    },
    {
      Name: "Home Renovation Pros",
      isCompany: true,
      emailAddress: "info@homerenovationpros.com", 
      phoneNumber: "+1-555-0456",
      address: "456 Renovation Street, Home Valley, State 67890",
      postCode: "67890",
      status: "active",
      notes: "Full-service home renovation and remodeling"
    },
    {
      Name: "Luxury Cabinet Solutions",
      isCompany: true,
      emailAddress: "sales@luxurycabinets.net",
      phoneNumber: "+1-555-0789",
      address: "789 Luxury Lane, Cabinet Heights, State 54321",
      postCode: "54321", 
      status: "inactive",
      notes: "High-end custom cabinet installations"
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
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients Template");
    XLSX.writeFile(wb, "Clients VSP.xlsx");
    toast.success("Clients template downloaded successfully!");
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

      setRows(parsed);
      setCurrentPage(1); // Reset to first page
      toast.success(`Successfully loaded ${parsed.length} clients`);
      
      // Start validation
      debouncedValidate(parsed);

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

    // Map Name to companyName for backend
    const mappedRows = validRows.map(row => ({
      ...row,
      companyName: row.Name,
    }));

    const batchSize = 100; // Process in smaller batches
    const totalBatches = Math.ceil(mappedRows.length / batchSize);
    let successCount = 0;

    try {
      toast.loading(`Importing ${mappedRows.length} clients in ${totalBatches} batches...`);

      let res;
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = mappedRows.slice(i * batchSize, (i + 1) * batchSize);
        
        
        try {
          res = await axios.post(`${BASE_URL}/api/client/import`, {
            userId: user.id,
            clients: batch,
          }, {
            timeout: 30000 // 30 second timeout
          });
          
          successCount += batch.length;
          
          // Update progress
          toast.loading(
            `Imported ${successCount}/${mappedRows.length} clients (Batch ${i + 1}/${totalBatches})`
          );
        } catch (batchError) {
          console.error(`Batch ${i + 1} failed:`, batchError);
          // Continue with next batch
        }
      }

      toast.dismiss();

      
      if (res.status == 201) {
        toast.success(res.data.message || `Successfully imported all ${successCount} clients!`);
      } else {
        toast.warning(`Imported ${successCount} out of ${mappedRows.length} clients. Some batches may have failed.`);
      }
      
      refreshClients();
      onClose();

    } catch (error) {
      console.error("Error importing clients:", error);
      toast.dismiss();
      toast.error("Failed to import clients");
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
                multiline={['address', 'notes'].includes(field)}
                rows={
                  field === 'address' ? 2 : 
                  field === 'notes' ? 2 : 1
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
          Import Clients Data
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
                    Maximum file size: 50MB • Supports up to 10,000+ rows
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
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB • {rows.length} clients loaded
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
                      ? `✅ All ${rows.length} clients are valid and ready for import`
                      : `⚠️ ${errorRowsCount} clients have errors out of ${rows.length} total clients`
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
                      placeholder="Search clients..."
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
                  👥 Clients Data Preview & Edit 
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
                              {requiredFields.includes(field) && (
                                <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
                              )}
                            </th>
                          ))}
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
           `Import ${validRowsCount} Valid Clients`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;