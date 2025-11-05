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
 * Generates Project Overview and Scope of Works page for tender template
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Object} project - Project data object
 */
export const generateProjectOverviewPage = async (doc, project) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const blackColor = [0, 0, 0];
  const redColor = [220, 20, 60];

  // Add new page
  doc.addPage();
  let currentY = 15;

  // Logo on Page 2 (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on page 2:', error);
    doc.setTextColor(...redColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('VSP', pageWidth - 40, 15);
    doc.setFontSize(12);
    doc.setTextColor(...blackColor);
    doc.text('Interiors', pageWidth - 40, 22);
  }

  // Project Overview and Scope of Works
  doc.setTextColor(...blackColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Overview and Scope of Works:', 10, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const projectName = project.projectName || '[Project Name]';
  const siteLocation = project.siteLocation || '[Site Address]';
  
  doc.text(`Project Name: ${projectName}`, 10, currentY);
  currentY += 6;
  doc.text(`Location: ${siteLocation}`, 10, currentY);
  
  currentY += 8;
  const overviewText = 'VSP Interiors proposes to undertake the complete joinery fit-out, including manufacture, delivery, installation, and handover of kitchen cabinetry and custom joinery works. All work will be completed in accordance with approved architectural plans, specifications, the New Zealand Building Code, and relevant NZ standards.';
  const splitOverview = doc.splitTextToSize(overviewText, pageWidth - 20);
  doc.text(splitOverview, 10, currentY);
  currentY += splitOverview.length * 5 + 10;

  // Project Specification Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Project Specification - Material, Hardware, and Finishes', 10, currentY);
  currentY += 8;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(10, currentY, pageWidth - 20, 7, 'F');
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  doc.text('Item', 12, currentY + 5);
  doc.text('Material / Specification', 45, currentY + 5);
  doc.text('Finish / Colour', 110, currentY + 5);
  doc.text('Brand / Supplier', 150, currentY + 5);
  
  currentY += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  const tableRows = [
    {
      item: 'Internal Carcass',
      material: '16.3mm thick LPL on standard MDF',
      finish: 'White Gloss',
      brand: 'Laminex'
    },
    {
      item: 'External Carcass',
      material: '18.3mm thick LPL on standard MDF',
      finish: 'Standard Melteca Range',
      brand: 'Laminex'
    },
    {
      item: 'Hardware - Hinges',
      material: 'Soft-close',
      finish: 'Chrome/Satin',
      brand: 'Hafele'
    },
    {
      item: 'Hardware - Drawers',
      material: 'Alto Soft close',
      finish: 'White',
      brand: 'Hafele'
    },
    {
      item: 'Handles',
      material: '',
      finish: '',
      brand: ''
    },
    {
      item: 'Benchtops',
      material: '',
      finish: '',
      brand: ''
    },
    {
      item: 'Glass Splashback',
      material: '',
      finish: '',
      brand: ''
    }
  ];

  // Add 3 empty rows
  for (let i = 0; i < 3; i++) {
    tableRows.push({
      item: '',
      material: '',
      finish: '',
      brand: ''
    });
  }

  tableRows.forEach((row, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(250, 250, 250);
    }
    doc.rect(10, currentY, pageWidth - 20, 6, 'F');
    
    doc.setTextColor(...blackColor);
    const itemText = doc.splitTextToSize(row.item || '', 30);
    doc.text(itemText, 12, currentY + 4);
    
    const materialText = doc.splitTextToSize(row.material || '', 60);
    doc.text(materialText, 45, currentY + 4);
    
    const finishText = doc.splitTextToSize(row.finish || '', 35);
    doc.text(finishText, 110, currentY + 4);
    
    const brandText = doc.splitTextToSize(row.brand || '', 40);
    doc.text(brandText, 150, currentY + 4);
    
    currentY += 6;
    
    // Add page break if needed
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 15;
    }
  });

  currentY += 5;

  // Scope of Work Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const scopeHeading = 'Our scope of work includes, but is not limited to, the following:';
  const splitScopeHeading = doc.splitTextToSize(scopeHeading, pageWidth - 20);
  doc.text(splitScopeHeading, 10, currentY);
  currentY += splitScopeHeading.length * 5 + 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const scopeItems = [
    'Site measure and CAD shop drawings for client and consultant approval',
    'CNC-based manufacture of all cabinetry, carcasses, and components',
    'Supply of premium hardware as detailed above',
    'Fabrication of benchtops as specified above',
    'Pre-finished and edge-banded panels to specified colours and materials',
    'Factory-based quality assurance and dimensional control before dispatch',
    'Delivery to the site, with horizontal placement only',
    'Installation on site by qualified joinery installers',
    'Final adjustments, defect rectification, and formal handover of all items'
  ];

  scopeItems.forEach((item) => {
    doc.text('•', 15, currentY);
    const itemText = doc.splitTextToSize(item, pageWidth - 25);
    doc.text(itemText, 20, currentY);
    currentY += itemText.length * 5 + 2;
    
    // Add page break if needed
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 15;
    }
  });

  currentY += 5;

  // Note Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Note:', 10, currentY);
  currentY += 6;
  
  doc.setFont('helvetica', 'normal');
  const noteText = 'A detailed list of inclusions, exclusions, and commercial terms is outlined in the following sections.';
  const splitNote = doc.splitTextToSize(noteText, pageWidth - 20);
  doc.text(splitNote, 10, currentY);

  // ==================== FOOTER SECTION (PAGE 2) ====================
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

