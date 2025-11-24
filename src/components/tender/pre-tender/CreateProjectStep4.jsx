// "use client";

// import React from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Divider,
//   Grid,
// } from "@mui/material";

// const CreateProjectStep4 = ({ allData }) => {
//   const { step1, step2, step3 } = allData || {};

//   console.log("step2 is here", step2);

//   // Ensure step2 is an array
//   const ratesArray = Array.isArray(step2) ? step2 : [];

//   // Calculate totals from step3 materials
//   const materialTotalCost = Array.isArray(step3)
//     ? step3.reduce((total, material) => {
//         return total + (parseFloat(material.materialCost) || 0);
//       }, 0)
//     : 0;

//   // Helper to get rate values
//   const getRateValue = (type, field) => {
//     const rate = ratesArray.find((rate) => rate.type === type);
//     return rate ? rate[field] || 0 : 0;
//   };

//   // Calculate values for different rate types
//   const materialCost = getRateValue("Material", "sell") || 0;
//   const hardwareCost = getRateValue("Hardware", "sell") || 0;
//   const freightCost = getRateValue("Freight", "sell") || 0;
//   const shopDrawingCost = getRateValue("ShopDrawing", "sell") || 0;
//   const machiningCost = getRateValue("Machining", "sell") || 0;
//   const assemblyCost = getRateValue("Assembly", "sell") || 0;
//   const installationCost = getRateValue("Installation", "sell") || 0;
//   const buyInCost = getRateValue("BuyIn", "sell") || 0;

//   // Totals
//   const totalHours = 0;
//   const laborCost =
//     shopDrawingCost + machiningCost + assemblyCost + installationCost;
//   const totalCost = materialTotalCost + freightCost + laborCost;

//   // Markups
//   const materialMarkup = getRateValue("Material", "markup") || 0;
//   const materialSell = materialTotalCost * (1 + materialMarkup / 100);
//   const totalSell = materialSell + freightCost + laborCost;

//   // Margin
//   const marginAmount = totalSell - totalCost;
//   const marginPercentage = totalCost > 0 ? (marginAmount / totalCost) * 100 : 0;

//   // GST
//   const gst = totalSell * 0.15;
//   const totalWithGST = totalSell + gst;

//   const rows = [
    
//     { label: "FREIGHT M3", value: `$${freightCost.toFixed(2)}` },
//     { label: "SHOP DRAWINGS", value: `$${shopDrawingCost.toFixed(2)}` },
//     { label: "MACHINING", value: `$${machiningCost.toFixed(2)}` },
//     { label: "ASSEMBLY", value: `$${assemblyCost.toFixed(2)}` },
//     { label: "INSTALLATION", value: `$${installationCost.toFixed(2)}` },
//     {
//       label: "MATERIAL TOTAL COST",
//       value: `$${materialTotalCost.toFixed(2)}`,
//     },
//     { label: "BUY IN ITEMS", value: `$${buyInCost.toFixed(2)}` },
//     {
//       label: "MARGIN TOTAL",
//       value: `${marginPercentage.toFixed(2)}% | $${marginAmount.toFixed(2)}`,
//     },
//     { label: "TOTAL COST", value: `$${totalCost.toFixed(2)}` },
//     { label: "SELL TOTAL", value: `$${totalSell.toFixed(2)}` },
//     { label: "GST 15%", value: `$${gst.toFixed(2)}` },
//     { label: "TOTAL (SELL + GST)", value: `$${totalWithGST.toFixed(2)}` },
//   ];

//   return (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         Project Overview
//       </Typography>

//       {/* Cost Table */}
//       <Card variant="outlined">
//         <TableContainer component={Paper}>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
//                 <TableCell>
//                   <Typography variant="subtitle2">HOURS / LM / M3</Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2">COST</Typography>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((row, idx) => (
//                 <TableRow key={idx}>
//                   <TableCell>
//                     <Typography fontWeight="500">{row.label}</Typography>
//                   </TableCell>
//                   <TableCell>{row.value}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Card>

//       {/* Project Details */}
//       <Card variant="outlined" sx={{ mt: 3 }}>
//         <CardContent>
//           <Typography variant="subtitle1" fontWeight="600" gutterBottom>
//             Project Details
//           </Typography>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <Typography>
//                 <strong>Project Name:</strong> {step1?.projectName || "N/A"}
//               </Typography>
//               <Typography>
//                 <strong>Site Location:</strong> {step1?.siteLocation || "N/A"}
//               </Typography>
//               <Typography>
//                 <strong>Access Notes:</strong> {step1?.accessNotes || "N/A"}
//               </Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography>
//                 <strong>QS Name:</strong> {step1?.qsName || "N/A"}
//               </Typography>
//               <Typography>
//                 <strong>QS Phone:</strong> {step1?.qsPhone || "N/A"}
//               </Typography>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

      
//     </Box>
//   );
// };

// export default CreateProjectStep4;


"use client";

import React, { useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";

const CreateProjectStep4 = ({ allData, formData, setFormData }) => {
  const { step1, step2, step3 } = allData || {};
  
  // Initialize labour cost from step1 or use local state
  const [labourCost, setLabourCost] = useState(step1?.labourCost || "");

  // Sync labour cost with step1 when it changes from parent
  useEffect(() => {
    if (step1?.labourCost !== undefined) {
      const step1LabourCost = step1.labourCost || "";
      if (step1LabourCost !== labourCost) {
        setLabourCost(step1LabourCost);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1?.labourCost]);

  // Update parent when labour cost changes
  const handleLabourCostChange = (value) => {
    setLabourCost(value);
    if (setFormData && formData) {
      setFormData({ ...formData, labourCost: value || null });
    }
  };

  console.log("step2 data:", step2);
  console.log("step3 data:", step3);

  // Ensure step2 and step3 are arrays
  const ratesArray = Array.isArray(step2) ? step2 : [];
  const materialsArray = Array.isArray(step3) ? step3 : [];

  // Helper to get rate values
  const getRateValue = (type, field) => {
    const rate = ratesArray.find((rate) => rate.type === type);
    return rate ? (rate[field] !== null && rate[field] !== undefined ? parseFloat(rate[field]) : 0) : 0;
  };

  // Calculate material total cost from step3 (actual cost)
  const materialTotalCost = materialsArray.reduce((total, material) => {
    return total + (parseFloat(material.materialCost) || 0);
  }, 0);

  // Calculate edging cost from step3 (actual cost)
  const edgingTotalCost = materialsArray.reduce((total, material) => {
    return total + (parseFloat(material.edgingCost) || 0);
  }, 0);

  // Get rate values - COST (actual cost from step2)
  const materialCost = getRateValue("Material", "cost");
  const hardwareCost = getRateValue("Hardware", "cost");
  const buyInCost = getRateValue("BuyIn", "cost");
  const freightCost = getRateValue("Freight", "cost");
  const shopDrawingCost = getRateValue("ShopDrawing", "cost");
  const machiningCost = getRateValue("Machining", "cost");
  const assemblyCost = getRateValue("Assembly", "cost");
  const installationCost = getRateValue("Installation", "cost");

  // Get rate values - SELL PRICE (sell price from step2)
  const materialMarkup = getRateValue("Material", "markup");
  const materialSellPrice = getRateValue("Material", "sell");
  const hardwareSellPrice = getRateValue("Hardware", "sell");
  const buyInSellPrice = getRateValue("BuyIn", "sell");
  const freightSellPrice = getRateValue("Freight", "sell");
  const shopDrawingSellPrice = getRateValue("ShopDrawing", "sell");
  const machiningSellPrice = getRateValue("Machining", "sell");
  const assemblySellPrice = getRateValue("Assembly", "sell");
  const installationSellPrice = getRateValue("Installation", "sell");

  // Calculate material sell price (always calculate from material cost + markup from step2)
  // The material sell price should be based on actual material costs from step3, not a fixed rate from step2
  const actualMaterialSell = materialTotalCost * (1 + materialMarkup / 100);

  // Calculate labor costs (sell prices from step2)
  const laborSellPrice = shopDrawingSellPrice + machiningSellPrice + assemblySellPrice + installationSellPrice;
  
  // Calculate labor costs (actual costs from step2)
  const laborCost = shopDrawingCost + machiningCost + assemblyCost + installationCost;

  // Parse labour cost from Step 4 input
  const labourTotalCost = parseFloat(labourCost) || 0;

  // Calculate total COST (all actual costs: material cost + labour cost + edging cost + hardware cost + buy-in cost + freight cost + shop drawing cost + machining cost + assembly cost + installation cost)
  const totalCost = materialTotalCost + labourTotalCost + edgingTotalCost + hardwareCost + buyInCost + freightCost + shopDrawingCost + machiningCost + assemblyCost + installationCost;

  // Calculate total SELL (all sell prices: material sell + labour cost + hardware sell + buy-in sell + freight sell + shop drawing sell + machining sell + assembly sell + installation sell)
  const totalSell = actualMaterialSell + labourTotalCost + hardwareSellPrice + buyInSellPrice + freightSellPrice + shopDrawingSellPrice + machiningSellPrice + assemblySellPrice + installationSellPrice;

  // Calculate margin
  const marginAmount = totalSell - totalCost;
  const marginPercentage = totalCost > 0 ? (marginAmount / totalCost) * 100 : 0;

  // Calculate GST
  const gst = totalSell * 0.15;
  const totalWithGST = totalSell + gst; // This is the totalCost field (SELL + GST)

  // Calculate values and update parent when they change
  useEffect(() => {
    if (setFormData && formData) {
      setFormData({
        ...formData,
        totalCost: totalWithGST, // Total Cost = SELL + GST
        totalSell: totalSell,
        totalProfit: marginAmount, // Profit = MARGIN amount
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWithGST, totalSell, marginAmount]);

  const rows = [
    { label: "MATERIAL SELL PRICE", value: `$${actualMaterialSell.toFixed(2)}` },
    { label: "LABOUR COST", value: `$${labourTotalCost.toFixed(2)}` },
    { label: "HARDWARE SELL PRICE", value: `$${hardwareSellPrice.toFixed(2)}` },
    { label: "BUY IN ITEMS SELL PRICE", value: `$${buyInSellPrice.toFixed(2)}` },
    { label: "FREIGHT SELL PRICE", value: `$${freightSellPrice.toFixed(2)}` },
    { label: "SHOP DRAWINGS SELL PRICE", value: `$${shopDrawingSellPrice.toFixed(2)}` },
    { label: "MACHINING SELL PRICE", value: `$${machiningSellPrice.toFixed(2)}` },
    { label: "ASSEMBLY SELL PRICE", value: `$${assemblySellPrice.toFixed(2)}` },
    { label: "INSTALLATION SELL PRICE", value: `$${installationSellPrice.toFixed(2)}` },
    { label: "TOTAL COST", value: `$${totalCost.toFixed(2)}` },
    { label: "TOTAL SELL", value: `$${totalSell.toFixed(2)}` },
    { 
      label: "MARGIN", 
      value: `${marginPercentage.toFixed(2)}% | $${marginAmount.toFixed(2)}` 
    },
    { label: "GST 15%", value: `$${gst.toFixed(2)}` },
    { label: "TOTAL (SELL + GST)", value: `$${totalWithGST.toFixed(2)}` },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Project Overview
      </Typography>

      {/* Labour Cost Input */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Labour Cost
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Labour Cost ($)"
            placeholder="Enter labour cost"
            value={labourCost}
            onChange={(e) => handleLabourCostChange(e.target.value)}
            inputProps={{
              min: 0,
              step: "0.01",
            }}
            size="medium"
            variant="outlined"
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      {/* Cost Summary Table */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Cost Summary
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      ITEM
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      AMOUNT
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => {
                  // Highlight last 5 rows (TOTAL COST, TOTAL SELL, MARGIN, GST 15%, TOTAL (SELL + GST))
                  const isSummaryRow = idx >= rows.length - 5;
                  return (
                    <TableRow 
                      key={idx}
                      sx={{ 
                        backgroundColor: isSummaryRow ? '#f0f8ff' : 'inherit',
                        '&:last-child td, &:last-child th': { border: 0 } 
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={isSummaryRow ? "600" : "500"}>
                          {row.label}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={isSummaryRow ? "600" : "500"}>
                          {row.value}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card variant="outlined" sx={{ mb: 3 }}>
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
              <Typography>
                <strong>Client:</strong> {step1?.clientId || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Materials Summary */}
      {materialsArray.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Materials Summary ({materialsArray.length} items)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                    <TableCell><strong>Material</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Measure</strong></TableCell>
                    <TableCell><strong>Material Cost</strong></TableCell>
                    <TableCell><strong>Edging Cost</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialsArray.map((material, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{material.finishMaterial || "N/A"}</TableCell>
                      <TableCell>{material.materialType || "N/A"}</TableCell>
                      <TableCell>{material.measure || "N/A"}</TableCell>
                      <TableCell>${(parseFloat(material.materialCost) || 0).toFixed(2)}</TableCell>
                      <TableCell>${(parseFloat(material.edgingCost) || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CreateProjectStep4;