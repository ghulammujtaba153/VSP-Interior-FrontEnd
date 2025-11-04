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
  Chip,
} from "@mui/material";

const SupplierPerformance = ({ supplierPerformance }) => {
  if (!supplierPerformance || supplierPerformance.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Supplier Performance" />
        <CardContent>
          <Typography color="text.secondary">No supplier performance data available</Typography>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceRating = (delivered, total) => {
    if (total === 0) return { label: "N/A", color: "default" };
    const rate = (parseInt(delivered) / parseInt(total)) * 100;
    if (rate >= 95) return { label: "Excellent", color: "success" };
    if (rate >= 85) return { label: "Good", color: "info" };
    if (rate >= 75) return { label: "Fair", color: "warning" };
    return { label: "Poor", color: "error" };
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Supplier Performance Analysis" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Supplier Name</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Delivered Orders</TableCell>
                <TableCell align="right">Delayed Orders</TableCell>
                <TableCell align="right">Delivery Rate</TableCell>
                <TableCell>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {supplierPerformance.map((supplier, idx) => {
                const totalOrders = parseInt(supplier.totalOrders || 0);
                const delivered = parseInt(supplier.deliveredOrders || 0);
                const delayed = parseInt(supplier.delayedOrders || 0);
                const deliveryRate = totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : 0;
                const rating = getPerformanceRating(delivered, totalOrders);

                return (
                  <TableRow key={supplier.supplierId || idx}>
                    <TableCell>
                      {supplier.suppliers?.name || "Unknown Supplier"}
                    </TableCell>
                    <TableCell align="right">{totalOrders}</TableCell>
                    <TableCell align="right">{delivered}</TableCell>
                    <TableCell align="right">{delayed}</TableCell>
                    <TableCell align="right">{deliveryRate}%</TableCell>
                    <TableCell>
                      <Chip
                        label={rating.label}
                        color={rating.color}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SupplierPerformance;

