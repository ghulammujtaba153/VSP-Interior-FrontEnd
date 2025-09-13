"use client"

import React from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import { QuoteDashboard } from "@/components/quotes/QuoteDashboard"
import { CreateQuote } from "@/components/quotes/CreateQuote"
import { QuoteTracking } from "@/components/quotes/QuoteTracking"
import { QuoteReports } from "@/components/quotes/QuoteReports"

// ✅ Correct TabPanel
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

export default function Quotes() {
  const [activeTab, setActiveTab] = React.useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Dashboard" />
          <Tab label="Create Quote" />
          <Tab label="Tracking" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <QuoteDashboard />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <CreateQuote />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <QuoteTracking />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <QuoteReports />
      </TabPanel>
    </Box>
  )
}
