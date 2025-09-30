"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Grid,
} from "@mui/material";

const CreateProjectStep4 = ({ allData }) => {
  const { step1, step2, step3 } = allData || {};

  // Ensure step2 is an array
  const ratesArray = Array.isArray(step2) ? step2 : [];

  // Calculate totals from step3 materials
  const materialTotalCost = Array.isArray(step3)
    ? step3.reduce((total, material) => {
        return total + (parseFloat(material.materialCost) || 0);
      }, 0)
    : 0;

  // Helper to get rate values
  const getRateValue = (type, field) => {
    const rate = ratesArray.find((rate) => rate.type === type);
    return rate ? rate[field] || 0 : 0;
  };

  // Calculate values for different rate types
  const freightCost = getRateValue("Freight", "hourlyRate") || 0;
  const shopDrawingCost = getRateValue("ShopDrawing", "hourlyRate") || 0;
  const machiningCost = getRateValue("Machining", "hourlyRate") || 0;
  const assemblyCost = getRateValue("Assembly", "hourlyRate") || 0;
  const installationCost = getRateValue("Installation", "hourlyRate") || 0;

  // Totals
  const totalHours = 0;
  const laborCost =
    shopDrawingCost + machiningCost + assemblyCost + installationCost;
  const totalCost = materialTotalCost + freightCost + laborCost;

  // Markups
  const materialMarkup = getRateValue("Material", "markup") || 0;
  const materialSell = materialTotalCost * (1 + materialMarkup / 100);
  const totalSell = materialSell + freightCost + laborCost;

  // Margin
  const marginAmount = totalSell - totalCost;
  const marginPercentage = totalCost > 0 ? (marginAmount / totalCost) * 100 : 0;

  // GST
  const gst = totalSell * 0.15;
  const totalWithGST = totalSell + gst;

  const rows = [
    { label: "FREIGHT M3", value: `$${freightCost.toFixed(2)}` },
    { label: "SHOP DRAWINGS", value: `$${shopDrawingCost.toFixed(2)}` },
    { label: "MACHINING", value: `$${machiningCost.toFixed(2)}` },
    { label: "ASSEMBLY", value: `$${assemblyCost.toFixed(2)}` },
    { label: "INSTALLATION", value: `$${installationCost.toFixed(2)}` },
    {
      label: "TOTAL HOURS",
      value: `${totalHours} | $${laborCost.toFixed(2)}`,
    },
    {
      label: "MATERIAL TOTAL COST",
      value: `$${materialTotalCost.toFixed(2)}`,
    },
    { label: "BUY IN ITEMS", value: "-" },
    {
      label: "MARGIN TOTAL",
      value: `${marginPercentage.toFixed(2)}% | $${marginAmount.toFixed(2)}`,
    },
    { label: "TOTAL COST", value: `$${totalCost.toFixed(2)}` },
    { label: "SELL TOTAL", value: `$${totalSell.toFixed(2)}` },
    { label: "GST 15%", value: `$${gst.toFixed(2)}` },
    { label: "TOTAL (SELL + GST)", value: `$${totalWithGST.toFixed(2)}` },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Project Overview
      </Typography>

      {/* Cost Table */}
      <Card variant="outlined">
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                <TableCell>
                  <Typography variant="subtitle2">HOURS / LM / M3</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">COST</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Typography fontWeight="500">{row.label}</Typography>
                  </TableCell>
                  <TableCell>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Project Details */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Project Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Project Name:</strong> {step1?.projectName || "N/A"}
              </Typography>
              <Typography>
                <strong>Site Location:</strong> {step1?.siteLocation || "N/A"}
              </Typography>
              <Typography>
                <strong>Access Notes:</strong> {step1?.accessNotes || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>QS Name:</strong> {step1?.qsName || "N/A"}
              </Typography>
              <Typography>
                <strong>QS Phone:</strong> {step1?.qsPhone || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      
    </Box>
  );
};

export default CreateProjectStep4;
