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
 * Generates General Inclusions page for tender template
 * @param {jsPDF} doc - The jsPDF document instance
 */
export const generateGeneralInclusionsPage = async (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const blackColor = [0, 0, 0];
  const redColor = [220, 20, 60];

  // Add new page
  doc.addPage();
  let currentY = 15;

  // Logo on Page 5 (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on page 5:', error);
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
  doc.text('General Inclusions:', 10, currentY);

  currentY += 12;

  // General Inclusions content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const inclusions = [
    'Preparation and approval of shop drawings based on the architectural drawings.',
    'Detailed site measurement and verification to confirm dimensions and installation conditions.',
    'Providing sample panels, finishes, or hardware mock-ups for client approval prior to full production.',
    'Manufacture of all kitchen cabinetry and custom joinery in accordance with approved shop drawings and specifications.',
    'Cabinet carcasses to be constructed using 16.3mm standard gloss white low-pressure laminate (LPL) on standard non-resistant MDF substrate, with standard 600mm depth, unless otherwise specified.',
    'Exposed cabinetry panels (including end panels, drawer fronts, doors, under panels, and closer panels/pelmets) to be manufactured in 18.3mm standard Melteca range low-pressure laminate (LPL) on standard non-resistant MDF substrate with matching PVC edge banding, unless alternative materials or finishes are specified.',
    'Supply of premium hardware – Doors and Doors (e.g., Blum, Hafele, Hettich, or project-specified alternatives).',
    'Quality assurance checks at all key stages, including post-manufacture, pre-delivery, and post-installation, to ensure compliance with project specifications, approved plans, relevant requirements, and the New Zealand Building Code.',
    'Coordination and delivery of all manufactured items to the site (horizontal delivery only).',
    'Coordination of services integration, including plumbing, electrical, and appliance installations where required.',
    'Professional installation of all joinery and cabinetry components by skilled installers.',
    'Coordination and communication with other trades to ensure smooth installation and minimal disruption.',
    'Verification that all cabinet levels, alignments, and gaps meet specified tolerances and quality standards.',
    'Compliance with all relevant health and safety standards during manufacture, delivery, and installation - Health and Safety at Work Act 2015 and site-specific safety protocols.',
    'Final cleaning of installed works prior to handover.',
    'Handover of completed works with all necessary documentation and certifications.',
    'Rectification of any defects identified during the agreed defects liability period in accordance with the contract terms.',
    'Compliance with environmental standards for waste disposal and recycling where practical.',
    'Where applicable, works will be undertaken in accordance with the relevant project Green Star requirements, including the use of certified sustainable materials, low-VOC products, and contributing to the project\'s overall sustainability targets.',
    'Provide operating manuals, PS3, and maintenance guides for hardware and finishes.',
    'Client final sign-off to confirm completion and satisfaction with the work.'
  ];

  for (const inclusion of inclusions) {
    // Check if we need a new page
    if (currentY > pageHeight - 80) {
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
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('•', 10, currentY);
    
    // Text with wrapping
    const textLines = doc.splitTextToSize(inclusion, pageWidth - 25);
    doc.text(textLines, 20, currentY);
    currentY += textLines.length * 4 + 4;
  }

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

