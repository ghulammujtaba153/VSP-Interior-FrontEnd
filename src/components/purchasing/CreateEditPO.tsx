"use client";


import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
} from "@mui/material";
import { Add, Delete, Save, Send, Upload } from "@mui/icons-material";

// Mock data
const mockSuppliers = [
  { id: "s1", name: "Supplier A", contactPerson: "John" },
  { id: "s2", name: "Supplier B", contactPerson: "Jane" },
];
const mockJobs = [
  { id: "j1", name: "Job 1", client: "Client A" },
  { id: "j2", name: "Job 2", client: "Client B" },
];



const CreateEditPO = () => {
  const [formData, setFormData] = useState({
    jobId: "",
    supplierId: "",
    expectedDelivery: "",
    notes: "",
  });

  const [lineItems, setLineItems] = ([
    {
      id: "1",
      itemId: "",
      description: "",
      category: "",
      quantity: 0,
      unit: "",
      unitPrice: 0,
      subtotal: 0,
    },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        itemId: "",
        description: "",
        category: "",
        quantity: 0,
        unit: "",
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.subtotal =
              Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () =>
    lineItems.reduce((total, item) => total + item.subtotal, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);

  const handleSave = (action: "draft" | "submit" | "send") => {
    alert(
      `Purchase Order ${
        action === "draft"
          ? "saved as draft"
          : action === "submit"
          ? "submitted for approval"
          : "sent to supplier"
      }`
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="600">
            Create Purchase Order
          </Typography>
          <Typography color="text.secondary">
            Fill in the details to create a new purchase order
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={() => handleSave("draft")}
          >
            Save Draft
          </Button>
          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => handleSave("submit")}
          >
            Submit for Approval
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => handleSave("send")}
          >
            Send to Supplier
          </Button>
        </Box>
      </Box>

      {/* Job & Supplier */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="1. Job Selection" />
            <CardContent>
              <TextField
                select
                label="Assign to Job"
                value={formData.jobId}
                onChange={(e) =>
                  setFormData({ ...formData, jobId: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="general">General Stock</MenuItem>
                {mockJobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.name} - {job.client}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="2. Supplier Selection" />
            <CardContent>
              <TextField
                select
                label="Choose Supplier"
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({ ...formData, supplierId: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              >
                {mockSuppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} - {s.contactPerson}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Expected Delivery"
                InputLabelProps={{ shrink: true }}
                value={formData.expectedDelivery}
                onChange={(e) =>
                  setFormData({ ...formData, expectedDelivery: e.target.value })
                }
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Line Items */}
      <Card sx={{ mt: 3 }}>
        <CardHeader
          title="3. Add Items"
          action={
            <Button startIcon={<Add />} onClick={addLineItem}>
              Add Item
            </Button>
          }
        />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                      value={item.itemId}
                      onChange={(e) =>
                        updateLineItem(item.id, "itemId", e.target.value)
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      value={item.category}
                      onChange={(e) =>
                        updateLineItem(item.id, "category", e.target.value)
                      }
                      size="small"
                    >
                      <MenuItem value="timber">Timber</MenuItem>
                      <MenuItem value="hardware">Hardware</MenuItem>
                      <MenuItem value="finishes">Finishes</MenuItem>
                      <MenuItem value="adhesives">Adhesives</MenuItem>
                      <MenuItem value="tools">Tools</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, "quantity", e.target.value)
                      }
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={item.unit}
                      onChange={(e) =>
                        updateLineItem(item.id, "unit", e.target.value)
                      }
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(item.id, "unitPrice", e.target.value)
                      }
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Card sx={{ minWidth: 240 }}>
              <CardContent>
                <Typography variant="subtitle1">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrency(calculateTotal())}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>

      {/* Attachments & Notes */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="4. Attachments" />
            <CardContent>
              <Box
                border="2px dashed"
                borderColor="divider"
                p={4}
                textAlign="center"
              >
                <Upload fontSize="large" color="disabled" />
                <Typography color="text.secondary" mt={1} mb={2}>
                  Upload supporting documents, drawings, or specifications
                </Typography>
                <Button variant="outlined" startIcon={<Upload />}>
                  Choose Files
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="5. Notes & Instructions" />
            <CardContent>
              <TextField
                multiline
                rows={6}
                placeholder="Add any special instructions or notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateEditPO;
