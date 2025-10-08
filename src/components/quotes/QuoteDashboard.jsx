'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  Paper,
  TablePagination,
  InputAdornment
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MailIcon from "@mui/icons-material/Mail";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import Loader from "../loader/Loader";

// Mock data - in real app this would come from API
const mockQuotes = [
  {
    id: "Q001",
    client: "Modern Homes Ltd",
    project: "Kitchen Renovation",
    value: 25000,
    status: "sent",
    date: "2024-01-15",
    margin: 22,
  },
  {
    id: "Q002",
    client: "City Apartments",
    project: "Complete Wardrobe Solution",
    value: 18500,
    status: "accepted",
    date: "2024-01-12",
    margin: 25,
  },
  {
    id: "Q003",
    client: "Luxury Villas",
    project: "Kitchen & Laundry",
    value: 42000,
    status: "draft",
    date: "2024-01-10",
    margin: 28,
  },
  {
    id: "Q004",
    client: "Heritage Homes",
    project: "Custom Kitchen",
    value: 15800,
    status: "lost",
    date: "2024-01-08",
    margin: 20,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "draft":
      return "default";
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

// New status color mapping for project data
const getProjectStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
      return "warning";
    case "draft":
    default:
      return "default";
  }
};

export const QuoteDashboard = () => {
  const totalQuotes = mockQuotes.length;
  const totalValue = mockQuotes.reduce((sum, quote) => sum + quote.value, 0);
  const winRate = (
    (mockQuotes.filter((q) => q.status === "accepted").length / totalQuotes) *
    100
  ).toFixed(1);
  const avgMargin = (
    mockQuotes.reduce((sum, quote) => sum + quote.margin, 0) / totalQuotes
  ).toFixed(1);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter })
      });

      const res = await axios.get(
        `${BASE_URL}/api/project-setup/get?${params}`
      );
      setData(res.data.data || []);
      setTotalRecords(res.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, search, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/project-setup/update/status/${id}`, { status: newStatus });
      fetchProjects();
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const calculateTotalValue = (project) => {
    if (!project.rates || project.rates.length === 0) return 0;
    return project.rates.reduce((total, rate) => total + (rate.sell || 0), 0);
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ p: 2 }}>
      {/* Key Metrics - Keep original stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Total Quotes</Typography>}
              action={<DescriptionIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5">{totalQuotes}</Typography>
              <Typography variant="caption" color="text.secondary">
                +12% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Total Value</Typography>}
              action={<AttachMoneyIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5">
                ${totalValue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                +8% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Win Rate</Typography>}
              action={<CheckCircleIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5">{winRate}%</Typography>
              <Typography variant="caption" color="text.secondary">
                +2.5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Avg Margin</Typography>}
              action={<TrendingUpIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5">{avgMargin}%</Typography>
              <Typography variant="caption" color="text.secondary">
                +1.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Updated Quote Management with Projects Data */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">Project Quotes Management</Typography>}
        />
        <CardContent sx={{ p: 0 }}>
          {/* Filters */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search projects..."
                  value={search}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Projects Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Quote Value</TableCell>
                  <TableCell>Rates Count</TableCell>
                  <TableCell>Materials Count</TableCell>
                  <TableCell>Revision</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.id}</TableCell>
                      <TableCell>{project.client?.companyName || "-"}</TableCell>
                      <TableCell>{project.projectName}</TableCell>
                      <TableCell>{project.siteLocation}</TableCell>
                      <TableCell>${calculateTotalValue(project).toLocaleString()}</TableCell>
                      <TableCell>{project.rates?.length || 0}</TableCell>
                      <TableCell>{project.materials?.length || 0}</TableCell>
                      <TableCell>{project.revision}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            project.status.charAt(0).toUpperCase() +
                            project.status.slice(1)
                          }
                          color={getProjectStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexDirection="column">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MailIcon />}
                            // onClick={() => handleStatusUpdate(project.id, "pending")}
                            // disabled={project.status === "pending" || project.status === "approved"}
                          >
                            View
                          </Button>
                          {/* <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleStatusUpdate(project.id, "approved")}
                            disabled={project.status === "approved"}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleStatusUpdate(project.id, "rejected")}
                            disabled={project.status === "rejected"}
                          >
                            Reject
                          </Button> */}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No projects found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};