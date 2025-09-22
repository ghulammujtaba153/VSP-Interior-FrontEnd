"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";

const ProgressClaims = () => {
  const claims = [
    {
      id: "PC-2024-001",
      project: "Office Complex A",
      amount: "$125,000",
      status: "approved",
      date: "2024-01-15",
      progress: "78%",
    },
    {
      id: "PC-2024-002",
      project: "Retail Center B",
      amount: "$89,500",
      status: "pending",
      date: "2024-01-18",
      progress: "45%",
    },
    {
      id: "PC-2024-003",
      project: "Residential Tower",
      amount: "$234,000",
      status: "draft",
      date: "2024-01-20",
      progress: "92%",
    },
    {
      id: "PC-2024-004",
      project: "Shopping Mall",
      amount: "$156,750",
      status: "rejected",
      date: "2024-01-12",
      progress: "23%",
    },
  ];

  const getStatusChip = (status) => {
    const colors = {
      approved: "success",
      pending: "warning",
      draft: "default",
      rejected: "error",
    };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colors[status] || "default"}
        size="small"
      />
    );
  };

  return (
    <Box p={4} bgcolor="background.default" minHeight="100vh">
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="600" color="primary">
            Progress Claims
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage progress claims for your projects
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" size="small" startIcon={<DescriptionIcon />}>
            Auto-Generate from Quote
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />}>
            New Claim
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2" color="text.secondary">Total Claims</Typography>} />
            <CardContent>
              <Typography variant="h6">24</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2" color="text.secondary">Approved Value</Typography>} />
            <CardContent>
              <Typography variant="h6" color="success.main">$1.2M</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2" color="text.secondary">Pending Value</Typography>} />
            <CardContent>
              <Typography variant="h6" color="warning.main">$89.5K</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2" color="text.secondary">This Month</Typography>} />
            <CardContent>
              <Typography variant="h6">8</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Claims Table */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title={<Typography color="primary">Recent Progress Claims</Typography>} />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Claim ID</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{claim.project}</TableCell>
                  <TableCell>{claim.amount}</TableCell>
                  <TableCell>{claim.progress}</TableCell>
                  <TableCell>{getStatusChip(claim.status)}</TableCell>
                  <TableCell>{claim.date}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small">
                        <VisibilityIcon fontSize="small" />
                      </Button>
                      <Button variant="outlined" size="small">
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button variant="outlined" size="small">
                        <DownloadIcon fontSize="small" />
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Variations Section */}
      <Card>
        <CardHeader title={<Typography color="primary">Variations & Add-ons</Typography>} />
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" p={2} bgcolor="action.hover" borderRadius={2}>
              <Box>
                <Typography fontWeight="500">Additional Electrical Work - Office Complex A</Typography>
                <Typography variant="body2" color="text.secondary">
                  Added to PC-2024-001
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography fontWeight="600">+$15,000</Typography>
                <Chip label="Approved" color="success" size="small" />
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" p={2} bgcolor="action.hover" borderRadius={2}>
              <Box>
                <Typography fontWeight="500">HVAC Upgrade - Retail Center B</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending approval
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography fontWeight="600">+$8,500</Typography>
                <Chip label="Pending" color="warning" size="small" />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgressClaims;
