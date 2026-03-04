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
 * Generates the cover page for the Tender Submission
 * @param {jsPDF} doc - jsPDF instance
 * @param {Object} project - Project data object
 */
export const generateCoverPage = async (doc, project) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const blackColor = [0, 0, 0];
  const redColor = [220, 20, 60]; // #dc143c
  const yellowHighlight = [255, 255, 0];

  // Logo Section (Centered at Top)
  try {
    const logoDataURL = await loadImageAsDataURL('/logo.png');
    const logoWidth = 80;
    const logoHeight = 30;
    doc.addImage(logoDataURL, 'PNG', (pageWidth - logoWidth) / 2, 25, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo image for cover page:', error);
    doc.setTextColor(...redColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.text('VSP Interiors', pageWidth / 2, 40, { align: 'center' });
  }

  let currentY = 75;

  // Tender Submission Heading
  doc.setTextColor(...blackColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TENDER SUBMISSION', pageWidth / 2, currentY, { align: 'center' });

  // Sub-heading
  currentY += 12;
  doc.setFontSize(18);
  doc.text('INTERIOR JOINERY | CABINETRY |', pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;
  doc.text('SHOPFITTING WORKS', pageWidth / 2, currentY, { align: 'center' });

  // Red horizontal line
  currentY += 8;
  doc.setDrawColor(...redColor);
  doc.setLineWidth(1);
  doc.line(40, currentY, pageWidth - 40, currentY);

  // Project Section
  currentY += 25;
  doc.setFontSize(20);
  doc.text('PROJECT', pageWidth / 2, currentY, { align: 'center' });

  // Project Name (with highlight effect simulation)
  currentY += 12;
  const projectName = (project.projectName || '[PROJECT NAME]').toUpperCase();
  doc.setFontSize(16);
  
  // Highlight box
  const projectNameWidth = doc.getTextWidth(projectName);
  doc.setFillColor(...yellowHighlight);
  doc.rect((pageWidth - projectNameWidth) / 2 - 2, currentY - 6, projectNameWidth + 4, 8, 'F');
  
  doc.setTextColor(...blackColor);
  doc.text(projectName, pageWidth / 2, currentY, { align: 'center' });

  // Project Location (with highlight)
  currentY += 10;
  const siteLocation = (project.siteLocation || '[PROJECT LOCATION]').toUpperCase();
  doc.setFontSize(14);
  
  const siteLocationWidth = doc.getTextWidth(siteLocation);
  doc.setFillColor(...yellowHighlight);
  doc.rect((pageWidth - siteLocationWidth) / 2 - 2, currentY - 5, siteLocationWidth + 4, 7, 'F');
  
  doc.setTextColor(...blackColor);
  doc.text(siteLocation, pageWidth / 2, currentY, { align: 'center' });

  // Submitted To Section
  currentY += 25;
  doc.setFontSize(14);
  doc.text('SUBMITTED TO:', pageWidth / 2, currentY, { align: 'center' });

  currentY += 10;
  const clientName = (project.client?.companyName || '[CLIENT NAME]').toUpperCase();
  doc.setFontSize(16);
  
  const clientNameWidth = doc.getTextWidth(clientName);
  doc.setFillColor(...yellowHighlight);
  doc.rect((pageWidth - clientNameWidth) / 2 - 2, currentY - 6, clientNameWidth + 4, 8, 'F');
  
  doc.setTextColor(...blackColor);
  doc.text(clientName, pageWidth / 2, currentY, { align: 'center' });

  // Submission Date Section
  currentY += 25;
  doc.setFontSize(14);
  doc.text('SUBMISSION DATE:', pageWidth / 2, currentY, { align: 'center' });

  currentY += 10;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-NZ', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  }).toUpperCase();
  doc.setFontSize(16);
  
  const dateStrWidth = doc.getTextWidth(dateStr);
  doc.setFillColor(...yellowHighlight);
  doc.rect((pageWidth - dateStrWidth) / 2 - 2, currentY - 6, dateStrWidth + 4, 8, 'F');
  
  doc.setTextColor(...blackColor);
  doc.text(dateStr, pageWidth / 2, currentY, { align: 'center' });

};
