"use client";

import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";

// Your imported components
import Dashboard from "@/components/account/Dashboard";
import ProgressClaims from "@/components/account/ProgressClaims";
import InvoicesPayments from "@/components/account/InvoicesPayments";
import SupplierInvoices from "@/components/account/SupplierInvoices";
import ProjectCosting from "@/components/account/ProjectCosting";
import RetentionTracking from "@/components/account/RetentionTracking";
import Reports from "@/components/account/Reports";

const AccountsModule = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { value: "dashboard", label: "Dashboard", component: Dashboard },
    { value: "progress-claims", label: "Progress Claims", component: ProgressClaims },
    { value: "invoices-payments", label: "Invoices & Payments", component: InvoicesPayments },
    { value: "supplier-invoices", label: "Supplier Invoices", component: SupplierInvoices },
    { value: "project-costing", label: "Project Costing", component: ProjectCosting },
    { value: "retention-tracking", label: "Retention Tracking", component: RetentionTracking },
    { value: "reports", label: "Reports", component: Reports },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight="600" color="primary">
              Accounts Module
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Comprehensive financial management and reporting
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Container>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                sx={{ textTransform: "none", fontWeight: 500 }}
              />
            ))}
          </Tabs>
        </Container>
      </AppBar>

      {/* Tab Content */}
      <Container sx={{ mt: 3 }}>
        {tabs.map((tab) =>
          activeTab === tab.value ? <tab.component key={tab.value} /> : null
        )}
      </Container>
    </Box>
  );
};

export default AccountsModule;
