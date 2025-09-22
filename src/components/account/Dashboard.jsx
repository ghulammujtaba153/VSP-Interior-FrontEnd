"use client";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const Dashboard = () => {
  const kpis = [
    {
      title: "Total Revenue",
      value: "$2,847,392",
      change: "+12.5%",
      trend: "up",
      icon: <AttachMoneyIcon color="primary" />,
    },
    {
      title: "Outstanding Invoices",
      value: "$394,827",
      change: "-5.2%",
      trend: "down",
      icon: <DescriptionIcon color="action" />,
    },
    {
      title: "Active Projects",
      value: "23",
      change: "+8.7%",
      trend: "up",
      icon: <PeopleIcon color="primary" />,
    },
    {
      title: "Overdue Payments",
      value: "$67,543",
      change: "+15.3%",
      trend: "up",
      icon: <WarningAmberIcon color="error" />,
    },
  ];

  const projectProgress = [
    { name: "Office Complex A", progress: 78, budget: "$1.2M", spent: "$936K" },
    { name: "Retail Center B", progress: 45, budget: "$850K", spent: "$382K" },
    { name: "Residential Tower", progress: 92, budget: "$2.1M", spent: "$1.9M" },
    { name: "Shopping Mall", progress: 23, budget: "$3.5M", spent: "$805K" },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* KPI Cards */}
      <Grid container spacing={3}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Typography variant="subtitle2" color="text.secondary">
                    {kpi.title}
                  </Typography>
                }
                action={kpi.icon}
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Typography variant="h5" fontWeight="bold">
                  {kpi.value}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  {kpi.trend === "up" ? (
                    <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={kpi.trend === "up" ? "success.main" : "error.main"}
                  >
                    {kpi.change}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" ml={0.5}>
                    from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cash Flow & Project Progress */}
      <Grid container spacing={3} mt={1}>
        {/* Cash Flow */}
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader
              title={<Typography color="primary">Cash Flow Overview</Typography>}
            />
            <CardContent>
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Inflow
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    $1,245,000
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Outflow
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    $892,000
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={56} color="error" />
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                pt={2}
                borderTop="1px solid"
                borderColor="divider"
              >
                <Typography variant="body2" fontWeight="bold">
                  Net Flow
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  +$353,000
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Progress */}
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader
              title={<Typography color="primary">Project Progress</Typography>}
            />
            <CardContent>
              {projectProgress.map((project, index) => (
                <Box key={index} mb={3}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight="medium">
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.spent} / {project.budget}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={project.progress} />
                  <Typography variant="caption" color="text.secondary">
                    {project.progress}% complete
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box mt={3}>
        <Card variant="outlined">
          <CardHeader
            title={<Typography color="primary">Recent Activity</Typography>}
          />
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Box width={8} height={8} bgcolor="success.main" borderRadius="50%" mr={2} />
              <Box>
                <Typography variant="body2">
                  Payment received from ABC Corp - $45,000
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 hours ago
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <Box width={8} height={8} bgcolor="warning.main" borderRadius="50%" mr={2} />
              <Box>
                <Typography variant="body2">Invoice #INV-2024-156 is overdue</Typography>
                <Typography variant="caption" color="text.secondary">
                  5 hours ago
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center">
              <Box width={8} height={8} bgcolor="primary.main" borderRadius="50%" mr={2} />
              <Box>
                <Typography variant="body2">
                  New progress claim submitted for Project Alpha
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 day ago
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
