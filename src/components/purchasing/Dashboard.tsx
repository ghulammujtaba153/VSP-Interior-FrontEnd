"use client"

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
  LocationOn,
} from "@mui/icons-material";
import { mockPurchaseOrders } from "@/data/mockData";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const filteredOrders = mockPurchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.jobAllocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesSupplier =
      supplierFilter === "all" || order.supplierName === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const handleAction = (action: string, poId: string) => {
    alert(`Action "${action}" performed on PO ${poId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Purchase Orders Dashboard
          </Typography>
          <Typography color="text.secondary">
            Manage all purchase orders across your projects
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Create PO
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FilterList />
              <Typography variant="h6">Filters & Search</Typography>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search POs, suppliers, jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Supplier Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  label="Supplier"
                >
                  <MenuItem value="all">All Suppliers</MenuItem>
                  <MenuItem value="Timber Masters Ltd">
                    Timber Masters Ltd
                  </MenuItem>
                  <MenuItem value="Hardware Solutions">
                    Hardware Solutions
                  </MenuItem>
                  <MenuItem value="Premium Finishes Co">
                    Premium Finishes Co
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Export */}
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" startIcon={<Download />}>
                Export
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader title={`Purchase Orders (${filteredOrders.length})`} />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PO ID</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Job/Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Expected Delivery</TableCell>
                  <TableCell>Total Value</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{order.jobAllocation}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: "bold",
                          display: "inline-block",
                          bgcolor:
                            order.status === "Delivered"
                              ? "success.light"
                              : order.status === "Draft"
                              ? "warning.light"
                              : order.status === "Submitted"
                              ? "info.light"
                              : "grey.300",
                        }}
                      >
                        {order.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalValue)}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleAction("View", order.id)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAction("Edit", order.id)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAction("Track", order.id)}
                        >
                          <LocationOn />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleAction("Delete", order.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total POs</Typography>
              <Typography variant="h5" fontWeight="bold">
                {mockPurchaseOrders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Value</Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(
                  mockPurchaseOrders.reduce((sum, po) => sum + po.totalValue, 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Pending Approval</Typography>
              <Typography variant="h5" fontWeight="bold">
                {
                  mockPurchaseOrders.filter(
                    (po) => po.status === "Draft" || po.status === "Submitted"
                  ).length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Delivered</Typography>
              <Typography variant="h5" fontWeight="bold">
                {
                  mockPurchaseOrders.filter((po) => po.status === "Delivered")
                    .length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
