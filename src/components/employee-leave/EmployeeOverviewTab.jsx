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
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { useAuth } from "@/context/authContext";
import Loader from "@/components/loader/Loader";
import StaffProfileCharts from "../human-resources/staff/StaffProfileCharts";
import TimeSheetHeatMap from "../human-resources/TimeSheetHeatMap";

const EmployeeOverviewTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    leaves: [],
    timesheets: [],
    payroll: [],
    documents: [],
  });

  const fetchData = async () => {
    try {
      const [leavesRes, timesheetsRes, payrollRes, docsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/employee-leave/get/${user.id}`),
        axios.get(`${BASE_URL}/api/employee-timesheet/get/${user.id}`),
        axios.get(`${BASE_URL}/api/payroll/get?userId=${user.id}`),
        axios.get(`${BASE_URL}/api/employee-document/employee/${user.id}`),
      ]);

      setStats({
        leaves: leavesRes.data.employeeLeave || leavesRes.data || [],
        timesheets: timesheetsRes.data.timesheets || timesheetsRes.data || [],
        payroll: Array.isArray(payrollRes.data) ? payrollRes.data : payrollRes.data?.data || [],
        documents: docsRes.data.data || docsRes.data.items || docsRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
    // eslint-disable-next-line
  }, [user?.id]);

  if (loading) return <Loader />;

  // Quick Stats
  const docSummary = {
    total: stats.documents.length,
    approved: stats.documents.filter(d => d.status === 'approved').length,
    pending: stats.documents.filter(d => d.status === 'pending').length,
  };

  const attendanceHeatData = stats.timesheets.map(ts => ({ date: ts.date }));

  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      <Box>
        <Typography variant="h5" fontWeight="800" mb={3} color="primary.main">
          Performance Overview
        </Typography>

        {/* Top row stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(3, 169, 244, 0.1)", color: "info.main" }}>
                    <Description />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Documents
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {docSummary.approved} / {docSummary.total}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(76, 175, 80, 0.1)", color: "success.main" }}>
                    <Payments />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Paid Payouts
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {stats.payroll.filter((p) => p.status === "paid").length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(255, 152, 0, 0.1)", color: "warning.main" }}>
                    <EventNote />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Leaves
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {stats.leaves.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(33, 150, 243, 0.1)", color: "primary.main" }}>
                    <FactCheck />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Attendance
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {stats.timesheets.length} Logs
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Charts - Row 1: Payroll, Work, Attendance, and Leave */}
      <Box sx={{ width: "100%" }}>
        <StaffProfileCharts 
            payroll={stats.payroll} 
            timesheets={stats.timesheets} 
            leaves={stats.leaves} 
        />
      </Box>

      {/* Activity Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TimeSheetHeatMap data={attendanceHeatData} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Summary Insights
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Doc Status
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {docSummary.approved}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                      /
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {docSummary.pending}
                    </Typography>
                  </Stack>
                  <Typography variant="caption">Approved / Pending</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Work Performance
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Consistent Submission
                  </Typography>
                  <Typography variant="caption">
                    Keep logging your time daily for accurate payroll.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default EmployeeOverviewTab;
