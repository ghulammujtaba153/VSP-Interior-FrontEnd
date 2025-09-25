'use client'

import React, { useState, useRef, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { CloudUpload, Edit, Save, Cancel } from "@mui/icons-material"
import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { BASE_URL } from "@/configs/url"
import { useParams } from "next/navigation"
import Notification from "@/components/Notification"

// Utility to normalize header names (lowercase, trimmed)
function normalizeHeader(header) {
  return header?.toString().trim().toLowerCase();
}

const CabinetImport = ({ id, setIsInProgress }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [excelData, setExcelData] = useState([])
  const [uniqueSubcategories, setUniqueSubcategories] = useState([])
  const [groupedData, setGroupedData] = useState({})
  const [error, setError] = useState("")
  const [columns, setColumns] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [subCategoryList, setSubCategoryList] = useState([])
  const [subcategoriesUploaded, setSubcategoriesUploaded] = useState(false)
  const fileInputRef = useRef(null)
  const [template, setTemplate] = useState([])
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("");


  // Lock-in states
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)

  // Fetch template from API
  const fetchTemplate = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cabinet/get/${id}`)
      // Extract all labels from dynamicData.arrayList
      const labels = res.data.cabinets[0]?.dynamicData?.arrayList.map(item => item.label) || []
      setTemplate(labels)
    } catch (error) {
      console.error('Error fetching template:', error)
    }
  }

  useEffect(() => {
    fetchTemplate()
  }, [id])

  // Handle file upload and parse excel
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError("Please select a valid Excel file (.xlsx or . xls)")
      return
    }

    setLoading(true)
    setError("")
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length === 0) {
          setError("Excel file is empty")
          setLoading(false)
          return
        }

        // Extract headers (first row) with custom blank handling
        let blankCount = 0;
        const headers = [];
        for (let idx = 0; idx < jsonData[0].length; idx++) {
          const header = jsonData[0][idx];
          if (!header || header.toString().trim() === "") {
            blankCount++;
            headers.push(`To be named ${idx + 1}`);
          } else {
            blankCount = 0; // Reset counter if a non-blank column is found
            headers.push(header.toString().trim());
          }
        }

        const normalizedHeaders = headers.map(normalizeHeader)
        const requiredColumns = ["code", "sub code", "description"]
        const missingColumns = requiredColumns.filter(col => 
          !normalizedHeaders.includes(col)
        )
        
        if (missingColumns.length > 0) {
          setError(
            `Missing required columns:\n` +
            missingColumns.map(col => `• ${col}`).join('\n')
          )
          setLoading(false)
          return
        }

        // ✅ Template validation - FIXED
        if (template && template.length > 0) {
          // Remove required columns to get dynamic headers only
          const dynamicHeaders = headers.filter(h => 
            !requiredColumns.includes(normalizeHeader(h))
          )
          
          const normalizedDynamicHeaders = dynamicHeaders.map(normalizeHeader)
          const normalizedTemplate = template.map(normalizeHeader)

          // Check if template columns exist in the uploaded file (order doesn't matter)
          const missingInFile = normalizedTemplate.filter(t => 
            !normalizedDynamicHeaders.includes(t)
          )
          
          const extraInFile = normalizedDynamicHeaders.filter(h => 
            !normalizedTemplate.includes(h)
          )

          if (missingInFile.length > 0 || extraInFile.length > 0) {
            setError(
              `Template mismatch:\n` +
              (missingInFile.length > 0
                ? `Missing:\n${missingInFile.map(col => `• ${col.replace(/\r?\n|\r/g, " ")}`).join('\n')}\n`
                : ""
              ) +
              (extraInFile.length > 0
                ? `Unexpected:\n${extraInFile.map(col => `• ${col.replace(/\r?\n|\r/g, " ")}`).join('\n')}`
                : ""
              )
            )
            setLoading(false)
            return
          }
        }

        // Convert to array of objects
        const descriptionIndex = normalizedHeaders.indexOf("description")
        const dataRows = jsonData.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, index) => {
            // If value is undefined or empty, set as empty string
            if (
              row[index] === undefined ||
              row[index] === null ||
              row[index] === ""
            ) {
              obj[header] = ""
            } else {
              obj[header] = String(row[index])
            }
          })
          return obj
        })

        // Get subcategories from "Code" column (case-insensitive)
        const codeHeaderIndex = normalizedHeaders.indexOf("code")
        const codeHeader = headers[codeHeaderIndex]
        const subs = Array.from(
          new Set(
            dataRows
              .map(row => row[codeHeader]?.toString().trim())
              .filter(val => val && val !== "")
          )
        ).filter(Boolean)

        if (subs.length === 0) {
          setError("No valid subcategories (Code) found in the file")
          setLoading(false)
          return
        }

        setExcelData(dataRows)
        setColumns(headers)
        setUniqueSubcategories(subs)
        setSubcategoriesUploaded(false) // Reset when new file is uploaded

        toast.success(`File uploaded successfully. Found ${subs.length} unique Codes (subcategories) in the file.`)
      } catch (error) {
        console.error("Error parsing Excel:", error)
        setError("Failed to parse Excel file. Please ensure it's a valid format.")
      } finally {
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError("Error reading file")
      setLoading(false)
    }

    reader.readAsBinaryString(file)
  }

  // When going to step 2 → group data by Code
  const handleNext = () => {
    if (uniqueSubcategories.length === 0) {
      toast.error("No Codes (subcategories) found in file")
      return
    }

    if (!subcategoriesUploaded) {
      toast.error("Please upload subcategories first")
      return
    }

    const grouped = {}
    const codeHeader = columns.find(col => col.toLowerCase() === "code")
    
    uniqueSubcategories.forEach((code) => {
      grouped[code] = excelData.filter(
        (row) => row[codeHeader]?.toString().trim() === code
      )
    })

    setGroupedData(grouped)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setGroupedData({})
  }

  const handleReset = () => {
    setStep(1)
    setExcelData([])
    setUniqueSubcategories([])
    setGroupedData({})
    setError("")
    setColumns([])
    setSubcategoriesUploaded(false) // Reset this state too
    setSubCategoryList([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFinish = () => {
    // Here you would typically send the data to your API
    console.log("Importing data:", groupedData)
    toast.success(`Successfully imported ${uniqueSubcategories.length} Codes (subcategories)!`)
    
    // Reset the form after successful import
    setTimeout(() => {
      handleReset()
    }, 1500)
  }

  // Determine if the user is in the middle of an import (not completed)
  const isInProgress = step !== 3 && (
    columns.length > 0 ||
    excelData.length > 0 ||
    uniqueSubcategories.length > 0 ||
    Object.keys(groupedData || {}).length > 0
  )

  // Warn on unload/refresh/navigation away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isInProgress) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }
    if (isInProgress) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isInProgress])

  // Add this effect to notify parent about progress
  useEffect(() => {
    if (typeof setIsInProgress === "function") {
      setIsInProgress(isInProgress);
    }
  }, [isInProgress, setIsInProgress]);

  const startEditing = (subcategory, rowIndex, column, value) => {
    setEditingCell({ subcategory, rowIndex, column })
    setEditValue(value)
  }

  const saveEdit = () => {
    if (!editingCell) return

    const { subcategory, rowIndex, column } = editingCell
    const updatedGroupedData = { ...groupedData }
    
    // Update the value
    updatedGroupedData[subcategory][rowIndex][column] = editValue
    
    // If editing Code, we need to handle moving the row
    if (column.toLowerCase() === "code") {
      const newCode = editValue.trim()
      if (newCode && newCode !== subcategory) {
        // Move row to new code group
        const rowToMove = updatedGroupedData[subcategory][rowIndex]
        updatedGroupedData[subcategory].splice(rowIndex, 1)
        
        if (!updatedGroupedData[newCode]) {
          updatedGroupedData[newCode] = []
        }
        updatedGroupedData[newCode].push(rowToMove)
        
        // Update unique subcategories if needed
        if (!uniqueSubcategories.includes(newCode)) {
          setUniqueSubcategories([...uniqueSubcategories, newCode])
        }
      }
    }
    
    setGroupedData(updatedGroupedData)
    setEditingCell(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const openPreview = (subcategory) => {
    setSelectedSubcategory(subcategory)
    setPreviewDialogOpen(true)
  }

  const steps = ['Upload File', 'Review Data', 'Complete Import']

  // Add this function to extract only subcategory fields
  const getSubcategoryRows = () => {
    const subCols = columns.filter(col =>
      ["code", "sub code", "description"].includes(col.toLowerCase())
    )
    return excelData.map(row => {
      const obj = {}
      subCols.forEach(col => {
        obj[col] = row[col]
      })
      return obj
    })
  }

  // Add this function to handle subcategory upload
  const handleUploadSubcategories = async () => {
    if (uniqueSubcategories.length === 0) {
      setMessage("No subcategories to upload")
      setOpen(true)
      toast.error("No subcategories to upload")
      return
    }
    setLoading(true)
    try {
      const payload = {
        data: uniqueSubcategories.map(name => ({
          categoryId: id,
          name,
        }))
      }
      const res = await axios.post(`${BASE_URL}/api/cabinet-subcategories/import`, payload)
      if (res.status === 201) {
         setMessage(res.data.message || "Subcategories uploaded successfully")
      setOpen(true)
        toast.success(res.data.message)
        setSubCategoryList(res.data.cabinetSubCategory) // <-- Save subcategories with ids
        setSubcategoriesUploaded(true) // Mark as uploaded
      }
       else {
          setMessage(res.data.message || "Failed to upload subcategories")
      setOpen(true)
        toast.error("Failed to upload subcategories")
      }
    } catch (error) {
      toast.error("Error uploading subcategories")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportData = async () => {
    toast.loading("Importing data...")
    try {
      // Find header keys
      const codeHeader = columns.find(col => col.toLowerCase() === "code")
      const subCodeHeader = columns.find(col => col.toLowerCase() === "sub code")
      const descriptionHeader = columns.find(col => col.toLowerCase() === "description")

      // Prepare a map for fast lookup: { name: id }
      const subCatMap = {}
      subCategoryList.forEach(sub => {
        subCatMap[sub.name] = sub.id
      })

      // Flatten groupedData to a single array of rows
      const allRows = Object.values(groupedData).flat()

      // Prepare payload with corrected mapping logic
      const importRows = allRows.map(row => {
        // Create an array to preserve column order for dynamic data
        const arrayList = []

        // Process columns in their original order
        columns.forEach(col => {
          // Skip the fixed columns (code, sub code, description)
          if (
            col.toLowerCase() !== codeHeader.toLowerCase() &&
            col.toLowerCase() !== subCodeHeader.toLowerCase() &&
            col.toLowerCase() !== descriptionHeader.toLowerCase()
          ) {
            // Handle empty column names by using the original header
            const columnLabel = col || "unnamed_column"
            
            // Preserve the original column name and value in order
            arrayList.push({
              label: columnLabel,
              value: row[col] || ""
            })
          }
        })

        const subcategoryName = row[codeHeader]?.toString().trim()
        const subcategoryId = subCatMap[subcategoryName]

        if (!subcategoryId) {
          console.warn(`No subcategory found for: ${subcategoryName}`)
        }

        return {
          cabinetCategoryId: id,
          cabinetSubCategoryId: subcategoryId,
          code: row[subCodeHeader],
          description: row[descriptionHeader],
          dynamicData: { arrayList },
        }
      })

      console.log("SubCategory Map:", subCatMap)
      console.log("Sample import row:", importRows[0])
      console.log("Total rows to import:", importRows.length)
      let res;

      // ✅ Split into chunks (20 by 20)
      const chunkSize = 20
      for (let i = 0; i < importRows.length; i += chunkSize) {
        const chunk = importRows.slice(i, i + chunkSize)

        res = await axios.post(`${BASE_URL}/api/cabinet/import`, { data: chunk })

        if (res.status !== 201) {
          toast.dismiss()
          toast.error(res.data.message)
          return
        }

        console.log(`Imported rows ${i + 1} - ${i + chunk.length}`)
      }

      toast.dismiss()
      setMessage(res.data.message || "Import completed successfully")
      setOpen(true)
      toast.success(res.data.message)
      setStep(3) // Move to completion step
    } catch (error) {

      toast.dismiss()
      console.log("Import error:", error)
      toast.error("Error importing data")
    } 
  }

  useEffect(() => {
    const handleInternalNavigation = (e) => {
      // Only intercept if in progress
      if (isInProgress) {
        // Find anchor or button with navigation intent
        let target = e.target;
        while (target && !target.getAttribute("href")) {
          target = target.parentElement;
        }
        if (target && target.getAttribute("href")) {
          e.preventDefault();
          setPendingNavigation(target.getAttribute("href"));
          setCancelConfirmOpen(true);
        }
      }
    };

    // Attach to sidebar/menu container (replace '#sidebar' with your sidebar/menu id/class)
    const sidebar = document.querySelector("#sidebar");
    if (sidebar) {
      sidebar.addEventListener("click", handleInternalNavigation, true);
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("click", handleInternalNavigation, true);
      }
    };
  }, [isInProgress]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {
        open && (
          <Notification
            open={open}
            message={`${message}`}
            type="warning"
            onClose={() => setOpen(false)}
          />
        )
      }
    
    <Button
      variant="text"
      onClick={(e) => {
        if (isInProgress) {
          setPendingNavigation('/cabinet/categories')
          setCancelConfirmOpen(true)
        } else {
          router.push('/cabinet/categories')
        }
      }}
    >
      Back
    </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Import Subcategories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an Excel file to import product subcategories into the system.<br/>
          <b>Required columns:</b> <Chip label="Code" size="small" color="primary" /> <Chip label="Sub Code" size="small" color="primary" /> <Chip label="Description" size="small" color="primary" />. Others are dynamic.
        </Typography>
      </Box>

      <Stepper activeStep={step-1} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <div style={{ whiteSpace: "pre-line" }}>{error}</div>
        </Alert>
      )}

      {step === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              File Requirements
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upload an Excel file with <b>Code</b>, <b>Sub Code</b>, and <b>Description</b> columns. Additional columns will be imported as well.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              <Chip label="Code" color="primary" size="small" variant="outlined" />
              <Chip label="Sub Code" color="primary" size="small" variant="outlined" />
              <Chip label="Description" color="primary" size="small" variant="outlined" />
              <Chip label="+ dynamic columns" color="secondary" size="small" variant="outlined" />
            </Box>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Upload Excel File
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                hidden
              />
            </Button>
          </Paper>
          
          {columns.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detected Columns
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {columns.map((col, idx) => (
                  <Chip 
                    key={idx} 
                    label={col || "(empty)"} 
                    color={["code", "sub code", "description"].includes(col.toLowerCase()) ? "primary" : "default"}
                    size="small" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Paper>
          )}
          
          {uniqueSubcategories.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Found {uniqueSubcategories.length} Unique Codes (Subcategories) in File
              </Typography>
              <List dense sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {uniqueSubcategories.map((sub, idx) => (
                  <ListItem key={idx} divider={idx < uniqueSubcategories.length - 1}>
                    <ListItemText 
                      primary={sub || "(empty)"}
                      secondary={
                        subCategoryList.find(item => item.name === sub)?.id 
                          ? `ID: ${subCategoryList.find(item => item.name === sub).id}` 
                          : "(not uploaded)"
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={uniqueSubcategories.length === 0 || loading || subcategoriesUploaded}
                  onClick={handleUploadSubcategories}
                >
                  {subcategoriesUploaded ? "Subcategories Uploaded ✓" : "Upload Subcategories"}
                </Button>
                
                {/* Only show Next button after subcategories are uploaded */}
                {subcategoriesUploaded && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={uniqueSubcategories.length === 0 || loading}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Import Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the data before importing. The system found {uniqueSubcategories.length} Codes (subcategories) with a total of {excelData.length} items.
              Click on a Code to view and edit its items.
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(groupedData).map(([sub, rows]) => (
                <Grid item xs={12} md={6} lg={4} key={sub}>
                  <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => openPreview(sub)}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {sub || "(empty)"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {rows.length} item{rows.length !== 1 ? 's' : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {rows.slice(0, 3).map((row, idx) => {
                          const subCodeHeader = columns.find(col => col.toLowerCase() === "sub code")
                          return (
                            <Chip 
                              key={idx} 
                              label={row[subCodeHeader] || `Item ${idx+1}`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )
                        })}
                        {rows.length > 3 && (
                          <Chip 
                            label={`+${rows.length - 3} more`} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" onClick={handleImportData}>
              Import Data
            </Button>
          </Box>
        </Box>
      )}

      {step === 3 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="success.main">
            Import Completed Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your subcategories have been imported successfully.
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            Import Another File
          </Button>
        </Paper>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Editing: {selectedSubcategory || "(empty)"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedSubcategory && groupedData[selectedSubcategory] && (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((col, idx) => (
                      <TableCell key={idx}>{col || "missing name"}</TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedData[selectedSubcategory].map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <TableCell key={colIndex}>
                          {editingCell && 
                           editingCell.subcategory === selectedSubcategory && 
                           editingCell.rowIndex === rowIndex && 
                           editingCell.column === col ? (
                            <TextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="small"
                              fullWidth
                              autoFocus
                            />
                          ) : (
                            <Box 
                              onClick={() => startEditing(selectedSubcategory, rowIndex, col, row[col] || "")}
                              sx={{ 
                                p: 1, 
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                            >
                              {row[col] || "(empty)"}
                            </Box>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        {editingCell && 
                         editingCell.subcategory === selectedSubcategory && 
                         editingCell.rowIndex === rowIndex ? (
                          <Box>
                            <IconButton size="small" onClick={saveEdit}>
                              <Save />
                            </IconButton>
                            <IconButton size="small" onClick={cancelEdit}>
                              <Cancel />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              const firstEmptyColumn = columns.find(col => !row[col])
                              if (firstEmptyColumn) {
                                startEditing(selectedSubcategory, rowIndex, firstEmptyColumn, "")
                              } else {
                                startEditing(selectedSubcategory, rowIndex, columns[0], row[columns[0]] || "")
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog 
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Confirm Cancel</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            You are in the middle of an import. Do you want to cancel the process?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>
            Stay
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Explicit cancel
              handleReset()
              setCancelConfirmOpen(false)
              if (pendingNavigation) {
                const to = pendingNavigation
                setPendingNavigation(null)
                router.push(to)
              }
            }}
          >
            Cancel Import
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CabinetImport