"use client"

import React, { useEffect, useState } from 'react'
import MaterialTable from '@/components/cabinet/cabinet-updated/MaterialTable'
import CabinetImport from '@/components/cabinet/cabinet-updated/CabinetImport'
import SubCategories from '@/components/cabinet/cabinet-updated/SubCategories'
import { useParams } from 'next/navigation'
import { Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Paper } from '@mui/material'
import axios from 'axios'
import { BASE_URL } from '@/configs/url'
import { useAuth } from '@/context/authContext'


const SubCategoriesPage = () => {
  const { id } = useParams()
  const [tabIndex, setTabIndex] = useState(0)
  const [isInProgress, setIsInProgress] = useState(false)
  const [pendingTab, setPendingTab] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [data, setData] = useState([]);
  const { token } = useAuth()




  const fetchData = async () => {
    console.log("fetching category data for id", id, localStorage.getItem('token'))
    try {
      const res = await axios.get(`${BASE_URL}/api/cabinet-categories/get/${id}`, {
        headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  useEffect(() => {
    fetchData();
  }, []);
  

  // Intercept tab change
  const handleTabChange = (e, newValue) => {
    if (isInProgress && tabIndex === 2) {
      setPendingTab(newValue)
      setConfirmOpen(true)
    } else {
      setTabIndex(newValue)
    }
  }

  // Handle confirmation
  const handleConfirmLeave = () => {
    setConfirmOpen(false)
    setTabIndex(pendingTab)
    setPendingTab(null)
    setIsInProgress(false) // Optionally reset import state
  }

  return (
    <Box component={Paper} sx={{ p: 2 }}>
      <Button variant="contained" color="primary" onClick={() => window.history.back('/cabinet/categories')}>
        &larr; Back to Categories
      </Button>
      <Typography variant="h4" gutterBottom>{data.name}</Typography>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Sub Categories" />
        <Tab label="Table" />
        <Tab label="Import Data" />
      </Tabs>
      {tabIndex === 0 && <SubCategories id={id} />}
      {tabIndex === 1 && <MaterialTable id={id} />}
      {tabIndex === 2 && (
        <CabinetImport
          id={id}
          setIsInProgress={setIsInProgress}
          categoryName={data.name}
        />
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Leave Import?</DialogTitle>
        <DialogContent>
          <Typography>
            You are in the middle of an import. Do you want to leave this page? Unsaved progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Stay</Button>
          <Button variant="contained" color="error" onClick={handleConfirmLeave}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SubCategoriesPage