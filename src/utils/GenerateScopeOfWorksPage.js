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
 * Generates Scope of Works page
 * @param {jsPDF} doc - The jsPDF document instance
 */
export const generateScopeOfWorksPage = async (doc) => {
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
    console.warn('Failed to load logo on Scope of Works page:', error);
  }

  // Title
  doc.setTextColor(...blackColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Scope of Works by VSP Interiors Includes:', 10, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const scopeItems = [
    'Preparation and approval of shop drawings based on the architectural drawings.',
    'Detailed site measurement and verification to confirm dimensions, services coordination, and installation conditions prior to manufacture.',
    'Cabinet carcasses allowed as 16.3mm thick standard gloss white finish on standard MDF substrate with matching PVC edging unless otherwise specified within project drawings or specifications.',
    'All drawers and cabinet hinges allowed as Hafele soft-close hardware (or approved equivalent) as standard unless noted otherwise within project drawings or specifications.',
    'Standard cabinet handles allowed at a supply allowance of $5.00 per handle unless otherwise specified within project drawings or specifications.',
    'Plastic white cutlery trays allowed as standard drawer accessories unless otherwise specified within project drawings or specifications.',
    'Manufacture of all kitchen cabinetry and custom joinery in accordance with approved shop drawings, specifications, and relevant New Zealand Building Code requirements.',
    'Quality assurance checks undertaken at key stages including pre-manufacture review, post-manufacture inspection, and installation verification to ensure compliance with approved documentation.',
    'Coordination and delivery of all manufactured items to the site (horizontal delivery only).',
    'Safe storage of joinery components either off-site or on-site as required prior to installation.',
    'Professional installation of all joinery and cabinetry components by qualified installers.',
    'Installation based on plumb, level, and square building conditions provided by others. Making good to walls, floors, ceilings, or existing finishes is excluded unless specifically noted.',
    'Coordination and communication with other trades to facilitate efficient installation sequencing and minimize disruption to site operations.',
    'No allowance has been made for protection of installed joinery following installation completion. Protection, maintenance, and care of installed works shall be by others.',
    'Compliance with all relevant Health and Safety at Work Act 2015 requirements during manufacture, delivery, and installation activities.',
    'Environmentally responsible work practices including waste minimization and recycling where practical.',
    'Where applicable, works will be undertaken in accordance with the relevant project Green Star requirements, including the use of certified sustainable materials, low-VOC products, and contributing to the project\'s overall sustainability targets.',
    'Final cleaning of installed works prior to handover.',
    'Handover of completed works including relevant documentation and certifications where applicable.',
    'Rectification of defects identified during the agreed defects liability period in accordance with contract conditions.'
  ];

  scopeItems.forEach((item) => {
    // Bullet point
    doc.text('•', 15, currentY);
    
    // Split text for word wrap
    const splitText = doc.splitTextToSize(item, pageWidth - 30);
    doc.text(splitText, 22, currentY);
    
    // Calculate next Y position
    const lineHeight = splitText.length * 5;
    currentY += lineHeight + 1; // Slight gap between items

    // Check for page break
    if (currentY > pageHeight - 30) {
      addFooter(doc);
      doc.addPage();
      currentY = 25;
      // Re-add logo if needed on new page
    }
  });

  // Footer helper
  function addFooter(docInstance) {
    const footerY = pageHeight - 25;
    docInstance.setDrawColor(...redColor);
    docInstance.setLineWidth(0.5);
    docInstance.line(10, footerY, pageWidth - 10, footerY);
    
    docInstance.setTextColor(...blackColor);
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(8);
    docInstance.text('VSP Interiors', 10, footerY + 5);
    
    docInstance.setFont('helvetica', 'normal');
    const footerSubY = footerY + 9;
    docInstance.text('Address: 36 Parkway Drive, Rosedale, Auckland', 10, footerSubY);
    docInstance.setTextColor(25, 118, 210);
    docInstance.text('Email: info@vspinteriors.co.nz', 10, footerSubY + 4);
    
    docInstance.setTextColor(...blackColor);
    docInstance.text('Phone: (09) 442 2588', pageWidth - 60, footerY + 5);
    docInstance.text('Fax: (09) 442 2585', pageWidth - 60, footerY + 9);
    docInstance.setTextColor(25, 118, 210);
    docInstance.text('Web: www.vspinteriors.co.nz', pageWidth - 60, footerSubY + 4);
  }

  addFooter(doc);
};
