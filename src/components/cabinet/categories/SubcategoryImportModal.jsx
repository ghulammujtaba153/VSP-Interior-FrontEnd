"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material"
import { Close, CloudUpload } from "@mui/icons-material"
import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import Loader from "@/components/loader/Loader"

const SubcategoryImportModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [excelData, setExcelData] = useState([])
  const [uniqueSubcategories, setUniqueSubcategories] = useState([])
  const [groupedData, setGroupedData] = useState({})
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1)
      setExcelData([])
      setUniqueSubcategories([])
      setGroupedData({})
      setError("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [open])

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
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          setError("Excel file is empty")
          setLoading(false)
          return
        }

        // Check if subcategory column exists
        if (!jsonData[0].hasOwnProperty("subcategory")) {
          setError("Excel file must contain a 'subcategory' column")
          setLoading(false)
          return
        }

        // Extract unique subcategories
        const subs = Array.from(
          new Set(jsonData.map((row) => row.subcategory?.toString().trim()))
        ).filter(Boolean)

        if (subs.length === 0) {
          setError("No valid subcategories found in the file")
          setLoading(false)
          return
        }

        setExcelData(jsonData)
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
    uniqueSubcategories.forEach((sub) => {
      grouped[sub] = excelData.filter(
        (row) => row.subcategory?.toString().trim() === sub
      )
    })

    setGroupedData(grouped)
    setStep(2)
  }

  const handleBack = () => setStep(1)

  const handleFinish = () => {
    onSuccess(groupedData)
    toast.success("Subcategories imported successfully!")
    onClose()
  }

  const steps = ['Upload File', 'Review Data', 'Complete Import']

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Import Subcategories
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        
        <Stepper activeStep={step-1} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        {loading && <Loader />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 1 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upload an Excel file with a <b>subcategory</b> column. The file should include these columns:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {["code", "description", "subcategory", "unit", "height", "thickness", 
                "depth", "ends", "bottom", "top", "rail", "b", "material", 
                "finish", "price", "b-set"].map((col) => (
                <Chip key={col} label={col} size="small" variant="outlined" />
              ))}
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
            
            {uniqueSubcategories.length > 0 && (
              <Paper sx={{ mt: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Found {uniqueSubcategories.length} Unique Subcategories:
                </Typography>
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {uniqueSubcategories.map((sub, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={sub} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Review Grouped Data by Subcategories
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {Object.entries(groupedData).map(([sub, rows]) => (
                <Paper key={sub} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {sub}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {rows.length} items under this subcategory
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {rows.slice(0, 5).map((row, idx) => (
                      <Chip 
                        key={idx} 
                        label={row.code || `Item ${idx+1}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                    {rows.length > 5 && (
                      <Chip 
                        label={`+${rows.length - 5} more`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step === 2 ? (
          <>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleFinish}>
              Import {uniqueSubcategories.length} Subcategories
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={uniqueSubcategories.length === 0 || loading}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default SubcategoryImportModal