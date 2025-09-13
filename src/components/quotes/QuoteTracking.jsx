"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Avatar,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MailIcon from "@mui/icons-material/Mail";
import DescriptionIcon from "@mui/icons-material/Description";

// Mock tracking data
const mockTrackingData = [
  {
    id: "Q001",
    client: "Modern Homes Ltd",
    project: "Kitchen Renovation",
    value: 25000,
    status: "sent",
    sentDate: "2024-01-15",
    viewedDate: "2024-01-16",
    lastActivity: "Viewed 2 times",
    responseDate: null,
    margin: 22,
  },
  {
    id: "Q002",
    client: "City Apartments",
    project: "Complete Wardrobe Solution",
    value: 18500,
    status: "accepted",
    sentDate: "2024-01-12",
    viewedDate: "2024-01-12",
    lastActivity: "Quote accepted",
    responseDate: "2024-01-14",
    margin: 25,
  },
  {
    id: "Q003",
    client: "Luxury Villas",
    project: "Kitchen & Laundry",
    value: 42000,
    status: "sent",
    sentDate: "2024-01-10",
    viewedDate: "2024-01-11",
    lastActivity: "Viewed 1 time",
    responseDate: null,
    margin: 28,
  },
  {
    id: "Q004",
    client: "Heritage Homes",
    project: "Custom Kitchen",
    value: 15800,
    status: "lost",
    sentDate: "2024-01-08",
    viewedDate: "2024-01-09",
    lastActivity: "Quote declined",
    responseDate: "2024-01-11",
    margin: 20,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "sent":
      return "warning";
    case "accepted":
      return "success";
    case "lost":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "sent":
      return <AccessTimeIcon fontSize="small" />;
    case "accepted":
      return <CheckCircleIcon fontSize="small" />;
    case "lost":
      return <CancelIcon fontSize="small" />;
    default:
      return <DescriptionIcon fontSize="small" />;
  }
};

export const QuoteTracking = () => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Pending Response</Typography>}
              action={<AccessTimeIcon color="warning" />}
            />
            <CardContent>
              <Typography variant="h5">2</Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting client response
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Recently Viewed</Typography>}
              action={<VisibilityIcon color="primary" />}
            />
            <CardContent>
              <Typography variant="h5">3</Typography>
              <Typography variant="caption" color="text.secondary">
                Viewed in last 7 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Follow-up Required</Typography>}
              action={<MailIcon color="error" />}
            />
            <CardContent>
              <Typography variant="h5">1</Typography>
              <Typography variant="caption" color="text.secondary">
                Overdue for follow-up
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quote Tracking Table */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">Quote Tracking</Typography>}
          action={
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select defaultValue="all" label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quote ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent Date</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTrackingData.map((quote) => (
                  <TableRow key={quote.id} hover>
                    <TableCell>{quote.id}</TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell>{quote.project}</TableCell>
                    <TableCell>${quote.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(quote.status)}
                        label={quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        color={getStatusColor(quote.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{quote.sentDate}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{quote.lastActivity}</Typography>
                      {quote.viewedDate && (
                        <Typography variant="caption" color="text.secondary">
                          Viewed: {quote.viewedDate}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {quote.status === "sent" && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CheckCircleIcon />}
                            >
                              Won
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CancelIcon />}
                            >
                              Lost
                            </Button>
                          </>
                        )}
                        {quote.status === "accepted" && (
                          <Button size="small" variant="contained" color="success">
                            Create Job
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MailIcon />}
                        >
                          Follow Up
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title={<Typography variant="h6">Recent Activity</Typography>} />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="flex-start" gap={2} pb={2} borderBottom="1px solid #eee">
              <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
                <CheckCircleIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography fontWeight="500">Quote Q002 Accepted</Typography>
                <Typography variant="body2" color="text.secondary">
                  City Apartments accepted the wardrobe solution quote for $18,500
                </Typography>
                <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" gap={2} pb={2} borderBottom="1px solid #eee">
              <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                <VisibilityIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography fontWeight="500">Quote Q001 Viewed</Typography>
                <Typography variant="body2" color="text.secondary">
                  Modern Homes Ltd viewed the kitchen renovation quote
                </Typography>
                <Typography variant="caption" color="text.secondary">1 day ago</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" gap={2}>
              <Avatar sx={{ bgcolor: "warning.main", width: 32, height: 32 }}>
                <MailIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography fontWeight="500">Quote Q003 Sent</Typography>
                <Typography variant="body2" color="text.secondary">
                  Kitchen & Laundry quote sent to Luxury Villas
                </Typography>
                <Typography variant="caption" color="text.secondary">3 days ago</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
