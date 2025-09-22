"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  InsertDriveFile as FileIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "@mui/icons-material";

const Reports = () => {
  const reportTypes = [
    {
      id: "cash-flow",
      name: "Cash Flow Report",
      description: "Track money in and out of projects",
      icon: <TrendingUpIcon color="primary" />,
      lastGenerated: "2 hours ago",
      status: "ready",
    },
    {
      id: "project-profitability",
      name: "Project Profitability",
      description: "Analyze profit margins by project",
      icon: <BarChartIcon color="primary" />,
      lastGenerated: "1 day ago",
      status: "ready",
    },
    {
      id: "financial-health",
      name: "Financial Health Dashboard",
      description: "Overall financial performance metrics",
      icon: <PieChartIcon color="primary" />,
      lastGenerated: "3 hours ago",
      status: "ready",
    },
    {
      id: "outstanding-invoices",
      name: "Outstanding Invoices",
      description: "All unpaid client invoices",
      icon: <FileIcon color="primary" />,
      lastGenerated: "30 mins ago",
      status: "ready",
    },
    {
      id: "supplier-payments",
      name: "Supplier Payments",
      description: "Payments due to suppliers",
      icon: <FileIcon color="primary" />,
      lastGenerated: "Processing...",
      status: "generating",
    },
  ];

  const recentReports = [
    {
      name: "Monthly Cash Flow - December 2023",
      type: "PDF",
      size: "2.3 MB",
      generated: "Jan 15, 2024",
    },
    {
      name: "Project Profitability Q4 2023",
      type: "Excel",
      size: "856 KB",
      generated: "Jan 12, 2024",
    },
    {
      name: "Outstanding Invoices Report",
      type: "CSV",
      size: "245 KB",
      generated: "Jan 10, 2024",
    },
  ];

  const getStatusColor = (status) => {
    if (status === "ready") return "success";
    if (status === "generating") return "warning";
    return "error";
  };

  return (
    <Box p={3} minHeight="100vh" bgcolor="background.default">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="600" color="primary">
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate financial reports and export data
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" size="small" startIcon={<FilterIcon />}>
            Schedule Reports
          </Button>
          <Button variant="contained" size="small" startIcon={<FileIcon />}>
            Custom Report
          </Button>
        </Box>
      </Box>

      {/* Quick Report Generation */}
      <Card>
        <CardHeader
          title={<Typography color="primary">Quick Report Generation</Typography>}
        />
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4} minWidth={150}>
              <FormControl fullWidth >
                <InputLabel>Report Type</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="cash-flow">Cash Flow</MenuItem>
                  <MenuItem value="profitability">Project Profitability</MenuItem>
                  <MenuItem value="invoices">Outstanding Invoices</MenuItem>
                  <MenuItem value="suppliers">Supplier Payments</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4} minWidth={150}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="this-month">This Month</MenuItem>
                  <MenuItem value="last-month">Last Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4} minWidth={150}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button fullWidth variant="contained" startIcon={<DownloadIcon />}>
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={<Typography color="primary">Available Reports</Typography>}
        />
        <CardContent>
          <Grid container spacing={2}>
            {reportTypes.map((report) => (
              <Grid item xs={12} md={6} lg={4} key={report.id}>
                <Box
                  p={2}
                  border="1px solid"
                  borderColor="divider"
                  borderRadius={2}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    {report.icon}
                    <Chip label={report.status} color={getStatusColor(report.status)} size="small" />
                  </Box>
                  <Typography fontWeight="600">{report.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Last: {report.lastGenerated}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      disabled={report.status === "generating"}
                    >
                      Generate
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} mt={1}>
        {/* Recent Reports */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title={<Typography color="primary">Recent Reports</Typography>}
            />
            <CardContent>
              {recentReports.map((report, i) => (
                <Box
                  key={i}
                  p={2}
                  mb={2}
                  borderRadius={2}
                  bgcolor="action.hover"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" gap={2} alignItems="center">
                    <FileIcon color="primary" />
                    <Box>
                      <Typography fontWeight="500">{report.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.type} • {report.size} • {report.generated}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title={<Typography color="primary">Key Financial Insights</Typography>}
            />
            <CardContent>
              <Box
                p={2}
                mb={2}
                borderRadius={2}
                bgcolor="success.light"
                color="success.dark"
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TrendingUpIcon fontSize="small" />
                  <Typography fontWeight="500">Positive Cash Flow</Typography>
                </Box>
                <Typography variant="body2">
                  Net cash flow increased by 15% compared to last month
                </Typography>
              </Box>
              <Box
                p={2}
                mb={2}
                borderRadius={2}
                bgcolor="warning.light"
                color="warning.dark"
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <FileIcon fontSize="small" />
                  <Typography fontWeight="500">Outstanding Invoices</Typography>
                </Box>
                <Typography variant="body2">
                  $394K in outstanding invoices, 15% increase from last month
                </Typography>
              </Box>
              <Box
                p={2}
                borderRadius={2}
                bgcolor="primary.light"
                color="primary.dark"
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BarChartIcon fontSize="small" />
                  <Typography fontWeight="500">Project Performance</Typography>
                </Box>
                <Typography variant="body2">
                  Average project margin improved to 18.5% this quarter
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
