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
      { name: "hourlyRate", label: "Freight Rate per M3", placeholder: "Enter freight rate per M3" },
      { name: "cost", label: "Freight Cost", placeholder: "Enter freight cost" },
      { name: "sell", label: "Freight Sell Price", placeholder: "Enter freight sell price" },
    ],
  },
  {
    type: "ShopDrawing",
    label: "Shop Drawing",
    fields: [
      { name: "hourlyRate", label: "Shop Drawing Hourly Rate", placeholder: "Enter shop drawing hourly rate" },
      { name: "cost", label: "Shop Drawing Cost", placeholder: "Enter shop drawing cost" },
      { name: "sell", label: "Shop Drawing Sell Price", placeholder: "Enter shop drawing sell price" },
    ],
  },
  {
    type: "Machining",
    label: "Machining",
    fields: [
      { name: "hourlyRate", label: "Machining Hourly Rate", placeholder: "Enter machining hourly rate" },
      { name: "cost", label: "Machining Cost", placeholder: "Enter machining cost" },
      { name: "sell", label: "Machining Sell Price", placeholder: "Enter machining sell price" },
    ],
  },
  {
    type: "Assembly",
    label: "Assembly",
    fields: [
      { name: "hourlyRate", label: "Assembly Hourly Rate", placeholder: "Enter assembly hourly rate" },
      { name: "cost", label: "Assembly Cost", placeholder: "Enter assembly cost" },
      { name: "sell", label: "Assembly Sell Price", placeholder: "Enter assembly sell price" },
    ],
  },
  {
    type: "Installation",
    label: "Installation",
    fields: [
      { name: "hourlyRate", label: "Installation Hourly Rate", placeholder: "Enter installation hourly rate" },
      { name: "cost", label: "Installation Cost", placeholder: "Enter installation cost" },
      { name: "sell", label: "Installation Sell Price", placeholder: "Enter installation sell price" },
    ],
  },
];

const CreateProjectStep2 = ({ records, setRecords }) => {
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (type, field, value) => {
    if (user.Role.name != "Superadmin") {
      setDialogOpen(true);
      return;
    }

    const updatedRecords = [...records];
    const existingIndex = updatedRecords.findIndex((record) => record.type === type);

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        [field]: value === "" ? 0 : parseFloat(value) || 0,
      };
    } else {
      updatedRecords.push({
        type,
        [field]: value === "" ? 0 : parseFloat(value) || 0,
        cost: 0,
        sell: 0,
      });
    }

    setRecords(updatedRecords);
  };

  const getRecordValue = (type, field) => {
    const record = records.find((record) => record.type === type);
    return record ? record[field] ?? 0 : 0;
  };

  const renderField = (type, fieldConfig, fieldIndex) => (
    <Grid item xs={12} key={`${type}-${fieldConfig.name}-${fieldIndex}`}>
      <TextField
        fullWidth
        type="number"
        label={fieldConfig.label}
        placeholder={fieldConfig.placeholder}
        value={getRecordValue(type, fieldConfig.name)}
        onChange={(e) => handleChange(type, fieldConfig.name, e.target.value)}
        inputProps={{ min: 0, step: "0.01" }}
        size="small"
        variant="outlined"
      />
    </Grid>
  );

  const renderSection = (rateType) => (
    <Card key={rateType.type} variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {rateType.label}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {rateType.fields.map((field, fieldIndex) =>
            renderField(rateType.type, field, fieldIndex)
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Project Rates Setup
      </Typography>
      <Grid container spacing={3}>
        {rateTypes.map((rateType) => (
          <Grid item xs={12} md={6} key={rateType.type}>
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
