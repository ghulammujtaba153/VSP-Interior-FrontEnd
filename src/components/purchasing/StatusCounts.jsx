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

const getStatusColor = (status) => {
  const statusColors = {
    submit: "default",
    approved: "success",
    rejected: "error",
    pending: "warning",
    delivered: "info",
    delayed: "error",
  };
  return statusColors[status?.toLowerCase()] || "default";
};

const StatusCounts = ({ statusCounts }) => {
  if (!statusCounts || statusCounts.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Order Status Breakdown" />
        <CardContent>
          <Typography color="text.secondary">No status data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Order Status Breakdown" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusCounts.map((status, idx) => (
                <TableRow key={status.status || idx}>
                  <TableCell>
                    <Chip
                      label={status.status || "Unknown"}
                      color={getStatusColor(status.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{status.count || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default StatusCounts;

