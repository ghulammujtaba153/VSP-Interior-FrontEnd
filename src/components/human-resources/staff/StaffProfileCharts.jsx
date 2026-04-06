"use client";

import React from 'react';
import { Card, CardContent, Grid, useTheme, Typography, Box } from '@mui/material';
import { Chart } from 'react-google-charts';

const StaffProfileCharts = ({ timesheets = [], leaves = [], payroll = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Explicit theme colors
  const textColor = isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)';
  const secondaryColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  // 📊 1. Monthly Payroll Trend (Last 12 Months)
  const payrollMonths = payroll.reduce((acc, curr) => {
    if (curr.status !== 'paid') return acc;
    const date = new Date(curr.paidDate || curr.createdAt);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[label] = (acc[label] || 0) + Number(curr.netSalary || 0);
    return acc;
  }, {});

  const payrollData = [
    ['Month', 'Net Salary', { role: 'style' }],
    ...Object.entries(payrollMonths).map(([m, val]) => [m, val, theme.palette.primary.main]).slice(-6)
  ];

  if (payrollData.length === 1) payrollData.push(['No Data', 0, theme.palette.grey[400]]);

  const payrollOptions = {
    title: 'Recent Payroll Payouts (AUD)',
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    hAxis: { textStyle: { color: secondaryColor }, gridlines: { color: dividerColor } },
    vAxis: { textStyle: { color: secondaryColor }, gridlines: { color: dividerColor }, baselineColor: dividerColor },
    chartArea: { width: '80%', height: '70' },
  };

  // 📊 2. Work vs Overtime Distribution
  const totalWork = timesheets.reduce((acc, ts) => acc + (Number(ts.netHours) || 0), 0);
  const totalOver = timesheets.reduce((acc, ts) => {
     // Helper for overwork decimal conversion
     const parts = (ts.overWork || "00:00:00").split(':');
     const dec = (parseInt(parts[0], 10) || 0) + ((parseInt(parts[1], 10) || 0) / 60);
     return acc + dec;
  }, 0);

  const workDistributionData = [
    ['Category', 'Hours'],
    ['Standard Hours', totalWork],
    ['Overtime Hours', totalOver],
  ];

  const workOptions = {
    title: 'Work vs Overtime (All-Time)',
    pieHole: 0.4,
    backgroundColor: 'transparent',
    legend: { position: 'bottom', textStyle: { color: secondaryColor } },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    slices: {
      0: { color: theme.palette.primary.main },
      1: { color: theme.palette.warning.main },
    },
    chartArea: { width: '90%', height: '80%' },
  };

  // 📊 3. Monthly Attendance Trend (Line Chart)
  const attendanceMonths = timesheets.reduce((acc, ts) => {
    const date = new Date(ts.date);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[label] = (acc[label] || 0) + (Number(ts.netHours) || 0);
    return acc;
  }, {});

  const attendanceData = [
    ['Month', 'Hours Worked'],
    ...Object.entries(attendanceMonths).map(([m, val]) => [m, val]).slice(-6)
  ];

  if (attendanceData.length === 1) attendanceData.push(['No Data', 0]);

  const attendanceOptions = {
    title: 'Monthly Attendance Trend (Logged Hours)',
    backgroundColor: 'transparent',
    curveType: 'function',
    legend: { position: 'none' },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    colors: [theme.palette.info.main],
    hAxis: { textStyle: { color: secondaryColor }, gridlines: { color: dividerColor } },
    vAxis: { textStyle: { color: secondaryColor }, gridlines: { color: dividerColor }, baselineColor: dividerColor },
    chartArea: { width: '80%', height: '70' },
  };

  // 📊 4. Leave Balance Utilization (Pie Chart)
  const LEAVE_LIMIT = 20; // Consistent with main page
  const approvedDays = leaves
    .filter(l => l.status.toLowerCase() === "approved")
    .reduce((acc, l) => {
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return acc + (isNaN(diff) ? 0 : diff);
    }, 0);
  const remaining = Math.max(0, LEAVE_LIMIT - approvedDays);

  const leaveBalanceData = [
    ['Status', 'Days'],
    ['Used', approvedDays],
    ['Remaining', remaining],
  ];

  const leaveOptions = {
    title: 'Leave Balance Utilization (Annual)',
    pieHole: 0.5,
    backgroundColor: 'transparent',
    legend: { position: 'bottom', textStyle: { color: secondaryColor } },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    slices: {
      0: { color: theme.palette.error.main },
      1: { color: theme.palette.success.main },
    },
    chartArea: { width: '90%', height: '80%' },
  };

  return (
    <Box>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, height: 350 }}>
            <CardContent>
              <Chart
                key={`payroll-${isDark}`}
                chartType="ColumnChart"
                data={payrollData}
                options={payrollOptions}
                width="100%"
                height="300px"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, height: 350 }}>
            <CardContent>
              <Chart
                key={`work-${isDark}`}
                chartType="PieChart"
                data={workDistributionData}
                options={workOptions}
                width="100%"
                height="300px"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, height: 350 }}>
            <CardContent>
              <Chart
                key={`attendance-${isDark}`}
                chartType="LineChart"
                data={attendanceData}
                options={attendanceOptions}
                width="100%"
                height="300px"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, height: 350 }}>
            <CardContent>
              <Chart
                key={`leave-${isDark}`}
                chartType="PieChart"
                data={leaveBalanceData}
                options={leaveOptions}
                width="100%"
                height="300px"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffProfileCharts;
