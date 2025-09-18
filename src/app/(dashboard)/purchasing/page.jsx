"use client"

import React, { useState } from "react"
import Dashboard from "@components/purchasing/Dashboard"
import CreateEditPO from "@components/purchasing/CreateEditPO"
import PODetails from "@components/purchasing/PODetails"
import DeliveryGRN from "@components/purchasing/DeliveryGRN"
import InvoicesAllocation from "@components/purchasing/InvoicesAllocation"
import Reports from "@components/purchasing/Reports"

import { Box, Card, Tabs, Tab, Typography } from "@mui/material"

// ✅ Import MUI Icons
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import DescriptionIcon from "@mui/icons-material/Description"
import VisibilityIcon from "@mui/icons-material/Visibility"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import ReceiptIcon from "@mui/icons-material/Receipt"
import BarChartIcon from "@mui/icons-material/BarChart"

// ✅ Tab Panel helper
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  )
}

const Page = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 3 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Purchasing Module
          </Typography>
          <Typography color="text.secondary">
            Complete procurement workflow for kitchen joinery projects
          </Typography>
        </Box>

        {/* Card with Tabs */}
        <Card sx={{ p: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab
              label="Dashboard"
              icon={<ShoppingCartIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Create PO"
              icon={<DescriptionIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="PO Details"
              icon={<VisibilityIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Delivery"
              icon={<LocalShippingIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Invoices"
              icon={<ReceiptIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Reports"
              icon={<BarChartIcon fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            <Dashboard />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <CreateEditPO />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <PODetails />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <DeliveryGRN />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <InvoicesAllocation />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <Reports />
          </TabPanel>
        </Card>
      </Box>
    </Box>
  )
}

export default Page
