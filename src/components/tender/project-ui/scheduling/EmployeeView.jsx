"use client"

import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from "@mui/material";

import EmployeeProjects from "./employee/EmployeeProjects";

const EmployeeView = () => {
  

  

  return (
    <Box sx={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
      <EmployeeProjects/>
    </Box>
  );
};

export default EmployeeView;
