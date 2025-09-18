"use client"


import React, { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Container, 
  Paper 
} from "@mui/material";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";

import FactoryBoard from "@/components/trackboards/FactoryBoard";
import SiteBoard from "@/components/trackboards/SiteBoard";
import JobOverview from "@/components/trackboards/JobOverview";
import ReportsAnalytics from "@/components/trackboards/ReportsAnalytics";
import SearchAndFilters from "@/components/trackboards/SearchAndFilters";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all-statuses",
    assignedTo: "all-staff",
    client: "all-clients",
    dateRange: "all-dates"
  });
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              VSP Trackboards
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time production tracking & job management
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Search and Filters */}
      <Paper square elevation={1}>
        <Container sx={{ py: 2 }}>
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </Container>
      </Paper>

      {/* Main Content */}
      <Container sx={{ py: 4 }}>
        <Paper>
          <Tabs
            value={tab}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              icon={<FactoryIcon />} 
              iconPosition="start" 
              label="Factory Board" 
            />
            <Tab 
              icon={<LocalShippingIcon />} 
              iconPosition="start" 
              label="Site Board" 
            />
            <Tab 
              icon={<BarChartIcon />} 
              iconPosition="start" 
              label="Job Overview" 
            />
            <Tab 
              icon={<DescriptionIcon />} 
              iconPosition="start" 
              label="Reports & Analytics" 
            />
          </Tabs>

          <TabPanel className="p-2" value={tab} index={0}>
            <FactoryBoard searchQuery={searchQuery} filters={filters} />
          </TabPanel>

          <TabPanel className="p-2" value={tab} index={1}>
            <SiteBoard searchQuery={searchQuery} filters={filters} />
          </TabPanel>

          <TabPanel className="p-2" value={tab} index={2}>
            <JobOverview searchQuery={searchQuery} filters={filters} />
          </TabPanel>

          <TabPanel className="p-2" value={tab} index={3}>
            <ReportsAnalytics />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Index;
