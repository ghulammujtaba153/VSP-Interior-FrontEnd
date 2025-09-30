// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { Container, Box, Typography, Paper, Button, Stepper, Step, StepLabel } from "@mui/material";

// import { BASE_URL } from "@/configs/url";

// import CreateProjectStep1 from "./CreateProjectStep1";
// import CreateProjectStep2 from "./CreateProjectStep2";
// import CreateProjectStep3 from "./CreateProjectStep3";
// import CreateProjectStep4 from "./CreateProjectStep4";
// import { useSearchParams } from "next/navigation";

// const steps = [
//   { label: "Project Details", component: CreateProjectStep1 },
//   { label: "Rates Setup", component: CreateProjectStep2 },
//   { label: "Materials Setup", component: CreateProjectStep3 },
//   { label: "Project Overview", component: CreateProjectStep4 },
// ];

// const CreateProject = () => {
//   const [step1Data, setStep1Data] = useState({});
//   const [step2Data, setStep2Data] = useState([]); // Array for rates
//   const [step3Data, setStep3Data] = useState([]); // Array for materials
//   const [activeStep, setActiveStep] = useState(0);
//   const searchParams = useSearchParams()
//   const id = searchParams.get('id')
//   const mode = searchParams.get('mode')

//   const StepComponent = steps[activeStep].component;

//   useEffect(() => {
//     if (mode === 'edit' && id) {
//       axios.get(`${BASE_URL}/api/project-setup/get/${id}`).then(res => {

//         console.log(res.data)
//       })
//     }
//   }, [id, mode])

//   const handleSubmit = async () => {
//     // Prepare payload matching controller structure
//     const payload = {
//       project: step1Data,
//       rates: step2Data,
//       materials: step3Data,
//     };

//     toast.loading("Saving ...");

//     try {
//       const res = await axios.post(`${BASE_URL}/api/project-setup/create`, payload);
//       toast.dismiss();
//       toast.success("Project saved successfully!");
//       setStep1Data({});
//       setStep2Data([]);
//       setStep3Data([]);
//       setActiveStep(0);
//     } catch (err) {
//       toast.dismiss();
//       toast.error("Error saving project");
//       console.error(err);
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
//         Create Project
//       </Typography>

//       <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
//         {steps.map((step) => (
//           <Step key={step.label}>
//             <StepLabel>{step.label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       <Paper sx={{ p: 3, mb: 3 }}>
//         <StepComponent
//           formData={
//             activeStep === 0 ? step1Data : {}
//           }
//           setFormData={
//             activeStep === 0 ? setStep1Data : () => {}
//           }
//           records={
//             activeStep === 1 ? step2Data :
//             activeStep === 2 ? step3Data :
//             []
//           }
//           setRecords={
//             activeStep === 1 ? setStep2Data :
//             activeStep === 2 ? setStep3Data :
//             () => {}
//           }
//           allData={{
//             step1: step1Data,
//             step2: step2Data, // This should be an array
//             step3: step3Data
//           }}
//         />
//       </Paper>

//       <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//         <Button
//           onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
//           disabled={activeStep === 0}
//         >
//           Back
//         </Button>

//         {activeStep < steps.length - 1 ? (
//           <Button
//             variant="contained"
//             onClick={() => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))}
//           >
//             Next
//           </Button>
//         ) : (
//           <Button variant="contained" color="success" onClick={handleSubmit}>
//             Submit
//           </Button>
//         )}
//       </Box>
//     </Container>
//   );
// };

// export default CreateProject;

'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Container, Box, Typography, Paper, Button, Stepper, Step, StepLabel } from '@mui/material'
import { useSearchParams } from 'next/navigation'

import { BASE_URL } from '@/configs/url'

import CreateProjectStep1 from './CreateProjectStep1'
import CreateProjectStep2 from './CreateProjectStep2'
import CreateProjectStep3 from './CreateProjectStep3'
import CreateProjectStep4 from './CreateProjectStep4'
import Link from 'next/link'
import Loader from '../loader/Loader'

const steps = [
  { label: 'Project Details', component: CreateProjectStep1 },
  { label: 'Rates Setup', component: CreateProjectStep2 },
  { label: 'Materials Setup', component: CreateProjectStep3 },
  { label: 'Project Overview', component: CreateProjectStep4 }
]

const CreateProject = () => {
  const [step1Data, setStep1Data] = useState({})
  const [step2Data, setStep2Data] = useState([]) // Rates
  const [step3Data, setStep3Data] = useState([]) // Materials
  const [activeStep, setActiveStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const mode = searchParams.get('mode') // "create" | "edit"

  const StepComponent = steps[activeStep].component

  // Fetch existing project for edit mode
  useEffect(() => {
    const fetchProject = async () => {
      if (mode === 'edit' && id) {
        try {
          setIsLoading(true)
          const res = await axios.get(`${BASE_URL}/api/project-setup/get/${id}`)
          const project = res.data.data // ✅ correct

          setStep1Data({
            id: project.id,
            projectName: project.projectName,
            description: project.description,
            clientId: project.clientId,
            qsName: project.qsName || '',
            qsPhone: project.qsPhone || '',
            accessNotes: project.accessNotes || '',
            siteLocation: project.siteLocation || ''
          })

          setStep2Data(project.rates || [])
          setStep3Data(project.materials || [])
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

  // Handle submit (create or update)
  const handleSubmit = async () => {
    const payload = {
      project: step1Data,
      rates: step2Data,
      materials: step3Data
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
        setActiveStep(0)
      }
    } catch (err) {
      toast.dismiss()
      toast.error('Error saving project')
      console.error(err)
    }
  }


  if(isLoading) return <Loader/>

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Link href='/project'>
        <Button variant='contained' color='primary'>
          Back
        </Button>
      </Link>

      <Typography variant='h4' component='h1' gutterBottom fontWeight='bold' textAlign='center'>
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
          backgroundColor: '#fafafa'
        }}
      >
        <StepComponent
          formData={activeStep === 0 ? step1Data : {}}
          setFormData={activeStep === 0 ? setStep1Data : () => {}}
          records={activeStep === 1 ? step2Data : activeStep === 2 ? step3Data : []}
          setRecords={activeStep === 1 ? setStep2Data : activeStep === 2 ? setStep3Data : () => {}}
          allData={{
            step1: step1Data,
            step2: step2Data,
            step3: step3Data
          }}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))} disabled={activeStep === 0}>
          Back
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button variant='contained' onClick={() => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))}>
            Next
          </Button>
        ) : (
          <Button variant='contained' color='success' onClick={handleSubmit}>
            {mode === 'edit' ? 'Update' : 'Submit'}
          </Button>
        )}
      </Box>
    </Container>
  )
}

export default CreateProject
