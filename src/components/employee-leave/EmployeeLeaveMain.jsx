"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import EmployeeLeaveTable from "./EmployeeLeaveTable";
import EmployeeTimeSheetTable from "../human-resources/employee-access/EmployeeTimeSheetTable";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box p={3}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const EmployeeLeaveMain = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ width: "100%", mt: 2 }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Employee Leaves" />
          <Tab label="Employee Time Sheets" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={value} index={0}>
        <EmployeeLeaveTable />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <EmployeeTimeSheetTable />
      </TabPanel>
    </Paper>
  );
};

export default EmployeeLeaveMain;
