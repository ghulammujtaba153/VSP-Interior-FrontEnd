"use client"

import React, { useState, useRef } from "react"
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

const SubcategoryImportPage = () => {
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
  const fileInputRef = useRef(null)

  // Handle file upload and parse excel
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError("Please select a valid Excel file (.xlsx or .xls)")
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

        // Extract headers (first row)
        const headers = jsonData[0].map(header => header?.toString().trim() || "")
        
        // Check if required columns exist
        const requiredColumns = ["code", "description", "subcategory"]
        const missingColumns = requiredColumns.filter(col => 
          !headers.some(header => header.toLowerCase() === col)
        )
        
        if (missingColumns.length > 0) {
          setError(`Missing required columns: ${missingColumns.join(", ")}`)
          setLoading(false)
          return
        }

        // Convert to array of objects
        const dataRows = jsonData.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined ? String(row[index]) : ""
          })
          return obj
        })

        // Extract unique subcategories
        const subcategoryIndex = headers.findIndex(h => h.toLowerCase() === "subcategory")
        const subs = Array.from(
          new Set(dataRows.map(row => row[headers[subcategoryIndex]]?.toString().trim()))
        ).filter(Boolean)

        if (subs.length === 0) {
          setError("No valid subcategories found in the file")
          setLoading(false)
          return
        }

        setExcelData(dataRows)
        setColumns(headers)
        setUniqueSubcategories(subs)

        toast.success(`File uploaded successfully. Found ${subs.length} unique subcategories`)
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

  // When going to step 2 → group data by subcategories
  const handleNext = () => {
    if (uniqueSubcategories.length === 0) {
      toast.error("No subcategories found in file")
      return
    }

    const grouped = {}
    const subcategoryHeader = columns.find(col => col.toLowerCase() === "subcategory")
    
    uniqueSubcategories.forEach((sub) => {
      grouped[sub] = excelData.filter(
        (row) => row[subcategoryHeader]?.toString().trim() === sub
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFinish = () => {
    // Here you would typically send the data to your API
    console.log("Importing data:", groupedData)
    toast.success(`Successfully imported ${uniqueSubcategories.length} subcategories!`)
    
    // Reset the form after successful import
    setTimeout(() => {
      handleReset()
    }, 1500)
  }

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
    
    // If editing subcategory, we need to handle moving the row
    if (column.toLowerCase() === "subcategory") {
      const newSubcategory = editValue.trim()
      if (newSubcategory && newSubcategory !== subcategory) {
        // Move row to new subcategory
        const rowToMove = updatedGroupedData[subcategory][rowIndex]
        updatedGroupedData[subcategory].splice(rowIndex, 1)
        
        if (!updatedGroupedData[newSubcategory]) {
          updatedGroupedData[newSubcategory] = []
        }
        updatedGroupedData[newSubcategory].push(rowToMove)
        
        // Update unique subcategories if needed
        if (!uniqueSubcategories.includes(newSubcategory)) {
          setUniqueSubcategories([...uniqueSubcategories, newSubcategory])
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
    
    <Link href="/cabinet/categories" passHref>Back</Link>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Import Subcategories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an Excel file to import product subcategories into the system
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
          {error}
        </Alert>
      )}

      {step === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              File Requirements
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upload an Excel file with <b>code</b>, <b>description</b>, and <b>subcategory</b> columns. Additional columns will be imported as well.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              <Chip label="code" color="primary" size="small" variant="outlined" />
              <Chip label="description" color="primary" size="small" variant="outlined" />
              <Chip label="subcategory" color="primary" size="small" variant="outlined" />
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
                    color={["code", "description", "subcategory"].includes(col.toLowerCase()) ? "primary" : "default"}
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
                Found {uniqueSubcategories.length} Unique Subcategories
              </Typography>
              <List dense sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {uniqueSubcategories.map((sub, idx) => (
                  <ListItem key={idx} divider={idx < uniqueSubcategories.length - 1}>
                    <ListItemText primary={sub || "(empty)"} />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={uniqueSubcategories.length === 0 || loading}
                >
                  Next
                </Button>
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
              Please review the data before importing. The system found {uniqueSubcategories.length} subcategories with a total of {excelData.length} items.
              Click on a subcategory to view and edit its items.
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
                        {rows.slice(0, 3).map((row, idx) => (
                          <Chip 
                            key={idx} 
                            label={row.code || `Item ${idx+1}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
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
            <Button variant="contained" onClick={handleFinish}>
              Import {uniqueSubcategories.length} Subcategories
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
                      <TableCell key={idx}>{col || "(empty)"}</TableCell>
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
    </Container>
  )
}

export default SubcategoryImportPage