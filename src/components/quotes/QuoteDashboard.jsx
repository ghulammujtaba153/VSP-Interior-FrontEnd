"use client";

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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");



  const fetchProjects = async () => {
      setLoading(true)
      try {
        const res = await axios.get(
          `${BASE_URL}/api/project-setup/get?page=${page + 1}&limit=${limit}&search=${search}`
        )
        setData(res.data.data || [])
        setRowCount(res.data.pagination?.totalRecords || 0)
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast.error('Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }


    useEffect(() => {
      fetchProjects()
    }, [page, limit, search])

    if(loading) return <Loader />

  return (
    <Box sx={{ p: 2 }}>
      {/* Key Metrics */}
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

      {/* Filters */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">Quote Management</Typography>}
        />
        <CardContent>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search quotes..."
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue="all" label="Status">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="lost">Lost</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} md={4}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select defaultValue="all" label="Client">
                  <MenuItem value="all">All Clients</MenuItem>
                  <MenuItem value="modern">Modern Homes Ltd</MenuItem>
                  <MenuItem value="city">City Apartments</MenuItem>
                  <MenuItem value="luxury">Luxury Villas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Quotes Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quote ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Margin</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockQuotes.map((quote) => (
                  <TableRow key={quote.id} hover>
                    <TableCell>{quote.id}</TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell>{quote.project}</TableCell>
                    <TableCell>
                      ${quote.value.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          quote.status.charAt(0).toUpperCase() +
                          quote.status.slice(1)
                        }
                        color={getStatusColor(quote.status) }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell>{quote.margin}%</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                        >
                          View
                        </Button>
                        <Button size="small" variant="outlined" color="secondary">
                          Edit
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
    </Box>
  );
};
