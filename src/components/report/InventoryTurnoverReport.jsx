"use client";

import React from "react";
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
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";



export const InventoryTurnoverReport = ({ period, project }) => {
  const inventoryData = {
    totalItems: 1247,
    turnoverRate: 6.8,
    stockValue: 485000,
    agingItems: 89,
    reorderAlerts: 23,
    categories: [
      {
        name: "Construction Materials",
        items: 450,
        value: 285000,
        turnover: 8.2,
        aging: 25,
        reorderNeeded: 8,
      },
      {
        name: "Tools & Equipment",
        items: 180,
        value: 125000,
        turnover: 4.5,
        aging: 12,
        reorderNeeded: 5,
      },
      {
        name: "Safety Equipment",
        items: 320,
        value: 45000,
        turnover: 12.1,
        aging: 8,
        reorderNeeded: 7,
      },
      {
        name: "Office Supplies",
        items: 297,
        value: 30000,
        turnover: 9.8,
        aging: 44,
        reorderNeeded: 3,
      },
    ],
  };

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
        <Button variant="contained">Generate Report</Button>
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
              <Typography variant="caption" color="success.main" display="flex" alignItems="center">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> +3.4% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Turnover Rate"
              action={<AutorenewIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {inventoryData.turnoverRate}x
              </Typography>
              <Typography variant="caption" color="success.main" display="flex" alignItems="center">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> +0.8x from last month
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
                ${inventoryData.stockValue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current inventory value
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
                {inventoryData.reorderAlerts}
              </Typography>
              <Typography variant="caption" color="error">
                Items need restocking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory by Category */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Inventory Analysis by Category"
          subheader="Stock levels, turnover rates, and aging by category"
        />
        <CardContent>
          <Grid container spacing={2}>
            {inventoryData.categories.map((cat) => (
              <Grid item xs={12} key={cat.name}>
                <Box p={2} bgcolor="grey.100" borderRadius={2}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {cat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cat.items} items • ${cat.value.toLocaleString()} value
                      </Typography>
                    </div>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        {cat.turnover}x
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Turnover rate
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6">{cat.items}</Typography>
                      <Typography variant="caption">Total Items</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color="error">
                        {cat.aging}
                      </Typography>
                      <Typography variant="caption">Aging Items</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color="primary">
                        {cat.reorderNeeded}
                      </Typography>
                      <Typography variant="caption">Reorder Needed</Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption">Turnover Performance</Typography>
                      <Typography variant="caption">
                        {((cat.turnover / 12) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(cat.turnover / 12) * 100}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Aging Inventory */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Aging Inventory Analysis"
          subheader="Items by aging period and recommended actions"
        />
        <CardContent>
          <Grid container spacing={2}>
            {[
              { period: "0-30 days", count: 1047, percentage: 84, color: "success" },
              { period: "31-60 days", count: 111, percentage: 9, color: "primary" },
              { period: "61-90 days", count: 56, percentage: 4, color: "warning" },
              { period: "90+ days", count: 33, percentage: 3, color: "error" },
            ].map((aging) => (
              <Grid item xs={12} md={3} key={aging.period}>
                <Box p={2} borderRadius={2} bgcolor="grey.100" textAlign="center">
                  <Typography variant="h6" color={`${aging.color}.main`}>
                    {aging.count}
                  </Typography>
                  <Typography variant="body2">{aging.period}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {aging.percentage}% of total
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Reorder Recommendations */}
      <Card>
        <CardHeader
          title="Reorder Recommendations"
          subheader="Items requiring immediate attention"
        />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {[
              { item: "Safety Helmets - Type A", currentStock: 15, reorderLevel: 25, suggested: 100, urgency: "High" },
              { item: "Concrete Mix - Portland", currentStock: 8, reorderLevel: 20, suggested: 50, urgency: "High" },
              { item: "Steel Beams - 6m", currentStock: 3, reorderLevel: 10, suggested: 25, urgency: "Critical" },
              { item: "Work Gloves - Large", currentStock: 22, reorderLevel: 30, suggested: 75, urgency: "Medium" },
              { item: "Electrical Wire - 12AWG", currentStock: 45, reorderLevel: 50, suggested: 200, urgency: "Low" },
            ].map((row) => (
              <Box
                key={row.item}
                p={2}
                bgcolor="grey.100"
                borderRadius={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {row.item}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current: {row.currentStock} • Reorder Level: {row.reorderLevel}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography color="primary" fontWeight="bold">
                    {row.suggested}
                  </Typography>
                  <Typography variant="caption">Suggested</Typography>
                </Box>
                <Chip
                  label={row.urgency}
                  color={
                    row.urgency === "Critical"
                      ? "error"
                      : row.urgency === "High"
                      ? "warning"
                      : row.urgency === "Medium"
                      ? "primary"
                      : "success"
                  }
                  size="small"
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
