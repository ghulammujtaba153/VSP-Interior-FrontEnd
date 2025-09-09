"use client";
import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  "code",
  "description"
];

const CSVFileModal = ({ open, onClose, onSuccess }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [csvColumns, setCsvColumns] = useState([]); // Dynamic columns from CSV
  const { user } = useAuth();

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
      setSelectedSubCategory(""); // Reset subcategory when category changes
    } else {
      setSubCategories([]);
      setSelectedSubCategory("");
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cabinet-categories/get`);
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cabinet-subcategories/get/${categoryId}`);
      setSubCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch subcategories");
    }
  };

  // Sample template data with common fields
  const templateData = [
    {
      code: "UBEP|900H|400D|18Th",
      description: "Under Bench | End Panel | 900H x 400D x18Th",
      vspCode: "2",
      unit: "Each",
      height: "0.9",
      thickness: "0.18",
      depth: "0.4",
      ends: "",
      bottom: "",
      top: "",
      rail: "",
      b: "",
      // Add any other fields you commonly use
      material: "Plywood",
      finish: "White",
      price: "150.00"
    },
    {
      code: "UBEP|900H|600D|18Th",
      description: "Under Bench | End Panel | 900H x 600D x18Th",
      vspCode: "4",
      unit: "Each",
      height: "0.9",
      thickness: "0.18",
      depth: "0.6",
      ends: "",
      bottom: "",
      top: "",
      rail: "",
      b: "",
      material: "Plywood",
      finish: "White",
      price: "180.00"
    },
    {
      code: "UBEP|900H|800D|18Th",
      description: "Under Bench | End Panel | 900H x 800D x18Th",
      vspCode: "6",
      unit: "Each",
      height: "0.9",
      thickness: "0.18",
      depth: "0.8",
      ends: "",
      bottom: "",
      top: "",
      rail: "",
      b: "",
      material: "Plywood",
      finish: "White",
      price: "210.00"
    }
  ];

  // ✅ Row-level validation
  const validateRows = (data) => {
    let newErrors = {};
    let seenCodes = new Set();

    data.forEach((row, idx) => {
      let rowErrors = [];

      // 1. Required fields (only code and description are required)
      requiredFields.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          rowErrors.push(`${field} is required`);
        }
      });

      // 2. Code validation - must be unique
      if (row.code) {
        if (seenCodes.has(row.code)) {
          rowErrors.push("Code must be unique");
        } else {
          seenCodes.add(row.code);
        }
      }

      // 3. Numeric validation for common numeric fields (if they exist)
      ["height", "thickness", "depth", "vspCode", "price"].forEach((field) => {
        if (row[field] && (isNaN(row[field]) || Number(row[field]) < 0)) {
          rowErrors.push(`${field} must be numeric >= 0`);
        }
      });

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
        
        // Get the range of the sheet to find all columns
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const allColumns = [];
        
        // Extract column headers from the first row (row 1)
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          const cell = sheet[cellAddress];
          const columnName = cell ? cell.v : `Column${col + 1}`;
          allColumns.push(columnName);
        }

        // Parse the data starting from row 2 (since row 1 has headers)
        const parsed = XLSX.utils.sheet_to_json(sheet, { 
          header: allColumns,
          range: 1 // Start from row 2 (index 1)
        });

        if (parsed.length === 0) {
          toast.error("The file appears to be empty or invalid");
          setUploading(false);
          return;
        }

        // Ensure code and description are first, then add all other columns
        const priorityColumns = ['code', 'description'];
        const otherColumns = allColumns.filter(col => !priorityColumns.includes(col));
        const finalColumns = [...priorityColumns, ...otherColumns];
        
        console.log('Detected columns:', allColumns);
        console.log('Final column order:', finalColumns);
        console.log('Parsed data:', parsed);
        
        setCsvColumns(finalColumns);
        setRows(parsed);
        validateRows(parsed);
        toast.success(`Successfully loaded ${parsed.length} rows with ${finalColumns.length} columns`);
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
    setCsvColumns([]);
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
    if (!selectedCategory || !selectedSubCategory) {
      toast.error("Please select both category and subcategory");
      return;
    }

    toast.loading("Inserting data...");
    try {
      // only send valid rows
      const validRows = rows.filter((_, idx) => !errors[idx]);

      if (validRows.length === 0) {
        toast.dismiss();
        toast.error("No valid rows to insert");
        return;
      }

      // Prepare data with category and subcategory IDs
      const cabinetsToUpload = validRows.map(row => {
        // Extract all fields that are not code or description
        const dynamicData = {};
        Object.keys(row).forEach(key => {
          if (!requiredFields.includes(key) && row[key] !== undefined && row[key] !== "") {
            dynamicData[key] = row[key];
          }
        });

        return {
          code: row.code,
          description: row.description,
          cabinetCategoryId: parseInt(selectedCategory),
          cabinetSubCategoryId: parseInt(selectedSubCategory),
          userId: user.id,
          dynamicData: dynamicData,
          status: "active" // Default status
        };
      });

      const res=await axios.post(`${BASE_URL}/api/cabinet/csv`, {
        userId: user.id,
        cabinets: cabinetsToUpload,
      });

      toast.dismiss();
      toast.success(res.data.message);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.dismiss();
      toast.error("Failed to insert data");
    }
  };

  const canUpload = selectedCategory && selectedSubCategory && rows.length > 0 && Object.keys(errors).length === 0;

  // Render table header dynamically
  const renderTableHeader = () => (
    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
      <tr>
        <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          #
        </th>
        {csvColumns.map((column) => (
          <th 
            key={column} 
            style={{ 
              border: '1px solid #ddd', 
              padding: '8px', 
              fontWeight: 'bold', 
              fontSize: '12px', 
              minWidth: requiredFields.includes(column) ? '200px' : '120px'
            }}
          >
            {column} {requiredFields.includes(column) && '*'}
          </th>
        ))}
        <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', fontSize: '12px', minWidth: '150px' }}>
          Status
        </th>
      </tr>
    </thead>
  );

  // Render table body dynamically
  const renderTableBody = () => (
    <tbody>
      {rows.map((row, idx) => (
        <tr key={idx} style={{ backgroundColor: errors[idx] ? '#ffebee' : 'white' }}>
          <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
            {idx + 1}
          </td>
          {csvColumns.map((column) => (
            <td key={column} style={{ border: '1px solid #ddd', padding: '4px' }}>
              <TextField
                value={row[column] || ""}
                onChange={(e) => handleEdit(idx, column, e.target.value)}
                size="small"
                variant="outlined"
                fullWidth
                error={errors[idx]?.some(err => err.includes(column))}
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
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FileIcon />
          Upload Cabinet Data
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Category Selection Section */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
          <Typography variant="h6" color="info.main" gutterBottom>
            📂 Select Category & Subcategory First
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose the category and subcategory for all cabinets in your upload file
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category *"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }} disabled={!selectedCategory}>
              <InputLabel>Subcategory *</InputLabel>
              <Select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                label="Subcategory *"
              >
                {subCategories.map((subCategory) => (
                  <MenuItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCategory && selectedSubCategory && (
              <Chip 
                label="✓ Ready for upload" 
                color="success" 
                variant="outlined"
                icon={<SuccessIcon />}
              />
            )}
          </Stack>
        </Paper>

        {/* Template Download Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="primary.main" gutterBottom>
                📋 Download Template First
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with sample data. Only <strong>Code</strong> and <strong>Description</strong> are required fields. 
                All other columns will be automatically detected from your CSV and stored as dynamic properties.
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

        {/* File Upload Section - Only show when category/subcategory selected */}
        {selectedCategory && selectedSubCategory && (
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
        )}

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
                    {(selectedFile.size / 1024).toFixed(1)} KB • {rows.length} rows • {csvColumns.length} columns detected
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
              📊 Data Preview & Edit ({csvColumns.length} columns detected)
            </Typography>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflow: 'auto', maxHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  {renderTableHeader()}
                  {renderTableBody()}
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
          disabled={!canUpload}
          size="large"
          startIcon={<UploadIcon />}
        >
          {!selectedCategory || !selectedSubCategory 
            ? "Select Category & Subcategory First"
            : Object.keys(errors).length > 0 
              ? `Fix ${Object.keys(errors).length} Errors First` 
              : `Upload ${rows.length} Records`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVFileModal;
