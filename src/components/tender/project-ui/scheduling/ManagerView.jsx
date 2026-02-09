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



const ManagerView = () => {
  

  return (
    <Box sx={{ width: "100%", animation: "fadeIn 0.4s ease-in" }}>
      <ProjectsTab/>
    </Box>
  );
};

export default ManagerView;
