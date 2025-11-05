"use client"

import { useState, useEffect } from "react";
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
  TablePagination,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
  Attachment,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loader from "../loader/Loader";

const Dashboard = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(supplierFilter !== "all" && { supplierId: supplierFilter }),
      });

      const res = await axios.get(`${BASE_URL}/api/purchases/get?${params}`);
      setPurchaseOrders(res.data.data || []);
      // Use pagination info from API response
      setTotalCount(res.data.pagination?.totalItems || res.data.total || 0);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/suppliers/get?page=1&limit=10000`);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [page, limit, searchTerm, statusFilter, supplierFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      draft: "warning",
      submit: "info",
      submitted: "info",
      approved: "success",
      rejected: "error",
      pending: "warning",
      delivered: "success",
      delayed: "error",
    };
    return statusColors[status?.toLowerCase()] || "default";
  };

  const handleView = (id) => {
    router.push(`/purchasing/view/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/purchasing/form?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase order?")) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/api/purchases/delete/${id}`);
      toast.success("Purchase order deleted successfully");
      fetchPurchaseOrders();
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error("Failed to delete purchase order");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      toast.loading("Updating status...");
      await axios.put(`${BASE_URL}/api/purchases/update/${orderId}`, {
        status: newStatus,
      });
      toast.dismiss();
      toast.success("Status updated successfully");
      fetchPurchaseOrders();
    } catch (error) {
      toast.dismiss();
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleCreatePO = () => {
    router.push("/purchasing/form");
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate summary stats
  const totalPOs = totalCount;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
  const pendingCount = purchaseOrders.filter(
    (po) => po.status === "submit" || po.status === "submitted" || po.status === "pending"
  ).length;
  const deliveredCount = purchaseOrders.filter((po) => po.status === "delivered").length;

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
        <Button variant="contained" startIcon={<Add />} onClick={handleCreatePO}>
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
                  <MenuItem value="submit">Submit</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="delayed">Delayed</MenuItem>
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
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Export */}
            {/* <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" startIcon={<Download />}>
                Export
              </Button>
            </Grid> */}
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader title={`Purchase Orders (${totalCount})`} />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Loader/>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>PO ID</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Job/Stock</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell>Expected Delivery</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Attachments</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No purchase orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {order.suppliers?.name || "N/A"}
                              </Typography>
                              {order.suppliers?.email && (
                                <Typography variant="caption" color="text.secondary">
                                  {order.suppliers.email}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {order.project?.projectName || (
                              <Chip label="General Stock" size="small" color="default" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || "N/A"}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {order.lineItems?.length || 0} item(s)
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{formatDate(order.expectedDelivery)}</TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {order.attachments && order.attachments.length > 0 ? (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Attachment fontSize="small" color="action" />
                                <Typography variant="caption">
                                  {order.attachments.length}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                None
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
                              {/* Status Dropdown */}
                              <Select
                                value={order.status || "submit"}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                size="small"
                                sx={{ 
                                  minWidth: 120,
                                  height: 32,
                                  fontSize: '0.875rem',
                                  '& .MuiSelect-select': {
                                    py: 0.5
                                  }
                                }}
                              >
                                <MenuItem value="submit">Submit</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="delivered">Delivered</MenuItem>
                                <MenuItem value="delayed">Delayed</MenuItem>
                              </Select>
                              
                              {/* Action Buttons */}
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleView(order.id)}
                                title="View"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleEdit(order.id)}
                                title="Edit"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(order.id)}
                                title="Delete"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={limit}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Rows per page:"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total POs</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalPOs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Value</Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Pending Approval</Typography>
              <Typography variant="h5" fontWeight="bold">
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Delivered</Typography>
              <Typography variant="h5" fontWeight="bold">
                {deliveredCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
