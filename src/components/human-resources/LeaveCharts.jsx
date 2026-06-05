"use client";

import React from 'react';
import { Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { Chart } from 'react-google-charts';

const LeaveCharts = ({ data = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Explicit theme colors for Google Charts
  const textColor = isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)';
  const secondaryColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  // 📈 1. Leave Type Distribution (Pie Chart)
  const typeCounts = data.reduce((acc, curr) => {
    const type = curr.leaveType || curr.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = [
    ['Type', 'Total'],
    ...Object.entries(typeCounts)
  ];

  const typeOptions = {
    title: 'Leave Distribution by Type',
    pieHole: 0.4,
    is3D: false,
    backgroundColor: 'transparent',
    legend: { 
      position: 'right', 
      textStyle: { color: secondaryColor, fontSize: 12 } 
    },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    slices: {
      0: { color: theme.palette.primary.main },
      1: { color: theme.palette.warning.main },
      2: { color: theme.palette.info.main },
      3: { color: theme.palette.success.main },
    },
    chartArea: { width: '90%', height: '80%' },
  };

  // 📈 2. Leave Status Breakdown (Bar Chart)
  const statusCounts = data.reduce((acc, curr) => {
    const status = curr.status?.charAt(0).toUpperCase() + curr.status?.slice(1) || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    ['Status', 'Count', { role: 'style' }],
    ['Approved', statusCounts['Approved'] || 0, theme.palette.success.main],
    ['Pending', statusCounts['Pending'] || 0, theme.palette.warning.main],
    ['Rejected', statusCounts['Rejected'] || 0, theme.palette.error.main],
  ];

  const statusOptions = {
    title: 'Leave Status Overview',
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    hAxis: {
      textStyle: { color: secondaryColor },
      gridlines: { color: dividerColor },
    },
    vAxis: {
      textStyle: { color: secondaryColor },
      gridlines: { color: dividerColor },
      baselineColor: dividerColor,
    },
    chartArea: { width: '80%', height: '70%' },
  };

  return (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 1, height: 350 }}>
          <CardContent>
            <Chart
              key={`type-${isDark}`}
              chartType="PieChart"
              data={typeData}
              options={typeOptions}
              width="100%"
              height="300px"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 1, height: 350 }}>
          <CardContent>
            <Chart
              key={`status-${isDark}`}
              chartType="ColumnChart"
              data={statusData}
              options={statusOptions}
              width="100%"
              height="300px"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LeaveCharts;
