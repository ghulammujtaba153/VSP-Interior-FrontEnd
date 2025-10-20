"use client"

import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";

import TodayTab from "./employee/TodayTab";
import WeekTab from "./employee/WeekTab";
import CompletedTab from "./employee/CompletedTab";
import EmployeeNotesTab from "./employee/EmployeeNotesTab";

const EmployeeView = () => {
  const [activeTab, setActiveTab] = useState("today");

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
      {/* Tabs Container */}
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 1,
          borderRadius: 3,
          mb: 3,
          maxWidth: 600,
          mx: "auto",
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            icon={<TodayIcon fontSize="small" />}
            iconPosition="start"
            label={<Typography variant="body2">Today</Typography>}
            value="today"
          />
          <Tab
            icon={<CalendarMonthIcon fontSize="small" />}
            iconPosition="start"
            label={<Typography variant="body2">Week</Typography>}
            value="week"
          />
          <Tab
            icon={<CheckCircleIcon fontSize="small" />}
            iconPosition="start"
            label={<Typography variant="body2">Completed</Typography>}
            value="completed"
          />
          <Tab
            icon={<DescriptionIcon fontSize="small" />}
            iconPosition="start"
            label={<Typography variant="body2">Notes</Typography>}
            value="notes"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === "today" && <TodayTab />}
        {activeTab === "week" && <WeekTab />}
        {activeTab === "completed" && <CompletedTab />}
        {activeTab === "notes" && <EmployeeNotesTab />}
      </Box>
    </Box>
  );
};

export default EmployeeView;
