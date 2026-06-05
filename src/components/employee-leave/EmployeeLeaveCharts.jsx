"use client";

import React from 'react';
import { Card, CardContent, Grid, useTheme, Typography, Box } from '@mui/material';
import { Chart } from 'react-google-charts';

const EmployeeLeaveCharts = ({ data = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Explicit theme colors
  const textColor = isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)';
  const secondaryColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  // Static limit for now (can be passed from props)
  const LIMIT = 20;

  // 📈 1. Leave Balance Utilization (Used vs Remaining)
  const usedDays = data
    .filter(l => l.status?.toLowerCase() === 'approved')
    .reduce((acc, l) => {
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return acc + (isNaN(diff) ? 0 : diff);
    }, 0);
  const remaining = Math.max(0, LIMIT - usedDays);

  const balanceData = [
    ['Status', 'Days'],
    ['Used', usedDays],
    ['Remaining', remaining],
  ];

  const balanceOptions = {
    title: 'Annual Leave Balance (Days)',
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

  // 📈 2. Leave Types Breakdown
  const typeCounts = data.reduce((acc, curr) => {
    const type = curr.leaveType || curr.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = [
    ['Type', 'Count'],
    ...Object.entries(typeCounts)
  ];

  const typeOptions = {
    title: 'Requests by Leave Type',
    pieHole: 0.4,
    backgroundColor: 'transparent',
    legend: { position: 'bottom', textStyle: { color: secondaryColor } },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    slices: {
      0: { color: theme.palette.primary.main },
      1: { color: theme.palette.warning.main },
      2: { color: theme.palette.info.main },
      3: { color: theme.palette.secondary.main },
    },
    chartArea: { width: '90%', height: '80%' },
  };

  return (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 1, height: 320 }}>
          <CardContent>
             <Chart
              key={`balance-${isDark}`}
              chartType="PieChart"
              data={balanceData}
              options={balanceOptions}
              width="100%"
              height="260px"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 1, height: 320 }}>
          <CardContent>
            <Chart
              key={`types-${isDark}`}
              chartType="PieChart"
              data={typeData}
              options={typeOptions}
              width="100%"
              height="260px"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EmployeeLeaveCharts;
