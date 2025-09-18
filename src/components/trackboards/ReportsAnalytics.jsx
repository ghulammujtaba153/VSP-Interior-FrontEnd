"use client";


import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Badge,
  Grid,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AccessTime as ClockIcon,
  WarningAmber as WarningIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Factory as FactoryIcon,
  LocalShipping as TruckIcon,
} from "@mui/icons-material";

export default function ReportsAnalytics() {
  const [tab, setTab] = React.useState("overview");

  // Mock analytics data
  const dailyWorkload = {
    scheduled: 24,
    completed: 18,
    efficiency: 75,
  };

  const delayReasons = [
    { reason: "Material Shortage", count: 5, percentage: 35 },
    { reason: "Equipment Maintenance", count: 3, percentage: 21 },
    { reason: "Staffing Issues", count: 2, percentage: 14 },
    { reason: "Client Changes", count: 2, percentage: 14 },
    { reason: "Weather Delays", count: 2, percentage: 14 },
  ];

  const workerProductivity = [
    { name: "John Smith", jobs: 8, efficiency: 95, type: "Machinist" },
    { name: "Sarah Wilson", jobs: 6, efficiency: 88, type: "Assembly" },
    { name: "Mike Johnson", jobs: 5, efficiency: 92, type: "Machinist" },
    { name: "Team A", jobs: 12, efficiency: 85, type: "Installation" },
    { name: "Team B", jobs: 10, efficiency: 78, type: "Delivery" },
  ];

  const weeklyTrends = [
    { week: "Week 1", factory: 22, site: 18, total: 40 },
    { week: "Week 2", factory: 25, site: 20, total: 45 },
    { week: "Week 3", factory: 28, site: 16, total: 44 },
    { week: "Week 4", factory: 24, site: 22, total: 46 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance insights and operational metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
          <Button variant="outlined" startIcon={<CalendarIcon />}>
            Date Range
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab value="overview" label="Overview" />
        <Tab value="productivity" label="Productivity" />
        <Tab value="delays" label="Delays" />
        <Tab value="trends" label="Trends" />
      </Tabs>

      {/* Overview */}
      {tab === "overview" && (
        <Box>
          {/* Daily Workload Summary */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Today's Workload"
                  action={<BarChartIcon color="action" />}
                />
                <CardContent>
                  <Typography variant="h4">{dailyWorkload.scheduled}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Jobs scheduled
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{dailyWorkload.completed}</strong> completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Efficiency Rate"
                  action={<TrendingUpIcon color="success" />}
                />
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {dailyWorkload.efficiency}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +5% from yesterday
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={dailyWorkload.efficiency}
                    sx={{ mt: 2, height: 8, borderRadius: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Active Issues"
                  action={<WarningIcon color="warning" />}
                />
                <CardContent>
                  <Typography variant="h4" color="error.main">
                    7
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Require attention
                  </Typography>
                  <Box mt={1} display="flex" gap={1}>
                    <Chip label="3 Critical" color="error" size="small" />
                    <Chip label="4 Minor" color="default" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Department Breakdown */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <FactoryIcon />
                      Factory Operations
                    </Box>
                  }
                />
                <CardContent>
                  {[
                    { label: "Machining Jobs", value: 80, done: "12/15" },
                    { label: "Assembly Jobs", value: 60, done: "6/10" },
                    { label: "Quality Control", value: 100, done: "8/8" },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="body2">{item.label}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={item.value}
                          sx={{ width: 80, height: 8, borderRadius: 2 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {item.done}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <TruckIcon />
                      Site Operations
                    </Box>
                  }
                />
                <CardContent>
                  {[
                    { label: "Ready for Dispatch", value: 75, done: "3/4" },
                    { label: "In Transit", value: 50, done: "2/4" },
                    { label: "Installation Complete", value: 90, done: "9/10" },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="body2">{item.label}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={item.value}
                          sx={{ width: 80, height: 8, borderRadius: 2 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {item.done}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Productivity */}
      {tab === "productivity" && (
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <PeopleIcon />
                Worker Productivity Analysis
              </Box>
            }
          />
          <CardContent>
            {workerProductivity.map((worker, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                border="1px solid #ddd"
                borderRadius={2}
                p={2}
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    width={40}
                    height={40}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="50%"
                    bgcolor="primary.light"
                  >
                    <Typography>
                      {worker.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontWeight="medium">{worker.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {worker.type}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    Jobs Completed
                  </Typography>
                  <Typography fontWeight="bold">{worker.jobs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={worker.efficiency}
                      sx={{ width: 80, height: 8, borderRadius: 2 }}
                    />
                    <Typography variant="body2">{worker.efficiency}%</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delays */}
      {tab === "delays" && (
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <ClockIcon />
                Delay Analysis & Root Causes
              </Box>
            }
          />
          <CardContent>
            {delayReasons.map((delay, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                border="1px solid #ddd"
                borderRadius={2}
                p={2}
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    bgcolor="error.main"
                  />
                  <Typography fontWeight="medium">{delay.reason}</Typography>
                </Box>
                <Box display="flex" gap={3}>
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">
                      Incidents
                    </Typography>
                    <Typography fontWeight="bold">{delay.count}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">
                      Impact
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={delay.percentage}
                        sx={{ width: 80, height: 8, borderRadius: 2 }}
                      />
                      <Typography variant="body2">
                        {delay.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trends */}
      {tab === "trends" && (
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon />
                Weekly Performance Trends
              </Box>
            }
          />
          <CardContent>
            {weeklyTrends.map((week, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                border="1px solid #ddd"
                borderRadius={2}
                p={2}
                mb={2}
              >
                <Typography fontWeight="medium">{week.week}</Typography>
                <Box display="flex" gap={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Factory
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FactoryIcon color="primary" fontSize="small" />
                      <Typography fontWeight="bold">{week.factory}</Typography>
                    </Box>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Site
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TruckIcon color="success" fontSize="small" />
                      <Typography fontWeight="bold">{week.site}</Typography>
                    </Box>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon color="secondary" fontSize="small" />
                      <Typography fontWeight="bold">{week.total}</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {i > 0 && week.total > weeklyTrends[i - 1].total ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : i > 0 && week.total < weeklyTrends[i - 1].total ? (
                      <TrendingDownIcon color="error" fontSize="small" />
                    ) : (
                      <Box width={16} height={16} />
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
