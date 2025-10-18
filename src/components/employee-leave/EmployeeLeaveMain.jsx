"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DescriptionIcon from "@mui/icons-material/Description";

import EmployeeLeaveTable from "./EmployeeLeaveTable";
import EmployeeTimeSheetTable from "../human-resources/employee-access/EmployeeTimeSheetTable";
import EmployeeNoticeBoard from "../human-resources/employee-access/EmployeeNoticeBoard";
import EmployeeDocumentRequest from "../human-resources/employee-access/EmployeeDocumentRequest";

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ width: "100%", mt: 2, borderRadius: 3, boxShadow: 4 }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
          aria-label="employee panels"
        >
          <Tab
            icon={<BeachAccessIcon />}
            iconPosition="start"
            label="Employee Leaves"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<AccessTimeIcon />}
            iconPosition="start"
            label="Employee Time Sheets"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab
            icon={<NotificationsIcon />}
            iconPosition="start"
            label="Notice Records"
            id="tab-2"
            aria-controls="tabpanel-2"
          />
          <Tab
            icon={<DescriptionIcon />}
            iconPosition="start"
            label="Document Requests"
            id="tab-3"
            aria-controls="tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={value} index={0}>
        <EmployeeLeaveTable />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <EmployeeTimeSheetTable />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <EmployeeNoticeBoard />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <EmployeeDocumentRequest />
      </TabPanel>
    </Paper>
  );
};

export default EmployeeLeaveMain;
