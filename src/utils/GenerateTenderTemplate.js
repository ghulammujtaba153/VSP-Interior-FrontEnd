"use client";

import jsPDF from "jspdf";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { generateProjectOverviewPage } from "./GenerateProjectOverviewPage";
import { generatePricingBreakdownPage } from "./GeneratePricingBreakdownPage";
import { generateTermsConditionsPage } from "./GenerateTermsConditionsPage";
import { generateGeneralInclusionsPage } from "./GenerateGeneralInclusionsPage";
import { generateGeneralExclusionsPage } from "./GenerateGeneralExclusionsPage";

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
 * Generates a Tender Submission PDF document
 * @param {number} projectId - Project ID to fetch project data
 */
export const GenerateTenderTemplate = async (projectId) => {
  if (!projectId) {
    toast.error('Project ID is required');
    return;
  }

  try {
    toast.loading('Generating tender template...');

    // Fetch project data
    const res = await axios.get(`${BASE_URL}/api/project-setup/get/${projectId}`);
    const project = res.data.data;

    if (!project) {
      toast.dismiss();
      toast.error('Project not found');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors
    const blackColor = [0, 0, 0];
    const redColor = [220, 20, 60]; // #dc143c for red accents
    const whiteColor = [255, 255, 255];

    let currentY = 15;

    // ==================== HEADER SECTION ====================
    
    // Company Contact Information (Top Left)
    doc.setTextColor(...blackColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('VSP Interiors Limited', 10, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    currentY += 5;
    doc.text('36 Parkway Drive, Rosedale, Auckland, New Zealand 0632', 10, currentY);
    currentY += 5;
    doc.setTextColor(25, 118, 210); // Blue color for links
    doc.text('Phone: (09) 442 2588 or 021 183 9151', 10, currentY);
    currentY += 5;
    doc.text('Email: vishal@vspinteriors.co.nz', 10, currentY);
    currentY += 5;
    doc.text('Website: www.vspinteriors.co.nz', 10, currentY);

    // Logo Section (Top Right)
    try {
      const logoDataURL = await loadImageAsDataURL('/logo.png');
      const logoWidth = 40;
      const logoHeight = 15;
      doc.addImage(logoDataURL, 'PNG', pageWidth - logoWidth - 10, 10, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Failed to load logo image, using text fallback:', error);
      // Fallback to text if image fails to load
      doc.setTextColor(...redColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('VSP', pageWidth - 40, 15);
      doc.setFontSize(12);
      doc.setTextColor(...blackColor);
      doc.text('Interiors', pageWidth - 40, 22);
    }

    // ==================== TENDER SUBMISSION HEADING ====================
    doc.setTextColor(...blackColor);
    currentY = 45;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TENDER SUBMISSION', 10, currentY);

    // ==================== TENDER DETAILS ====================
    currentY += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-NZ', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    doc.text(`Date: ${dateStr}`, 10, currentY);
    currentY += 6;
    
    const clientName = project.client?.companyName || '[Client Name]';
    doc.text(`To: ${clientName}`, 10, currentY);
    currentY += 6;
    
    const projectName = project.projectName || '[Project Name]';
    doc.text(`Subject: Tender Submission – ${projectName}`, 10, currentY);
    currentY += 6;
    
    const siteLocation = project.siteLocation || '[Site Address]';
    doc.text(`Project Location: ${siteLocation}`, 10, currentY);
    currentY += 6;
    
    const tenderRef = project.id ? `TENDER-${project.id}` : '[TENDER NUMBER OR QUOTATION NUMBER]';
    doc.text(`Tender Reference: ${tenderRef}`, 10, currentY);

    // ==================== LETTER BODY ====================
    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tender Submission Letter', 10, currentY);
    
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Dear Sir/Madam,', 10, currentY);
    
    currentY += 8;
    const bodyText1 = 'On behalf of VSP Interiors Limited, we are pleased to submit our formal tender for the above project. We offer more than competitive pricing — we deliver reliability, quality, and peace of mind.';
    const splitText1 = doc.splitTextToSize(bodyText1, pageWidth - 20);
    doc.text(splitText1, 10, currentY);
    currentY += splitText1.length * 5 + 5;

    const bodyText2 = 'As a specialist manufacturer and installer of bespoke kitchens and architectural joinery, we understand that fit-out work defines the final impression of any building. We take this responsibility seriously — which is why some of New Zealand\'s most respected builders and developers rely on us to deliver projects that are visually exceptional, on schedule, and to the highest standards.';
    const splitText2 = doc.splitTextToSize(bodyText2, pageWidth - 20);
    doc.text(splitText2, 10, currentY);
    currentY += splitText2.length * 5 + 5;

    const bodyText3 = 'Founded on strong trade principles and sharp business systems, we provide complete in-house control of the joinery process — from shop drawings and CNC production to edge-banding, finishing, delivery, site installation, and quality assurance. Our workshop and skilled team are structured to manage multiple projects simultaneously, with short lead times. We routinely deliver:';
    const splitText3 = doc.splitTextToSize(bodyText3, pageWidth - 20);
    doc.text(splitText3, 10, currentY);
    currentY += splitText3.length * 5 + 5;

    // ==================== SERVICES LIST ====================
    currentY += 3;
    const services = [
      'Kitchens, vanities, laundry, wardrobes, office, and retail joinery',
      'Engineered stone benchtops, laminate tops, solid surface, and timber benchtop solutions',
      'Public sector works (schools, aged care), commercial apartments, and high-end homes'
    ];

    services.forEach((service) => {
      doc.text('•', 15, currentY);
      const serviceText = doc.splitTextToSize(service, pageWidth - 25);
      doc.text(serviceText, 20, currentY);
      currentY += serviceText.length * 5;
    });

    // ==================== CONCLUDING STATEMENT ====================
    currentY += 5;
    const concludingText = 'All production is managed through integrated systems for traceability, accuracy, and delivery control.';
    const splitConcluding = doc.splitTextToSize(concludingText, pageWidth - 20);
    doc.text(splitConcluding, 10, currentY);
    currentY += splitConcluding.length * 5 + 10;

    // ==================== SIGNATURE BLOCK ====================
    doc.text('Yours faithfully,', 10, currentY);
    currentY += 15;
    
    // Signature line (stylized - just a line for now)
    doc.setLineWidth(0.5);
    doc.line(10, currentY, 50, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Vishal Prasad', 10, currentY);
    currentY += 5;
    doc.text('Director', 10, currentY);
    currentY += 5;
    doc.text('VSP Interiors Limited', 10, currentY);

    // ==================== FOOTER SECTION ====================
    const footerY = pageHeight - 25;
    
    // Red horizontal line
    doc.setDrawColor(...redColor);
    doc.setLineWidth(0.5);
    doc.line(10, footerY, pageWidth - 10, footerY);
    
    // Footer content
    currentY = footerY + 5;
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('VSP Interiors', 10, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Address: 36 Parkway Drive, Rosedale, Auckland', 10, currentY + 4);
    doc.setTextColor(25, 118, 210);
    doc.text('Email: info@vspinteriors.co.nz', 10, currentY + 8);
    
    // Right side footer
    doc.setTextColor(...blackColor);
    doc.text('Phone: (09) 442 2588', pageWidth - 60, currentY);
    doc.text('Fax: (09) 442 2585', pageWidth - 60, currentY + 4);
    doc.setTextColor(25, 118, 210);
    doc.text('Web: www.vspinteriors.co.nz', pageWidth - 60, currentY + 8);

    // ==================== PAGE 2: PROJECT OVERVIEW AND SCOPE ====================
    await generateProjectOverviewPage(doc, project);

    // ==================== PAGE 3: TENDER PRICING BREAKDOWN ====================
    await generatePricingBreakdownPage(doc);

    // ==================== PAGE 4: TERMS & CONDITIONS ====================
    await generateTermsConditionsPage(doc);

    // ==================== PAGE 5: GENERAL INCLUSIONS ====================
    await generateGeneralInclusionsPage(doc);

    // ==================== PAGE 6: GENERAL EXCLUSIONS & HEALTH, SAFETY & ENVIRONMENT ====================
    await generateGeneralExclusionsPage(doc);

    
    // Save the PDF
    const fileName = `Tender_Submission_${projectName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.dismiss();
    toast.success('Tender template generated successfully');

  } catch (error) {
    console.error('Error generating tender template:', error);
    toast.dismiss();
    toast.error('Error generating tender template: ' + (error.response?.data?.message || error.message));
  }
};

