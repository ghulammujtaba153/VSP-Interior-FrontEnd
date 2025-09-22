"use client";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  Grid,
  Divider,
  Paper,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CreditCardIcon from "@mui/icons-material/CreditCard";

const InvoicesPayments = () => {
  const invoices = [
    {
      id: "INV-2024-156",
      client: "ABC Corporation",
      amount: "$45,000",
      status: "paid",
      dueDate: "2024-01-15",
      paidDate: "2024-01-14",
    },
    {
      id: "INV-2024-157",
      client: "XYZ Development",
      amount: "$67,500",
      status: "overdue",
      dueDate: "2024-01-10",
      paidDate: null,
    },
    {
      id: "INV-2024-158",
      client: "Modern Builders Ltd",
      amount: "$32,750",
      status: "outstanding",
      dueDate: "2024-01-25",
      paidDate: null,
    },
    {
      id: "INV-2024-159",
      client: "Green Construction",
      amount: "$89,200",
      status: "sent",
      dueDate: "2024-02-05",
      paidDate: null,
    },
  ];

  const getStatusChip = (status) => {
    const colorMap = {
      paid: "success",
      overdue: "error",
      outstanding: "warning",
      sent: "primary",
      draft: "default",
    };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colorMap[status] || "default"}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" color="primary" fontWeight={600}>
            Invoices & Payments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track invoices, payments, and outstanding amounts
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<SendIcon />}>
            Send Reminders
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            New Invoice
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { title: "Total Outstanding", value: "$394,827", sub: "15 invoices", color: "warning.main" },
          { title: "Overdue Amount", value: "$67,543", sub: "3 invoices", color: "error.main" },
          { title: "Paid This Month", value: "$234,500", sub: "12 payments", color: "success.main" },
          { title: "Average Days to Pay", value: "28", sub: "days", color: "text.primary" },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: card.color }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search invoices..."
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
            <Button variant="outlined" startIcon={<FilterAltIcon />}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title={<Typography color="primary">Invoice Management</Typography>} />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Paid Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{invoice.paidDate || "-"}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <SendIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <CreditCardIcon fontSize="small" />
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

      {/* Payment History */}
      <Card>
        <CardHeader title={<Typography color="primary">Recent Payments Received</Typography>} />
        <CardContent>
          {[
            {
              client: "ABC Corporation",
              invoice: "INV-2024-156",
              method: "Bank Transfer",
              amount: "+$45,000",
              date: "Jan 14, 2024",
            },
            {
              client: "Green Construction",
              invoice: "INV-2024-145",
              method: "Check",
              amount: "+$78,500",
              date: "Jan 12, 2024",
            },
          ].map((payment, i) => (
            <Box
              key={i}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
              mb={2}
              borderRadius={2}
              sx={{ bgcolor: "action.hover" }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width={40}
                  height={40}
                  borderRadius="50%"
                  sx={{ bgcolor: "success.light" }}
                >
                  <CreditCardIcon fontSize="small" sx={{ color: "success.contrastText" }} />
                </Box>
                <Box>
                  <Typography fontWeight={500}>{payment.client}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {payment.invoice} • {payment.method}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography color="success.main" fontWeight="bold">
                  {payment.amount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {payment.date}
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoicesPayments;
