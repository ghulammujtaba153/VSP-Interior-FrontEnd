import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { formatCurrency, formatMonth } from "./reportsUtils";

const MonthlyTrend = ({ monthlyTrend }) => {
  if (!monthlyTrend || monthlyTrend.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Monthly Spend Trend (Last 6 Months)" />
        <CardContent>
          <Typography color="text.secondary">No monthly trend data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Monthly Spend Trend (Last 6 Months)" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Monthly Spend</TableCell>
                <TableCell align="right">Orders Count</TableCell>
                <TableCell align="right">Avg Order Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyTrend.map((month, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatMonth(month.month)}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(parseFloat(month.monthlySpend || 0))}
                  </TableCell>
                  <TableCell align="right">
                    {month.ordersCount || 0}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(
                      parseFloat(month.monthlySpend || 0) /
                        (parseInt(month.ordersCount) || 1)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrend;

