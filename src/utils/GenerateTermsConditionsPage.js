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
 * Generates Terms & Conditions page for tender template
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

  // Logo on Page 4 (Top Right)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 40;
    const logoHeight = 15;
    doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo on page 4:', error);
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
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions (Summary)', pageWidth / 2, currentY, { align: 'center' });

  currentY += 12;

  // Terms and Conditions content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const terms = [
    {
      title: 'Tender Validity:',
      description: '90 calendar days from submission.'
    },
    {
      title: 'Payment:',
      description: 'Payment is due on the 20th of the month following the date of the progress claim, in accordance with the Construction Contracts Act 2002 (CAA). Ownership of materials, goods, and installed items remains with VSP Interiors Limited until full payment is received. Failure to pay may result in work suspension.'
    },
    {
      title: 'Retentions:',
      description: 'Retention applies only if agreed during contract negotiation, not exceeding 5% of the total contract value. 50% released at Practical Completion and the balance upon final completion or expiry of the defect\'s liability period (typically 12 months). If retention is not negotiated, NIL retention applies.'
    },
    {
      title: 'Liquidated Damages:',
      description: 'Liquidated Damages (LDs) shall not apply to this contract unless otherwise agreed. VSP Interiors Limited is not liable for penalties, consequential loss, or damages from delays, except where specifically agreed. Delays from variations, site access restrictions, third-party contractor delays, weather events, or events beyond VSP Interiors Limited\'s reasonable control do not give rise to claims for damages or penalties.'
    },
    {
      title: 'Variations:',
      description: 'All variations must be instructed in writing and agreed before commencement of the affected works. Pricing is based on time, material, or agreed unit rates, and delays in approvals may impact program and cost.'
    },
    {
      title: 'Defects Liability:',
      description: 'A 12-month Defects Liability Period applies from the date of Practical Completion, during which VSP Interiors will rectify identified and agreed joinery defects at no cost.'
    },
    {
      title: 'Insurance:',
      description: 'Public Liability cover of $10 million and Contract Works insurance (if applicable) provided.'
    },
    {
      title: 'Health & Safety:',
      description: 'All work will be undertaken in accordance with the Health and Safety at Work Act 2015 and relevant site safety requirements.'
    },
    {
      title: 'Dispute Resolution:',
      description: 'Disputes shall be resolved in accordance with the Construction Contracts Act 2002 or by other mutually agreed processes.'
    },
    {
      title: 'Site Access & Conditions:',
      description: 'The client must provide reasonable site access and ensure the site is in a suitable condition for the work to proceed. Full terms are attached or available upon request.'
    },
    {
      title: 'Programme & Lead Time:',
      description: 'The final program is to be confirmed following award and approval of shop drawings. Lead time for manufacture is typically 3-4 weeks from final sign-off, subject to workload and material availability.'
    },
    {
      title: 'Dispute Resolution:',
      description: 'Any dispute or difference arising under the contract shall be resolved in accordance with the Construction Contracts Act 2002, or where appropriate, through negotiation, mediation, or adjudication under the CCA framework.'
    }
  ];

  for (const term of terms) {
    // Check if we need a new page
    if (currentY > pageHeight - 70) {
      doc.addPage();
      currentY = 10;
      
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

    // Title (bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(term.title, 10, currentY);
    currentY += 5;

    // Description (normal, with text wrapping)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const descriptionLines = doc.splitTextToSize(term.description, pageWidth - 20);
    doc.text(descriptionLines, 10, currentY);
    currentY += descriptionLines.length * 3.5 + 4;
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

