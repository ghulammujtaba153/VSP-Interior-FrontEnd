import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";

const RetentionTracking = () => {
  const retentions = [
    {
      id: "RET-2024-001",
      project: "Office Complex A",
      client: "ABC Corporation",
      amount: 120000,
      releaseDate: "2024-03-15",
      status: "upcoming",
      daysLeft: 45,
      percentage: 10,
    },
    {
      id: "RET-2024-002",
      project: "Retail Center B",
      client: "XYZ Development",
      amount: 85000,
      releaseDate: "2024-02-28",
      status: "overdue",
      daysLeft: -5,
      percentage: 10,
    },
    {
      id: "RET-2024-003",
      project: "Community Center",
      client: "City Council",
      amount: 45000,
      releaseDate: "2024-01-20",
      status: "released",
      daysLeft: 0,
      percentage: 5,
    },
    {
      id: "RET-2024-004",
      project: "Shopping Mall",
      client: "Metro Properties",
      amount: 350000,
      releaseDate: "2024-06-30",
      status: "pending",
      daysLeft: 145,
      percentage: 10,
    },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusChip = (status) => {
    switch (status) {
      case "upcoming":
        return <Chip label="Upcoming" color="warning" icon={<AccessTimeIcon />} />;
      case "overdue":
        return <Chip label="Overdue" color="error" icon={<WarningIcon />} />;
      case "released":
        return <Chip label="Released" color="success" icon={<CheckCircleIcon />} />;
      default:
        return <Chip label="Pending" color="primary" icon={<EventIcon />} />;
    }
  };

  return (
    <Box p={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Retention Tracking
          </Typography>
          <Typography color="text.secondary">
            Monitor retention releases and automatic alerts
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<NotificationsIcon />}>
            Set Alerts
          </Button>
          <Button variant="contained" startIcon={<AttachMoneyIcon />}>
            Request Release
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Retained
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                $600K
              </Typography>
              <Typography variant="caption" color="text.secondary">
                4 active retentions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Due This Month
              </Typography>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                $85K
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 retention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Overdue Amount
              </Typography>
              <Typography variant="h6" color="error.main" fontWeight="bold">
                $85K
              </Typography>
              <Typography variant="caption" color="text.secondary">
                5 days overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Released This Year
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                $234K
              </Typography>
              <Typography variant="caption" color="text.secondary">
                8 releases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Retention Table */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Retention Management" />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Retention ID</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Release Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {retentions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.project}</TableCell>
                  <TableCell>{r.client}</TableCell>
                  <TableCell>{formatCurrency(r.amount)}</TableCell>
                  <TableCell>{r.percentage}%</TableCell>
                  <TableCell>{r.releaseDate}</TableCell>
                  <TableCell>{getStatusChip(r.status)}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                    {r.status === "upcoming" && (
                      <Button size="small" variant="contained" sx={{ ml: 1 }}>
                        Request
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Retention Performance" />
            <CardContent>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>On-time Releases</Typography>
                  <Typography color="success.main">85%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Average Release Time</Typography>
                  <Typography>32 days</Typography>
                </Box>
                <LinearProgress variant="determinate" value={68} />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Client Response Rate</Typography>
                  <Typography color="primary.main">92%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Alert Configuration" />
            <CardContent>
              <Box mb={2} display="flex" justifyContent="space-between">
                <Box>
                  <Typography>30-day reminder</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Alert 30 days before release date
                  </Typography>
                </Box>
                <Chip label="Active" color="success" />
              </Box>
              <Divider />
              <Box my={2} display="flex" justifyContent="space-between">
                <Box>
                  <Typography>Overdue notification</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Daily alerts for overdue retentions
                  </Typography>
                </Box>
                <Chip label="Active" color="success" />
              </Box>
              <Divider />
              <Box mt={2} display="flex" justifyContent="space-between">
                <Box>
                  <Typography>Weekly summary</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weekly retention status report
                  </Typography>
                </Box>
                <Chip label="Inactive" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetentionTracking;
