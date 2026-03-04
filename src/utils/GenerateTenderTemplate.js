"use client";

import jsPDF from "jspdf";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { generateProjectOverviewPage } from "./GenerateProjectOverviewPage";
import { generateGeneralExclusionsPage } from "./GenerateGeneralExclusionsPage";
import { generateTermsConditionsPage } from "./GenerateTermsConditionsPage";
import { generateCoverPage } from "./GenerateCoverPage";
import { generateScopeOfWorksPage } from "./GenerateScopeOfWorksPage";


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
    
    // ==================== PAGE 1: COVER PAGE ====================
    await generateCoverPage(doc, project);
    doc.addPage();

    // Colors
    const blackColor = [0, 0, 0];
    const redColor = [220, 20, 60]; // #dc143c for red accents
    const whiteColor = [255, 255, 255];
    const yellowHighlight = [255, 255, 0];

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

    // Date with Highlight
    const dateLabel = "Date: ";
    const dateTextWidth = doc.getTextWidth(dateStr);
    doc.text(dateLabel, 10, currentY);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + doc.getTextWidth(dateLabel), currentY - 4, dateTextWidth + 2, 6, 'F');
    doc.text(dateStr, 10 + doc.getTextWidth(dateLabel) + 1, currentY);
    
    currentY += 6;
    
    // To (Client) with Highlight
    const toLabel = "To: ";
    const clientName = project.client?.companyName || '[Client Name]';
    const clientWidth = doc.getTextWidth(clientName);
    doc.text(toLabel, 10, currentY);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + doc.getTextWidth(toLabel), currentY - 4, clientWidth + 2, 6, 'F');
    doc.text(clientName, 10 + doc.getTextWidth(toLabel) + 1, currentY);

    currentY += 6;
    
    // Project Name with Highlight
    const subjectLabel = "Project Name: ";
    const projectName = project.projectName || '[Project Name]';
    const projectWidth = doc.getTextWidth(projectName);
    doc.text(subjectLabel, 10, currentY);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + doc.getTextWidth(subjectLabel), currentY - 4, projectWidth + 2, 6, 'F');
    doc.text(projectName, 10 + doc.getTextWidth(subjectLabel) + 1, currentY);

    currentY += 6;
    
    // Location with Highlight
    const locationLabel = "Project Location: ";
    const siteLocation = project.siteLocation || '[Site Address]';
    const locWidth = doc.getTextWidth(siteLocation);
    doc.text(locationLabel, 10, currentY);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + doc.getTextWidth(locationLabel), currentY - 4, locWidth + 2, 6, 'F');
    doc.text(siteLocation, 10 + doc.getTextWidth(locationLabel) + 1, currentY);

    currentY += 6;
    
    // Tender Reference with Highlight
    const refLabel = "Tender Reference: ";
    const revision = project.revision !== undefined ? ` (REV ${project.revision})` : "";
    const tenderRef = (project.id ? `TENDER-${project.id}` : '[TENDER NUMBER]') + revision;
    const refWidth = doc.getTextWidth(tenderRef);
    doc.text(refLabel, 10, currentY);
    doc.setFillColor(...yellowHighlight);
    doc.rect(10 + doc.getTextWidth(refLabel), currentY - 4, refWidth + 2, 6, 'F');
    doc.text(tenderRef, 10 + doc.getTextWidth(refLabel) + 1, currentY);

    // ==================== LETTER BODY ====================
    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tender Submission Letter', 10, currentY);
    
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Dear Tender Evaluation Team,', 10, currentY);
    
    currentY += 10;
    const bodyText1 = 'VSP Interiors Limited is pleased to submit our subcontract tender for the Interior Joinery, Cabinetry, and Shopfitting Works for the above project in response to your invitation to tender.';
    const splitText1 = doc.splitTextToSize(bodyText1, pageWidth - 20);
    doc.text(splitText1, 10, currentY);
    currentY += splitText1.length * 5 + 6;

    const bodyText2 = 'VSP Interiors Limited, established in 2012, is an Auckland-based specialist contractor providing manufacture, supply, and installation of interior joinery solutions across commercial, healthcare, education, retail, and residential sectors throughout New Zealand.';
    // Bold "2012"
    const splitText2 = doc.splitTextToSize(bodyText2, pageWidth - 20);
    doc.text(splitText2, 10, currentY);
    currentY += splitText2.length * 5 + 6;

    const bodyText3 = 'This submission has been prepared in accordance with the issued drawings, specifications, and tender documentation. VSP Interiors Limited confirms that it has the capability, resources, and manufacturing capacity required to successfully deliver the works in alignment with the project programme and quality requirements.';
    const splitText3 = doc.splitTextToSize(bodyText3, pageWidth - 20);
    doc.text(splitText3, 10, currentY);
    currentY += splitText3.length * 5 + 6;

    const bodyText4 = 'The company is led by experienced industry professionals with extensive backgrounds in cabinet making, project management, and commercial construction delivery.';
    const splitText4 = doc.splitTextToSize(bodyText4, pageWidth - 20);
    doc.text(splitText4, 10, currentY);
    currentY += splitText4.length * 5 + 6;

    const bodyText5 = 'We appreciate the opportunity to tender and look forward to the opportunity to work collaboratively with your team to successfully deliver this project.';
    const splitText5 = doc.splitTextToSize(bodyText5, pageWidth - 20);
    doc.text(splitText5, 10, currentY);
    currentY += splitText5.length * 5 + 10;

    // ==================== SIGNATURE BLOCK ====================
    doc.text('Yours sincerely,', 10, currentY);
    currentY += 10;
    
    // Space for signature image (if exists) or just line
    try {
      // If you have a signature image file, you can add it here
      // const sigDataURL = await loadImageAsDataURL('/signature.png');
      // doc.addImage(sigDataURL, 'PNG', 10, currentY, 30, 15);
      // currentY += 20;
    } catch(e) {}

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Vishal Prasad', 10, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('Director – VSP Interiors Limited', 10, currentY);
    currentY += 5;
    doc.text('021 183 9151', 10, currentY);
    currentY += 5;
    doc.setTextColor(25, 118, 210);
    doc.text('vishal@vspinteriors.co.nz', 10, currentY);

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

    // ==================== PAGE 3: PROJECT OVERVIEW, TENDER SUM & PRICING BREAKDOWN ====================
    await generateProjectOverviewPage(doc, project);

    // ==================== PAGE 4: SCOPE OF WORKS ====================
    await generateScopeOfWorksPage(doc);

    // ==================== PAGE 5: EXCLUSIONS, HSE & TERMS (SUMMARY) ====================
    await generateGeneralExclusionsPage(doc);

    // ==================== PAGE 6: TERMS & CONDITIONS (CONTINUED) ====================
    await generateTermsConditionsPage(doc);

    
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

