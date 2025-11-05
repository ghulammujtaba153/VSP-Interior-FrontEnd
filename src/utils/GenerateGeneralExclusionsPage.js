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
 * Generates General Exclusions and Health, Safety & Environment page for tender template
 * @param {jsPDF} doc - The jsPDF document instance
 */
export const generateGeneralExclusionsPage = async (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const blackColor = [0, 0, 0];
  const redColor = [220, 20, 60];

  // Add new page
  doc.addPage();
  let currentY = 15;

  // Logo on Page 6 (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on page 6:', error);
    doc.setTextColor(...redColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('VSP', pageWidth - 40, 15);
    doc.setFontSize(12);
    doc.setTextColor(...blackColor);
    doc.text('Interiors', pageWidth - 40, 22);
  }

  // General Exclusions Section
  doc.setTextColor(...blackColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('General Exclusions:', 10, currentY);

  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const exclusions = [
    'Vertical delivery (e.g., carrying items upstairs).',
    'Structural, building, or alteration works, including demolition, carpentry, framing, linings, and associated works by others.',
    'Electrical, plumbing, gas fitting, or mechanical works, including appliance connections.',
    'Mirror, glass splash-back, LED lighting, Autex unless specifically included.',
    'Painting, finishing, or decoration of existing joinery items unless specifically included.',
    'Supply or installation of any appliances, fixtures, or fittings.',
    'Provision of access equipment (e.g., scaffolding, hoists, Hiab) unless explicitly noted.',
    'Site preparation works, including clearing, levelling, or remedial building works to accommodate joinery.',
    'Removal of existing joinery or cabinetry unless otherwise specified.',
    'Costs associated with delays or disruptions outside of VSP Interiors\' control.',
    'Supply of materials, finishes, or products not available locally or requiring special import unless stated.',
    'Any fees, permits, or consents required by councils or regulatory bodies.'
  ];

  for (const exclusion of exclusions) {
    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = 15;
      
      // Add logo to new page
      try {
        const logoDataURL = await loadImageAsDataURL('/logo.png');
        const logoWidth = 40;
        const logoHeight = 15;
        doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Failed to load logo on continuation page:', error);
      }
    }

    // Bullet point
    doc.text('•', 10, currentY);
    
    // Text with wrapping
    const textLines = doc.splitTextToSize(exclusion, pageWidth - 25);
    doc.text(textLines, 20, currentY);
    currentY += textLines.length * 3.5 + 2;
  }

  // Health, Safety & Environment Section
  currentY += 5;
  
  // Check if we need a new page for this section
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = 15;
    
    // Add logo to new page
    try {
      const logoDataURL = await loadImageAsDataURL('/logo.png');
      const logoWidth = 40;
      const logoHeight = 15;
      doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Failed to load logo on continuation page:', error);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Health, Safety & Environment', 10, currentY);

  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const healthSafetyItems = [
    'Fully compliant with the Health and Safety at Work Act 2015 (HSWA).',
    'Preparation and implementation of a Site-specific Safety Plan (SSSP) and risk registers prior to commencement.',
    'Active participation in Site Wise or equivalent safety programs, with current certification for all site personnel.',
    'Use of personal protective equipment (PPE) and adherence to site-specific safety requirements at all times.',
    'All personnel are trained and briefed in site safety protocols before commencing work.',
    'Safe handling, storage, and use of tools, machinery, and materials in accordance with manufacturer and site safety guidelines.',
    'Coordination with other trades to maintain a safe, organized, and clean worksite.',
    'Ongoing monitoring, reporting, and management of hazards throughout the project to ensure a safe working environment.',
    'Minimisation of dust, noise, and other site environmental impacts.',
    'Implementation of environmentally responsible work practices to be maintained throughout the project.'
  ];

  for (const item of healthSafetyItems) {
    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = 15;
      
      // Add logo to new page
      try {
        const logoDataURL = await loadImageAsDataURL('/logo.png');
        const logoWidth = 40;
        const logoHeight = 15;
        doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Failed to load logo on continuation page:', error);
      }
    }

    // Bullet point
    doc.text('•', 10, currentY);
    
    // Text with wrapping
    const textLines = doc.splitTextToSize(item, pageWidth - 25);
    doc.text(textLines, 20, currentY);
    currentY += textLines.length * 3.5 + 2;
  }

  // Signature Block
  currentY += 6;
  
  // Check if we need a new page for signature
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 15;
    
    // Add logo to new page
    try {
      const logoDataURL = await loadImageAsDataURL('/logo.png');
      const logoWidth = 40;
      const logoHeight = 15;
      doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Failed to load logo on continuation page:', error);
    }
  }

  currentY += 15;

  // Signature line
  doc.setLineWidth(0.5);
  doc.line(10, currentY, 50, currentY);
  currentY += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Vishal Prasad', 10, currentY);
  currentY += 4;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Director', 10, currentY);
  currentY += 4;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('VSP Interiors Limited', 10, currentY);
  currentY += 4;
  
  doc.setFontSize(9);
  doc.text('021 183 9151', 10, currentY);
  currentY += 4;
  
  doc.setTextColor(25, 118, 210);
  doc.text('vishal@vspinteriors.co.nz', 10, currentY);

  // ==================== FOOTER SECTION ====================
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

