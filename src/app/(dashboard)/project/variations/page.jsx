'use client'

import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Loader from '@/components/loader/Loader'
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Autocomplete
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ProjectSetupAutocomplete = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)

  const router = useRouter()

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/api/project-setup/get?page=1&limit=100`
      )
      setData(res.data.data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSelect = (event, project) => {
    setSelectedProject(project)
  }

  const handleNext = () => {
    if (selectedProject?.id) {
      router.push(`/project/variations/${selectedProject.id}`)
    } else {
      toast.warning('Please select a project first')
    }
  }

  if (loading) return <Loader />

  return (
    <Paper sx={{ padding: 2 }}>
      <Link href='/quotes'>
        <Button variant='contained' color='primary'>
          Back
        </Button>
      </Link>

      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h5' fontWeight='bold'>
          Project Setup Management
        </Typography>

        <Link href='/project/form'>
          <Button variant='contained' color='primary' startIcon={<Add />}>
            Add Project
          </Button>
        </Link>
      </Box>

      {/* Autocomplete Search */}
      <Autocomplete
        options={data}
        getOptionLabel={option =>
          `${option.projectName} — ${option.client?.companyName || 'No Client'}`
        }
        value={selectedProject}
        onChange={handleSelect}
        renderInput={params => (
          <TextField
            {...params}
            label='Search & Select Project'
            placeholder='Type project name...'
            fullWidth
          />
        )}
      />

      {/* Next Button */}
      <Box mt={3} display='flex' justifyContent='flex-end'>
        <Button
          variant='contained'
          color='secondary'
          onClick={handleNext}
          disabled={!selectedProject}
        >
          Next
        </Button>
      </Box>
    </Paper>
  )
}

export default ProjectSetupAutocomplete
