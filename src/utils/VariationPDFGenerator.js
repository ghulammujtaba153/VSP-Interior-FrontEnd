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

const VariationSubmittalGenerator = ({ data }) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);


  console.log("Data:", data);

  // Fixed template data - exactly as shown in the image
  const templateData = {
    payer: {
      companyName: "Southbase Construction",
      address: "Level 4/185 The Strand",
      address2: "Parnell",
      address3: "Auckland 1010",
      attention: "Mason Clinic",
    },
    payee: {
      companyName: "VSP Interiors Limited",
      address: "38 Parkway Drive",
      address2: "Rosedale",
      address3: "Auckland",
      address4: "New Zealand",
      contact: "Vishal 021-183-9151",
    },
    project: {
      name: data?.project?.projectName || "N/A",
      siteAddress: data?.project?.siteLocation || "N/A",
      trade: "Joinery",
      variation: data?.description || "N/A",
      reference: `VAR-${data?.id}`,
      ourRef: `VD-${data?.id}`,
      date: new Date(data?.created_at).toLocaleDateString("en-NZ"),
      received: "",
      docRef: `PRJ-${data?.projectId}`,
    },
    variation: {
      description: data?.description || "No description provided",
      totalPrice:
        data?.variations?.reduce((sum, v) => sum + (Number(v.cost) || 0), 0) || 0,
    },
    breakdown: data?.variations?.map((v) => ({
      item: v.title,
      description: v.description,
      qty: v.quantity,
      unit: v.unit,
      rates: v.rates,
      amount: v.cost,
    })) || [],
  };


  console.log("Mapped Template Data:", templateData);


  

  const generatePDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');

      // Colors matching the image exactly
      const blackColor = [0, 0, 0];
      const lightGrayColor = [217, 217, 217]; // #d9d9d9
      const whiteColor = [255, 255, 255];

      // VARIATION SUBMITTAL Header
      doc.setFillColor(...blackColor);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('VARIATION SUBMITTAL', 105, 8, { align: 'center' });

      let currentY = 20;

      // PAYER Section (Left side) - No header, just the table
      // Company/Name Row
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('P', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Company', 50, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(70, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payer.companyName, 87.5, currentY + 4, { align: 'center' });

      // PAYEE Section (Right side) - No header, just the table
      doc.setFillColor(...blackColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('P', 115, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Company', 145, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payee.companyName, 182.5, currentY + 4, { align: 'center' });

      currentY += 6;

      // PAYER Address Rows
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('A', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Address', 50, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(70, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payer.address, 87.5, currentY + 4, { align: 'center' });

      // PAYEE Address Row 1
      doc.setFillColor(...blackColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('A', 115, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Address', 145, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payee.address, 182.5, currentY + 4, { align: 'center' });

      currentY += 6;

      // PAYER Address Row 2
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Y', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Address', 50, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(70, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payer.address2, 87.5, currentY + 4, { align: 'center' });

      // PAYEE Address Row 2
      doc.setFillColor(...blackColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Y', 115, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Address', 145, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payee.address2, 182.5, currentY + 4, { align: 'center' });

      currentY += 6;

      // PAYER Address Row 3
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('E', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Address', 50, currentY + 4, { align: 'center' });


      doc.setFillColor(...blackColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('E', 115, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Address', 145, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payee.address2, 182.5, currentY + 4, { align: 'center' });

      currentY += 6;

      // PAYER Attention Row
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('R', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(30, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Attention', 50, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(70, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.payer.attention, 87.5, currentY + 4, { align: 'center' });

      // PAYEE Address Row 3

      // PAYEE Contact Row
      doc.setFillColor(...blackColor);
      doc.rect(105, currentY, 20, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('R', 115, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(125, currentY, 40, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.text('Contact', 145, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(165, currentY, 35, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...blackColor);
      doc.text(templateData.payee.contact, 182.5, currentY + 4, { align: 'center' });



      currentY += 6;
      currentY += 6;

      // Project Details Section - Header with black background
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 190, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      // Top row - Project, Trade, Our Ref
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('Project', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(30, currentY, 30, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.name, 45, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(60, currentY, 40, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Trade', 70, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(80, currentY, 20, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.trade, 90, currentY + 4, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(100, currentY, 20, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Our Ref', 110, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(120, currentY, 20, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.ourRef, 130, currentY + 4, { align: 'center' });

      currentY += 6;

      // Bottom row - Site Address, Variation/Reference, Date/Received
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, currentY, 20, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('Site Address', 20, currentY + 4, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(30, currentY, 50, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.siteAddress, 55, currentY + 4, { align: 'center' });

      // Variation/Reference column
      doc.setFillColor(...lightGrayColor);
      doc.rect(80, currentY, 20, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Variation', 90, currentY + 2, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(80, currentY + 3, 20, 3, 'F');
      doc.text('Reference', 90, currentY + 5, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(100, currentY, 20, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.variation, 110, currentY + 2, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(100, currentY + 3, 20, 3, 'F');
      doc.text(templateData.project.reference, 110, currentY + 5, { align: 'center' });

      // Date/Received column
      doc.setFillColor(...lightGrayColor);
      doc.rect(120, currentY, 20, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 130, currentY + 2, { align: 'center' });

      doc.setFillColor(...lightGrayColor);
      doc.rect(120, currentY + 3, 20, 3, 'F');
      doc.text('Received', 130, currentY + 5, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(140, currentY, 20, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.date, 150, currentY + 2, { align: 'center' });

      doc.setFillColor(...whiteColor);
      doc.rect(140, currentY + 3, 20, 3, 'F');
      doc.text('', 150, currentY + 5, { align: 'center' }); // Empty for received

      currentY += 6;
      currentY += 6;

      // Variation Description Section
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, currentY, 120, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Variation Description', 15, currentY + 4);

      // Doc Ref
      doc.setFillColor(...lightGrayColor);
      doc.rect(130, currentY, 70, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Doc Ref', 135, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(templateData.project.docRef, 165, currentY + 4);

      currentY += 6;

      // Main Content Area
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, currentY, 130, 45, 'S');

      doc.setTextColor(...blackColor);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Detail description of work/', 12, currentY + 4);
      doc.text('explanation/reason for', 12, currentY + 7);
      doc.text('variation (unless stated in', 12, currentY + 10);
      doc.text('instruction) e.g. what was done,', 12, currentY + 13);
      doc.text('why the work is a variation, who', 12, currentY + 16);
      doc.text('was instructed, how and when', 12, currentY + 19);

      const detailLines = doc.splitTextToSize(templateData.variation.description, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(detailLines, 12, currentY + 25);

      // Right section - Price
      doc.rect(140, currentY, 60, 45, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const priceText = 'Submitted price as detailed below';
      const priceLines = doc.splitTextToSize(priceText, 50);
      doc.text(priceLines, 145, currentY + 10);

      doc.setFontSize(10);
      doc.text('ADD', 160, currentY + 25);
      doc.setFontSize(12);
      doc.text(`$${templateData.variation.totalPrice.toFixed(2)}`, 155, currentY + 32);

      // Price Breakdown section
      currentY += 52;

      // Header
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 190, 8, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PRICE BREAKDOWN', 105, currentY + 5, { align: 'center' });

      // Column headers
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY + 8, 190, 6, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFontSize(7);

      const colPositions = [15, 50, 125, 140, 160, 195];
      doc.text('ITEM', colPositions[0], currentY + 12);
      doc.text('DESCRIPTION', colPositions[1], currentY + 12);
      doc.text('QTY', colPositions[2], currentY + 12);
      doc.text('UNIT', colPositions[3], currentY + 12);
      doc.text('RATES', colPositions[4], currentY + 12);
      doc.text('AMOUNT', colPositions[5], currentY + 12, { align: 'right' });

      currentY += 15;

      // ADDITION VARIATION header
      doc.setFillColor(...whiteColor);
      doc.rect(10, currentY, 190, 6, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('ADDITION', colPositions[0], currentY + 4);
      doc.text(`VARIATION ${templateData.project.ourRef} Waiting Room Screen`, colPositions[1], currentY + 4);
      currentY += 6;

      // Breakdown items
      templateData.breakdown.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
        doc.setFillColor(...bgColor);
        doc.rect(10, currentY, 190, 6, 'F');
      
        doc.setTextColor(...blackColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
      
        // Convert all numeric values to strings
        doc.text(String(item.item || ''), colPositions[0], currentY + 4);
        doc.text(String(item.description || ''), colPositions[1], currentY + 4);
        doc.text(String(item.qty || ''), colPositions[2], currentY + 4);
        doc.text(String(item.unit || ''), colPositions[3], currentY + 4);
        doc.text(String(item.rates || ''), colPositions[4], currentY + 4);
        doc.text(String(item.amount || ''), colPositions[5], currentY + 4, { align: 'right' });
      
        currentY += 6;
      });
      

      // Total row
      doc.setFillColor(...blackColor);
      doc.rect(10, currentY, 190, 8, 'F');
      doc.setTextColor(...whiteColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TOTAL VARIATION (GST EXCLUSIVE)', 120, currentY + 5);
      doc.text(`$${templateData.variation.totalPrice.toFixed(2)}`, colPositions[5], currentY + 5, { align: 'right' });

      // Conditions section
      currentY += 12;
      doc.setTextColor(...blackColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('THIS VARIATION PRICE IS SUBJECT TO THE FOLLOWING CONDITIONS:', 15, currentY);

      // Conditions box
      currentY += 6;
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, currentY, 190, 15, 'S');

      // Signature section
      currentY += 20;
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, currentY, 190, 25, 'S');

      // Signature Section with 3 rows and multiple columns
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');

      // Row 1: SIGN, DATE, APPROVE REQUESTED BY
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, currentY, 30, 8, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('SIGN', 25, currentY + 3, { align: 'center' });
      doc.text('', 25, currentY + 6, { align: 'center' }); // Empty line for consistency
      
      doc.setFillColor(...whiteColor);
      doc.rect(40, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('VISHAL', 55, currentY + 5, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(70, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('DATE', 85, currentY + 3, { align: 'center' });
      doc.text('', 85, currentY + 6, { align: 'center' }); // Empty line for consistency
      
      doc.setFillColor(...whiteColor);
      doc.rect(100, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(templateData.project.date, 115, currentY + 5, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(130, currentY, 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('APPROVE REQUESTED', 150, currentY + 3, { align: 'center' });
      doc.text('BY', 150, currentY + 6, { align: 'center' });
      
      doc.setFillColor(...whiteColor);
      doc.rect(170, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Meg.05', 185, currentY + 5, { align: 'center' });

      currentY += 8;

      // Row 2: PAYER APPROVAL ACCEPTANCE, APPROVE BY, DATE
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, currentY, 40, 8, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('PAYER APPROVAL', 30, currentY + 3, { align: 'center' });
      doc.text('ACCEPTANCE', 30, currentY + 6, { align: 'center' });
      
      doc.setFillColor(...whiteColor);
      doc.rect(50, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('', 65, currentY + 5, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(80, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('APPROVE', 95, currentY + 3, { align: 'center' });
      doc.text('BY', 95, currentY + 6, { align: 'center' });
      
      doc.setFillColor(...whiteColor);
      doc.rect(110, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('SIGNED', 125, currentY + 5, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(140, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('DATE', 155, currentY + 3, { align: 'center' });
      doc.text('', 155, currentY + 6, { align: 'center' }); // Empty line for consistency
      
      doc.setFillColor(...whiteColor);
      doc.rect(170, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('', 185, currentY + 5, { align: 'center' });

      currentY += 8;

      // Row 3: VO REF, COMMENTS
      doc.setFillColor(...lightGrayColor);
      doc.rect(10, currentY, 30, 8, 'F');
      doc.setTextColor(...blackColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('VO', 25, currentY + 3, { align: 'center' });
      doc.text('REF', 25, currentY + 6, { align: 'center' });
      
      doc.setFillColor(...whiteColor);
      doc.rect(40, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('', 55, currentY + 5, { align: 'center' });
      
      doc.setFillColor(...lightGrayColor);
      doc.rect(70, currentY, 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('COMMENTS', 85, currentY + 3, { align: 'center' });
      doc.text('', 85, currentY + 6, { align: 'center' }); // Empty line for consistency
      
      doc.setFillColor(...whiteColor);
      doc.rect(100, currentY, 100, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('', 150, currentY + 5, { align: 'center' });


      // Save the PDF
      const fileName = `Variation_Submittal_${templateData.project.ourRef}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      {/* <Button variant="outlined" startIcon={<PdfIcon />} onClick={() => setPreviewOpen(true)} size="small">
        Preview
      </Button> */}
      <Button variant="contained" startIcon={<DownloadIcon />} onClick={generatePDF} size="small" color="primary">
        Download PDF
      </Button>


    </Box>
  );
};

export default VariationSubmittalGenerator;