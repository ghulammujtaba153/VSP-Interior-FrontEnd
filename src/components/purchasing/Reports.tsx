"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Description as FileTextIcon,
  WarningAmber as AlertTriangleIcon,
} from "@mui/icons-material";
import { mockPurchaseOrders, mockSuppliers, mockJobs } from "@/data/mockData";
import { BASE_URL } from "@/configs/url";
import axios from "axios";

const Reports = () => {
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  const fetchPurchaseStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/purchases/stats`);
      console.log(res.data.data);
    } catch (error) {
      console.error("Error fetching purchase stats:", error);
    }
  };

  useEffect(() => {
    fetchPurchaseStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const handleExport = (format: string) => {
    alert(`Report has been exported as ${format.toUpperCase()}`);
  };

  // Calculate spend per project
  const projectSpendData = mockJobs.map((job) => {
    const jobPOs = mockPurchaseOrders.filter(
      (po) => po.jobAllocation === job.name
    );
    const actualSpend = jobPOs.reduce((sum, po) => sum + po.totalValue, 0);
    const estimated = job.estimatedValue * 0.6; // Assume 60% is materials

    return {
      project: job.name,
      client: job.client,
      estimated: estimated,
      actual: actualSpend,
      variance: actualSpend - estimated,
      variancePercent: estimated
        ? ((actualSpend - estimated) / estimated) * 100
        : 0,
    };
  });

  // Calculate spend per supplier
  const supplierSpendData = mockSuppliers.map((supplier) => {
    const supplierPOs = mockPurchaseOrders.filter(
      (po) => po.supplierName === supplier.name
    );
    const totalSpend = supplierPOs.reduce((sum, po) => sum + po.totalValue, 0);
    const orderCount = supplierPOs.length;
    const avgDeliveryTime = 5; // Mock data

    return {
      supplier: supplier.name,
      totalSpend,
      orderCount,
      avgOrderValue: orderCount ? totalSpend / orderCount : 0,
      avgDeliveryTime,
      onTimeDelivery: 92, // Mock percentage
    };
  });

  // Delayed deliveries
  const delayedDeliveries = mockPurchaseOrders.filter((po) => {
    const expectedDate = new Date(po.expectedDeliveryDate);
    const today = new Date();
    return (
      expectedDate < today &&
      po.status !== "Delivered" &&
      po.status !== "Closed"
    );
  });

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive purchasing insights and performance metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport("excel")}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<FileTextIcon />}
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Report Filters */}
      {/* Report Filters */}
<Card>
  <CardHeader
    title={
      <Box display="flex" alignItems="center" gap={1}>
        <FilterIcon fontSize="small" />
        <Typography variant="h6">Report Filters</Typography>
      </Box>
    }
  />
  <CardContent>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth sx={{ minWidth: 220 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="project-spend">Project Spend Analysis</MenuItem>
            <MenuItem value="supplier-performance">Supplier Performance</MenuItem>
            <MenuItem value="delayed-deliveries">Delayed Deliveries</MenuItem>
            <MenuItem value="forecast-actual">Forecast vs Actual</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Date From"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Date To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth sx={{ minWidth: 220 }}>
          <InputLabel>Supplier</InputLabel>
          <Select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <MenuItem value="all">All Suppliers</MenuItem>
            {mockSuppliers.map((supplier) => (
              <MenuItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth sx={{ minWidth: 220 }}>
          <InputLabel>Job</InputLabel>
          <Select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <MenuItem value="all">All Jobs</MenuItem>
            {mockJobs.map((job) => (
              <MenuItem key={job.id} value={job.id}>
                {job.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </CardContent>
</Card>


      {/* Metrics */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Spend
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(
                      mockPurchaseOrders.reduce(
                        (sum, po) => sum + po.totalValue,
                        0
                      )
                    )}
                  </Typography>
                </Box>
                <BarChartIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Suppliers
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {mockSuppliers.length}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Order Value
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(
                      mockPurchaseOrders.reduce(
                        (sum, po) => sum + po.totalValue,
                        0
                      ) / mockPurchaseOrders.length
                    )}
                  </Typography>
                </Box>
                <CalendarIcon color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Delayed Orders
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {delayedDeliveries.length}
                  </Typography>
                </Box>
                <AlertTriangleIcon color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Spend */}
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Spend per Project - Estimated vs Actual" />
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Estimated</TableCell>
                  <TableCell>Actual</TableCell>
                  <TableCell>Variance</TableCell>
                  <TableCell>Variance %</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectSpendData.map((project, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{project.project}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>{formatCurrency(project.estimated)}</TableCell>
                    <TableCell>{formatCurrency(project.actual)}</TableCell>
                    <TableCell
                      sx={{
                        color: project.variance > 0 ? "error.main" : "success.main",
                      }}
                    >
                      {project.variance > 0 ? "+" : ""}
                      {formatCurrency(project.variance)}
                    </TableCell>
                    <TableCell>{project.variancePercent.toFixed(1)}%</TableCell>
                    <TableCell>
                      {project.variancePercent > 10 ? (
                        <Typography color="error">Over Budget</Typography>
                      ) : project.variancePercent < -10 ? (
                        <Typography color="success.main">Under Budget</Typography>
                      ) : (
                        <Typography color="text.secondary">On Track</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Supplier Performance Analysis" />
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Total Spend</TableCell>
                  <TableCell>Order Count</TableCell>
                  <TableCell>Avg Order Value</TableCell>
                  <TableCell>Avg Delivery Time</TableCell>
                  <TableCell>On-Time Delivery</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplierSpendData.map((supplier, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{supplier.supplier}</TableCell>
                    <TableCell>{formatCurrency(supplier.totalSpend)}</TableCell>
                    <TableCell>{supplier.orderCount}</TableCell>
                    <TableCell>{formatCurrency(supplier.avgOrderValue)}</TableCell>
                    <TableCell>{supplier.avgDeliveryTime} days</TableCell>
                    <TableCell>{supplier.onTimeDelivery}%</TableCell>
                    <TableCell>
                      {supplier.onTimeDelivery >= 95
                        ? "Excellent"
                        : supplier.onTimeDelivery >= 85
                        ? "Good"
                        : supplier.onTimeDelivery >= 75
                        ? "Fair"
                        : "Poor"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delayed Deliveries */}
      <Card sx={{ mt: 2 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <AlertTriangleIcon />
              <Typography variant="h6">Delayed Deliveries Report</Typography>
            </Box>
          }
        />
        <CardContent>
          {delayedDeliveries.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PO ID</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Job</TableCell>
                    <TableCell>Expected Delivery</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delayedDeliveries.map((po) => {
                    const expectedDate = new Date(po.expectedDeliveryDate);
                    const today = new Date();
                    const daysOverdue = Math.floor(
                      (today.getTime() - expectedDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={po.id}>
                        <TableCell>{po.id}</TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell>{po.jobAllocation}</TableCell>
                        <TableCell>
                          {expectedDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: "error.main" }}>
                          {daysOverdue} days
                        </TableCell>
                        <TableCell>{formatCurrency(po.totalValue)}</TableCell>
                        <TableCell>
                          <Typography color="error">Overdue</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4} color="success.main">
              <AlertTriangleIcon fontSize="large" />
              <Typography>No delayed deliveries - all orders are on track!</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
