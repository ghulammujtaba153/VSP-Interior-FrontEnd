"use client";

import React from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import {
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  PieChart,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";



export const FinancialReport = ({ period, project }) => {
  const financialData = {
    totalRevenue: 1247500,
    totalExpenses: 876200,
    netProfit: 371300,
    cashFlow: 245800,
    profitMargin: 29.8,
    projectProfitability: [
      {
        name: "Project Alpha",
        revenue: 450000,
        costs: 312000,
        profit: 138000,
        margin: 30.7,
      },
      {
        name: "Project Beta",
        revenue: 380000,
        costs: 275000,
        profit: 105000,
        margin: 27.6,
      },
      {
        name: "Project Gamma",
        revenue: 417500,
        costs: 289200,
        profit: 128300,
        margin: 30.7,
      },
    ],
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Financial Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Profit/loss, cash flow, and project profitability
          </Typography>
        </Box>
        <Button variant="contained">Generate Report</Button>
      </Box>

      {/* Key Financial Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader
              title="Total Revenue"
              action={<AttachMoney color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                ${financialData.totalRevenue.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="success.main"
                display="flex"
                alignItems="center"
              >
                <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                +18.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader
              title="Total Expenses"
              action={<CreditCard color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="error">
                ${financialData.totalExpenses.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="error"
                display="flex"
                alignItems="center"
              >
                <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                +8.4% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader
              title="Net Profit"
              action={<AccountBalanceWallet color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="success.main">
                ${financialData.netProfit.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="success.main"
                display="flex"
                alignItems="center"
              >
                <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                +32.1% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader title="Cash Flow" action={<TrendingUp color="action" />} />
            <CardContent>
              <Typography variant="h6" color="primary">
                ${financialData.cashFlow.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="success.main"
                display="flex"
                alignItems="center"
              >
                <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                +15.7% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader title="Profit Margin" action={<PieChart color="action" />} />
            <CardContent>
              <Typography variant="h6" color="primary">
                {financialData.profitMargin}%
              </Typography>
              <Typography
                variant="caption"
                color="success.main"
                display="flex"
                alignItems="center"
              >
                <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                +4.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Profitability */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title="Project Profitability"
          subheader="Revenue, costs, and profit margins by project"
        />
        <CardContent>
          {financialData.projectProfitability.map((project, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {project.name}
                </Typography>
                <Typography variant="subtitle1" color="success.main">
                  {project.margin}% margin
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography fontWeight="bold">
                    ${project.revenue.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Costs
                  </Typography>
                  <Typography fontWeight="bold">
                    ${project.costs.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Profit
                  </Typography>
                  <Typography fontWeight="bold" color="success.main">
                    ${project.profit.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title="Cash Flow Analysis"
          subheader="Inflows vs outflows over time"
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                Cash Inflows
              </Typography>
              <Divider sx={{ my: 1 }} />
              {[
                { source: "Project Payments", amount: 420000, percentage: 68 },
                { source: "Milestone Completions", amount: 180000, percentage: 29 },
                { source: "Other Income", amount: 18000, percentage: 3 },
              ].map((inflow, i) => (
                <Box
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography>{inflow.source}</Typography>
                  <Box textAlign="right">
                    <Typography fontWeight="bold">
                      ${inflow.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inflow.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="error">
                Cash Outflows
              </Typography>
              <Divider sx={{ my: 1 }} />
              {[
                { source: "Materials & Supplies", amount: 285000, percentage: 45 },
                { source: "Labor Costs", amount: 190000, percentage: 30 },
                { source: "Equipment & Tools", amount: 95000, percentage: 15 },
                { source: "Overhead", amount: 63000, percentage: 10 },
              ].map((outflow, i) => (
                <Box
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography>{outflow.source}</Typography>
                  <Box textAlign="right">
                    <Typography fontWeight="bold">
                      ${outflow.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {outflow.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
