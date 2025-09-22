import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  WarningAmber,
  AttachMoney,
  Calculate,
  Description,
} from "@mui/icons-material";

const ProjectCosting = () => {
  const projects = [
    {
      id: "PROJ-001",
      name: "Office Complex A",
      budget: 1200000,
      spent: 936000,
      committed: 156000,
      remaining: 108000,
      progress: 78,
      variance: -48000,
      status: "on-track",
    },
    {
      id: "PROJ-002",
      name: "Retail Center B",
      budget: 850000,
      spent: 382000,
      committed: 245000,
      remaining: 223000,
      progress: 45,
      variance: 15000,
      status: "under-budget",
    },
    {
      id: "PROJ-003",
      name: "Residential Tower",
      budget: 2100000,
      spent: 1934000,
      committed: 298000,
      remaining: -132000,
      progress: 92,
      variance: -232000,
      status: "over-budget",
    },
    {
      id: "PROJ-004",
      name: "Shopping Mall",
      budget: 3500000,
      spent: 805000,
      committed: 567000,
      remaining: 2128000,
      progress: 23,
      variance: 89000,
      status: "under-budget",
    },
  ];

  const costCategories = [
    { category: "Labor", budgeted: 450000, actual: 423000, variance: 27000 },
    { category: "Materials", budgeted: 380000, actual: 412000, variance: -32000 },
    { category: "Equipment", budgeted: 125000, actual: 118000, variance: 7000 },
    { category: "Subcontractors", budgeted: 245000, actual: 256000, variance: -11000 },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status) => {
    switch (status) {
      case "on-track":
        return "success";
      case "under-budget":
        return "primary";
      case "over-budget":
        return "error";
      case "at-risk":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box p={4} sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Project Costing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track budget vs actual costs for all projects
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<Calculate />}>
            Cost Analysis
          </Button>
          <Button variant="contained" startIcon={<Description />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {[
          { title: "Total Budget", value: "$7.65M", subtitle: "4 active projects" },
          { title: "Total Spent", value: "$4.06M", subtitle: "53% of budget" },
          { title: "Budget Variance", value: "-$184K", subtitle: "2.4% over budget", color: "error.main" },
          { title: "Committed Costs", value: "$1.27M", subtitle: "pending invoices", color: "warning.main" },
        ].map((card, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card>
              <CardHeader
                title={<Typography variant="body2" color="text.secondary">{card.title}</Typography>}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color={card.color || "text.primary"}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Project Table */}
      <Card sx={{ mt: 4 }}>
        <CardHeader title={<Typography color="primary">Project Cost Overview</Typography>} />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Spent</TableCell>
                <TableCell>Committed</TableCell>
                <TableCell>Remaining</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Variance</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Typography fontWeight="bold">{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatCurrency(p.budget)}</TableCell>
                  <TableCell>{formatCurrency(p.spent)}</TableCell>
                  <TableCell>{formatCurrency(p.committed)}</TableCell>
                  <TableCell color={p.remaining < 0 ? "error" : "inherit"}>
                    {formatCurrency(p.remaining)}
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={p.progress}
                      sx={{ height: 6, borderRadius: 2, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {p.progress}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" color={p.variance > 0 ? "success.main" : "error.main"}>
                      {p.variance > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                      <Typography variant="body2" ml={0.5}>
                        {formatCurrency(Math.abs(p.variance))}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status.replace("-", " ")}
                      color={getStatusColor(p.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Categories & Alerts */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={<Typography color="primary">Cost Category Analysis</Typography>} />
            <CardContent>
              {costCategories.map((c, i) => (
                <Box key={i} mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="bold">{c.category}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(c.actual)} / {formatCurrency(c.budgeted)}
                      </Typography>
                      {c.variance > 0 ? (
                        <TrendingUp fontSize="small" color="success" />
                      ) : (
                        <TrendingDown fontSize="small" color="error" />
                      )}
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(c.actual / c.budgeted) * 100}
                    sx={{ height: 6, borderRadius: 2, my: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color={c.variance > 0 ? "success.main" : "error.main"}
                  >
                    {c.variance > 0 ? "Under budget by " : "Over budget by "}
                    {formatCurrency(Math.abs(c.variance))}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={<Typography color="primary">Cost Alerts & Warnings</Typography>} />
            <CardContent>
              <Box display="flex" alignItems="center" p={2} mb={2} bgcolor="error.light" borderRadius={2}>
                <WarningAmber color="error" />
                <Box ml={2}>
                  <Typography fontWeight="bold" color="error">
                    Budget Overrun Alert
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Residential Tower is $232K over budget
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" p={2} mb={2} bgcolor="warning.light" borderRadius={2}>
                <AttachMoney color="warning" />
                <Box ml={2}>
                  <Typography fontWeight="bold" color="warning.main">
                    High Committed Costs
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Shopping Mall has $567K in pending commitments
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" p={2} bgcolor="primary.light" borderRadius={2}>
                <TrendingUp color="primary" />
                <Box ml={2}>
                  <Typography fontWeight="bold" color="primary">
                    Cost Savings Opportunity
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Retail Center B is $15K under budget
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title={<Typography color="primary">Recent Cost Transactions</Typography>} />
        <CardContent>
          <Box display="flex" justifyContent="space-between" p={2} bgcolor="grey.100" borderRadius={2} mb={2}>
            <Box>
              <Typography fontWeight="bold">Steel Works Ltd - Materials</Typography>
              <Typography variant="caption" color="text.secondary">
                Office Complex A • SUP-2024-078
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography fontWeight="bold" color="error">
                -$23,450
              </Typography>
              <Typography variant="caption" color="text.secondary">
                2 hours ago
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" p={2} bgcolor="grey.100" borderRadius={2}>
            <Box>
              <Typography fontWeight="bold">Labor Costs - Week 3</Typography>
              <Typography variant="caption" color="text.secondary">
                Retail Center B • Payroll
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography fontWeight="bold" color="error">
                -$45,200
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 day ago
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectCosting;
