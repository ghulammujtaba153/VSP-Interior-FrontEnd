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
        resolve(dataURL, 'PNG');
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

/**
 * Generates Project Overview, Tender Sum and Pricing Breakdown page
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Object} project - Project data object
 */
export const generateProjectOverviewPage = async (doc, project, quoteData = null) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const blackColor = [0, 0, 0];
  const redColor = [220, 20, 60];
  const yellowHighlight = [255, 255, 0];

  // Add new page
  doc.addPage();
  let currentY = 15;

  // Logo (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on page 3:', error);
  }

  // ==================== PROJECT OVERVIEW ====================
  doc.setTextColor(...blackColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Overview:', 10, currentY);
  
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Project Name: ', 10, currentY);
  const projectName = project.projectName || '[Project Name]';
  const nameWidth = doc.getTextWidth(projectName);
  doc.setFillColor(...yellowHighlight);
  doc.rect(10 + doc.getTextWidth('Project Name: '), currentY - 4, nameWidth + 2, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text(projectName, 10 + doc.getTextWidth('Project Name: ') + 1, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Location: ', 10, currentY);
  const siteLocation = project.siteLocation || '[Site Address]';
  const locWidth = doc.getTextWidth(siteLocation);
  doc.setFillColor(...yellowHighlight);
  doc.rect(10 + doc.getTextWidth('Location: '), currentY - 4, locWidth + 2, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text(siteLocation, 10 + doc.getTextWidth('Location: ') + 1, currentY);

  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Description:', 10, currentY);
  doc.setFont('helvetica', 'normal');
  const description = project.description || 'Complete interior fit-out works including manufacture, delivery, installation, and handover of all kitchen cabinetry and custom interior joinery work in accordance with approved drawings, specifications, and the New Zealand Building Code.';
  const splitDesc = doc.splitTextToSize(description, pageWidth - 35);
  doc.text(splitDesc, 35, currentY);
  currentY += Math.max(splitDesc.length * 5, 10);

  // ==================== TENDER SUM ====================
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Tender Sum', 10, currentY);
  
  currentY += 5;
  // Use quoteData.finalPrice when available, otherwise fall back to project.totalSell
  const tenderSumExclGst = (quoteData && quoteData.finalPrice != null) ? quoteData.finalPrice : (project.totalSell || 0);
  const gst = tenderSumExclGst * 0.15;
  const totalSum = tenderSumExclGst + gst;

  const tableWidth = pageWidth - 20;
  const col1W = tableWidth * 0.6;
  const col2W = tableWidth * 0.4;
  const rowH = 6;

  // Tender Sum Table
  const drawTenderSumRow = (label, value, y, isBold = false) => {
    doc.setDrawColor(...blackColor);
    doc.setLineWidth(0.3);
    doc.rect(10, y, col1W, rowH);
    doc.rect(10 + col1W, y, col2W, rowH);
    
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.text(label, 12, y + 4.5);
    
    // Value with Highlight
    const valStr = value.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' }).replace('$', '$ ');
    const valWidth = doc.getTextWidth(valStr);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + col1W + col2W - valWidth - 4, y + 1, valWidth + 2, rowH - 2, 'F');
    doc.text(valStr, 10 + col1W + col2W - 2, y + 4.5, { align: 'right' });
  };

  drawTenderSumRow('Tender Sum (Excluding GST)', tenderSumExclGst, currentY);
  currentY += rowH;
  drawTenderSumRow('GST (15%)', gst, currentY);
  currentY += rowH;
  drawTenderSumRow('Total Contract Sum (Including GST)', totalSum, currentY, true);
  currentY += rowH + 8;

  const subText = 'The Tender Sum is submitted as a lump sum subcontract price based on the issued drawings, specifications, inclusions, exclusions, and conditions contained within this tender submission.';
  const splitSubText = doc.splitTextToSize(subText, pageWidth - 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(splitSubText, 10, currentY);
  currentY += splitSubText.length * 5 + 8;

  // ==================== TENDER PRICING BREAKDOWN ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Tender Pricing Breakdown', 10, currentY);
  currentY += 5;

  if (quoteData && quoteData.pricingItems && quoteData.pricingItems.length > 0) {
    // ── Quote-driven breakdown: one row per pricing line item ──
    const blockRowH = 6;
    doc.setLineWidth(0.3);

    // Header row
    doc.setFillColor(...yellowHighlight);
    doc.rect(10, currentY, col1W, blockRowH, 'F');
    doc.rect(10 + col1W, currentY, col2W, blockRowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...blackColor);
    doc.text('Item Category', 12, currentY + 4.5);
    doc.text('Amount (NZD excl. GST)', 10 + col1W + col2W - 2, currentY + 4.5, { align: 'right' });
    currentY += blockRowH;

    // Item rows — sell prices only (skip zero-value items)
    const visibleItems = quoteData.pricingItems.filter(item => (item.sellPrice || 0) > 0);
    visibleItems.forEach((item, idx) => {
      doc.setDrawColor(...blackColor);
      doc.rect(10, currentY, col1W, blockRowH);
      doc.rect(10 + col1W, currentY, col2W, blockRowH);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(item.category || '', 12, currentY + 4.5);

      const sellStr = (item.sellPrice || 0).toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' }).replace('$', '$ ');
      const sellW = doc.getTextWidth(sellStr);
      doc.setFillColor(...yellowHighlight);
      doc.rect(10 + col1W + col2W - sellW - 4, currentY + 1, sellW + 2, blockRowH - 2, 'F');
      doc.text(sellStr, 10 + col1W + col2W - 2, currentY + 4.5, { align: 'right' });

      currentY += blockRowH;
    });

    // Total row
    doc.setDrawColor(...blackColor);
    doc.setLineWidth(0.5);
    doc.rect(10, currentY, col1W, blockRowH);
    doc.rect(10 + col1W, currentY, col2W, blockRowH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL (excl. GST)', 12, currentY + 4.5);
    const totalStr = tenderSumExclGst.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' }).replace('$', '$ ');
    const totalW = doc.getTextWidth(totalStr);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + col1W + col2W - totalW - 4, currentY + 1, totalW + 2, blockRowH - 2, 'F');
    doc.text(totalStr, 10 + col1W + col2W - 2, currentY + 4.5, { align: 'right' });
    currentY += blockRowH + 5;

  } else {
    // ── Original project-data driven block ──
    const drawPricingBlock = (areaData, y) => {
      const blockRowH = 6;
      doc.setLineWidth(0.3);

      const rows = [
        { label: 'Area of Works', value: areaData.areaOfWorks },
        { label: 'Drawing Number, Revision, and Date', value: areaData.drawingInfo },
        { label: 'Quantity', value: areaData.quantity }
      ];

      rows.forEach((row) => {
        doc.rect(10, y, col1W, blockRowH);
        doc.rect(10 + col1W, y, col2W, blockRowH);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const labelW = doc.getTextWidth(row.label);
        doc.setFillColor(...yellowHighlight);
        doc.rect(12, y + 1, labelW, blockRowH - 2, 'F');
        doc.text(row.label, 12, y + 4.5);
        const isQty = row.label === 'Quantity';
        const valText = String(row.value || '');
        const valW = doc.getTextWidth(valText);
        if (isQty) {
          doc.setFillColor(...yellowHighlight);
          doc.rect(10 + col1W + col2W - valW - 4, y + 1, valW + 2, blockRowH - 2, 'F');
          doc.text(valText, 10 + col1W + col2W - 2, y + 4.5, { align: 'right' });
        } else {
          doc.setFillColor(...yellowHighlight);
          doc.rect(10 + col1W + 2, y + 1, valW + 2, blockRowH - 2, 'F');
          doc.text(valText, 10 + col1W + 4, y + 4.5);
        }
        y += blockRowH;
      });

      const descBoxH = 50;
      doc.rect(10, y, pageWidth - 20, descBoxH);
      doc.line(10 + col1W + 15, y, 10 + col1W + 15, y + descBoxH);
      doc.setFont('helvetica', 'normal');
      const descText = areaData.description || '';
      const splitAreaDesc = doc.splitTextToSize(descText, col1W + 10);
      doc.text(splitAreaDesc, 12, y + 5);
      const priceStr = areaData.price.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' }).replace('$', '$ ');
      const priceW = doc.getTextWidth(priceStr);
      doc.setFillColor(...yellowHighlight);
      doc.rect(10 + tableWidth - priceW - 4, y + 1, priceW + 2, blockRowH - 2, 'F');
      doc.text(priceStr, 10 + tableWidth - 2, y + 4.5, { align: 'right' });
      return y + descBoxH;
    };

    const cs = project.costingSheet || {};
    const areaData = {
      areaOfWorks: cs.unitName || '[Area of Works]',
      drawingInfo: `${cs.drawingNo || 'N/A'} Revision ${cs.Revision || 'N/A'} Dated ${new Date(project.updatedAt).toLocaleDateString()}`,
      quantity: cs.quantity || 0,
      description: `Interior carcass allowed 16.3mm thick on MDF substrate with 18.3mm thick LPL for all exposed faces on MDF substrate. ${cs.cabinetLookUp?.[0]?.description || ''}\n\nHardware and Accessories\n${cs.hardwareLookUp?.[0]?.description || 'Standard hardware... '}\n${cs.hinges?.[0]?.description || ''}`,
      price: cs.totals?.materials?.sell || 0
    };
    currentY = drawPricingBlock(areaData, currentY);
  }

  // If there are more areas, they could be added here in a loop if the data structure allowed it.

  // ==================== FOOTER SECTION ====================
  const addFooter = (doc) => {
    const footerY = pageHeight - 25;
    doc.setDrawColor(...redColor);
    doc.setLineWidth(0.5);
    doc.line(10, footerY, pageWidth - 10, footerY);
    
    let footerYPos = footerY + 5;
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('VSP Interiors', 10, footerYPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Address: 36 Parkway Drive, Rosedale, Auckland', 10, footerYPos + 4);
    doc.setTextColor(25, 118, 210);
    doc.text('Email: info@vspinteriors.co.nz', 10, footerYPos + 8);
    
    doc.setTextColor(...blackColor);
    doc.text('Phone: (09) 442 2588', pageWidth - 60, footerYPos);
    doc.text('Fax: (09) 442 2585', pageWidth - 60, footerYPos + 4);
    doc.setTextColor(25, 118, 210);
    doc.text('Web: www.vspinteriors.co.nz', pageWidth - 60, footerYPos + 8);
  };

  addFooter(doc);
};
