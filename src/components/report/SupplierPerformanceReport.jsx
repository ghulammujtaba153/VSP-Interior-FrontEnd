"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export default function SupplierPerformanceReport({ period, project }) {
  const supplierData = {
    totalSuppliers: 28,
    activeSuppliers: 22,
    averageRating: 4.2,
    onTimeDelivery: 87.5,
    costVariance: -3.2,
    suppliers: [
      {
        name: "BuildMart Supplies",
        rating: 4.8,
        onTimeDelivery: 95,
        costVariance: -2.1,
        orders: 45,
        totalSpent: 285000,
        lastDelivery: "2 days ago",
        reliability: "Excellent",
      },
      {
        name: "Metro Construction Co",
        rating: 4.5,
        onTimeDelivery: 88,
        costVariance: 1.5,
        orders: 32,
        totalSpent: 195000,
        lastDelivery: "5 days ago",
        reliability: "Good",
      },
      {
        name: "Quality Materials Ltd",
        rating: 3.9,
        onTimeDelivery: 78,
        costVariance: 4.8,
        orders: 28,
        totalSpent: 167000,
        lastDelivery: "1 week ago",
        reliability: "Fair",
      },
      {
        name: "Express Delivery Pro",
        rating: 4.6,
        onTimeDelivery: 92,
        costVariance: -1.8,
        orders: 38,
        totalSpent: 142000,
        lastDelivery: "1 day ago",
        reliability: "Excellent",
      },
    ],
  };

  const getReliabilityColor = (reliability) => {
    switch (reliability) {
      case "Excellent":
        return "success";
      case "Good":
        return "primary";
      case "Fair":
        return "warning";
      default:
        return "error";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Supplier Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Delivery timelines, cost variances, and reliability scores
          </Typography>
        </Box>
        <Button variant="contained" color="primary">
          Generate Report
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Total Suppliers</Typography>}
              action={<LocalShippingIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {supplierData.totalSuppliers}
              </Typography>
              <Typography variant="caption" color="success.main">
                {supplierData.activeSuppliers} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Average Rating</Typography>}
              action={<StarIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {supplierData.averageRating}/5
              </Typography>
              <Box display="flex" alignItems="center" color="success.main">
                <TrendingUpIcon fontSize="small" />
                <Typography variant="caption"> +0.3 from last month</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">On-Time Delivery</Typography>}
              action={<AccessTimeIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {supplierData.onTimeDelivery}%
              </Typography>
              <Box display="flex" alignItems="center" color="error.main">
                <TrendingDownIcon fontSize="small" />
                <Typography variant="caption"> -2.1% from last month</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Cost Variance</Typography>}
              action={<AttachMoneyIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography
                variant="h5"
                color={supplierData.costVariance < 0 ? "success.main" : "error.main"}
              >
                {supplierData.costVariance > 0 ? "+" : ""}
                {supplierData.costVariance}%
              </Typography>
              <Typography variant="caption" color="success.main">
                Below budget average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Top Performers</Typography>}
              action={<StarIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {supplierData.suppliers.filter((s) => s.rating >= 4.5).length}
              </Typography>
              <Typography variant="caption" color="success.main">
                Rated 4.5+ stars
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Supplier Breakdown */}
      <Box mt={4}>
        <Card>
          <CardHeader
            title={<Typography color="primary">Supplier Performance Breakdown</Typography>}
            subheader="Detailed performance metrics for each supplier"
          />
          <CardContent>
            <Grid container spacing={3}>
              {supplierData.suppliers.map((supplier) => (
                <Grid item xs={12} key={supplier.name}>
                  <Box p={2} borderRadius={2} bgcolor="background.paper" boxShadow={1}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Box>
                        <Typography fontWeight="bold">{supplier.name}</Typography>
                        <Box display="flex" gap={1} alignItems="center" mt={1}>
                          <Chip
                            size="small"
                            label={supplier.reliability}
                            color={getReliabilityColor(supplier.reliability)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Last delivery: {supplier.lastDelivery}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          <StarIcon sx={{ color: "gold" }} fontSize="small" />
                          <Typography variant="h6" color="primary">
                            {supplier.rating}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Rating
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="h6">{supplier.onTimeDelivery}%</Typography>
                        <Typography variant="caption">On-Time Delivery</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography
                          variant="h6"
                          color={supplier.costVariance < 0 ? "success.main" : "error.main"}
                        >
                          {supplier.costVariance > 0 ? "+" : ""}
                          {supplier.costVariance}%
                        </Typography>
                        <Typography variant="caption">Cost Variance</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="h6">{supplier.orders}</Typography>
                        <Typography variant="caption">Orders</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="h6">
                          ${supplier.totalSpent.toLocaleString()}
                        </Typography>
                        <Typography variant="caption">Total Spent</Typography>
                      </Grid>
                    </Grid>

                    <Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Overall Performance</Typography>
                        <Typography variant="body2">
                          {((supplier.rating / 5) * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(supplier.rating / 5) * 100}
                        sx={{ height: 8, borderRadius: 5, mt: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
