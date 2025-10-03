"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
} from "@mui/material";
import { useAuth } from "@/context/authContext";

const rateTypes = [
  {
    type: "Material",
    label: "Material",
    fields: [
      { name: "markup", label: "Material Markup %", placeholder: "Enter material markup %" },
      { name: "cost", label: "Material Cost", placeholder: "Enter material cost" },
      { name: "sell", label: "Material Sell Price", placeholder: "Enter material sell price" },
    ],
  },
  {
    type: "Hardware",
    label: "Hardware",
    fields: [
      { name: "markup", label: "Hardware Markup %", placeholder: "Enter hardware markup %" },
      { name: "cost", label: "Hardware Cost", placeholder: "Enter hardware cost" },
      { name: "sell", label: "Hardware Sell Price", placeholder: "Enter hardware sell price" },
    ],
  },
  {
    type: "BuyIn",
    label: "Buy-in Item",
    fields: [
      { name: "markup", label: "Buy-in Item Markup %", placeholder: "Enter buy-in item markup %" },
      { name: "cost", label: "Buy-in Item Cost", placeholder: "Enter buy-in item cost" },
      { name: "sell", label: "Buy-in Item Sell Price", placeholder: "Enter buy-in item sell price" },
    ],
  },
  {
    type: "Freight",
    label: "Freight",
    fields: [
      { name: "markup", label: "Freight Markup %", placeholder: "Enter freight markup %" },
      { name: "cost", label: "Freight Cost", placeholder: "Enter freight cost" },
      { name: "sell", label: "Freight Sell Price", placeholder: "Enter freight sell price" },
    ],
  },
  {
    type: "ShopDrawing",
    label: "Shop Drawing",
    fields: [
      { name: "markup", label: "Shop Drawing Markup %", placeholder: "Enter shop drawing markup %" },
      { name: "cost", label: "Shop Drawing Cost", placeholder: "Enter shop drawing cost" },
      { name: "sell", label: "Shop Drawing Sell Price", placeholder: "Enter shop drawing sell price" },
    ],
  },
  {
    type: "Machining",
    label: "Machining",
    fields: [
      { name: "markup", label: "Machining Markup %", placeholder: "Enter machining markup %" },
      { name: "cost", label: "Machining Cost", placeholder: "Enter machining cost" },
      { name: "sell", label: "Machining Sell Price", placeholder: "Enter machining sell price" },
    ],
  },
  {
    type: "Assembly",
    label: "Assembly",
    fields: [
      { name: "markup", label: "Assembly Markup %", placeholder: "Enter assembly markup %" },
      { name: "cost", label: "Assembly Cost", placeholder: "Enter assembly cost" },
      { name: "sell", label: "Assembly Sell Price", placeholder: "Enter assembly sell price" },
    ],
  },
  {
    type: "Installation",
    label: "Installation",
    fields: [
      { name: "markup", label: "Installation Markup %", placeholder: "Enter installation markup %" },
      { name: "cost", label: "Installation Cost", placeholder: "Enter installation cost" },
      { name: "sell", label: "Installation Sell Price", placeholder: "Enter installation sell price" },
    ],
  },
];

const CreateProjectStep2 = ({ records, setRecords }) => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Convert inputs to proper values
  const normalizeValue = (val) => {
    if (val === "" || val === null || val === undefined) return null;
    return isNaN(val) ? val : parseFloat(val);
  };

  // Calculate sell price based on cost and markup
  const calculateSellPrice = (cost, markup) => {
    if (!cost && !markup) return null;
    const costValue = parseFloat(cost) || 0;
    const markupValue = parseFloat(markup) || 0;
    const sellPrice = costValue * (1 + markupValue / 100);
    return parseFloat(sellPrice.toFixed(2));
  };

  const handleChange = (type, field, value) => {
    if (user.Role.name !== "Superadmin") {
      setDialogOpen(true);
      return;
    }

    const updatedRecords = [...records];
    const existingIndex = updatedRecords.findIndex((record) => record.type === type);

    let updatedRecord;

    if (existingIndex >= 0) {
      updatedRecord = {
        ...updatedRecords[existingIndex],
        [field]: normalizeValue(value),
      };
    } else {
      updatedRecord = {
        type,
        markup: null,
        cost: null,
        sell: null,
        [field]: normalizeValue(value),
      };
    }

    // Auto-calc sell price for ALL types when cost or markup changes
    if (field === "cost" || field === "markup") {
      const cost = field === "cost" ? normalizeValue(value) : updatedRecord.cost;
      const markup = field === "markup" ? normalizeValue(value) : updatedRecord.markup;
      updatedRecord.sell = calculateSellPrice(cost, markup);
    }

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = updatedRecord;
    } else {
      updatedRecords.push(updatedRecord);
    }

    setRecords(updatedRecords);
  };

  const getRecordValue = (type, field) => {
    const record = records.find((record) => record.type === type);
    return record && record[field] !== null ? record[field] : "";
  };

  const renderSection = (rateType) => (
    <Card key={rateType.type} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {rateType.label}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3} sx={{ minWidth: "200px" }}>
            <Typography fontWeight="medium">{rateType.label}</Typography>
          </Grid>

          {rateType.fields.map((field, fieldIndex) => (
            <Grid item xs={12} sm={3} key={`${rateType.type}-${field.name}-${fieldIndex}`}>
              <TextField
                fullWidth
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                value={getRecordValue(rateType.type, field.name)}
                onChange={(e) => handleChange(rateType.type, field.name, e.target.value)}
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
                size="small"
                variant="outlined"
                disabled={field.name === "sell"}
                sx={{
                  "& .MuiInputBase-input:disabled": {
                    backgroundColor: "action.hover",
                    color: "text.primary",
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }} component={Paper}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Project Rates Setup
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter cost and markup percentages. Sell prices are automatically calculated for all categories.
      </Typography>

      <Grid container spacing={3}>
        {rateTypes.map((rateType) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={rateType.type}>
            {renderSection(rateType)}
          </Grid>
        ))}
      </Grid>

      {/* Restriction Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Permission Denied</DialogTitle>
        <DialogContent>
          <Typography>
            Only <strong>Superadmin</strong> is allowed to update project rates.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateProjectStep2;