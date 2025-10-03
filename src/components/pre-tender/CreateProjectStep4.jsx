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

  // Calculate material total cost from step3
  const materialTotalCost = materialsArray.reduce((total, material) => {
    return total + (parseFloat(material.materialCost) || 0);
  }, 0);

  // Get rate values
  const materialMarkup = getRateValue("Material", "markup");
  const materialSellPrice = getRateValue("Material", "sell");
  
  const hardwareMarkup = getRateValue("Hardware", "markup");
  const hardwareSellPrice = getRateValue("Hardware", "sell");
  
  const buyInMarkup = getRateValue("BuyIn", "markup");
  const buyInSellPrice = getRateValue("BuyIn", "sell");
  
  const freightHourlyRate = getRateValue("Freight", "hourlyRate");
  const freightSellPrice = getRateValue("Freight", "sell");
  
  const shopDrawingHourlyRate = getRateValue("ShopDrawing", "hourlyRate");
  const shopDrawingSellPrice = getRateValue("ShopDrawing", "sell");
  
  const machiningHourlyRate = getRateValue("Machining", "hourlyRate");
  const machiningSellPrice = getRateValue("Machining", "sell");
  
  const assemblyHourlyRate = getRateValue("Assembly", "hourlyRate");
  const assemblySellPrice = getRateValue("Assembly", "sell");
  
  const installationHourlyRate = getRateValue("Installation", "hourlyRate");
  const installationSellPrice = getRateValue("Installation", "sell");

  // Calculate actual sell prices based on cost + markup
  const calculatedMaterialSell = materialTotalCost * (1 + materialMarkup / 100);
  const actualMaterialSell = materialSellPrice > 0 ? materialSellPrice : calculatedMaterialSell;

  // Calculate labor costs (hourly rate based services)
  const laborCost = shopDrawingSellPrice + machiningSellPrice + assemblySellPrice + installationSellPrice;

  // Calculate total cost (material cost + labor costs + freight + buy-in items)
  const totalCost = materialTotalCost + laborCost + freightSellPrice + buyInSellPrice;

  // Calculate total sell (material sell + labor costs + freight + buy-in items)
  const totalSell = actualMaterialSell + laborCost + freightSellPrice + buyInSellPrice + hardwareSellPrice;

  // Calculate margin
  const marginAmount = totalSell - totalCost;
  const marginPercentage = totalCost > 0 ? (marginAmount / totalCost) * 100 : 0;

  // Calculate GST
  const gst = totalSell * 0.15;
  const totalWithGST = totalSell + gst;

  const rows = [
    { label: "MATERIAL COST", value: `$${materialSellPrice.toFixed(2)}` },
    // { label: "MATERIAL MARKUP", value: `${materialMarkup.toFixed(2)}%` },
    // { label: "MATERIAL SELL PRICE", value: `$${actualMaterialSell.toFixed(2)}` },
    { label: "HARDWARE SELL PRICE", value: `$${hardwareSellPrice.toFixed(2)}` },
    { label: "BUY IN ITEMS", value: `$${buyInSellPrice.toFixed(2)}` },
    { label: "FREIGHT", value: `$${freightSellPrice.toFixed(2)}` },
    { label: "SHOP DRAWINGS", value: `$${shopDrawingSellPrice.toFixed(2)}` },
    { label: "MACHINING", value: `$${machiningSellPrice.toFixed(2)}` },
    { label: "ASSEMBLY", value: `$${assemblySellPrice.toFixed(2)}` },
    { label: "INSTALLATION", value: `$${installationSellPrice.toFixed(2)}` },
    { label: "TOTAL LABOR COST", value: `$${laborCost.toFixed(2)}` },
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
                {rows.map((row, idx) => (
                  <TableRow 
                    key={idx}
                    sx={{ 
                      backgroundColor: idx >= rows.length - 4 ? '#f0f8ff' : 'inherit',
                      '&:last-child td, &:last-child th': { border: 0 } 
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={idx >= rows.length - 4 ? "600" : "500"}>
                        {row.label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={idx >= rows.length - 4 ? "600" : "500"}>
                        {row.value}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
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
                    <TableCell><strong>Cost</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialsArray.map((material, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{material.finishMaterial || "N/A"}</TableCell>
                      <TableCell>{material.materialType || "N/A"}</TableCell>
                      <TableCell>{material.measure || "N/A"}</TableCell>
                      <TableCell>${(parseFloat(material.materialCost) || 0).toFixed(2)}</TableCell>
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