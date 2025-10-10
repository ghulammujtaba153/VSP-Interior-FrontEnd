

'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'

import { BASE_URL } from '@/configs/url'

import CreateProjectStep1 from './CreateProjectStep1'
import CreateProjectStep2 from './CreateProjectStep2'
import CreateProjectStep3 from './CreateProjectStep3'
import CreateProjectStep4 from './CreateProjectStep4'
import CreateProjectStep5 from './CreateProjectStep5'
import Loader from '../loader/Loader'

const steps = [
  { label: 'Project Details', component: CreateProjectStep1 },
  { label: 'Rates Setup', component: CreateProjectStep2 },
  { label: 'Materials Setup', component: CreateProjectStep3 },
  { label: 'Project Overview', component: CreateProjectStep4 },
  { label: 'Costing Sheet', component: CreateProjectStep5 },
]

const CreateProject = () => {
  const [step1Data, setStep1Data] = useState({})
  const [step2Data, setStep2Data] = useState([]) // Rates
  const [step3Data, setStep3Data] = useState([]) // Materials
  const [step5Data, setStep5Data] = useState({}) // Costing Sheet
  const [activeStep, setActiveStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const mode = searchParams.get('mode') // "create" | "edit"
  const amend = searchParams.get('amend')
  const router = useRouter()

  const StepComponent = steps[activeStep].component

  // Fetch project in edit mode
  useEffect(() => {
    const fetchProject = async () => {
      if (mode === 'edit' && id) {
        try {
          setIsLoading(true)
          const res = await axios.get(`${BASE_URL}/api/project-setup/get/${id}`)
          const project = res.data.data

          setStep1Data({
            id: project.id,
            projectName: project.projectName,
            description: project.description,
            clientId: project.clientId,
            qsName: project.qsName || '',
            qsPhone: project.qsPhone || '',
            accessNotes: project.accessNotes || '',
            siteLocation: project.siteLocation || '',
          })

          setStep2Data(project.rates || [])
          setStep3Data(project.materials || [])
          // Handle costingSheet - it should be an object, not an array
          const costingSheetData = project.costingSheet || {}
          // Remove id and projectId if they exist (from database)
          const { id: csId, projectId: csProjId, createdAt, updatedAt, ...cleanCostingSheet } = costingSheetData
          setStep5Data(Object.keys(cleanCostingSheet).length > 0 ? cleanCostingSheet : {})
        } catch (err) {
          console.error(err)
          toast.error('Failed to fetch project details')
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchProject()
  }, [id, mode])

  // Handle submit
  const handleSubmit = async () => {
    const payload = {
      project: step1Data,
      rates: step2Data,
      materials: step3Data,
      costingSheet: step5Data,
      amend: amend ? true : false
    }

    toast.loading(mode === 'edit' ? 'Updating project...' : 'Saving project...')

    try {
      if (mode === 'edit' && id) {
        await axios.put(`${BASE_URL}/api/project-setup/update/${id}`, payload)
        toast.dismiss()
        toast.success('Project updated successfully!')
      } else {
        await axios.post(`${BASE_URL}/api/project-setup/create`, payload)
        toast.dismiss()
        toast.success('Project created successfully!')
        setStep1Data({})
        setStep2Data([])
        setStep3Data([])
        setStep5Data({})
        setActiveStep(0)
      }
    } catch (err) {
      toast.dismiss()
      toast.error('Error saving project')
      console.error(err)
    }
  }

  // --- NAVIGATION HANDLING (Top/Bottom/Sidebar) ---
  const confirmLeave = (href) => {
    setPendingNavigation(href || null)
    setOpenDialog(true)
  }

  const handleConfirmLeave = () => {
    setOpenDialog(false)
    if (pendingNavigation) {
      router.push(pendingNavigation) // Sidebar click
    } else {
      router.push('/project') // Default back route
    }
  }

  const handleBottomBack = () => {
    if (activeStep === 0) {
      confirmLeave()
    } else {
      setActiveStep(prev => Math.max(prev - 1, 0))
    }
  }

  // Intercept sidebar navigation
  useEffect(() => {
    const handleSidebarClick = (e) => {
      const anchor = e.target.closest('a[href]')
      if (anchor) {
        e.preventDefault()
        confirmLeave(anchor.getAttribute('href'))
      }
    }

    const sidebar = document.querySelector('#sidebar')
    if (sidebar) {
      sidebar.addEventListener('click', handleSidebarClick)
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('click', handleSidebarClick)
      }
    }
  }, [])

  if (isLoading) return <Loader />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Top Back Button */}
      <Button
        onClick={() => confirmLeave()}
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Leave Project Setup?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to leave this process? Your unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmLeave} color="error" variant="contained">
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight="bold"
        textAlign="center"
      >
        {mode === 'edit' ? 'Edit Project' : 'Create Project'}
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map(step => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: '#fafafa',
        }}
      >
        <StepComponent
          formData={activeStep === 0 ? step1Data : activeStep === 4 ? step5Data : {}}
          setFormData={activeStep === 0 ? setStep1Data : activeStep === 4 ? setStep5Data : () => {}}
          records={
            activeStep === 1 ? step2Data : activeStep === 2 ? step3Data : []
          }
          setRecords={
            activeStep === 1
              ? setStep2Data
              : activeStep === 2
              ? setStep3Data
              : () => {}
          }
          allData={{
            step1: step1Data,
            step2: step2Data,
            step3: step3Data,
            step5: step5Data,
          }}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBottomBack}>
          Back
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() =>
              setActiveStep(prev => Math.min(prev + 1, steps.length - 1))
            }
          >
            Next
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit}>
            {mode === 'edit' ? 'Update' : 'Submit'}
          </Button>
        )}
      </Box>
    </Container>
  )
}

export default CreateProject
