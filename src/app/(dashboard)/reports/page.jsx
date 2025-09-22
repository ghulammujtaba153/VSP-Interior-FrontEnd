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

  const handleExport = (type) => {
    console.log(`Exporting as ${type}`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box flexGrow={1}>
            <Typography variant="h6" color="textPrimary">
              Reports Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Comprehensive business intelligence and analytics
            </Typography>
          </Box>

          {/* Filters */}
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            size="small"
            style={{ marginRight: "1rem", minWidth: "150px" }}
          >
            <MenuItem value="all">All Projects</MenuItem>
            <MenuItem value="project-1">Project Alpha</MenuItem>
            <MenuItem value="project-2">Project Beta</MenuItem>
            <MenuItem value="project-3">Project Gamma</MenuItem>
          </Select>

          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            size="small"
            style={{ marginRight: "1rem", minWidth: "150px" }}
          >
            <MenuItem value="last-7-days">Last 7 days</MenuItem>
            <MenuItem value="last-30-days">Last 30 days</MenuItem>
            <MenuItem value="last-90-days">Last 90 days</MenuItem>
            <MenuItem value="last-year">Last year</MenuItem>
          </Select>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterList />}
            style={{ marginRight: "0.5rem" }}
          >
            Advanced Filters
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={() => handleExport("pdf")}
          >
            Export
          </Button>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Container style={{ marginTop: "2rem" }}>
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
    </div>
  );
};

export default ReportsDashboard;
