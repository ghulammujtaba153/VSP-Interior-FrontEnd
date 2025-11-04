import { Card, CardContent, Box, Typography, Grid } from "@mui/material";
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  WarningAmber as AlertTriangleIcon,
} from "@mui/icons-material";
import { formatCurrency } from "./reportsUtils";

const SummaryMetrics = ({ summary }) => {
  if (!summary) return null;

  const { totalOrders, totalSpend, avgOrderValue } = summary;

  return (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {totalOrders || 0}
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
                  Total Spend
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(totalSpend)}
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
                  {formatCurrency(avgOrderValue)}
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
                  Status Types
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {summary.statusCounts?.length || 0}
                </Typography>
              </Box>
              <AlertTriangleIcon color="warning" />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryMetrics;

