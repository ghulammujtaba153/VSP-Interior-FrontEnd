"use client"

import React, { useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '@/configs/url';
import { toast } from 'react-toastify'
import * as XLSX from "xlsx";
import {
  Modal,
  Box,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  TextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '@/context/authContext';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "1200px",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  p: 4,
  borderRadius: 2,
  overflow: "auto",
};

const ContactsImportModal = ({ open, onClose, clientId, refreshContacts }) => {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const { user } = useAuth();

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    setData([]);
    setValidationErrors([]);
    setPreviewMode(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          toast.error('File must contain at least a header row and one data row');
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Map Excel columns to contact fields
        const mappedData = rows.map((row, index) => {
          const contact = {
            clientId: clientId || 0,
            firstName: '',
            lastName: '',
            role: '',
            emailAddress: '',
            phoneNumber: '',
          };

          headers.forEach((header, colIndex) => {
            const value = row[colIndex] || '';
            const headerLower = header.toLowerCase();

            if (headerLower.includes('first') || (headerLower.includes('name') && !headerLower.includes('last'))) {
              contact.firstName = value.toString();
            } else if (headerLower.includes('last') || headerLower.includes('surname')) {
              contact.lastName = value.toString();
            } else if (headerLower.includes('role') || headerLower.includes('position') || headerLower.includes('title')) {
              contact.role = value.toString();
            } else if (headerLower.includes('email')) {
              contact.emailAddress = value.toString();
            } else if (headerLower.includes('phone') || headerLower.includes('mobile') || headerLower.includes('tel')) {
              contact.phoneNumber = value.toString();
            }
          });

          return contact;
        });

        setData(mappedData);
        toast.success(`Successfully parsed ${mappedData.length} contacts from file`);
      } catch (error) {
        toast.error('Error reading file. Please ensure it\'s a valid Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateData = () => {
    const errors = [];
    
    data.forEach((contact, index) => {
      if (!contact.firstName?.trim()) {
        errors.push({ row: index + 1, field: 'firstName', message: 'First name is required' });
      }
      if (!contact.lastName?.trim()) {
        errors.push({ row: index + 1, field: 'lastName', message: 'Last name is required' });
      }
      if (!contact.role?.trim()) {
        errors.push({ row: index + 1, field: 'role', message: 'Role is required' });
      }
      if (!contact.emailAddress?.trim()) {
        errors.push({ row: index + 1, field: 'emailAddress', message: 'Email is required' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.emailAddress)) {
        errors.push({ row: index + 1, field: 'emailAddress', message: 'Invalid email format' });
      }
      if (!contact.phoneNumber?.trim()) {
        errors.push({ row: index + 1, field: 'phoneNumber', message: 'Phone number is required' });
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePreview = () => {
    if (validateData()) {
      setPreviewMode(true);
    }
  };

  const handleEditData = () => {
    setPreviewMode(false);
  };

  const handleDataChange = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => !(error.row === index + 1 && error.field === field)));
  };

  const removeContact = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    
    // Clear validation errors for this row
    setValidationErrors(prev => prev.filter(error => error.row !== index + 1));
  };

  const handleSubmit = async () => {
    if (!validateData()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setUploading(true);
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }
      
      const response = await axios.post(`${BASE_URL}/api/contact/import`, { 
        contacts: data,
        userId: user.id 
      });
      
      toast.success(`Successfully imported ${data.length} contacts`);
      refreshContacts && refreshContacts();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error importing contacts');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setData([]);
    setFile(null);
    setValidationErrors([]);
    setPreviewMode(false);
    onClose();
  };

  const getFieldError = (rowIndex, field) => {
    return validationErrors.find(error => error.row === rowIndex + 1 && error.field === field)?.message;
  };

  const hasFieldError = (rowIndex, field) => {
    return !!getFieldError(rowIndex, field);
  };

  const downloadTemplate = () => {
    // Create comprehensive sample template
    const sampleData = [
      ['First Name*', 'Last Name*', 'Role*', 'Email*', 'Phone*'],
      ['John', 'Doe', 'Manager', 'john.doe@example.com', '+1234567890'],
      ['Jane', 'Smith', 'Assistant', 'jane.smith@example.com', '+1234567891'],
      ['Mike', 'Johnson', 'Director', 'mike.johnson@example.com', '+1234567892'],
      ['Sarah', 'Wilson', 'Coordinator', 'sarah.wilson@example.com', '+1234567893']
    ];
    
    // Create worksheet with sample data
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 20 }, // Role
      { wch: 30 }, // Email
      { wch: 20 }  // Phone
    ];
    worksheet['!cols'] = columnWidths;
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts Template");
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Clients Contact VSP.xlsx`;
    
    XLSX.writeFile(workbook, filename);
    toast.success('Template downloaded successfully!');
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" mb={3} display="flex" alignItems="center" gap={1}>
          <CloudUploadIcon color="primary" />
          Import Contacts
          {clientId && <Chip label={`Client ID: ${clientId}`} color="primary" variant="outlined" />}
        </Typography>

        {!data.length ? (
          <Box textAlign="center" py={4}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  size="large"
                >
                  Choose Excel File
                </Button>
              </label>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                size="large"
              >
                Download Excel Template
              </Button>
            </Box>
            
            <Typography variant="body2" color="textSecondary" mt={2}>
              Supported formats: .xlsx, .xls, .csv
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              File should contain columns for: First Name, Last Name, Role, Email, Phone
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Fields marked with * are required
            </Typography>
          </Box>
        ) : (
          <>
            {validationErrors.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Found {validationErrors.length} validation error(s). Please fix them before proceeding.
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={2} mb={2}>
              <Button
                variant="outlined"
                onClick={handleEditData}
                disabled={!previewMode}
              >
                Edit Data
              </Button>
              <Button
                variant="outlined"
                onClick={handlePreview}
                disabled={previewMode}
              >
                Preview Data
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={validationErrors.length > 0 || uploading}
                startIcon={uploading ? <CircularProgress size={16} /> : undefined}
              >
                {uploading ? 'Importing...' : `Import ${data.length} Contacts`}
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={1}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell width="50px">#</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell width="80px">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((contact, index) => (
                    <TableRow 
                      key={index} 
                      sx={{ 
                        backgroundColor: hasFieldError(index, 'firstName') || 
                                     hasFieldError(index, 'lastName') || 
                                     hasFieldError(index, 'role') || 
                                     hasFieldError(index, 'emailAddress') || 
                                     hasFieldError(index, 'phoneNumber') 
                          ? '#fff3cd' : 'inherit'
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {previewMode ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {contact.firstName}
                            {hasFieldError(index, 'firstName') && <ErrorIcon color="error" fontSize="small" />}
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            value={contact.firstName}
                            onChange={(e) => handleDataChange(index, 'firstName', e.target.value)}
                            error={hasFieldError(index, 'firstName')}
                            helperText={getFieldError(index, 'firstName')}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {previewMode ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {contact.lastName}
                            {hasFieldError(index, 'lastName') && <ErrorIcon color="error" fontSize="small" />}
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            value={contact.lastName}
                            onChange={(e) => handleDataChange(index, 'lastName', e.target.value)}
                            error={hasFieldError(index, 'lastName')}
                            helperText={getFieldError(index, 'lastName')}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {previewMode ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {contact.role}
                            {hasFieldError(index, 'role') && <ErrorIcon color="error" fontSize="small" />}
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            value={contact.role}
                            onChange={(e) => handleDataChange(index, 'role', e.target.value)}
                            error={hasFieldError(index, 'role')}
                            helperText={getFieldError(index, 'role')}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {previewMode ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {contact.emailAddress}
                            {hasFieldError(index, 'emailAddress') && <ErrorIcon color="error" fontSize="small" />}
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            value={contact.emailAddress}
                            onChange={(e) => handleDataChange(index, 'emailAddress', e.target.value)}
                            error={hasFieldError(index, 'emailAddress')}
                            helperText={getFieldError(index, 'emailAddress')}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {previewMode ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {contact.phoneNumber}
                            {hasFieldError(index, 'phoneNumber') && <ErrorIcon color="error" fontSize="small" />}
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            value={contact.phoneNumber}
                            onChange={(e) => handleDataChange(index, 'phoneNumber', e.target.value)}
                            error={hasFieldError(index, 'phoneNumber')}
                            helperText={getFieldError(index, 'phoneNumber')}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {!previewMode && (
                          <Tooltip title="Remove Contact">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeContact(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ContactsImportModal;