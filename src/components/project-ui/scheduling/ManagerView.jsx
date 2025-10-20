"use client";

import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import TimelineIcon from "@mui/icons-material/Timeline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";

// Import your tab components
import ProjectsTab from "./manager/ProjectsTab";
import GanttTab from "./manager/GanttTab";
import CalendarTab from "./manager/CalendarTab";
import ResourceLoadTab from "./manager/ResourceLoadTab";
import NotesTab from "./manager/NotesTab";

// Helper for tab content rendering
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

const ManagerView = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabData = [
    { label: "Projects", icon: <FolderIcon fontSize="small" />, component: <ProjectsTab /> },
    { label: "Gantt View", icon: <TimelineIcon fontSize="small" />, component: <GanttTab /> },
    { label: "Calendar", icon: <CalendarMonthIcon fontSize="small" />, component: <CalendarTab /> },
    { label: "Resource Load", icon: <BarChartIcon fontSize="small" />, component: <ResourceLoadTab /> },
    { label: "Notes", icon: <DescriptionIcon fontSize="small" />, component: <NotesTab /> },
  ];

  return (
    <Box sx={{ width: "100%", animation: "fadeIn 0.4s ease-in" }}>
      {/* Tab List */}
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              minHeight: 50,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              mx: 0.5,
            },
            "& .Mui-selected": {
              bgcolor: "action.hover",
              boxShadow: 1,
            },
          }}
        >
          {tabData.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={
                <Typography
                  variant="body1"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  {tab.label}
                </Typography>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabData.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default ManagerView;
