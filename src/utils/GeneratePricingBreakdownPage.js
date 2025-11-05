"use client";

import jsPDF from "jspdf";

/**
 * Loads an image and converts it to base64
 */
const loadImageAsDataURL = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

/**
 * Generates Tender Pricing Breakdown page for tender template
 * @param {jsPDF} doc - The jsPDF document instance
 */
export const generatePricingBreakdownPage = async (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const blackColor = [0, 0, 0];
  const redColor = [220, 20, 60];

  // Add new page
  doc.addPage();
  let currentY = 15;

  // Logo on Page 3 (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on page 3:', error);
    doc.setTextColor(...redColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('VSP', pageWidth - 40, 15);
    doc.setFontSize(12);
    doc.setTextColor(...blackColor);
    doc.text('Interiors', pageWidth - 40, 22);
  }

  // Title
  doc.setTextColor(...blackColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tender Pricing Breakdown (NZD, excl. GST)', 10, currentY);

  currentY += 10;

  // Table dimensions
  const tableStartX = 10;
  const tableStartY = currentY;
  const tableWidth = pageWidth - 20;
  const col1Width = 30; // Quantity
  const col2Width = 120; // Description
  const col3Width = 40; // Amount
  const rowHeight = 6;
  const numRows = 32; // Approximately 30-35 rows as per image

  // Table header
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.5);
  
  // Header row background
  doc.setFillColor(240, 240, 240);
  doc.rect(tableStartX, tableStartY, tableWidth, rowHeight, 'FD');
  
  // Header text
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Quantity', tableStartX + col1Width / 2, tableStartY + rowHeight / 2 + 2, { align: 'center' });
  doc.text('Description', tableStartX + col1Width + col2Width / 2, tableStartY + rowHeight / 2 + 2, { align: 'center' });
  doc.text('Amount', tableStartX + col1Width + col2Width + col3Width / 2, tableStartY + rowHeight / 2 + 2, { align: 'center' });

  // Summary section configuration
  const summaryLabels = ['NET AMOUNT', 'GST 15%', 'TOTAL'];
  const summaryRowHeight = rowHeight;
  const summaryStartY = pageHeight - 80; // Reserve space for summary and footer
  
  // Calculate space for data rows (leaving room for summary section)
  let tableY = tableStartY + rowHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const availableHeight = summaryStartY - tableY;
  const maxDataRows = Math.floor(availableHeight / rowHeight);
  const dataRows = Math.min(numRows - 3, maxDataRows); // Subtract 3 for summary rows

  // Calculate dimensions
  const totalSummaryHeight = summaryLabels.length * summaryRowHeight;
  const dataSectionEndY = summaryStartY - totalSummaryHeight;

  // Draw all horizontal lines for data rows (row separators)
  for (let i = 0; i <= dataRows; i++) {
    const yPos = tableStartY + (i * rowHeight);
    doc.line(tableStartX, yPos, tableStartX + tableWidth, yPos);
  }
  
  // Draw all vertical lines (column separators) for the entire data section
  doc.line(tableStartX, tableStartY, tableStartX, dataSectionEndY); // Left border
  doc.line(tableStartX + col1Width, tableStartY, tableStartX + col1Width, dataSectionEndY); // After Quantity
  doc.line(tableStartX + col1Width + col2Width, tableStartY, tableStartX + col1Width + col2Width, dataSectionEndY); // After Description
  doc.line(tableStartX + tableWidth, tableStartY, tableStartX + tableWidth, dataSectionEndY); // Right border
  
  // Fill data cells with white background
  doc.setFillColor(255, 255, 255);
  for (let i = 0; i < dataRows; i++) {
    const yPos = tableStartY + rowHeight + (i * rowHeight);
    doc.rect(tableStartX, yPos - rowHeight, tableWidth, rowHeight, 'F');
  }

  // Summary Section (integrated into table)
  const summaryY = summaryStartY;
  
  // Draw summary section horizontal lines
  for (let i = 0; i <= summaryLabels.length; i++) {
    const yPos = summaryY + (i * summaryRowHeight);
    doc.line(tableStartX, yPos, tableStartX + tableWidth, yPos);
  }
  
  // Draw summary section vertical lines
  doc.line(tableStartX, summaryY, tableStartX, summaryY + totalSummaryHeight); // Left border
  doc.line(tableStartX + col1Width, summaryY, tableStartX + col1Width, summaryY + totalSummaryHeight); // After Quantity
  doc.line(tableStartX + col1Width + col2Width, summaryY, tableStartX + col1Width + col2Width, summaryY + totalSummaryHeight); // After Description
  doc.line(tableStartX + tableWidth, summaryY, tableStartX + tableWidth, summaryY + totalSummaryHeight); // Right border
  
  // Fill summary cells and add labels
  summaryLabels.forEach((label, index) => {
    const rowY = summaryY + (index * summaryRowHeight);
    
    // Draw cell background
    doc.setFillColor(255, 255, 255);
    doc.rect(tableStartX, rowY, tableWidth, summaryRowHeight, 'F');
    
    // Draw label (right-aligned in description column)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, tableStartX + col1Width + col2Width - 5, rowY + summaryRowHeight / 2 + 2, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
  });

  // Draw outer border of entire table (from header to end of summary)
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.5);
  const totalTableHeight = (summaryY + totalSummaryHeight) - tableStartY;
  doc.rect(tableStartX, tableStartY, tableWidth, totalTableHeight, 'D');

  // ==================== FOOTER SECTION (PAGE 3) ====================
  const footerY = pageHeight - 25;
  
  // Red horizontal line
  doc.setDrawColor(...redColor);
  doc.setLineWidth(0.5);
  doc.line(10, footerY, pageWidth - 10, footerY);
  
  // Footer content
  let footerYPos = footerY + 5;
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VSP Interiors', 10, footerYPos);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Address: 36 Parkway Drive, Rosedale, Auckland', 10, footerYPos + 4);
  doc.setTextColor(25, 118, 210);
  doc.text('Email: info@vspinteriors.co.nz', 10, footerYPos + 8);
  
  // Right side footer
  doc.setTextColor(...blackColor);
  doc.text('Phone: (09) 442 2588', pageWidth - 60, footerYPos);
  doc.text('Fax: (09) 442 2585', pageWidth - 60, footerYPos + 4);
  doc.setTextColor(25, 118, 210);
  doc.text('Web: www.vspinteriors.co.nz', pageWidth - 60, footerYPos + 8);
};

