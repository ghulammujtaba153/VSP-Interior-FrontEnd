"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Select,
  MenuItem,
  Button,
  IconButton,
  Paper,
} from "@mui/material";

import {
  FilterList,
  Download,
  TrendingUp,
  AttachMoney,
  People,
  AccessTime,
  Inventory,
  TrendingDown,
} from "@mui/icons-material";

// Import your report components

import { FinancialReport } from "@/components/report/FinancialReport";
import { SalesPipelineReport } from "@/components/report/SalesPipelineReport";
import JobPerformanceReport from "@/components/report/JobPerformanceReport";
import ResourceUtilizationReport from "@/components/report/ResourceUtilizationReport";
import { InventoryTurnoverReport } from "@/components/report/InventoryTurnoverReport";
import SupplierPerformanceReport from "@/components/report/SupplierPerformanceReport";

const ReportsDashboard = () => {
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  return (
    <Box sx={{ minHeight: "100vh" }} component={Paper}>
      

      {/* Tabs */}
      <Container sx={{ marginTop: "2rem" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Sales Pipeline" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Financial Reports" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="Resource Utilization" icon={<People />} iconPosition="start" />
          <Tab label="Job Performance" icon={<AccessTime />} iconPosition="start" />
          <Tab label="Inventory Turnover" icon={<Inventory />} iconPosition="start" />
          <Tab label="Supplier Performance" icon={<TrendingDown />} iconPosition="start" />
        </Tabs>

        {/* Tab Content */}
        <Box mt={3}>
          {tabValue === 0 && (
            <SalesPipelineReport period={selectedPeriod} project={selectedProject} />
          )}
          {tabValue === 1 && (
            <FinancialReport period={selectedPeriod} project={selectedProject} />
          )}
          {tabValue === 2 && (
            <ResourceUtilizationReport period={selectedPeriod} project={selectedProject} />
          )}
          {tabValue === 3 && (
            <JobPerformanceReport period={selectedPeriod} project={selectedProject} />
          )}
          {tabValue === 4 && (
            <InventoryTurnoverReport period={selectedPeriod} project={selectedProject} />
          )}
          {tabValue === 5 && (
            <SupplierPerformanceReport period={selectedPeriod} project={selectedProject} />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ReportsDashboard;
