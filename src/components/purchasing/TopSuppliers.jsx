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
import { formatCurrency } from "./reportsUtils";

const TopSuppliers = ({ topSuppliers }) => {
  if (!topSuppliers || topSuppliers.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Top 5 Suppliers by Spend" />
        <CardContent>
          <Typography color="text.secondary">No supplier data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Top 5 Suppliers by Spend" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Supplier Name</TableCell>
                <TableCell align="right">Total Spend</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Avg Order Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topSuppliers.map((supplier, idx) => (
                <TableRow key={supplier.supplierId || idx}>
                  <TableCell>
                    {supplier.suppliers?.name || "Unknown Supplier"}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(parseFloat(supplier.totalSpend || 0))}
                  </TableCell>
                  <TableCell align="right">
                    {supplier.totalOrders || 0}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(
                      parseFloat(supplier.totalSpend || 0) /
                        (parseInt(supplier.totalOrders) || 1)
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

export default TopSuppliers;

