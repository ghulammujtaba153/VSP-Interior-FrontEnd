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
 * Generates Exclusions, HSE, and Terms & Conditions Summary page
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

  // Logo (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on exclusions page:', error);
  }

  // ==================== EXCLUSIONS ====================
  doc.setTextColor(...blackColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Exclusions:', 10, currentY);
  
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const exclusionIntro = "Unless specifically included within this tender submission, the following items are excluded from VSP Interiors Limited's scope of works:";
  const splitIntro = doc.splitTextToSize(exclusionIntro, pageWidth - 20);
  doc.text(splitIntro, 10, currentY);
  currentY += splitIntro.length * 4 + 4;

  const exclusions = [
    'Vertical delivery (e.g., stairs, lifts, cranage, or upper-level transportation).',
    'Structural, building, or alteration works including demolition, framing, linings, carpentry, or associated builder’s works by others.',
    'Electrical, plumbing, gas fitting, mechanical, and data service works including appliance connections.',
    'Mirrors, glass splashbacks, LED lighting, Autex panels, or specialist finishes unless specifically included.',
    'Making good to walls, floors, ceilings, or existing finishes due to building tolerances or site conditions.',
    'Painting, finishing, or decoration of existing joinery.',
    'Supply or installation of any appliances, fixtures, or fittings.',
    'Provision of access equipment (e.g., scaffolding, hoists, Hiab) unless explicitly noted.',
    'Site preparation works, including clearing, levelling, or remedial building works to accommodate joinery.',
    'Removal of existing joinery or cabinetry unless otherwise noted.',
    'Protection of installed works by others after installation completion.',
    'Builder’s clean or final construction clean.',
    'Seismic restraint engineering or design, unless specifically documented.',
    'Costs associated with delays or disruptions outside of VSP Interiors’ control.',
    'Delays arising from late information, incomplete documentation, or delayed approvals by others, including architectural, consultant, or client instructions.',
    'Supply of materials, finishes, or products not available locally or requiring special import unless stated.',
    'Any fees, permits, or consents required by councils or regulatory bodies.'
  ];

  exclusions.forEach((item) => {
    doc.text('•', 15, currentY);
    const splitText = doc.splitTextToSize(item, pageWidth - 30);
    doc.text(splitText, 22, currentY);
    currentY += splitText.length * 4 + 1;
  });

  // ==================== HEALTH, SAFETY & ENVIRONMENT ====================
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Health, Safety & Environment', 10, currentY);
  
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const hseItems = [
    'Fully compliant with the Health and Safety at Work Act 2015 (HSWA).',
    'Site-specific Safety Plan (SSSP) and risk registers prepared prior to commencement.',
    'Active SiteWise participation and certification.',
    'All personnel hold current inductions, relevant competencies, and participate in toolbox meetings and ongoing safety monitoring.',
    'Environmentally responsible work practices to be maintained throughout the project.'
  ];

  hseItems.forEach((item) => {
    doc.text('•', 15, currentY);
    const splitText = doc.splitTextToSize(item, pageWidth - 30);
    // Dynamic Bold for HSWA
    if (item.includes('Health and Safety at Work Act 2015 (HSWA)')) {
      const parts = item.split('Health and Safety at Work Act 2015 (HSWA)');
      doc.text(parts[0], 22, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text('Health and Safety at Work Act 2015 (HSWA).', 22 + doc.getTextWidth(parts[0]), currentY);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text(splitText, 22, currentY);
    }
    currentY += splitText.length * 4 + 1;
  });

  // ==================== TERMS & CONDITIONS (SUMMARY) ====================
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Terms & Conditions (Summary)', 10, currentY);
  
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const tcItems = [
    { label: 'Tender Validity:', text: '90 calendar days from submission.' },
    { label: 'Payment:', text: 'Progress payments shall be made in accordance with the Construction Contracts Act 2002 and the agreed payment schedule, payable on the 20th of the month following the date' }
  ];

  tcItems.forEach((item) => {
    doc.text('•', 15, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, 22, currentY);
    doc.setFont('helvetica', 'normal');
    const labelW = doc.getTextWidth(item.label);
    const splitText = doc.splitTextToSize(item.text, pageWidth - 30 - labelW);
    doc.text(splitText, 22 + labelW + 1, currentY);
    currentY += splitText.length * 4 + 2;
  });

  // Footer helper
  const addFooter = (docInstance) => {
    const footerY = pageHeight - 25;
    docInstance.setDrawColor(...redColor);
    docInstance.setLineWidth(0.5);
    docInstance.line(10, footerY, pageWidth - 10, footerY);
    
    docInstance.setTextColor(...blackColor);
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(8);
    docInstance.text('VSP Interiors', 10, footerY + 5);
    
    docInstance.setFont('helvetica', 'normal');
    docInstance.text('Address: 36 Parkway Drive, Rosedale, Auckland', 10, footerY + 9);
    docInstance.setTextColor(25, 118, 210);
    docInstance.text('Email: info@vspinteriors.co.nz', 10, footerY + 13);
    
    docInstance.setTextColor(...blackColor);
    docInstance.text('Phone: (09) 442 2588', pageWidth - 60, footerY + 5);
    docInstance.text('Fax: (09) 442 2585', pageWidth - 60, footerY + 9);
    docInstance.setTextColor(25, 118, 210);
    docInstance.text('Web: www.vspinteriors.co.nz', pageWidth - 60, footerY + 13);
  };

  addFooter(doc);
};
