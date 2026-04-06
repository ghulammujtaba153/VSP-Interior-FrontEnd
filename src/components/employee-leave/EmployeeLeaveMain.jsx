"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Avatar, Stack } from "@mui/material";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardIcon from "@mui/icons-material/Dashboard";

import EmployeeOverviewTab from "./EmployeeOverviewTab";
import EmployeeLeaveTable from "./EmployeeLeaveTable";
import EmployeeTimeSheetTable from "../human-resources/employee-access/EmployeeTimeSheetTable";
import EmployeeNoticeBoard from "../human-resources/employee-access/EmployeeNoticeBoard";
import EmployeeDocumentRequest from "../human-resources/employee-access/EmployeeDocumentRequest";
import { useAuth } from "@/context/authContext";

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const EmployeeLeaveMain = () => {
  const [value, setValue] = useState(0);
  const { user } = useAuth(); // Restored user for potential header logic

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Stack sx={{ p: 2, width: "100%", gap: 2 }}>
      <Paper sx={{ width: "100%", borderRadius: 3, boxShadow: 4, overflow: "hidden" }}>
        {/* Tabs Header */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="employee panels"
            sx={{ 
                bgcolor: 'background.paper',
                '& .MuiTab-root': { py: 2 } 
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<BeachAccessIcon />} iconPosition="start" label="My Leaves" />
            <Tab icon={<AccessTimeIcon />} iconPosition="start" label="Time Sheets" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notices" />
            <Tab icon={<DescriptionIcon />} iconPosition="start" label="Documents" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={value} index={0}>
          <EmployeeOverviewTab />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <EmployeeLeaveTable />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <EmployeeTimeSheetTable />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <EmployeeNoticeBoard />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <EmployeeDocumentRequest />
        </TabPanel>
      </Paper>
    </Stack>
  );
};

export default EmployeeLeaveMain;
