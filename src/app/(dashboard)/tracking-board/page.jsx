"use client";

import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Container, 
  Paper,
  Divider,
  useTheme,
  alpha
} from "@mui/material";
import ProjectsTable from "@/components/trackboards/ProjectsTable";
import TrackingSummary from "@/components/trackboards/TrackingSummary";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableChartIcon from "@mui/icons-material/TableChart";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";

const Index = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/job-scheduling/get`);
      setProjects(res.data.jobs || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: 'background.default' }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Tracking Board
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor and manage your project live tracking details.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="tracking board tabs"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '0.95rem',
              fontWeight: 500,
              textTransform: 'none',
              gap: 1
            }
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Summary & Stats" />
          <Tab icon={<TableChartIcon />} iconPosition="start" label="All Projects" />
        </Tabs>
      </Box>

      <Box sx={{ p: 0 }}>
        {tabValue === 0 && (
          <Box sx={{ py: 2 }}>
            {loading ? <Loader /> : <TrackingSummary projects={projects} />}
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <ProjectsTable projects={projects} loading={loading} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Index;
