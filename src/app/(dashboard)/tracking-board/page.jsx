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
import ProjectsTable from "@/components/trackboards/ProjectsTable";




const Index = () => {


  return (
    <Box sx={{ minHeight: "100vh", p: 2 }} component={Paper}>
      <ProjectsTable/>
    </Box>
  );
};

export default Index;
