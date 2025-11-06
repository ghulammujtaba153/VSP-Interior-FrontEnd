"use client";

import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

export default function SupplierPerformanceReport({ period, project }) {
  const [loading, setLoading] = useState(true);
  const [supplierData, setSupplierData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period?.startDate) params.append('startDate', period.startDate);
      if (period?.endDate) params.append('endDate', period.endDate);
      
      const url = `${BASE_URL}/api/suppliers/get/performance/stats${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(url);
      
      if (res.data.success) {
        setSupplierData(res.data.data);
      } else {
        setSupplierData(null);
      }
    } catch (error) {
      console.error("Error fetching supplier performance data:", error);
      setSupplierData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [period, project, refreshKey]);

  if (loading) return <Loader />;

  if (!supplierData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load supplier performance data
        </Typography>
        <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  const getReliabilityColor = (reliability) => {
    switch (reliability) {
      case "Excellent":
        return "success";
      case "Good":
        return "primary";
      case "Fair":
        return "warning";
      case "Poor":
        return "error";
      case "No Data":
        return "default";
      default:
        return "default";
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
        <Button variant="contained" color="primary" onClick={() => setRefreshKey(prev => prev + 1)}>
          Refresh Data
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

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">On-Time Delivery</Typography>}
              action={<AccessTimeIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {supplierData.onTimeDelivery}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {supplierData.totalSuppliers} total suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Top Performers</Typography>}
              action={<StarIcon fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {supplierData.topPerformers}
              </Typography>
              <Typography variant="caption" color="success.main">
                With 80%+ on-time delivery
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
              {supplierData.suppliers && supplierData.suppliers.length > 0 ? (
                supplierData.suppliers.map((supplier) => (
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
                        <Typography variant="h6" color="primary">
                        {supplier.onTimeDelivery}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        On-Time Delivery
                      </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="h6">{supplier.deliveredOrders || 0}</Typography>
                        <Typography variant="caption">Delivered Orders</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="h6">{supplier.earlyDeliveries || 0}</Typography>
                        <Typography variant="caption" color="success.main">Early Deliveries</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="h6">{supplier.lateDeliveries || 0}</Typography>
                        <Typography variant="caption" color="error.main">Late Deliveries</Typography>
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
                        <Typography variant="body2">On-Time Delivery Rate</Typography>
                        <Typography variant="body2">
                          {supplier.onTimeDelivery.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={supplier.onTimeDelivery}
                        sx={{ height: 8, borderRadius: 5, mt: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))
              ) : (
                <Grid item xs={12}>
                  <Typography color="text.secondary" align="center" py={3}>
                    No supplier performance data available
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
