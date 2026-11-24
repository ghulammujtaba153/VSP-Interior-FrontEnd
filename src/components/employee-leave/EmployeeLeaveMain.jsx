"use client";

import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Stack } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentsIcon from "@mui/icons-material/Payments";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";

import apiClient from "@/lib/axios";
import EmployeeOverviewTab from "./EmployeeOverviewTab";
import EmployeeLeaveTable from "./EmployeeLeaveTable";
import EmployeeTimeSheetTable from "../human-resources/employee-access/EmployeeTimeSheetTable";
import EmployeeNoticeBoard from "../human-resources/employee-access/EmployeeNoticeBoard";
import EmployeeDocumentRequest from "../human-resources/employee-access/EmployeeDocumentRequest";
import EmployeePayslips from "./EmployeePayslips";
import EmployeeCertifications from "../human-resources/employee-access/EmployeeCertifications";
import TeamApprovalsTab from "../human-resources/employee-access/TeamApprovalsTab";

const BASE_TABS = [
  { id: "overview", label: "Overview", icon: <DashboardIcon /> },
  { id: "leaves", label: "My Leaves", icon: <BeachAccessIcon /> },
  { id: "timesheets", label: "Time Sheets", icon: <AccessTimeIcon /> },
  { id: "payslips", label: "Payslips", icon: <PaymentsIcon /> },
  { id: "notices", label: "Notices", icon: <NotificationsIcon /> },
  { id: "documents", label: "Documents", icon: <DescriptionIcon /> },
  { id: "certifications", label: "Certifications", icon: <SchoolIcon /> },
];

const TEAM_TAB = { id: "team", label: "Team Approvals", icon: <GroupIcon /> };

const TAB_COMPONENTS = {
  overview: EmployeeOverviewTab,
  leaves: EmployeeLeaveTable,
  timesheets: EmployeeTimeSheetTable,
  payslips: EmployeePayslips,
  notices: EmployeeNoticeBoard,
  documents: EmployeeDocumentRequest,
  certifications: EmployeeCertifications,
  team: TeamApprovalsTab,
};

const EmployeeLeaveMain = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [showTeamTab, setShowTeamTab] = useState(false);
  const tabs = showTeamTab ? [...BASE_TABS, TEAM_TAB] : BASE_TABS;
  const activeTab = tabs.some((t) => t.id === tabParam) ? tabParam : "overview";

  useEffect(() => {
    const checkManager = async () => {
      try {
        const res = await apiClient.get("/api/hr/approvals/queue?scope=team");
        setShowTeamTab(res.data.data?.isManager || res.data.data?.isHrAdmin);
      } catch {
        setShowTeamTab(false);
      }
    };
    checkManager();
  }, []);

  const handleChange = (event, newValue) => {
    router.replace(`/employee-leave?tab=${newValue}`, { scroll: false });
  };

  const navigateToTab = (slug) => {
    router.replace(`/employee-leave?tab=${slug}`, { scroll: false });
  };

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <Stack sx={{ p: 2, width: "100%", gap: 2 }}>
      <Box px={1}>
        <Typography variant="h4" fontWeight="bold">My HR</Typography>
        <Typography variant="body2" color="text.secondary">
          Employee self-service — leave, time, payslips, and documents
        </Typography>
      </Box>

      <Paper sx={{ width: "100%", borderRadius: 3, boxShadow: 4, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ bgcolor: "background.paper", "& .MuiTab-root": { py: 2 } }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.id} value={tab.id} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <Box p={3}>
          {activeTab === "overview" ? (
            <EmployeeOverviewTab onNavigateTab={navigateToTab} />
          ) : (
            ActiveComponent && <ActiveComponent />
          )}
        </Box>
      </Paper>
    </Stack>
  );
};

export default EmployeeLeaveMain;
