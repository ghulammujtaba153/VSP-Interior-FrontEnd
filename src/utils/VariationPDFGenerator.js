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
} from "@mui/material";
import { PictureAsPdf as PdfIcon, Download as DownloadIcon } from "@mui/icons-material";

const VariationSubmittalGenerator = ({ variationData, projectData }) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: `Variation Submittal - ${projectData?.project?.projectName || 'Project'}`,
      subject: 'Variation Submittal Document',
      author: 'VSP Interiors Limited',
    });

    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 152, 219]; // Light Blue
    const accentColor = [231, 76, 60]; // Red

    // Add header with company info
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('VARIATION SUBMITTAL', 105, 15, { align: 'center' });

    // Company information tables
    const startY = 40;

    // Left company (Client)
    doc.setFillColor(...secondaryColor);
    doc.rect(10, startY, 90, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Client header
    doc.text('P', 15, startY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text('Company / Name', 22, startY + 8);
    doc.setFont('helvetica', 'bold');
    doc.text(projectData?.project?.client?.companyName || 'Client Name', 15, startY + 15);
    
    doc.text('A', 15, startY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text('Address', 22, startY + 22);
    doc.text(projectData?.project?.client?.address || 'Client Address', 15, startY + 29);
    
    doc.text('Y', 15, startY + 36);
    doc.text('E', 22, startY + 36);

    // Right company (VSP)
    doc.setFillColor(...accentColor);
    doc.rect(110, startY, 90, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    doc.text('P', 115, startY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text('Company / Name', 122, startY + 8);
    doc.setFont('helvetica', 'bold');
    doc.text('VSP Interiors Limited', 115, startY + 15);
    
    doc.text('A', 115, startY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text('Address', 122, startY + 22);
    doc.text('36 Parkway Drive, Rosedale, Auckland, New Zealand', 115, startY + 29);
    
    doc.text('E', 115, startY + 36);
    doc.text('Contact', 122, startY + 36);
    doc.text('Vishal 021-183-9151', 115, startY + 43);

    // Project details table
    const projectStartY = startY + 50;
    doc.setFillColor(240, 240, 240);
    doc.rect(10, projectStartY, 190, 20, 'F');
    doc.setTextColor(0, 0, 0);
    
    const projectDetails = [
      { label: 'Project', value: projectData?.project?.projectName || 'N/A' },
      { label: 'Trade', value: 'Joinery' },
      { label: 'Our Ref', value: `V${variationData.id}` },
      { label: 'Site Address', value: projectData?.project?.siteLocation || 'N/A' },
      { label: 'Variation Reference', value: 'Reception Counter' },
      { label: 'Date', value: new Date(variationData.created_at).toLocaleDateString('en-NZ') },
    ];

    let yPos = projectStartY + 8;
    doc.setFontSize(8);
    
    // First row
    doc.text(`Project: ${projectDetails[0].value}`, 15, yPos);
    doc.text(`Trade: ${projectDetails[1].value}`, 80, yPos);
    doc.text(`Our Ref: ${projectDetails[2].value}`, 140, yPos);
    
    yPos += 6;
    
    // Second row
    doc.text(`Site Address: ${projectDetails[3].value}`, 15, yPos);
    doc.text(`Variation Reference: ${projectDetails[4].value}`, 80, yPos);
    doc.text(`Date: ${projectDetails[5].value}`, 140, yPos);

    // Variation Description
    const descStartY = projectStartY + 30;
    doc.setFillColor(...secondaryColor);
    doc.rect(10, descStartY, 190, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Variation Description', 15, descStartY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text('Changes to the Reception Counter', 70, descStartY + 8);
    doc.text('Doc Ref: 6205.1 rev 2', 160, descStartY + 8);

    // Detailed description
    const detailedStartY = descStartY + 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Detail description of work/ explanation / reason for variation/unless stated in', 15, detailedStartY);
    doc.text('instruction/s & what was done, why the work is a variation, who was instructed, how and when', 15, detailedStartY + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Supply and Install;', 15, detailedStartY + 15);
    doc.setFont('helvetica', 'normal');
    
    const descriptionLines = doc.splitTextToSize(
      `Changes to the front and rear of the reception counter finish from LPL to PLY1 and PL2 dwg # 5205.1 revision 2 c/w clear polyurethane finish to all exposed edges and faces.\n\nPLY1 - Birch PV - A Grade\nPHY2 - Birch Décor Oak, Grade AB`,
      180
    );
    
    doc.text(descriptionLines, 15, detailedStartY + 25);

    // Submitted Price
    doc.setFillColor(...accentColor);
    doc.rect(140, detailedStartY + 45, 60, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Submitted price as detailed below', 145, detailedStartY + 51);
    
    const totalCost = variationData.variations?.reduce((sum, v) => sum + (v.cost || 0), 0) || 0;
    doc.setFontSize(12);
    doc.text(`ADD $${totalCost.toFixed(2)}`, 165, detailedStartY + 60);

    // Price Breakdown Header
    const breakdownStartY = detailedStartY + 70;
    doc.setFillColor(...primaryColor);
    doc.rect(10, breakdownStartY, 190, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    const breakdownHeaders = ['ITEM', 'DESCRIPTION', 'QTY', 'UNIT', 'RATES', 'AMOUNT'];
    const breakdownWidths = [15, 65, 15, 20, 25, 30];
    let xPos = 15;
    
    breakdownHeaders.forEach((header, index) => {
      doc.text(header, xPos, breakdownStartY + 5);
      xPos += breakdownWidths[index];
    });

    // Variation header
    doc.setFillColor(...secondaryColor);
    doc.rect(10, breakdownStartY + 8, 190, 8, 'F');
    doc.setTextColor(255, 255, 255);
    
    doc.text('V', 15, breakdownStartY + 13);
    doc.text('A', 22, breakdownStartY + 13);
    doc.text('R', 29, breakdownStartY + 13);
    doc.text('I', 36, breakdownStartY + 13);
    doc.text('A', 43, breakdownStartY + 13);
    doc.text('T', 50, breakdownStartY + 13);
    doc.text('I', 57, breakdownStartY + 13);
    doc.text('O', 64, breakdownStartY + 13);
    doc.text('N', 71, breakdownStartY + 13);
    
    doc.text(variationData.description || 'Changes to the Reception Counter', 85, breakdownStartY + 13);

    // Variation items
    let itemY = breakdownStartY + 20;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    variationData.variations?.forEach((variation, index) => {
      doc.text(`V${variationData.id}`, 15, itemY);
      doc.text(variation.description || variation.title, 35, itemY);
      doc.text(variation.quantity.toString(), 105, itemY, { align: 'right' });
      doc.text(variation.unit, 125, itemY);
      doc.text(`$${variation.rates.toFixed(2)}`, 150, itemY, { align: 'right' });
      doc.text(`$${variation.cost.toFixed(2)}`, 180, itemY, { align: 'right' });
      itemY += 6;
    });

    // Add some empty rows for the template format
    for (let i = 0; i < 3; i++) {
      doc.text('', 15, itemY);
      doc.text('', 35, itemY);
      doc.text('', 105, itemY, { align: 'right' });
      doc.text('', 125, itemY);
      doc.text('', 150, itemY, { align: 'right' });
      doc.text('', 180, itemY, { align: 'right' });
      itemY += 6;
    }

    // Total row
    doc.setFillColor(240, 240, 240);
    doc.rect(150, itemY, 50, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 155, itemY + 5);
    doc.text(`$${totalCost.toFixed(2)}`, 180, itemY + 5, { align: 'right' });

    // Footer
    const footerY = 280;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by VSP Interiors Limited - Variation Management System', 105, footerY, { align: 'center' });
    doc.text(`Document generated on: ${new Date().toLocaleDateString('en-NZ')} ${new Date().toLocaleTimeString('en-NZ')}`, 105, footerY + 4, { align: 'center' });

    // Save the PDF
    const fileName = `Variation_Submittal_${projectData?.project?.projectName?.replace(/\s+/g, '_')}_V${variationData.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const PreviewContent = () => (
    <Box sx={{ p: 2, fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.2' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#2980b9', color: 'white', p: 2, textAlign: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
          VARIATION SUBMITTAL
        </Typography>
      </Box>

      {/* Company Information */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {/* Client Info */}
        <Box sx={{ backgroundColor: '#3498db', color: 'white', p: 1, width: '45%' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            <span style={{ display: 'inline-block', width: '20px' }}>P</span> Company / Name
          </Typography>
          <Typography sx={{ fontSize: '10px', ml: '20px' }}>
            {projectData?.project?.client?.companyName || 'Client Name'}
          </Typography>
          
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold', mt: 0.5 }}>
            <span style={{ display: 'inline-block', width: '20px' }}>A</span> Address
          </Typography>
          <Typography sx={{ fontSize: '10px', ml: '20px' }}>
            {projectData?.project?.client?.address || 'Client Address'}
          </Typography>
        </Box>

        {/* VSP Info */}
        <Box sx={{ backgroundColor: '#e74c3c', color: 'white', p: 1, width: '45%' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            <span style={{ display: 'inline-block', width: '20px' }}>P</span> Company / Name
          </Typography>
          <Typography sx={{ fontSize: '10px', ml: '20px' }}>
            VSP Interiors Limited
          </Typography>
          
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold', mt: 0.5 }}>
            <span style={{ display: 'inline-block', width: '20px' }}>E</span> Contact
          </Typography>
          <Typography sx={{ fontSize: '10px', ml: '20px' }}>
            Vishal 021-183-9151
          </Typography>
        </Box>
      </Box>

      {/* Project Details */}
      <Box sx={{ backgroundColor: '#f5f5f5', p: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Project: {projectData?.project?.projectName || 'N/A'}</Typography>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Trade: Joinery</Typography>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Our Ref: V{variationData.id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Site Address: {projectData?.project?.siteLocation || 'N/A'}</Typography>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Variation Reference: Reception Counter</Typography>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Date: {new Date(variationData.created_at).toLocaleDateString('en-NZ')}</Typography>
        </Box>
      </Box>

      {/* Variation Description */}
      <Box sx={{ backgroundColor: '#3498db', color: 'white', p: 1, mb: 1 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
          Variation Description: Changes to the Reception Counter
        </Typography>
      </Box>

      {/* Detailed Description */}
      <Box sx={{ mb: 2, p: 1, border: '1px solid #ddd' }}>
        <Typography sx={{ fontSize: '9px', fontWeight: 'bold', mb: 1 }}>
          Detail description of work/ explanation / reason for variation/unless stated in instruction/s & what was done, why the work is a variation, who was instructed, how and when
        </Typography>
        <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }}>Supply and Install;</Typography>
        <Typography sx={{ fontSize: '9px', mt: 0.5 }}>
          Changes to the front and rear of the reception counter finish from LPL to PLY1 and PL2 dwg # 5205.1 revision 2 c/w clear polyurethane finish to all exposed edges and faces.
        </Typography>
        <Typography sx={{ fontSize: '9px', mt: 0.5 }}>
          PLY1 - Birch PV - A Grade
        </Typography>
        <Typography sx={{ fontSize: '9px' }}>
          PHY2 - Birch Décor Oak, Grade AB
        </Typography>
        
        <Box sx={{ backgroundColor: '#e74c3c', color: 'white', p: 0.5, mt: 1, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            Submitted price as detailed below ADD ${variationData.variations?.reduce((sum, v) => sum + (v.cost || 0), 0).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Price Breakdown */}
      <Box sx={{ border: '1px solid #ddd' }}>
        {/* Table Header */}
        <Box sx={{ backgroundColor: '#2980b9', color: 'white', p: 0.5, display: 'flex' }}>
          {['ITEM', 'DESCRIPTION', 'QTY', 'UNIT', 'RATES', 'AMOUNT'].map((header, idx) => (
            <Typography key={idx} sx={{ fontSize: '8px', fontWeight: 'bold', flex: 1 }}>
              {header}
            </Typography>
          ))}
        </Box>

        {/* Variation Header */}
        <Box sx={{ backgroundColor: '#3498db', color: 'white', p: 0.5, display: 'flex' }}>
          <Typography sx={{ fontSize: '8px', fontWeight: 'bold', width: '60px' }}>
            VARIATION
          </Typography>
          <Typography sx={{ fontSize: '8px', flex: 1 }}>
            {variationData.description || 'Changes to the Reception Counter'}
          </Typography>
        </Box>

        {/* Variation Items */}
        {variationData.variations?.map((variation, index) => (
          <Box key={index} sx={{ display: 'flex', p: 0.5, borderBottom: '1px solid #eee' }}>
            <Typography sx={{ fontSize: '8px', width: '60px' }}>V{variationData.id}</Typography>
            <Typography sx={{ fontSize: '8px', flex: 1 }}>{variation.description || variation.title}</Typography>
            <Typography sx={{ fontSize: '8px', width: '40px', textAlign: 'right' }}>{variation.quantity}</Typography>
            <Typography sx={{ fontSize: '8px', width: '50px' }}>{variation.unit}</Typography>
            <Typography sx={{ fontSize: '8px', width: '50px', textAlign: 'right' }}>${variation.rates.toFixed(2)}</Typography>
            <Typography sx={{ fontSize: '8px', width: '60px', textAlign: 'right' }}>${variation.cost.toFixed(2)}</Typography>
          </Box>
        ))}

        {/* Empty rows for template */}
        {[...Array(3)].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', p: 0.5, borderBottom: '1px solid #eee' }}>
            <Typography sx={{ fontSize: '8px', width: '60px' }}></Typography>
            <Typography sx={{ fontSize: '8px', flex: 1 }}></Typography>
            <Typography sx={{ fontSize: '8px', width: '40px', textAlign: 'right' }}></Typography>
            <Typography sx={{ fontSize: '8px', width: '50px' }}></Typography>
            <Typography sx={{ fontSize: '8px', width: '50px', textAlign: 'right' }}></Typography>
            <Typography sx={{ fontSize: '8px', width: '60px', textAlign: 'right' }}></Typography>
          </Box>
        ))}

        {/* Total Row */}
        <Box sx={{ backgroundColor: '#f5f5f5', display: 'flex', p: 0.5, justifyContent: 'flex-end' }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold', mr: 2 }}>
            TOTAL:
          </Typography>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold', width: '60px', textAlign: 'right' }}>
            ${variationData.variations?.reduce((sum, v) => sum + (v.cost || 0), 0).toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PdfIcon />}
          onClick={() => setPreviewOpen(true)}
          size="small"
        >
          Preview
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generatePDF}
          size="small"
          color="primary"
        >
          Download PDF
        </Button>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Variation Submittal Preview - V{variationData.id}
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