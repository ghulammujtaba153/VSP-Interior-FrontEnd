"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SchoolIcon from "@mui/icons-material/School";
import CampaignIcon from '@mui/icons-material/Campaign';
import PaymentsIcon from '@mui/icons-material/Payments';
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssessmentIcon from "@mui/icons-material/Assessment";

import StaffProfiles from "@/components/human-resources/StaffProfiles";
import Timesheets from "@/components/human-resources/Timesheets";
import LeaveAvailability from "@/components/human-resources/LeaveAvailability";
import Certifications from "@/components/human-resources/Certifications";
import Notices from "@/components/human-resources/Notices";
import Salary from "@/components/human-resources/Salary";
import HrApprovalsQueue from "@/components/human-resources/HrApprovalsQueue";
import HrApprovalsCenter from "@/components/human-resources/HrApprovalsCenter";
import HrOnboardingTracker from "@/components/human-resources/HrOnboardingTracker";
import PermissionRoute from "@/components/PermissionRoute";
import Link from "next/link";

const TAB_SLUGS = [
  "approvals",
  "onboarding",
  "staffProfiles",
  "timesheets",
  "leaveAvailability",
  "certifications",
  "notices",
  "salary",
];

const tabComponents = {
  approvals: HrApprovalsCenter,
  onboarding: HrOnboardingTracker,
  staffProfiles: StaffProfiles,
  timesheets: Timesheets,
  leaveAvailability: LeaveAvailability,
  certifications: Certifications,
  notices: Notices,
  salary: Salary,
};

const HumanResourcePageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = TAB_SLUGS.includes(tabParam) ? tabParam : "staffProfiles";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (tabParam && TAB_SLUGS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    router.replace(`/human-resource?tab=${newValue}`, { scroll: false });
  };

  const tabs = [
    { id: "approvals", label: "Approvals", icon: <PendingActionsIcon /> },
    { id: "onboarding", label: "Onboarding", icon: <PersonAddIcon /> },
    { id: "staffProfiles", label: "Staff Profiles", icon: <PeopleIcon /> },
    { id: "timesheets", label: "Timesheets", icon: <ScheduleIcon /> },
    { id: "leaveAvailability", label: "Leave & Availability", icon: <EventAvailableIcon /> },
    { id: "certifications", label: "Certifications & Licences", icon: <SchoolIcon /> },
    { id: "notices", label: "Notices", icon: <CampaignIcon /> },
    { id: "salary", label: "Salary Management", icon: <PaymentsIcon /> },
  ];

  const ActiveComponent = tabComponents[activeTab];

  return (
    <PermissionRoute resource="human resource">
    <Container sx={{ py: 4 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            HR Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage staff profiles, timesheets, leave, payroll, certifications, and notices.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/reports"
          variant="outlined"
          startIcon={<AssessmentIcon />}
        >
          HR Reports
        </Button>
      </Box>

      <HrApprovalsQueue />

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

      <Box>
        <ActiveComponent />
      </Box>
    </Container>
    </PermissionRoute>
  );
};

export default HumanResourcePageInner;
