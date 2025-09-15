"use client";

import Loader from '@/components/loader/Loader'
import GanttChart from '@/components/projects/GanttChart'
import OverAllProject from '@/components/projects/OverAllProject'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { Tabs, Tab, Box, Button } from '@mui/material'
import Link from 'next/link';
import GanttTry from '@/components/projects/GanttTry';

const Page = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const fetchProject = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/get/${id}`)
      setData(res.data.project)
    } catch (error) {
      toast.error('Error fetching project data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  if (loading) return <Loader />

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Button component={Link} href="/projects" variant="contained" sx={{ mb: 2 }}>Back</Button>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="project tabs"
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab label="Project Overview" />
        <Tab label="Project Timeline" />
        {/* <Tab label="Tasks"  /> */}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <OverAllProject project={data} />}
        {tabValue === 1 && <GanttChart project={data} />}
        {tabValue === 2 && <GanttTry project={data}/>}

      </Box>
    </Box>
  )
}

export default Page
