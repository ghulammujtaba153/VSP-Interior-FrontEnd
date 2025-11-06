"use client";

import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

export const FinancialReport = ({ period, project }) => {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period?.startDate) params.append('startDate', period.startDate);
      if (period?.endDate) params.append('endDate', period.endDate);
      
      const url = `${BASE_URL}/api/project-setup/get/financial/report${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(url);
      
      const data = res.data.data;
      
      // Map API data to component structure
      const mappedData = {
        totalRevenue: data.totalRevenue || 0,
        totalExpenses: data.totalExpenses || 0,
        netProfit: data.netProfit || 0,
        cashFlow: data.cashFlow || 0,
        profitMargin: data.profitMargin || 0,
        projectProfitability: data.projectProfitability || [],
        breakdown: data.breakdown || {
          expenses: { materials: 0, lineItems: 0, labour: 0 },
          inflows: { projectPayments: 0 },
          outflows: { materialsAndSupplies: 0, lineItems: 0, labourCosts: 0 },
        },
      };
      
      setFinancialData(mappedData);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setFinancialData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [period, project]);

  if (loading) return <Loader />;

  if (!financialData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load financial data
        </Typography>
        <Button onClick={fetchFinancialData} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  // Helper to calculate percentage change (mock data for now - can be enhanced with historical data)
  const getChangePercentage = (value, type) => {
    // This is a placeholder - in real scenario, you'd compare with previous period
    return { value: 0, isPositive: value > 0 };
  };

  const revenueChange = getChangePercentage(financialData.totalRevenue, 'revenue');
  const expensesChange = getChangePercentage(financialData.totalExpenses, 'expenses');
  const profitChange = getChangePercentage(financialData.netProfit, 'profit');
  const cashFlowChange = getChangePercentage(financialData.cashFlow, 'cashFlow');
  const marginChange = getChangePercentage(financialData.profitMargin, 'margin');

  // Calculate percentages for cash flow breakdown
  const inflowTotal = financialData.breakdown.inflows.projectPayments;
  const outflowTotal = financialData.breakdown.outflows.materialsAndSupplies + 
                       financialData.breakdown.outflows.lineItems + 
                       financialData.breakdown.outflows.labourCosts;

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const cashInflows = [
    { 
      source: "Project Payments", 
      amount: financialData.breakdown.inflows.projectPayments, 
      percentage: calculatePercentage(financialData.breakdown.inflows.projectPayments, inflowTotal) 
    },
  ];

  const cashOutflows = [
    { 
      source: "Materials & Supplies", 
      amount: financialData.breakdown.outflows.materialsAndSupplies, 
      percentage: calculatePercentage(financialData.breakdown.outflows.materialsAndSupplies, outflowTotal) 
    },
    { 
      source: "Line Items (Rates)", 
      amount: financialData.breakdown.outflows.lineItems, 
      percentage: calculatePercentage(financialData.breakdown.outflows.lineItems, outflowTotal) 
    },
    { 
      source: "Labour Costs", 
      amount: financialData.breakdown.outflows.labourCosts, 
      percentage: calculatePercentage(financialData.breakdown.outflows.labourCosts, outflowTotal) 
    },
  ];

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
        <Button variant="contained" onClick={fetchFinancialData}>
          Refresh Data
        </Button>
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
                ${financialData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                variant="caption"
                color={revenueChange.isPositive ? "success.main" : "error"}
                display="flex"
                alignItems="center"
              >
                {revenueChange.isPositive ? <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />}
                Active projects revenue
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
                ${financialData.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="flex"
                alignItems="center"
              >
                Materials + Rates + Labour
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
              <Typography variant="h6" color={financialData.netProfit >= 0 ? "success.main" : "error"}>
                ${financialData.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                variant="caption"
                color={profitChange.isPositive ? "success.main" : "error"}
                display="flex"
                alignItems="center"
              >
                {profitChange.isPositive ? <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />}
                Revenue - Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader title="Cash Flow" action={<TrendingUp color="action" />} />
            <CardContent>
              <Typography variant="h6" color={financialData.cashFlow >= 0 ? "primary" : "error"}>
                ${financialData.cashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                variant="caption"
                color={cashFlowChange.isPositive ? "success.main" : "error"}
                display="flex"
                alignItems="center"
              >
                {cashFlowChange.isPositive ? <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />}
                Cash In - Cash Out
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardHeader title="Profit Margin" action={<PieChart color="action" />} />
            <CardContent>
              <Typography variant="h6" color="primary">
                {financialData.profitMargin.toFixed(2)}%
              </Typography>
              <Typography
                variant="caption"
                color={marginChange.isPositive ? "success.main" : "error"}
                display="flex"
                alignItems="center"
              >
                {marginChange.isPositive ? <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />}
                Net Profit / Revenue
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
          {financialData.projectProfitability.length > 0 ? (
            financialData.projectProfitability.map((project, index) => (
              <Box
                key={project.id || index}
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
                  <Typography variant="subtitle1" color={project.margin >= 0 ? "success.main" : "error"}>
                    {project.margin.toFixed(2)}% margin
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography fontWeight="bold">
                      ${project.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Costs
                    </Typography>
                    <Typography fontWeight="bold">
                      ${project.costs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Profit
                    </Typography>
                    <Typography fontWeight="bold" color={project.profit >= 0 ? "success.main" : "error"}>
                      ${project.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No project profitability data available
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title="Cash Flow Analysis"
          subheader="Inflows vs outflows breakdown"
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                Cash Inflows
              </Typography>
              <Divider sx={{ my: 1 }} />
              {cashInflows.map((inflow, i) => (
                <Box
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography>{inflow.source}</Typography>
                  <Box textAlign="right">
                    <Typography fontWeight="bold">
                      ${inflow.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inflow.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight="bold">Total Inflows</Typography>
                <Typography fontWeight="bold" color="success.main">
                  ${financialData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" color="error">
                Cash Outflows
              </Typography>
              <Divider sx={{ my: 1 }} />
              {cashOutflows.map((outflow, i) => (
                <Box
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography>{outflow.source}</Typography>
                  <Box textAlign="right">
                    <Typography fontWeight="bold">
                      ${outflow.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {outflow.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight="bold">Total Outflows</Typography>
                <Typography fontWeight="bold" color="error">
                  ${financialData.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
