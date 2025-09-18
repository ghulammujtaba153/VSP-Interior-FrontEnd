"use client"

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Chip,
} from "@mui/material";
import {
  LocalShipping,
  CloudUpload,
  CheckCircle,
  WarningAmber,
  Inventory2,
  Description,
  PhotoCamera,
  Save,
} from "@mui/icons-material";

import { mockPurchaseOrders, mockDeliveries } from "@/data/mockData";

interface DeliveryItem {
  lineItemId: string;
  description: string;
  orderedQty: number;
  deliveredQty: number;
  condition: "Good" | "Damaged" | "Missing";
  notes: string;
}

const DeliveryGRN = () => {
  const [selectedPO, setSelectedPO] = useState("");
  const [deliveryRef, setDeliveryRef] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);

  // Initialize delivery items when PO is selected
  const handlePOSelect = (poId: string) => {
    setSelectedPO(poId);
    const po = mockPurchaseOrders.find((p) => p.id === poId);
    if (po) {
      const items = po.items.map((item) => ({
        lineItemId: item.id,
        description: item.description,
        orderedQty: item.quantity,
        deliveredQty: 0,
        condition: "Good" as const,
        notes: "",
      }));
      setDeliveryItems(items);
    }
  };

  const updateDeliveryItem = (
    lineItemId: string,
    field: keyof DeliveryItem,
    value: any
  ) => {
    setDeliveryItems((items) =>
      items.map((item) =>
        item.lineItemId === lineItemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveDelivery = () => {
    alert(`Goods Received Note created for ${selectedPO}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getDeliveryStatus = (ordered: number, delivered: number) => {
    if (delivered === 0) return "Pending";
    if (delivered < ordered) return "Partial";
    return "Complete";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Delivery & Goods Received Note
          </Typography>
          <Typography color="text.secondary">
            Record deliveries and update inventory levels
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveDelivery}
          disabled={!selectedPO}
        >
          Save GRN
        </Button>
      </Box>

      {/* PO Selection */}
      <Card>
        <CardHeader title="Select Purchase Order" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel>Purchase Order</InputLabel>
                <Select
                  value={selectedPO}
                  onChange={(e) => handlePOSelect(e.target.value)}
                  label="Purchase Order"
                >
                  {mockPurchaseOrders
                    .filter(
                      (po) => po.status === "Approved" || po.status === "Delivered"
                    )
                    .map((po) => (
                      <MenuItem key={po.id} value={po.id}>
                        {po.id} - {po.supplierName} ({formatCurrency(po.totalValue)})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Delivery Date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Supplier Reference"
                placeholder="Delivery note reference"
                value={deliveryRef}
                onChange={(e) => setDeliveryRef(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Delivery Items */}
      {selectedPO && deliveryItems.length > 0 && (
        <Card>
          <CardHeader title="Delivery Items" />
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Ordered Qty</TableCell>
                  <TableCell>Delivered Qty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryItems.map((item) => (
                  <TableRow key={item.lineItemId}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.orderedQty}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.deliveredQty || ""}
                        onChange={(e) =>
                          updateDeliveryItem(
                            item.lineItemId,
                            "deliveredQty",
                            Number(e.target.value)
                          )
                        }
                        inputProps={{ min: 0, max: item.orderedQty }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getDeliveryStatus(
                          item.orderedQty,
                          item.deliveredQty
                        )}
                        color={
                          getDeliveryStatus(
                            item.orderedQty,
                            item.deliveredQty
                          ) === "Complete"
                            ? "success"
                            : getDeliveryStatus(
                                item.orderedQty,
                                item.deliveredQty
                              ) === "Partial"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.condition}
                        size="small"
                        onChange={(e) =>
                          updateDeliveryItem(
                            item.lineItemId,
                            "condition",
                            e.target.value as DeliveryItem["condition"]
                          )
                        }
                        sx={{ width: 120 }}
                      >
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Damaged">Damaged</MenuItem>
                        <MenuItem value="Missing">Missing</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        placeholder="Add notes..."
                        size="small"
                        value={item.notes}
                        onChange={(e) =>
                          updateDeliveryItem(
                            item.lineItemId,
                            "notes",
                            e.target.value
                          )
                        }
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upload Delivery Documents */}
      <Card>
        <CardHeader title="Delivery Documentation" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                }}
              >
                <CloudUpload fontSize="large" color="action" />
                <Typography color="text.secondary" mt={1} mb={2}>
                  Upload Delivery Dockets
                </Typography>
                <Button variant="outlined" startIcon={<CloudUpload />}>
                  Choose Files
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                }}
              >
                <PhotoCamera fontSize="large" color="action" />
                <Typography color="text.secondary" mt={1} mb={2}>
                  Photo Documentation
                </Typography>
                <Button variant="outlined" startIcon={<PhotoCamera />}>
                  Take Photos
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader title="Recent Deliveries" />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {mockDeliveries.map((delivery) => (
              <Box
                key={delivery.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography fontWeight="bold">{delivery.poId}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivered on{" "}
                      {new Date(delivery.deliveryDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip label={delivery.status} color="success" size="small" />
                  <Button variant="outlined" size="small" startIcon={<Description />}>
                    View GRN
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Inventory Impact */}
      {selectedPO && (
        <Card>
          <CardHeader title="Inventory Impact" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{ p: 2, bgcolor: "success.light", borderRadius: 2 }}
                >
                  <Typography fontWeight="bold" display="flex" alignItems="center" gap={1}>
                    <CheckCircle fontSize="small" /> Stock Increases
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items will be added to inventory upon confirmation
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: "warning.light", borderRadius: 2 }}>
                  <Typography fontWeight="bold" display="flex" alignItems="center" gap={1}>
                    <WarningAmber fontSize="small" /> Shortages Flagged
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Partial deliveries will be flagged for follow-up
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 2 }}>
                  <Typography fontWeight="bold" display="flex" alignItems="center" gap={1}>
                    <Description fontSize="small" /> Cost Updates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inventory values will be updated automatically
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DeliveryGRN;
