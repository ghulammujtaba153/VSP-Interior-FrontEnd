"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Description,
  Payments,
  FactCheck,
  EventNote,
} from "@mui/icons-material";
import apiClient from "@/lib/axios";
import { useAuth } from "@/context/authContext";
import Loader from "@/components/loader/Loader";
import StaffProfileCharts from "../human-resources/staff/StaffProfileCharts";
import TimeSheetHeatMap from "../human-resources/TimeSheetHeatMap";

const TAB_SLUGS = {
  overview: "overview",
  leaves: "leaves",
  timesheets: "timesheets",
  payslips: "payslips",
  notices: "notices",
  documents: "documents",
  certifications: "certifications",
};

const EmployeeOverviewTab = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    leaveCount: 0,
    timesheetCount: 0,
    payslipCount: 0,
    documentCount: 0,
    leaveEntitled: 20,
    heatmapDates: [],
    chartLeaves: [],
    chartTimesheets: [],
    payroll: [],
  });

  const fetchData = async () => {
    try {
      const countParams = "page=1&limit=1";
      const [leavesRes, timesheetsRes, payslipsRes, docsRes, balanceRes, payslipChartRes] = await Promise.all([
        apiClient.get(`/api/employee-leave/get/employee/${user.id}?${countParams}`),
        apiClient.get(`/api/employee-timesheet/get/employee/${user.id}?${countParams}`),
        apiClient.get(`/api/hr/payslips/user/${user.id}?${countParams}`),
        apiClient.get(`/api/employee-document/employee/${user.id}?${countParams}`),
        apiClient.get(`/api/hr/leave-balances/${user.id}`),
        apiClient.get(`/api/hr/payslips/user/${user.id}?page=1&limit=12`),
      ]);

      const balances = balanceRes.data.data || balanceRes.data || [];
      const annual = balances.find((b) => b.leaveType === "annual") || balances[0];

      setStats({
        leaveCount: leavesRes.data.total ?? leavesRes.data.summary?.total ?? 0,
        timesheetCount: timesheetsRes.data.total ?? timesheetsRes.data.stats?.total ?? 0,
        payslipCount: payslipsRes.data.total ?? 0,
        documentCount: docsRes.data.total ?? docsRes.data.summary?.total ?? 0,
        leaveEntitled: Number(annual?.entitled ?? annual?.remaining + annual?.used ?? 20),
        heatmapDates: timesheetsRes.data.heatmapDates || [],
        chartLeaves: leavesRes.data.chartLeaves || [],
        chartTimesheets: timesheetsRes.data.chartTimesheets || [],
        payroll: payslipChartRes.data.data || [],
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return <Loader />;

  const statCards = [
    { label: "Leave Requests", value: stats.leaveCount, icon: <EventNote />, color: "primary.light", tab: TAB_SLUGS.leaves },
    { label: "Timesheets", value: stats.timesheetCount, icon: <FactCheck />, color: "success.light", tab: TAB_SLUGS.timesheets },
    { label: "Payslips", value: stats.payslipCount, icon: <Payments />, color: "warning.light", tab: TAB_SLUGS.payslips },
    { label: "Documents", value: stats.documentCount, icon: <Description />, color: "info.light", tab: TAB_SLUGS.documents },
  ];

  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      <Box>
        <Typography variant="h5" fontWeight="800" mb={3} color="primary.main">
          Performance Overview
        </Typography>
        <Grid container spacing={3}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Card
                sx={{
                  borderRadius: 3,
                  cursor: onNavigateTab ? "pointer" : "default",
                  transition: "box-shadow 0.2s",
                  "&:hover": onNavigateTab ? { boxShadow: 4 } : {},
                }}
                onClick={() => onNavigateTab?.(card.tab)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: card.color }}>{card.icon}</Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                      <Typography variant="h5" fontWeight={700}>{card.value}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider />

      <StaffProfileCharts
        leaves={stats.chartLeaves}
        timesheets={stats.chartTimesheets}
        payroll={stats.payroll}
        leaveEntitled={stats.leaveEntitled}
      />
      <TimeSheetHeatMap data={stats.heatmapDates} />
    </Stack>
  );
};

export { TAB_SLUGS };
export default EmployeeOverviewTab;
