"use client";

import React from "react";
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { PictureAsPdf as PdfIcon, Download as DownloadIcon } from "@mui/icons-material";
import jsPDF from "jspdf";

const VariationSubmittalGenerator = ({ variationData, projectData }) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Calculate total cost
  const calculateTotalCost = () => {
    return variationData?.variations?.reduce((sum, v) => sum + (v.cost || 0), 0) || 0;
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `Variation Submittal - ${projectData?.project?.projectName || 'Project'}`,
        subject: 'Variation Submittal Document',
        author: 'VSP Interiors Limited'
      });

      // Colors
      const blackColor = [0, 0, 0];
      const darkGrayColor = [100, 100, 100];
      const lightGrayColor = [240, 240, 240];
      const whiteColor = [255, 255, 255];

      // Add header
      doc.setFillColor(...blackColor);
      doc.rect(0, 0, 210, 15, 'F');
      
      doc.setTextColor(...whiteColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('VARIATION SUBMITTAL', 105, 8, { align: 'center' });

      // Company Information - Table format matching preview
      const startY = 25;
      
      // PAYER Section
      doc.setDrawColor(0, 0, 0);
      
      // PAYER Header
      doc.setFillColor(...blackColor);
      doc.rect(10, startY, 95, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYER', 57.5, startY + 4, { align: 'center' });

      // PAYEE Header
      doc.setFillColor(...blackColor);
      doc.rect(105, startY, 95, 6, 'F');
      doc.text('PAYEE', 152.5, startY + 4, { align: 'center' });

      let currentY = startY + 6;

      // PAYER Company/Name Row
      doc.setFillColor(...darkGrayColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.text('P', 20, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...darkGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.text('Company / Name', 50, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(70, currentY, 35, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFontSize(7);
      doc.text(projectData?.project?.client?.companyName || 'Southbase Construction', 87.5, currentY + 4, { align: 'center' });

      // PAYEE Company/Name Row
      doc.setFillColor(...darkGrayColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.text('P', 115, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...darkGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.text('Company / Name', 145, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('VSP Interiors Limited', 182.5, currentY + 4, { align: 'center' });

      currentY += 6;

      // PAYER Address Rows
      const payerAddress = projectData?.project?.client?.address || 'Level 4/165 The Strand, Parnell, Auckland 1010';
      const payerAddressLines = doc.splitTextToSize(payerAddress, 30);
      
      payerAddressLines.forEach((line, index) => {
        if (index === 0) {
          doc.setFillColor(...darkGrayColor);
          doc.rect(10, currentY, 20, 6, 'F');
          doc.setTextColor(...whiteColor);
          doc.text('A', 20, currentY + 4, { align: 'center' });
          
          doc.setFillColor(...darkGrayColor);
          doc.rect(30, currentY, 40, 6, 'F');
          doc.text('Address', 50, currentY + 4, { align: 'center' });
        } else {
          doc.setFillColor(...darkGrayColor);
          doc.rect(10, currentY, 20, 6, 'F');
          doc.setTextColor(...whiteColor);
          doc.text(index === 1 ? 'Y' : 'E', 20, currentY + 4, { align: 'center' });
          
          doc.setFillColor(...darkGrayColor);
          doc.rect(30, currentY, 40, 6, 'F');
          doc.text('Address', 50, currentY + 4, { align: 'center' });
        }
        
        doc.setFillColor(...lightGrayColor);
        doc.rect(70, currentY, 35, 6, 'F');
        doc.setTextColor(...blackColor);
        doc.text(line, 87.5, currentY + 4, { align: 'center' });
        currentY += 6;
      });

      // PAYEE Address Rows
      const payeeAddress = ['36 Parkway Drive,', 'Rosedale,', 'Auckland, New Zealand'];
      payeeAddress.forEach((line, index) => {
        if (index === 0) {
          doc.setFillColor(...darkGrayColor);
          doc.rect(105, currentY, 20, 6, 'F');
          doc.setTextColor(...whiteColor);
          doc.text('A', 115, currentY + 4, { align: 'center' });
          
          doc.setFillColor(...darkGrayColor);
          doc.rect(125, currentY, 40, 6, 'F');
          doc.text('Address', 145, currentY + 4, { align: 'center' });
        } else {
          doc.setFillColor(...darkGrayColor);
          doc.rect(105, currentY, 20, 6, 'F');
          doc.setTextColor(...whiteColor);
          doc.text(index === 1 ? 'Y' : 'E', 115, currentY + 4, { align: 'center' });
          
          doc.setFillColor(...darkGrayColor);
          doc.rect(125, currentY, 40, 6, 'F');
          doc.text('Address', 145, currentY + 4, { align: 'center' });
        }
        
        doc.setFillColor(...lightGrayColor);
        doc.rect(165, currentY, 35, 6, 'F');
        doc.setTextColor(...blackColor);
        doc.text(line, 182.5, currentY + 4, { align: 'center' });
        currentY += 6;
      });

      // PAYER Attention Row
      doc.setFillColor(...darkGrayColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.text('R', 20, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...darkGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.text('Attention', 50, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(70, currentY, 35, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('', 87.5, currentY + 4, { align: 'center' });

      // PAYEE Contact Row
      doc.setFillColor(...darkGrayColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.text('E', 115, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...darkGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.text('Contact', 145, currentY + 4, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Vishal 021-183-9151', 182.5, currentY + 4, { align: 'center' });

      // Project Details Section
      const projectStartY = currentY + 10;
      
      // First row
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, projectStartY, 190, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFontSize(8);
      
      // Project
      doc.setFont('helvetica', 'bold');
      doc.text('Project', 12, projectStartY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(projectData?.project?.projectName || 'Mason Clinic', 30, projectStartY + 4);
      
      // Trade
      doc.setFont('helvetica', 'bold');
      doc.text('Trade', 80, projectStartY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text('Joinery', 95, projectStartY + 4);
      
      // Our Ref
      doc.setFont('helvetica', 'bold');
      doc.text('Our Ref', 130, projectStartY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`V${String(variationData?.id || '01').padStart(2, '0')}`, 150, projectStartY + 4);
      
      // Date
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 170, projectStartY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(variationData?.created_at || new Date()).toLocaleDateString('en-NZ'), 185, projectStartY + 4);

      // Second row
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, projectStartY + 6, 190, 6, 'F');
      
      // Site Address
      doc.setFont('helvetica', 'bold');
      doc.text('Site Address', 12, projectStartY + 10);
      doc.setFont('helvetica', 'normal');
      const siteAddress = projectData?.project?.siteLocation || 'Carrington Road, Pt Chevalier, Auckland';
      const shortSiteAddress = doc.splitTextToSize(siteAddress, 50)[0];
      doc.text(shortSiteAddress, 40, projectStartY + 10);
      
      // Variation
      doc.setFont('helvetica', 'bold');
      doc.text('Variation', 100, projectStartY + 10);
      doc.setFont('helvetica', 'normal');
      doc.text('Reference', 115, projectStartY + 10);
      
      // Reception
      doc.setFont('helvetica', 'bold');
      doc.text('Reception', 150, projectStartY + 10);
      doc.setFont('helvetica', 'normal');
      doc.text('Counter', 165, projectStartY + 10);
      
      // Received
      doc.setFont('helvetica', 'bold');
      doc.text('Received', 185, projectStartY + 10);

      // Variation Description Section
      const descStartY = projectStartY + 16;
      
      // Variation Description
      doc.setFillColor(...darkGrayColor);
      doc.rect(10, descStartY, 120, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Variation Description', 15, descStartY + 4);
      doc.setFont('helvetica', 'normal');
      const descText = variationData?.description || 'Changes to the Reception Counter';
      const shortDesc = doc.splitTextToSize(descText, 100)[0];
      doc.text(shortDesc, 70, descStartY + 4);
      
      // Doc Ref
      doc.setFillColor(...lightGrayColor);
      doc.rect(130, descStartY, 70, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Doc Ref', 135, descStartY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text('6205.1 rev 2', 165, descStartY + 4);

      // Main Content Area
      const contentStartY = descStartY + 10;
      
      // Left section - Detailed description
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, contentStartY, 130, 45, 'S');
      
      doc.setTextColor(...blackColor);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Detail description of work/', 12, contentStartY + 4);
      doc.text('explanation / reason for', 12, contentStartY + 7);
      doc.text('variation(unless stated in', 12, contentStartY + 10);
      doc.text('instruction) e.g what was done,', 12, contentStartY + 13);
      doc.text('why the work is a variation, who', 12, contentStartY + 16);
      doc.text('was instructed, how and when', 12, contentStartY + 19);
      
      const detailText = variationData?.description || 'Changes to the front and rear of the reception counter finish from LPL to PLY1 and PL2 dwg # 6205.1 revision 2 c/w clear polyurethane finish to all exposed edges and faces.';
      const detailLines = doc.splitTextToSize(detailText, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(detailLines, 12, contentStartY + 25);

      // Right section - Price
      doc.rect(140, contentStartY, 60, 45, 'S');
      
      const totalCost = calculateTotalCost();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const priceText = 'Submitted price as detailed below';
      const priceLines = doc.splitTextToSize(priceText, 50);
      doc.text(priceLines, 145, contentStartY + 10);
      
      doc.setFontSize(10);
      doc.text('ADD', 160, contentStartY + 25);
      doc.setFontSize(12);
      doc.text(`$${totalCost.toFixed(2)}`, 155, contentStartY + 32);

      // Price Breakdown section
      const breakdownStartY = contentStartY + 52;
      
      // Header
      doc.setFillColor(...blackColor);
      doc.rect(10, breakdownStartY, 190, 8, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PRICE BREAKDOWN', 105, breakdownStartY + 5, { align: 'center' });

      // Column headers
      doc.setFillColor(...blackColor);
      doc.rect(10, breakdownStartY + 8, 190, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(7);
      
      const colPositions = [15, 50, 125, 140, 160, 195];
      doc.text('ITEM', colPositions[0], breakdownStartY + 12);
      doc.text('DESCRIPTION', colPositions[1], breakdownStartY + 12);
      doc.text('QTY', colPositions[2], breakdownStartY + 12);
      doc.text('UNIT', colPositions[3], breakdownStartY + 12);
      doc.text('RATES', colPositions[4], breakdownStartY + 12);
      doc.text('AMOUNT', colPositions[5], breakdownStartY + 12, { align: 'right' });

      let tableY = breakdownStartY + 15;
      
      // ADDITION VARIATION header
      doc.setFillColor(...darkGrayColor);
      doc.rect(10, tableY, 190, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.text('V', colPositions[0], tableY + 4);
      doc.text('ADDITION VARIATION', colPositions[1], tableY + 4);
      tableY += 6;

      // Main variation description
      doc.setFillColor(250, 250, 250);
      doc.rect(10, tableY, 190, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text(`V${String(variationData?.id || '01').padStart(2, '0')}`, colPositions[0], tableY + 4);
      const mainDesc = variationData?.description || 'Changes to the Reception Counter';
      const shortMainDesc = doc.splitTextToSize(mainDesc, 80)[0];
      doc.text(shortMainDesc, colPositions[1], tableY + 4);
      tableY += 6;

      // Variation items
      variationData?.variations?.forEach((variation, index) => {
        const bgColor = index % 2 === 0 ? [255, 255, 255] : [250, 250, 250];
        doc.setFillColor(...bgColor);
        doc.rect(10, tableY, 190, 6, 'F');
        
        doc.text(variation.title || '', colPositions[0], tableY + 4);
        doc.text(variation.description || variation.title || '', colPositions[1], tableY + 4);
        doc.text((variation.quantity || 0).toString(), colPositions[2], tableY + 4);
        doc.text(variation.unit || 'No', colPositions[3], tableY + 4);
        doc.text((variation.rates || 0).toFixed(2), colPositions[4], tableY + 4);
        doc.text((variation.cost || 0).toFixed(2), colPositions[5], tableY + 4, { align: 'right' });
        
        tableY += 6;
      });

      // Total row
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, tableY, 190, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TOTAL VARIATION (GST EXCLUSIVE)', 120, tableY + 5);
      doc.text(`$${totalCost.toFixed(2)}`, colPositions[5], tableY + 5, { align: 'right' });

      // Conditions section
      const conditionsY = tableY + 12;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('THIS VARIATION PRICE IS SUBJECT TO THE FOLLOWING CONDITIONS:', 15, conditionsY);
      
      // Add some sample conditions
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('• Price valid for 30 days from date of submission', 15, conditionsY + 6);
      doc.text('• Subject to site conditions and access', 15, conditionsY + 11);
      doc.text('• Excludes GST', 15, conditionsY + 16);
      
      // Signature section
      const signatureY = conditionsY + 25;
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, signatureY, 190, 25, 'S');
      
      // Signature labels
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGN', 15, signatureY + 5);
      doc.text('VISHAL', 15, signatureY + 10);
      doc.text('DATE', 15, signatureY + 15);
      doc.text(new Date().toLocaleDateString('en-NZ'), 15, signatureY + 20);
      doc.text('APPROVE REQUESTED BY', 60, signatureY + 5);
      
      doc.text('Reg.QS', 60, signatureY + 15);
      doc.text('PAYER APPROVAL ACCEPTANCE', 60, signatureY + 20);
      
      doc.text('APPROVE BY', 140, signatureY + 5);
      doc.text('SIGNED', 140, signatureY + 10);
      doc.text('DATE', 140, signatureY + 15);
      doc.text('VO REF', 140, signatureY + 20);
      
      doc.text('COMMENTS', 170, signatureY + 5);

      // Save the PDF
      const fileName = `Variation_Submittal_${projectData?.project?.projectName?.replace(/\s+/g, '_') || 'Project'}_V${String(variationData?.id || '01').padStart(2, '0')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  const PriceBreakdownTable = () => {
    const totalCost = calculateTotalCost();
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2, border: '1px solid #000' }}>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'black' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px', border: '1px solid #000', padding: '4px' }}>ITEM</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px', border: '1px solid #000', padding: '4px' }}>DESCRIPTION</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px', border: '1px solid #000', padding: '4px', textAlign: 'center' }}>QTY</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px', border: '1px solid #000', padding: '4px' }}>UNIT</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px', border: '1px solid #000', padding: '4px' }}>RATES</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px', border: '1px solid #000', padding: '4px', textAlign: 'right' }}>AMOUNT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* ADDITION VARIATION Header */}
            <TableRow sx={{ backgroundColor: '#505050' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '9px', border: '1px solid #000', padding: '4px' }}>V</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '9px', border: '1px solid #000', padding: '4px' }}>
                ADDITION VARIATION
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
            </TableRow>

            {/* Main Variation Description */}
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontSize: '9px', fontWeight: 'bold', border: '1px solid #000', padding: '4px' }}>
                V{String(variationData?.id || '01').padStart(2, '0')}
              </TableCell>
              <TableCell sx={{ fontSize: '9px', fontWeight: 'bold', border: '1px solid #000', padding: '4px' }}>
                {variationData?.description || 'Changes to the Reception Counter'}
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
              <TableCell sx={{ border: '1px solid #000', padding: '4px' }}></TableCell>
            </TableRow>

            {/* Variation Items */}
            {variationData?.variations?.map((variation, index) => (
              <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                <TableCell sx={{ fontSize: '8px', border: '1px solid #000', padding: '4px' }}>{variation.title || ""}</TableCell>
                <TableCell sx={{ fontSize: '8px', border: '1px solid #000', padding: '4px' }}>{variation.description || variation.title}</TableCell>
                <TableCell sx={{ fontSize: '8px', border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{variation.quantity}</TableCell>
                <TableCell sx={{ fontSize: '8px', border: '1px solid #000', padding: '4px' }}>{variation.unit || 'No'}</TableCell>
                <TableCell sx={{ fontSize: '8px', border: '1px solid #000', padding: '4px' }}>${(variation.rates || 0).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: '8px', border: '1px solid #000', padding: '4px', textAlign: 'right' }}>${(variation.cost || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
              <TableCell colSpan={5} sx={{ fontSize: '9px', fontWeight: 'bold', border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                TOTAL VARIATION (GST EXCLUSIVE)
              </TableCell>
              <TableCell sx={{ fontSize: '9px', fontWeight: 'bold', border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                ${totalCost.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const PreviewContent = () => {
    const totalCost = calculateTotalCost();
    
    return (
      <Box sx={{ p: 2, fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4', backgroundColor: 'white', maxWidth: '800px' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#000', color: 'white', p: 1, textAlign: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
            VARIATION SUBMITTAL
          </Typography>
        </Box>

        {/* Company Information - Table format matching screenshot */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
          {/* PAYER Section */}
          <Box sx={{ width: '48%', border: '1px solid #000', display: 'grid', gridTemplateColumns: '20px 120px 1fr' }}>
            {/* Header Row */}
            <Box sx={{ backgroundColor: '#000', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>P</Box>
            <Box sx={{ backgroundColor: '#505050', color: 'white', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>Company / Name</Box>
            <Box sx={{ borderLeft: '1px solid #000', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>
              {projectData?.project?.client?.companyName || 'Southbase Construction'}
            </Box>

            {/* Address */}
            <Box sx={{ backgroundColor: '#000', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>A</Box>
            <Box sx={{ backgroundColor: '#d9d9d9', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>Address</Box>
            <Box sx={{ borderLeft: '1px solid #000', fontSize: '8px', p: 0.5 }}>
              {projectData?.project?.client?.address || 'Level 4/165 The Strand, Parnell, Auckland 1010'}
            </Box>

            {/* Attention */}
            <Box sx={{ backgroundColor: '#000', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>R</Box>
            <Box sx={{ backgroundColor: '#d9d9d9', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>Attention</Box>
            <Box sx={{ borderLeft: '1px solid #000', fontSize: '8px', p: 0.5 }}>________________________</Box>
          </Box>

          {/* PAYEE Section */}
          <Box sx={{ width: '48%', border: '1px solid #000', display: 'grid', gridTemplateColumns: '20px 120px 1fr' }}>
            {/* Header Row */}
            <Box sx={{ backgroundColor: '#000', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>P</Box>
            <Box sx={{ backgroundColor: '#505050', color: 'white', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>Company / Name</Box>
            <Box sx={{ borderLeft: '1px solid #000', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>VSP Interiors Limited</Box>

            {/* Address */}
            <Box sx={{ backgroundColor: '#000', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>A</Box>
            <Box sx={{ backgroundColor: '#d9d9d9', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>Address</Box>
            <Box sx={{ borderLeft: '1px solid #000', fontSize: '8px', p: 0.5 }}>
              36 Parkway Drive,<br />Rosedale,<br />Auckland, New Zealand
            </Box>

            {/* Contact */}
            <Box sx={{ backgroundColor: '#000', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>E</Box>
            <Box sx={{ backgroundColor: '#d9d9d9', fontSize: '8px', fontWeight: 'bold', p: 0.5 }}>Contact</Box>
            <Box sx={{ borderLeft: '1px solid #000', fontSize: '8px', p: 0.5 }}>Vishal 021-183-9151</Box>
          </Box>
        </Box>

        {/* Project Details - Table format */}
        <Box sx={{ border: '1px solid #000', mb: 2 }}>
          {/* First row */}
          <Box sx={{ display: 'flex', borderBottom: '1px solid #000', backgroundColor: '#f0f0f0' }}>
            <Box sx={{ width: '25%', p: 0.5, borderRight: '1px solid #000' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Project</Typography>
              <Typography sx={{ fontSize: '8px' }}>{projectData?.project?.projectName || 'Mason Clinic'}</Typography>
            </Box>
            <Box sx={{ width: '25%', p: 0.5, borderRight: '1px solid #000' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Trade</Typography>
              <Typography sx={{ fontSize: '8px' }}>Joinery</Typography>
            </Box>
            <Box sx={{ width: '25%', p: 0.5, borderRight: '1px solid #000' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Our Ref</Typography>
              <Typography sx={{ fontSize: '8px' }}>V{String(variationData?.id || '01').padStart(2, '0')}</Typography>
            </Box>
            <Box sx={{ width: '25%', p: 0.5 }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Date</Typography>
              <Typography sx={{ fontSize: '8px' }}>{new Date(variationData?.created_at || new Date()).toLocaleDateString('en-NZ')}</Typography>
            </Box>
          </Box>
          
          {/* Second row */}
          <Box sx={{ display: 'flex', borderBottom: '1px solid #000', backgroundColor: '#f0f0f0' }}>
            <Box sx={{ width: '25%', p: 0.5, borderRight: '1px solid #000' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Site Address</Typography>
              <Typography sx={{ fontSize: '8px' }}>{projectData?.project?.siteLocation || 'Carrington Road, Pt Chevalier, Auckland'}</Typography>
            </Box>
            <Box sx={{ width: '25%', p: 0.5, borderRight: '1px solid #000' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Variation</Typography>
              <Typography sx={{ fontSize: '8px' }}>Reference</Typography>
            </Box>
            <Box sx={{ width: '25%', p: 0.5, borderRight: '1px solid #000' }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Reception</Typography>
              <Typography sx={{ fontSize: '8px' }}>Counter</Typography>
            </Box>
            <Box sx={{ width: '25%', p: 0.5 }}>
              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Received</Typography>
            </Box>
          </Box>
        </Box>

        {/* Variation Description */}
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box sx={{ flex: 1, backgroundColor: '#505050', color: 'white', p: 0.8, border: '1px solid #000' }}>
            <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Variation Description</Typography>
            <Typography sx={{ fontSize: '8px', fontWeight: 'normal' }}>
              {variationData?.description || 'Changes to the Reception Counter'}
            </Typography>
          </Box>
          <Box sx={{ width: '150px', backgroundColor: '#f0f0f0', p: 0.8, border: '1px solid #000' }}>
            <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>Doc Ref</Typography>
            <Typography sx={{ fontSize: '8px' }}>6205.1 rev 2</Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {/* Left Section - Detailed Description */}
          <Box sx={{ flex: 1, p: 1, border: '1px solid #000', minHeight: '120px' }}>
            <Typography sx={{ fontSize: '7px', fontWeight: 'bold', mb: 0.5 }}>
              Detail description of work/<br />
              explanation / reason for<br />
              variation(unless stated in<br />
              instruction) e.g what was done,<br />
              why the work is a variation, who<br />
              was instructed, how and when
            </Typography>
            <Typography sx={{ fontSize: '7px', fontWeight: 'bold', mt: 1 }}>
              {variationData?.description || 'Changes to the Reception Counter'}
            </Typography>
          </Box>
          
          {/* Right Section - Price */}
          <Box sx={{ width: '150px', p: 1, border: '1px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '8px', fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
              Submitted price as detailed below
            </Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', mb: 0.5 }}>ADD</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
              ${totalCost.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Price Breakdown Table */}
        <PriceBreakdownTable />

        {/* Conditions Section */}
        <Box sx={{ mt: 2, p: 1, border: '1px solid #ccc' }}>
          <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>
            THIS VARIATION PRICE IS SUBJECT TO THE FOLLOWING CONDITIONS:
          </Typography>
          <Typography sx={{ fontSize: '7px', mt: 0.5 }}>• Price valid for 30 days from date of submission</Typography>
          <Typography sx={{ fontSize: '7px' }}>• Subject to site conditions and access</Typography>
          <Typography sx={{ fontSize: '7px' }}>• Excludes GST</Typography>
        </Box>

        {/* Signature Section */}
        <Box sx={{ mt: 2, p: 1, border: '1px solid #000' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>SIGN</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>VISHAL</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>DATE</Typography>
              <Typography sx={{ fontSize: '7px' }}>{new Date().toLocaleDateString('en-NZ')}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>APPROVE REQUESTED BY</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold', mt: 1 }}>Reg.QS</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>PAYER APPROVAL ACCEPTANCE</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>APPROVE BY</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>SIGNED</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>DATE</Typography>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>VO REF</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '7px', fontWeight: 'bold' }}>COMMENTS</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<PdfIcon />} onClick={() => setPreviewOpen(true)} size="small">
          Preview
        </Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={generatePDF} size="small" color="primary">
          Download PDF
        </Button>
      </Box>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Variation Submittal Preview - V{String(variationData?.id || '01').padStart(2, '0')}
        </DialogTitle>
        <DialogContent>
          <PreviewContent />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button onClick={generatePDF} variant="contained" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VariationSubmittalGenerator;