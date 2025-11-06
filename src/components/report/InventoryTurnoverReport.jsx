"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

export const InventoryTurnoverReport = ({ period, project }) => {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period?.startDate) params.append('startDate', period.startDate);
      if (period?.endDate) params.append('endDate', period.endDate);
      
      const url = `${BASE_URL}/api/inventory/get/performance/stats${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(url);
      
      if (res.data.success) {
        setInventoryData(res.data.data);
      } else {
        setInventoryData(null);
      }
    } catch (error) {
      console.error("Error fetching inventory performance data:", error);
      setInventoryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [period, project, refreshKey]);

  if (loading) return <Loader />;

  if (!inventoryData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load inventory performance data
        </Typography>
        <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Inventory Turnover
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock movement, aging inventory, and reorder suggestions
          </Typography>
        </div>
        <Button variant="contained" onClick={() => setRefreshKey(prev => prev + 1)}>Refresh Data</Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Total Items"
              action={<InventoryIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {inventoryData.totalItems.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total inventory items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Average Price"
              action={<AutorenewIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                ${inventoryData.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Per unit average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Stock Value"
              action={<InventoryIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                ${inventoryData.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total inventory value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Reorder Alerts"
              action={<WarningAmberIcon color="warning" />}
            />
            <CardContent>
              <Typography variant="h6" color="error">
                {inventoryData.statusBreakdown?.counts?.['Low Stock'] || 0}
              </Typography>
              <Typography variant="caption" color="error">
                Items in low stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Items Used in Projects" />
            <CardContent>
              <Typography variant="h4" color="primary">
                {inventoryData.itemsUsedInProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of {inventoryData.totalItems} total items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Items Not Used" />
            <CardContent>
              <Typography variant="h4" color="error">
                {inventoryData.itemsNotUsed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items with no project usage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Items Used */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Top Items Used in Projects"
          subheader="Items with highest usage from purchase orders"
        />
        <CardContent>
          {inventoryData.topItemsUsed && inventoryData.topItemsUsed.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.light" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Item Name</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total Quantity Used</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total Value Used</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Cost Price</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Estimated Price Generated</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Usage Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.topItemsUsed.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.totalQuantityUsed}</TableCell>
                    <TableCell align="right">${item.totalValueUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">${item.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">${item.estimatedPriceGenerated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">{item.usageCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No items used in projects yet
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader
          title="Inventory Status Breakdown"
          subheader="Items categorized by stock status"
        />
        <CardContent>
          <Grid container spacing={2} mb={3}>
            {Object.entries(inventoryData.statusBreakdown.counts).map(([status, count]) => (
              <Grid item xs={12} md={4} key={status}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" color="primary">
                      {count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {Object.entries(inventoryData.statusBreakdown.details).map(([status, items]) => (
            <Box key={status} mb={3}>
              <Typography variant="h6" gutterBottom>
                {status} ({items.length} items)
              </Typography>
              {items.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Item Name</strong></TableCell>
                      <TableCell align="right"><strong>Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Cost Price</strong></TableCell>
                      <TableCell align="right"><strong>Total Value</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.slice(0, 10).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${parseFloat(item.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">${item.totalValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No items in this status
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};
