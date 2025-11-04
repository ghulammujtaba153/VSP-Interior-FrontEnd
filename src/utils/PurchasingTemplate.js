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
 * Generates a Purchase Order PDF document
 * @param {Object} data - Purchase order data
 * @param {Object} data.purchaseOrder - Purchase order object
 * @param {Object} data.supplier - Supplier information
 * @param {Object} data.project - Project information (optional)
 * @param {Array} data.lineItems - Line items array
 * @param {Object} data.company - VSP Interiors company information
 */
export const PurchasingTemplate = async (data) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Colors
    const blackColor = [0, 0, 0];
    const redColor = [220, 20, 60]; // #dc143c - for logo accents
    const whiteColor = [255, 255, 255];
    
    let currentY = 10;
    
    // ==================== HEADER SECTION ====================
    
    // Supplier/Buyer Information (Left Side)
    doc.setTextColor(...blackColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const supplier = data?.supplier || {};
    const supplierName = supplier.name || "PREFINISHED SURFACES";
    const supplierAddress = supplier.address || "90 Henderson Valley Road";
    const supplierCity = supplier.city || "Henderson, Auckland 0612";
    const supplierCountry = supplier.country || "New Zealand";
    const supplierPhone = supplier.phone || "022 274 7621";
    const supplierEmail = supplier.email || "dave@prefinishedsurfaces.com";
    const supplierGST = supplier.gst || "109-354-546";
    
    doc.text(supplierName, 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    currentY += 5;
    doc.text(supplierAddress, 10, currentY);
    currentY += 5;
    doc.text(supplierCity, 10, currentY);
    currentY += 5;
    doc.text(supplierCountry, 10, currentY);
    currentY += 5;
    doc.text(supplierPhone, 10, currentY);
    currentY += 5;
    doc.text(supplierEmail, 10, currentY);
    currentY += 5;
    doc.text(supplierGST, 10, currentY);
    
    // VSP Interiors Information (Middle - Right)
    const company = data?.company || {};
    const companyName = company.name || "VSP Interiors Limited";
    const companyAddress = company.address || "36 Parkway Drive, Rosedale,";
    const companyCity = company.city || "Auckland 0632";
    const companyPhone = company.phone || "(09) 442 2588";
    const companyEmail = company.email || "vishal@vspinteriors.co.nz";
    const companyWebsite = company.website || "www.vspinteriors.co.nz";
    
    currentY = 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(companyName, 105, currentY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    currentY += 5;
    doc.text(companyAddress, 105, currentY, { align: 'center' });
    currentY += 5;
    doc.text(companyCity, 105, currentY, { align: 'center' });
    currentY += 5;
    doc.text(companyPhone, 105, currentY, { align: 'center' });
    currentY += 5;
    doc.text(companyEmail, 105, currentY, { align: 'center' });
    currentY += 5;
    doc.text(companyWebsite, 105, currentY, { align: 'center' });
    
    // Logo Section (Top Right)
    currentY = 10;
    const logoX = 170;
    const logoY = currentY;
    const logoWidth = 30; // Width in mm
    const logoHeight = 15; // Height in mm
    
    try {
      // Load and add logo image
      const logoDataURL = await loadImageAsDataURL('/logo.png');
      doc.addImage(logoDataURL, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Failed to load logo image, using text fallback:', error);
      // Fallback to text if image fails to load
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...blackColor);
      doc.text('VSP', logoX, currentY + 5);
      doc.setFontSize(12);
      doc.text('Interiors', logoX, currentY + 10);
    }
    
    // ==================== PURCHASE ORDER TITLE ====================
    currentY = 50;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const poNumber = data?.purchaseOrder?.id || 1875;
    doc.text(`PURCHASE ORDER#${poNumber}`, 105, currentY, { align: 'center' });
    
    // ==================== PO DETAILS SECTION ====================
    currentY += 15;
    
    const project = data?.project || {};
    const purchaseOrder = data?.purchaseOrder || {};
    const user = data?.user || {};
    
    const projectName = project.projectName || "Mason Clinic Stage 3";
    const poDate = purchaseOrder.createdAt 
      ? new Date(purchaseOrder.createdAt).toLocaleDateString('en-NZ', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      : "10/Jun/2025";
    const poIssuedBy = user.name || "Vishal";
    const poPhone = user.phone || "(09) 442 2588";
    const poEmail = user.email || "vishal@vspinteriors.co.nz";
    const dueDate = purchaseOrder.expectedDelivery
      ? new Date(purchaseOrder.expectedDelivery).toLocaleDateString('en-NZ', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : "30/Jun/2025";
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Left column labels and values
    let detailY = currentY;
    const labelX = 20;
    const valueX = 60;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(projectName, valueX, detailY);
    
    detailY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(poDate, valueX, detailY);
    
    detailY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('PO Issued by:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(poIssuedBy, valueX, detailY);
    
    detailY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(poPhone, valueX, detailY);
    
    detailY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(poEmail, valueX, detailY);
    
    detailY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(dueDate, valueX, detailY);
    
    detailY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('PO Number:', labelX, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(poNumber.toString(), valueX, detailY);
    
    // ==================== LINE ITEMS TABLE ====================
    currentY = detailY + 15;
    
    // Table header
    doc.setFillColor(...blackColor);
    doc.rect(10, currentY - 5, 190, 8, 'F');
    doc.setTextColor(...whiteColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    doc.text('Item', 12, currentY);
    doc.text('Description', 40, currentY);
    doc.text('Quantity', 135, currentY);
    doc.text('Unit Cost', 155, currentY);
    doc.text('Line Total', 175, currentY);
    
    currentY += 5;
    
    // Table rows
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const lineItems = data?.lineItems || [];
    let tableStartY = currentY;
    
    lineItems.forEach((item, index) => {
      if (currentY > 230) {
        // Start new page if needed
        doc.addPage();
        currentY = 20;
        tableStartY = currentY;
      }
      
      // Draw row border
      doc.setDrawColor(200, 200, 200);
      doc.line(10, currentY - 3, 200, currentY - 3);
      
      // Item code/name
      const itemCode = item.inventory?.name || item.description?.substring(0, 10) || `G${String(index + 1).padStart(3, '0')}A`;
      doc.text(itemCode.substring(0, 8), 12, currentY);
      
      // Description (wrap if too long)
      const description = item.description || "";
      const maxDescriptionWidth = 90;
      const descriptionLines = doc.splitTextToSize(description, maxDescriptionWidth);
      let descY = currentY;
      descriptionLines.forEach((line, i) => {
        if (i < 3) { // Limit to 3 lines
          doc.text(line, 40, descY);
          descY += 5;
        }
      });
      
      // Quantity
      doc.text((item.quantity || 0).toString(), 135, currentY);
      
      // Unit Cost
      const unitCost = parseFloat(item.unitPrice || 0);
      doc.text(`$${unitCost.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 155, currentY);
      
      // Line Total
      const lineTotal = parseFloat(item.subtotal || 0);
      doc.text(`$${lineTotal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 175, currentY);
      
      // Move to next row (adjust based on description height)
      currentY = Math.max(currentY + 8, descY + 2);
    });
    
    // Notes section (if exists)
    const notes = purchaseOrder.notes || "";
    if (notes) {
      const noteLines = doc.splitTextToSize(notes, 180);
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...redColor);
      noteLines.forEach(line => {
        doc.text(line, 10, currentY);
        currentY += 4;
      });
      doc.setTextColor(...blackColor);
    }
    
    // ==================== TOTALS SECTION ====================
    currentY = Math.max(currentY + 10, 140);
    
    const subtotal = purchaseOrder.totalAmount || lineItems.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    const gstRate = 0.15; // 15% GST
    const gst = subtotal * gstRate;
    const total = subtotal + gst;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const totalsX = 130;
    
    doc.text('Subtotal:', totalsX, currentY);
    doc.text(`$${subtotal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, currentY, { align: 'right' });
    
    currentY += 6;
    doc.text('GST 15%:', totalsX, currentY);
    doc.text(`$${gst.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, currentY, { align: 'right' });
    
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total:', totalsX, currentY);
    doc.text(`$${total.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, currentY, { align: 'right' });
    
    // ==================== TERMS AND CONDITIONS ====================
    currentY += 15;
    
    // Check if we need a new page
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Purchase Order Terms:', 10, currentY);
    currentY += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Purchase Order Terms and Conditions', 10, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const termsText = [
      "All Local Purchase orders shall be governed by the following terms and conditions",
      "",
      "ACKNOWLEDGMENT: Receipt of the purchase order shall be acknowledged on the Purchase Order Acceptance Ship by the supplier within 5 days from the date of delivery of the LPO or shall be deemed void.",
      "",
      "PURCHASE ORDER NO: Purchase Order No must appear in all invoices, packing slips, dispatch slips, and related correspondence.",
      "",
      "ENTIRE AGREEMENT: SPECIFICATION: Goods should be delivered under the PO and shall comply with the description as to specification, quantity, and fitness for the purpose for which they are required, and as specified on the order. VSP Interiors takes no responsibility for any goods that do not have a delivery docket signed by a VSP Interiors Limited representative. We also reserve the right to return goods at no cost to VSP Interiors Limited if goods or services are not provided by the agreed date and Goods or Services are non-compliant.",
      "",
      "WAIVER: An extension of time or waiver of same item shall not relieve the supplier in any other respect from the terms of the contract.",
      "",
      "TERMS OF PAYMENT: Unless otherwise stated, payment for goods supplied under this PO will not be due until the 20th of the following month."
    ];
    
    termsText.forEach(paragraph => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
      
      if (paragraph.trim() === "") {
        currentY += 3;
      } else {
        const lines = doc.splitTextToSize(paragraph, 190);
        lines.forEach(line => {
          doc.text(line, 10, currentY);
          currentY += 4;
        });
        currentY += 2;
      }
    });
    
    // Save the PDF
    const fileName = `Purchase_Order_${poNumber}.pdf`;
    doc.save(fileName);
    
    return doc;
  } catch (error) {
    console.error("Error generating Purchase Order PDF:", error);
    throw error;
  }
};
