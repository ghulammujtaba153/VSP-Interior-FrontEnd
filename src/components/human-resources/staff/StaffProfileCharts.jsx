"use client";

import React from 'react';
import { Card, CardContent, Grid, useTheme, Typography, Box } from '@mui/material';
import { Chart } from 'react-google-charts';
import { getTimesheetHours, getOvertimeHours } from '@/lib/hrUtils';

const StaffProfileCharts = ({
  timesheets = [],
  leaves = [],
  payroll = [],
  leaveEntitled = 20,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const textColor = isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)';
  const secondaryColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  const payrollMonths = payroll.reduce((acc, curr) => {
    const amount = Number(curr.netPay ?? curr.netSalary ?? 0);
    if (amount <= 0) return acc;
    const date = new Date(curr.paymentDate || curr.paidDate || curr.createdAt);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[label] = (acc[label] || 0) + amount;
    return acc;
  }, {});

  const payrollData = [
    ['Month', 'Net Pay (NZD)', { role: 'style' }],
    ...Object.entries(payrollMonths).map(([m, val]) => [m, val, theme.palette.primary.main]).slice(-6)
  ];

  if (payrollData.length === 1) payrollData.push(['No Data', 0, theme.palette.grey[400]]);

  const payrollOptions = {
    title: 'Recent Payroll Payouts (NZD)',
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    hAxis: { textStyle: { color: secondaryColor }, gridlines: { color: dividerColor } },
    vAxis: { textStyle: { color: secondaryColor }, gridlines: { color: dividerColor }, baselineColor: dividerColor },
    chartArea: { width: '80%', height: '70' },
  };

  let totalHours = 0;
  let totalOver = 0;
  for (const ts of timesheets) {
    const hours = getTimesheetHours(ts);
    const over = getOvertimeHours(ts);
    totalHours += hours;
    totalOver += over > 0 ? over : 0;
  }
  const totalWork = Math.max(0, totalHours - totalOver);

  const workDistributionData = [
    ['Category', 'Hours'],
    ['Standard Hours', totalWork],
    ['Overtime Hours', totalOver],
  ];

  if (totalWork === 0 && totalOver === 0) {
    workDistributionData.push(['No logged hours', 1]);
  }

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

  const attendanceMonths = timesheets.reduce((acc, ts) => {
    const date = new Date(ts.date);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[label] = (acc[label] || 0) + getTimesheetHours(ts);
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

  const approvedDays = leaves
    .filter(l => l.status?.toLowerCase() === "approved")
    .reduce((acc, l) => {
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return acc + (isNaN(diff) ? 0 : diff);
    }, 0);
  const remaining = Math.max(0, leaveEntitled - approvedDays);

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
