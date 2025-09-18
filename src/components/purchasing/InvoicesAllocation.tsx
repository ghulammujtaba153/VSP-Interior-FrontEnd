import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
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
  Paper,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";

// MUI Icons
import UploadIcon from "@mui/icons-material/Upload";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LinkIcon from "@mui/icons-material/Link";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";

// Mock data
import { mockInvoices, mockPurchaseOrders, mockJobs } from "@/data/mockData";

const InvoicesAllocation = () => {
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [matchingPO, setMatchingPO] = useState("");
  const [allocationType, setAllocationType] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  const showToast = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setToast({ open: true, message, severity });
  };

  const handleMatchInvoice = () => {
    showToast("Invoice has been successfully matched to purchase order", "success");
  };

  const handleAllocateCosts = () => {
    showToast(
      `Costs have been allocated to ${allocationType === "job" ? "job" : "general stock"}`,
      "success"
    );
  };

  const getDiscrepancyColor = (invoice: any) => {
    const po = mockPurchaseOrders.find((p) => p.id === invoice.poId);
    if (!po) return "text.secondary";

    const difference = Math.abs(invoice.totalAmount - po.totalValue);
    if (difference > 50) return "error.main";
    if (difference > 0) return "warning.main";
    return "success.main";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight="600">
            Invoices & Cost Allocation
          </Typography>
          <Typography color="text.secondary">
            Match invoices to POs and allocate costs to jobs
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Upload Invoice
          </Button>
          <Button variant="contained" startIcon={<LinkIcon />}>
            Match Invoice
          </Button>
        </Box>
      </Box>

      {/* Upload Invoice */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <UploadIcon />
              <Typography variant="h6">Upload Supplier Invoice</Typography>
            </Box>
          }
        />
        <CardContent>
          <Box
            border="2px dashed"
            borderColor="divider"
            borderRadius={2}
            p={4}
            textAlign="center"
          >
            <ReceiptIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography color="text.secondary" mb={2}>
              Upload PDF or scanned copy of supplier invoice
            </Typography>
            <Button variant="outlined" startIcon={<UploadIcon />}>
              Choose Invoice File
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Invoice Matching */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <LinkIcon />
              <Typography variant="h6">Match Invoice to Purchase Order</Typography>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel id="invoice-select-label">Select Invoice</InputLabel>
                <Select
                  labelId="invoice-select-label"
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                >
                  {mockInvoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.supplierName} (
                      {formatCurrency(invoice.totalAmount)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel id="po-select-label">Match to Purchase Order</InputLabel>
                <Select
                  labelId="po-select-label"
                  value={matchingPO}
                  onChange={(e) => setMatchingPO(e.target.value)}
                >
                  {mockPurchaseOrders.map((po) => (
                    <MenuItem key={po.id} value={po.id}>
                      {po.id} - {po.supplierName} ({formatCurrency(po.totalValue)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            disabled={!selectedInvoice || !matchingPO}
            onClick={handleMatchInvoice}
          >
            Match Invoice to PO
          </Button>
        </CardContent>
      </Card>

      {/* Cost Allocation */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon />
              <Typography variant="h6">Cost Allocation</Typography>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel id="allocation-type-label">Allocation Type</InputLabel>
                <Select
                  labelId="allocation-type-label"
                  value={allocationType}
                  onChange={(e) => setAllocationType(e.target.value)}
                >
                  <MenuItem value="job">Job-specific</MenuItem>
                  <MenuItem value="stock">General Stock (Overheads)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {allocationType === "job" && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ minWidth: 220 }} >
                  <InputLabel id="job-select-label">Select Job</InputLabel>
                  <Select
                    labelId="job-select-label"
                    fullWidth sx={{ minWidth: 220 }}
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                  >
                    {mockJobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.name} - {job.client}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
          <Button
            variant="contained"
            startIcon={<AttachMoneyIcon />}
            disabled={!allocationType}
            onClick={handleAllocateCosts}
          >
            Allocate Costs
          </Button>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader title="Invoice Management" />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>PO Reference</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>PO Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockInvoices.map((invoice) => {
                  const po = mockPurchaseOrders.find((p) => p.id === invoice.poId);
                  const difference = po ? invoice.totalAmount - po.totalValue : 0;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.supplierName}</TableCell>
                      <TableCell>{invoice.poId}</TableCell>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell sx={{ color: getDiscrepancyColor(invoice) }}>
                        {po ? formatCurrency(po.totalValue) : "N/A"}
                        {difference !== 0 && (
                          <Typography variant="caption" display="block">
                            {difference > 0 ? "+" : ""}
                            {formatCurrency(difference)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={invoice.status} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          <VisibilityIcon fontSize="small" />
                        </Button>
                        {invoice.discrepancies && invoice.discrepancies.length > 0 && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <WarningAmberIcon color="warning" fontSize="small" />
                            <Typography variant="caption" color="warning.main">
                              {invoice.discrepancies.length} issue(s)
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Discrepancies */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <WarningAmberIcon />
              <Typography variant="h6">Invoice Discrepancies</Typography>
            </Box>
          }
        />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {mockInvoices
              .filter((inv) => inv.discrepancies && inv.discrepancies.length > 0)
              .map((invoice) => (
                <Box key={invoice.id} p={2} border="1px solid" borderColor="warning.main" borderRadius={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box>
                      <Typography fontWeight="600">{invoice.invoiceNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.supplierName}
                      </Typography>
                    </Box>
                    <Chip label={invoice.status} color="primary" size="small" />
                  </Box>
                  {invoice.discrepancies.map((discrepancy, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                      <WarningAmberIcon color="warning" fontSize="small" />
                      <Typography variant="body2">{discrepancy}</Typography>
                    </Box>
                  ))}
                  <Box mt={1} display="flex" gap={1}>
                    <Button size="small" variant="outlined">
                      Resolve
                    </Button>
                    <Button size="small" variant="outlined">
                      Contact Supplier
                    </Button>
                  </Box>
                </Box>
              ))}
          </Box>
        </CardContent>
      </Card>

      {/* Accounts Payables Integration */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon />
              <Typography variant="h6">Accounts Payables Integration</Typography>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box p={2} borderRadius={2} bgcolor="success.light" color="success.dark">
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircleIcon />
                  <Typography fontWeight="600">Auto Sync</Typography>
                </Box>
                <Typography variant="body2">
                  Matched invoices automatically sync with AP module
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box p={2} borderRadius={2} bgcolor="info.light" color="info.dark">
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <DescriptionIcon />
                  <Typography fontWeight="600">Payment Terms</Typography>
                </Box>
                <Typography variant="body2">
                  Due dates and payment schedules are automatically tracked
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box p={2} borderRadius={2} bgcolor="warning.light" color="warning.dark">
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <WarningAmberIcon />
                  <Typography fontWeight="600">Approval Required</Typography>
                </Box>
                <Typography variant="body2">
                  Disputed invoices require approval before payment
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Snackbar for Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity as any}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesAllocation;
