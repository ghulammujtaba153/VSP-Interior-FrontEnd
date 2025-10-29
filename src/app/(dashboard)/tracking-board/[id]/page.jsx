"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab,
  AppBar,
  useScrollTrigger,
  Slide,
  Button
} from "@mui/material";
import { useParams } from "next/navigation";
import OverviewTab from "@/components/trackboards/OverviewTab";
import FactorysiteTab from "@/components/trackboards/FactorysiteTab";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FactoryIcon from "@mui/icons-material/Factory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import TimelineIcon from "@mui/icons-material/Timeline";
import Loader from "@/components/loader/Loader";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import SiteTab from "@/components/trackboards/SiteTab";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotesTab from "@/components/trackboards/NotesTab";
import NoteIcon from "@mui/icons-material/Note";
import Link from "next/link";

// Hide app bar on scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Page = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("data", id);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabs = [
    { 
      label: "Overview", 
      icon: <DashboardIcon />, 
      component: <OverviewTab data={data} /> 
    },
    { 
      label: "Factory Site", 
      icon: <FactoryIcon />, 
      component: <FactorysiteTab projectId={id} data={data}/> 
    },
    { 
      label: "Site", 
      icon: <LocationOnIcon />, 
      component: <SiteTab projectId={id} data={data}/> 
    },
    { 
      label: "Notes", 
      icon: <NoteIcon />, 
      component: <NotesTab projectId={id} data={data}/> 
    },
   
  ];


    

  const fetchProject = useCallback(async () => {
    setLoading(true);
    console.log("fetching project", id);

    try {
      const res = await axios.get(`${BASE_URL}/api/job-scheduling/get/${id}`);
      console.log("api hit",res.data);
      setData( res.data.job); // support both shapes
    } catch (error) {
      toast.error('Error fetching project data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProject();
  }, [id, fetchProject]);

  if (loading) return <Loader />;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Button
        component={Link}
        href="/tracking-board"
        variant="contained"
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      {/* Sticky App Bar with Tabs */}
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          color="default" 
          elevation={1}
          sx={{ 
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ px: 2, pt: 1 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Tracking Board
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Project ID: {id}
            </Typography>
          </Box>
          
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: 60,
                fontSize: '0.875rem'
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </AppBar>
      </HideOnScroll>

      {/* Tab Content */}
      <Box 
        component={Paper} 
        sx={{ 
          m: 2, 
          mt: 0,
          minHeight: 'calc(100vh - 200px)',
          borderRadius: 1
        }}
        elevation={0}
      >
        {tabs[tabValue].component}
      </Box>
    </Box>
  )
}

export default Page;