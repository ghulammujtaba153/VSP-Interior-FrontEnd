"use client"

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

import UploadIcon from "@mui/icons-material/Upload";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";

const SupplierInvoices = () => {
  const supplierInvoices = [
    {
      id: "SUP-2024-078",
      supplier: "Steel Works Ltd",
      amount: "$23,450",
      status: "approved",
      receivedDate: "2024-01-18",
      dueDate: "2024-02-17",
      poNumber: "PO-2024-045",
    },
    {
      id: "SUP-2024-079",
      supplier: "Concrete Solutions",
      amount: "$45,600",
      status: "pending",
      receivedDate: "2024-01-20",
      dueDate: "2024-02-19",
      poNumber: "PO-2024-046",
    },
    {
      id: "SUP-2024-080",
      supplier: "Electrical Services Co",
      amount: "$15,200",
      status: "review",
      receivedDate: "2024-01-22",
      dueDate: "2024-02-21",
      poNumber: null,
    },
    {
      id: "SUP-2024-081",
      supplier: "Plumbing Masters",
      amount: "$8,750",
      status: "rejected",
      receivedDate: "2024-01-19",
      dueDate: "2024-02-18",
      poNumber: "PO-2024-047",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "review":
        return "info";
      case "rejected":
        return "error";
      case "paid":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Box p={4} bgcolor="background.default" minHeight="100vh">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" color="primary">
            Supplier Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload, approve, and manage supplier invoices
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<LinkIcon />}>
            Link to PO
          </Button>
          <Button variant="contained" startIcon={<UploadIcon />}>
            Upload Invoice
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2">Pending Approval</Typography>} />
            <CardContent>
              <Typography variant="h6" color="warning.main">
                $61,550
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3 invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2">Approved to Pay</Typography>} />
            <CardContent>
              <Typography variant="h6" color="success.main">
                $128,340
              </Typography>
              <Typography variant="caption" color="text.secondary">
                8 invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2">Paid This Month</Typography>} />
            <CardContent>
              <Typography variant="h6">$89,750</Typography>
              <Typography variant="caption" color="text.secondary">
                15 payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title={<Typography variant="body2">Active Suppliers</Typography>} />
            <CardContent>
              <Typography variant="h6">34</Typography>
              <Typography variant="caption" color="text.secondary">
                suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filter */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search supplier invoices..."
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
              }}
            />
            <Button variant="outlined" startIcon={<FilterAltIcon />}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Supplier Invoices Table */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Invoice Approval Workflow" />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplierInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.supplier}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.poNumber ? (
                        <Typography color="primary">{invoice.poNumber}</Typography>
                      ) : (
                        <Typography color="text.secondary">No PO</Typography>
                      )}
                    </TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {invoice.status === "pending" && (
                          <>
                            <IconButton size="small" color="success">
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
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

export default SupplierInvoices;
