"use client";

import { Box, Paper, Typography, Grid } from "@mui/material";
import { Chart } from "react-google-charts";

const PurchasingCharts = ({ statsData }) => {
  if (!statsData) {
    return null;
  }

  // Prepare Status Distribution Chart Data
  const statusChartData = [
    ["Status", "Count"],
    ...(statsData.summary?.statusCounts || []).map((item) => [
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
      parseInt(item.count),
    ]),
  ];

  // Prepare Top Suppliers Chart Data
  const topSuppliersData = [
    ["Supplier", "Total Spend (NZD)"],
    ...(statsData.topSuppliers || []).map((supplier) => [
      supplier.suppliers?.name || "Unknown",
      parseFloat(supplier.totalSpend || 0),
    ]),
  ];

  // Prepare Project Spend Chart Data
  const projectSpendData = [
    ["Project", "Total Spent (NZD)"],
    ...(statsData.projectSpend || []).map((project) => [
      project.projectName || "Unknown",
      parseFloat(project.totalSpent || 0),
    ]),
  ];

  // Prepare Monthly Trend Chart Data
  const monthlyTrendData = [
    ["Month", "Monthly Spend", "Orders Count"],
    ...(statsData.monthlyTrend || []).map((trend) => {
      const date = new Date(trend.month);
      const monthName = date.toLocaleDateString("en-NZ", { month: "short", year: "numeric" });
      return [
        monthName,
        parseFloat(trend.monthlySpend || 0),
        parseInt(trend.ordersCount || 0),
      ];
    }),
  ];

  // Prepare Top Items Chart Data
  const topItemsData = [
    ["Item", "Total Quantity", "Total Spent (NZD)"],
    ...(statsData.itemStats || []).map((item) => [
      item.item?.name || "Unknown",
      parseFloat(item.totalQuantity || 0),
      parseFloat(item.totalSpent || 0),
    ]),
  ];

  // Prepare Supplier Performance Chart Data
  const supplierPerformanceData = [
    ["Supplier", "Delivered", "Delayed"],
    ...(statsData.supplierPerformance || []).map((perf) => [
      perf.suppliers?.name || "Unknown",
      parseInt(perf.deliveredOrders || 0),
      parseInt(perf.delayedOrders || 0),
    ]),
  ];

  // Prepare Attachment Stats Chart Data
  const attachmentStats = statsData.attachmentStats || {};
  const attachmentChartData = [
    ["Type", "Count"],
    ["With Attachments", parseInt(attachmentStats.ordersWithAttachments || 0)],
    ["Missing Attachments", parseInt(attachmentStats.missingAttachments || 0)],
  ];

  const chartOptions = {
    backgroundColor: "transparent",
    legend: {
      position: "right",
      textStyle: { fontSize: 12 },
    },
    chartArea: {
      left: "15%",
      top: "10%",
      width: "80%",
      height: "75%",
    },
  };

  const pieChartOptions = {
    ...chartOptions,
    is3D: false,
    pieSliceText: "value",
    pieSliceTextStyle: { fontSize: 12 },
  };

  const barChartOptions = {
    ...chartOptions,
    legend: { position: "top" },
    hAxis: {
      title: "Amount (NZD)",
      textStyle: { fontSize: 11 },
    },
    vAxis: {
      textStyle: { fontSize: 11 },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    legend: { position: "top" },
    hAxis: {
      title: "Month",
      textStyle: { fontSize: 11 },
    },
    vAxis: {
      title: "Value",
      textStyle: { fontSize: 11 },
    },
    series: {
      0: { type: "line", targetAxisIndex: 0 },
      1: { type: "bars", targetAxisIndex: 1 },
    },
    vAxes: {
      0: { title: "Spend (NZD)" },
      1: { title: "Orders Count" },
    },
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        Visual Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Status Distribution - Pie Chart */}
        {statsData.summary?.statusCounts && statsData.summary.statusCounts.length > 0 && (
          <Grid item sx={{width: { md: "49%", xs: "100%" }}}>
            <Paper sx={{ p: 2, height: "400px" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Order Status Distribution
              </Typography>
              <Chart
                chartType="PieChart"
                width="100%"
                height="350px"
                data={statusChartData}
                options={pieChartOptions}
              />
            </Paper>
          </Grid>
        )}

        {/* Attachment Stats - Donut Chart */}
        {attachmentChartData.length > 1 && (
            <Grid item sx={{ width: { md: "49%", xs: "100%" } }}>

            <Paper sx={{ p: 2, height: "400px" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Attachment Coverage
              </Typography>
              <Chart
                chartType="PieChart"
                width="100%"
                height="350px"
                data={attachmentChartData}
                options={{
                  ...pieChartOptions,
                  pieHole: 0.4,
                }}
              />
            </Paper>
          </Grid>
        )}


        {/* Top Items - Column Chart */}
        {statsData.itemStats && statsData.itemStats.length > 0 && (
          <Grid item sx={{ width: "100%"}}>
            <Paper sx={{ p: 2, height: "400px", minWidth: "50%" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Top Items by Quantity & Spend
              </Typography>
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="350px"
                data={topItemsData}
                options={{
                  ...barChartOptions,
                  hAxis: {
                    ...barChartOptions.hAxis,
                    title: "Item Name",
                  },
                  vAxis: {
                    ...barChartOptions.vAxis,
                    title: "Value",
                  },
                }}
              />
            </Paper>
          </Grid>
        )}

        {/* Top Suppliers by Spend - Bar Chart */}
        {statsData.topSuppliers && statsData.topSuppliers.length > 0 && (
          <Grid item sx={{width: { md: "32%", xs: "100%" }}}>
            <Paper sx={{ p: 2, height: "400px", minWidth: "50%" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Top Suppliers by Total Spend
              </Typography>
              <Chart
                chartType="BarChart"
                width="100%"
                height="350px"
                data={topSuppliersData}
                options={{
                  ...barChartOptions,
                  hAxis: {
                    ...barChartOptions.hAxis,
                    title: "Total Spend (NZD)",
                  },
                }}
              />
            </Paper>
          </Grid>
        )}

        {/* Project Spend Distribution - Bar Chart */}
        {statsData.projectSpend && statsData.projectSpend.length > 0 && (
          <Grid item sx={{width: { md: "32%", xs: "100%" }}}>
            <Paper sx={{ p: 2, height: "400px", minWidth: "50%" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Project Spend Distribution
              </Typography>
              <Chart
                chartType="BarChart"
                width="100%"
                height="350px"
                data={projectSpendData}
                options={{
                  ...barChartOptions,
                  hAxis: {
                    ...barChartOptions.hAxis,
                    title: "Total Spent (NZD)",
                  },
                }}
              />
            </Paper>
          </Grid>
        )}

        {/* Monthly Trend - Combo Chart */}
        {statsData.monthlyTrend && statsData.monthlyTrend.length > 0 && (
          <Grid item sx={{width: { md: "33%", xs: "100%" }}}>
            <Paper sx={{ p: 2, height: "400px", minWidth: "50%" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Monthly Spending Trend
              </Typography>
              <Chart
                chartType="ComboChart"
                width="100%"
                height="350px"
                data={monthlyTrendData}
                options={lineChartOptions}
              />
            </Paper>
          </Grid>
        )}

        

        {/* Supplier Performance - Column Chart */}
        {statsData.supplierPerformance && statsData.supplierPerformance.length > 0 && (
          <Grid item sx={{ width: "100%"}}>
            <Paper sx={{ p: 2, height: "400px", minWidth: "50%" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Supplier Performance (Delivered vs Delayed)
              </Typography>
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="350px"
                data={supplierPerformanceData}
                options={{
                  ...barChartOptions,
                  hAxis: {
                    ...barChartOptions.hAxis,
                    title: "Supplier",
                  },
                  vAxis: {
                    ...barChartOptions.vAxis,
                    title: "Order Count",
                  },
                  colors: ["#4caf50", "#f44336"],
                }}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PurchasingCharts;

