import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  MonetizationOn as MonetizationOnIcon,
  Person as PersonIcon,
  Attachment as AttachmentIcon,
} from "@mui/icons-material";
import { mockPurchaseOrders } from "@/data/mockData"; // same data source

const PODetails = () => {
  const po = mockPurchaseOrders[0];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);

  const handleAction = (action: string) => {
    alert(`Action "${action}" performed on PO ${po.id}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Purchase Order Details
          </Typography>
          <Typography color="text.secondary">
            Complete information for PO {po.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleAction("Edit")}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAction("Approve")}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => handleAction("Send to Supplier")}
          >
            Send to Supplier
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleAction("Cancel")}
          >
            Cancel PO
          </Button>
        </Box>
      </Box>

      {/* PO Information */}
      <Card>
        <CardHeader
          title={
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">PO Information</Typography>
              <Chip
                label={po.status}
                color={
                  po.status === "Approved"
                    ? "success"
                    : po.status === "Pending"
                    ? "warning"
                    : "default"
                }
              />
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <DescriptionIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    PO Number
                  </Typography>
                  <Typography fontWeight="bold">{po.id}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <BusinessIcon color="info" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Supplier
                  </Typography>
                  <Typography fontWeight="bold">{po.supplierName}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <CalendarTodayIcon color="success" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography fontWeight="bold">
                    {new Date(po.orderDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <AccessTimeIcon color="warning" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Expected Delivery
                  </Typography>
                  <Typography fontWeight="bold">
                    {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Job Allocation
              </Typography>
              <Typography fontWeight="bold">{po.jobAllocation}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography fontWeight="bold" variant="h6" color="primary">
                {formatCurrency(po.totalValue)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader title="Line Items" />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {po.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Chip label={item.category} variant="outlined" />
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status || "Pending"}
                      color={
                        item.status === "Approved"
                          ? "success"
                          : item.status === "Pending"
                          ? "warning"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Box sx={{ width: 300 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(po.totalValue * 0.909)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>GST (10%):</Typography>
                <Typography>{formatCurrency(po.totalValue * 0.091)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}
              >
                <Typography>Total:</Typography>
                <Typography>{formatCurrency(po.totalValue)}</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader title="Activity Log" />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {po.activityLog?.map((entry) => (
              <Paper
                key={entry.id}
                sx={{ p: 2, display: "flex", gap: 2, alignItems: "flex-start" }}
              >
                <PersonIcon color="primary" />
                <Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography fontWeight="bold">{entry.user}</Typography>
                    <Chip label={entry.action} size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(entry.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {entry.details}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader title="Attachments" />
        <CardContent>
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 5,
              textAlign: "center",
            }}
          >
            <AttachmentIcon sx={{ fontSize: 40, color: "text.secondary", mb: 2 }} />
            <Typography color="text.secondary">
              No attachments for this purchase order
            </Typography>
            <Button variant="outlined" startIcon={<AttachmentIcon />} sx={{ mt: 2 }}>
              Add Attachment
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PODetails;
