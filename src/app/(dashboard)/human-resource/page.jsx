"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  Divider,
  Badge,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SchoolIcon from "@mui/icons-material/School";

import StaffProfiles from "@/components/human-resources/StaffProfiles";
import Timesheets from "@/components/human-resources/Timesheets";
import LeaveAvailability from "@/components/human-resources/LeaveAvailability";
import Certifications from "@/components/human-resources/Certifications";

const tabComponents = {
  staffProfiles: StaffProfiles,
  timesheets: Timesheets,
  leaveAvailability: LeaveAvailability,
  certifications: Certifications,
};

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("staffProfiles");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { id: "staffProfiles", label: "Staff Profiles", icon: <PeopleIcon /> },
    { id: "timesheets", label: "Timesheets", icon: <ScheduleIcon /> },
    { id: "leaveAvailability", label: "Leave & Availability", icon: <EventAvailableIcon /> },
    { id: "certifications", label: "Certifications & Licences", icon: <SchoolIcon /> },
  ];

  const ActiveComponent = tabComponents[activeTab];

  return (
    <Container sx={{ py: 4 }}>
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold">
          HR & Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage staff profiles, timesheets, leave availability, and certifications.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
              value={tab.id}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        <ActiveComponent />
      </Box>
    </Container>
  );
};

export default ReportsPage;
