"use client";

import React from 'react';
import { Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { Chart } from 'react-google-charts';

const TimeSheetCharts = ({ data = [] }) => {
  const theme = useTheme();

  // ✅ Simplified Helper: Just Start to End
  const calculateNetHours = (start, end) => {
    if (!start || !end) return 0;
    try {
      const s = new Date(`1970-01-01T${start}`);
      const e = new Date(`1970-01-01T${end}`);
      let diff = (e - s) / (1000 * 60 * 60); // diff in hours
      if (diff < 0) diff += 24; // Handle overnight shifts
      return diff;
    } catch (err) { return 0; }
  };

  // Preparation for Status Distribution (Pie Chart)
  const statusCounts = data.reduce((acc, curr) => {
    const status = curr.status?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    ['Status', 'Count'],
    ['Approved', statusCounts.approved || 0],
    ['Pending', statusCounts.pending || 0],
    ['Rejected', statusCounts.rejected || 0],
  ];

  // Robust theme color extraction
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)';
  const secondaryColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  const statusOptions = {
    title: 'Submission Status',
    pieHole: 0.4,
    colors: ['#2e7d32', '#ed6c02', '#d32f2f'],
    backgroundColor: 'transparent',
    legend: { 
      position: 'bottom',
      textStyle: { color: textColor, fontSize: 12 }
    },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    chartArea: { width: '90%', height: '70%' },
    pieSliceTextStyle: { color: '#fff', bold: true },
    pieSliceBorderColor: dividerColor,
    tooltip: {
      textStyle: { color: '#000' },
      showColorCode: true
    }
  };

  const hourStatsMap = data.reduce((acc, curr) => {
    const empName = curr.employee?.name || 'N/A';
    const hours = calculateNetHours(curr.startTime, curr.endTime);
    acc[empName] = (acc[empName] || 0) + hours;
    return acc;
  }, {});

  const hourlyData = [
    ['Employee', 'Total Hours'],
    ...Object.entries(hourStatsMap).map(([name, hours]) => [name, Number(hours.toFixed(2))]).sort((a, b) => b[1] - a[1]).slice(0, 5),
  ];

  const hourlyOptions = {
    title: 'Top 5 Worked Hours by Employee',
    colors: [theme.palette.primary.main],
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    chartArea: { width: '65%', height: '70%' },
    hAxis: { 
      title: 'Total Hours', 
      minValue: 0,
      textStyle: { color: secondaryColor },
      titleTextStyle: { color: textColor, fontSize: 13, bold: true },
      gridlines: { color: dividerColor },
      baselineColor: dividerColor
    },
    vAxis: { 
      title: 'Employee',
      textStyle: { color: secondaryColor },
      titleTextStyle: { color: textColor, fontSize: 13, bold: true },
      baselineColor: dividerColor
    },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true }
  };

  return (
    <Grid container spacing={4} mb={4}>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ height: 350 }}>
             <Chart
                key={`pie-${isDark}`}
                chartType="PieChart"
                data={statusData}
                options={statusOptions}
                width="100%"
                height="300px"
             />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ height: 350 }}>
             <Chart
                key={`bar-${isDark}`}
                chartType="BarChart"
                data={hourlyData}
                options={hourlyOptions}
                width="100%"
                height="300px"
             />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TimeSheetCharts;
