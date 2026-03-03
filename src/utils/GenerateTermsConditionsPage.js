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
 * Generates Terms & Conditions Continued page
 * @param {jsPDF} doc - The jsPDF document instance
 */
export const generateTermsConditionsPage = async (doc) => {
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
    console.warn('Failed to load logo on T&C page:', error);
  }

  // Top continuation text (from Payment term)
  doc.setTextColor(...blackColor); // Use a slightly lighter gray if needed to match image, but black is standard
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const topText = 'of a valid payment claim unless otherwise agreed in writing. Ownership of goods remains with VSP Interiors Limited until full payment is received.';
  const splitTopText = doc.splitTextToSize(topText, pageWidth - 30);
  doc.text(splitTopText, 22, currentY);
  currentY += splitTopText.length * 5 + 2;

  const terms = [
    {
      label: 'Retentions:',
      text: 'Retention will only apply if agreed during contract negotiation. Unless otherwise agreed in writing, retention shall not exceed 5% of the total contract value, with half released at practical completion and the balance upon final completion or expiry of the defects liability period (typically 12 months). If retention is not negotiated, NIL retention applies.'
    },
    {
      label: 'Variations:',
      text: 'All variations must be instructed and agreed in writing prior to commencement of varied works. Verbal instructions shall not constitute approval.'
    },
    {
      label: 'Programme:',
      text: 'Pricing is based on reasonable and uninterrupted access in accordance with the agreed construction programme. Delays, resequencing, or return visits caused by others may constitute a variation adjustment.'
    },
    {
      label: 'Liquidated Damages:',
      text: 'Unless otherwise agreed in writing prior to contract execution, Liquidated Damages shall not apply to this contract. VSP Interiors Limited shall not be liable for any penalties, consequential loss, or damages arising from delays in completion except where specifically agreed in writing. Delays resulting from variations, site access restrictions, third-party contractor delays, or events beyond VSP Interiors Limited\'s reasonable control shall not give rise to claims for damages or penalties.'
    },
    {
      label: 'Defects Liability:',
      text: '12 months from Practical Completion.'
    },
    {
      label: 'Insurance:',
      text: 'Public Liability Insurance maintained at $10 million; Contract Works insurance (if applicable) provided.'
    },
    {
      label: 'Suspension of Works:',
      text: 'VSP Interiors Limited reserves the right to suspend works in accordance with the Construction Contracts Act 2002 for non-payment.'
    },
    {
      label: 'Dispute Resolution:',
      text: 'Any disputes shall be resolved in accordance with the Construction Contracts Act 2002 or by other mutually agreed processes.'
    },
    {
      label: 'Health & Safety:',
      text: 'All works will be undertaken in accordance with the Health and Safety at Work Act 2015 and relevant site safety requirements.'
    },
    {
      label: 'Site Access & Conditions:',
      text: 'The client shall provide reasonable site access and ensure the site is in a suitable condition for the works to proceed. Full terms attached or available upon request.'
    }
  ];

  terms.forEach((term) => {
    // Bullet point
    doc.text('•', 15, currentY);
    
    // Label (Bold)
    doc.setFont('helvetica', 'bold');
    doc.text(term.label, 22, currentY);
    
    // Description (Normal)
    doc.setFont('helvetica', 'normal');
    const labelWidth = doc.getTextWidth(term.label);
    const splitText = doc.splitTextToSize(term.text, pageWidth - 30 - labelWidth);
    doc.text(splitText, 22 + labelWidth + 1, currentY);
    
    currentY += splitText.length * 5 + 2;
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
