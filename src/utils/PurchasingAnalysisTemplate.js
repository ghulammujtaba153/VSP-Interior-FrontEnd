"use client";

import jsPDF from "jspdf";

export const PurchasingAnalysisTemplate = (statsData) => {
    
  const generatePDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Colors - using direct RGB values
      const primaryColor = { r: 25, g: 118, b: 210 }; // Primary blue
      const darkGray = { r: 51, g: 51, b: 51 };
      const lightGray = { r: 217, g: 217, b: 217 };
      const white = { r: 255, g: 255, b: 255 };
      const successGreen = { r: 46, g: 125, b: 50 };
      const warningOrange = { r: 237, g: 108, b: 2 };

      // Helper function to add logo
      const addLogo = () => {
        return new Promise((resolve) => {
          try {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            
            const timeout = setTimeout(() => {
              // If logo doesn't load within 2 seconds, continue without it
              currentY += 5;
              resolve();
            }, 2000);
            
            logoImg.onload = () => {
              clearTimeout(timeout);
              try {
                const logoWidth = 40;
                const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
                doc.addImage(logoImg, 'PNG', margin, currentY, logoWidth, logoHeight);
                currentY += logoHeight + 5;
              } catch (err) {
                console.log('Error adding logo to PDF:', err);
              }
              resolve();
            };
            
            logoImg.onerror = () => {
              clearTimeout(timeout);
              currentY += 5;
              resolve();
            };
            
            // Try to load logo from public folder
            logoImg.src = '/logo.png';
          } catch (error) {
            console.log('Logo not found, continuing without logo');
            currentY += 5;
            resolve();
          }
        });
      };

      // Header Section
      const drawHeader = () => {
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(white.r, white.g, white.b);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PURCHASING ANALYSIS REPORT', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-AU', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, pageWidth / 2, 22, { align: 'center' });
        
        currentY = 30;
      };

      // Summary Section
      const drawSummarySection = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', margin, currentY);
        currentY += 8;

        const summary = statsData?.summary || {};
        const boxWidth = (pageWidth - 2 * margin - 10) / 4;
        const boxHeight = 18;
        const spacing = 8;

        // Total Orders
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'F');
        doc.setTextColor(white.r, white.g, white.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Orders', margin + boxWidth / 2, currentY + 5.5, { align: 'center' });
        doc.setFontSize(12);
        doc.text((summary.totalOrders || 0).toString(), margin + boxWidth / 2, currentY + 13, { align: 'center' });

        // Total Spend
        doc.setFillColor(successGreen.r, successGreen.g, successGreen.b);
        doc.roundedRect(margin + boxWidth + spacing, currentY, boxWidth, boxHeight, 2, 2, 'F');
        doc.setFontSize(8);
        doc.text('Total Spend', margin + boxWidth + spacing + boxWidth / 2, currentY + 5.5, { align: 'center' });
        doc.setFontSize(12);
        const totalSpend = parseFloat(summary.totalSpend || 0);
        doc.text(`$${totalSpend.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
          margin + boxWidth + spacing + boxWidth / 2, currentY + 13, { align: 'center' });

        // Avg Order Value
        doc.setFillColor(warningOrange.r, warningOrange.g, warningOrange.b);
        doc.roundedRect(margin + 2 * (boxWidth + spacing), currentY, boxWidth, boxHeight, 2, 2, 'F');
        doc.setFontSize(8);
        doc.text('Avg Order Value', margin + 2 * (boxWidth + spacing) + boxWidth / 2, currentY + 5.5, { align: 'center' });
        doc.setFontSize(12);
        const avgOrderValue = parseFloat(summary.avgOrderValue || 0);
        doc.text(`$${avgOrderValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
          margin + 2 * (boxWidth + spacing) + boxWidth / 2, currentY + 13, { align: 'center' });

        // Status Types
        doc.setFillColor(darkGray.r, darkGray.g, darkGray.b);
        doc.roundedRect(margin + 3 * (boxWidth + spacing), currentY, boxWidth, boxHeight, 2, 2, 'F');
        doc.setFontSize(8);
        doc.text('Status Types', margin + 3 * (boxWidth + spacing) + boxWidth / 2, currentY + 5.5, { align: 'center' });
        doc.setFontSize(12);
        doc.text((summary.statusCounts?.length || 0).toString(), 
          margin + 3 * (boxWidth + spacing) + boxWidth / 2, currentY + 13, { align: 'center' });

        currentY += boxHeight + 10;
      };

      // Status Breakdown Table
      const drawStatusTable = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Status Breakdown', margin, currentY);
        currentY += 8;

        const statusCounts = statsData?.summary?.statusCounts || [];
        if (statusCounts.length > 0) {
          // Table Header
          doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
          doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Status', margin + 5, currentY + 5.5);
          doc.text('Count', pageWidth - margin - 30, currentY + 5.5);
          currentY += 8;

          // Table Rows
          statusCounts.forEach((status, idx) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
            }

            if (idx % 2 === 0) {
              doc.setFillColor(white.r, white.g, white.b);
            } else {
              doc.setFillColor(245, 245, 245);
            }
            doc.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(status.status || 'N/A', margin + 5, currentY + 4.5);
            doc.text((status.count || 0).toString(), pageWidth - margin - 30, currentY + 4.5);
            currentY += 7;
          });
        } else {
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('No status data available', margin + 5, currentY);
          currentY += 7;
        }

        currentY += 10;
      };

      // Top Suppliers Table
      const drawTopSuppliers = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top 5 Suppliers by Spend', margin, currentY);
        currentY += 8;

        const topSuppliers = statsData?.topSuppliers || [];
        if (topSuppliers.length > 0) {
          // Table Header
          doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
          doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Supplier', margin + 5, currentY + 5.5);
          doc.text('Total Spend', margin + 80, currentY + 5.5);
          doc.text('Orders', margin + 130, currentY + 5.5);
          doc.text('Avg Value', pageWidth - margin - 40, currentY + 5.5);
          currentY += 8;

          // Table Rows
          topSuppliers.forEach((supplier, idx) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
            }

            if (idx % 2 === 0) {
              doc.setFillColor(white.r, white.g, white.b);
            } else {
              doc.setFillColor(245, 245, 245);
            }
            doc.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const supplierName = supplier.suppliers?.name || 'Unknown';
            doc.text(supplierName.length > 25 ? supplierName.substring(0, 22) + '...' : supplierName, margin + 5, currentY + 4.5);
            
            const totalSpend = parseFloat(supplier.totalSpend || 0);
            doc.text(`$${totalSpend.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, margin + 80, currentY + 4.5);
            
            doc.text((supplier.totalOrders || 0).toString(), margin + 130, currentY + 4.5);
            
            const avgValue = totalSpend / (parseInt(supplier.totalOrders) || 1);
            doc.text(`$${avgValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, pageWidth - margin - 40, currentY + 4.5);
            currentY += 7;
          });
        } else {
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('No supplier data available', margin + 5, currentY);
          currentY += 7;
        }

        currentY += 10;
      };

      // Project Spend Table
      const drawProjectSpend = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Project-wise Spend Analysis', margin, currentY);
        currentY += 8;

        const projectSpend = statsData?.projectSpend || [];
        if (projectSpend.length > 0) {
          // Table Header
          doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
          doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Project Name', margin + 5, currentY + 5.5);
          doc.text('Client', margin + 80, currentY + 5.5);
          doc.text('Total Spent', pageWidth - margin - 50, currentY + 5.5);
          currentY += 8;

          // Table Rows
          projectSpend.forEach((project, idx) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
            }

            if (idx % 2 === 0) {
              doc.setFillColor(white.r, white.g, white.b);
            } else {
              doc.setFillColor(245, 245, 245);
            }
            doc.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const projectName = project.projectName || 'General Stock';
            doc.text(projectName.length > 30 ? projectName.substring(0, 27) + '...' : projectName, margin + 5, currentY + 4.5);
            
            const clientName = project.project?.client?.companyName || 'N/A';
            doc.text(clientName.length > 25 ? clientName.substring(0, 22) + '...' : clientName, margin + 80, currentY + 4.5);
            
            const totalSpent = parseFloat(project.totalSpent || 0);
            doc.text(`$${totalSpent.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, pageWidth - margin - 50, currentY + 4.5);
            currentY += 7;
          });
        } else {
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('No project spend data available', margin + 5, currentY);
          currentY += 7;
        }

        currentY += 10;
      };

      // Monthly Trend Table
      const drawMonthlyTrend = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Spend Trend (Last 6 Months)', margin, currentY);
        currentY += 8;

        const monthlyTrend = statsData?.monthlyTrend || [];
        if (monthlyTrend.length > 0) {
          // Table Header
          doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
          doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Month', margin + 5, currentY + 5.5);
          doc.text('Monthly Spend', margin + 60, currentY + 5.5);
          doc.text('Orders', margin + 120, currentY + 5.5);
          doc.text('Avg Value', pageWidth - margin - 50, currentY + 5.5);
          currentY += 8;

          // Table Rows
          monthlyTrend.forEach((month, idx) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
            }

            if (idx % 2 === 0) {
              doc.setFillColor(white.r, white.g, white.b);
            } else {
              doc.setFillColor(245, 245, 245);
            }
            doc.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            const monthDate = new Date(month.month);
            const monthStr = monthDate.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
            doc.text(monthStr, margin + 5, currentY + 4.5);
            
            const monthlySpend = parseFloat(month.monthlySpend || 0);
            doc.text(`$${monthlySpend.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, margin + 60, currentY + 4.5);
            
            doc.text((month.ordersCount || 0).toString(), margin + 120, currentY + 4.5);
            
            const avgValue = monthlySpend / (parseInt(month.ordersCount) || 1);
            doc.text(`$${avgValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, pageWidth - margin - 50, currentY + 4.5);
            currentY += 7;
          });
        } else {
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('No monthly trend data available', margin + 5, currentY);
          currentY += 7;
        }

        currentY += 10;
      };

      // Top Items Table
      const drawTopItems = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top 5 Items by Quantity', margin, currentY);
        currentY += 8;

        const itemStats = statsData?.itemStats || [];
        if (itemStats.length > 0) {
          // Table Header
          doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
          doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Item Name', margin + 5, currentY + 5.5);
          doc.text('Category', margin + 70, currentY + 5.5);
          doc.text('Quantity', margin + 110, currentY + 5.5);
          doc.text('Total Spent', margin + 140, currentY + 5.5);
          doc.text('Avg Price', pageWidth - margin - 50, currentY + 5.5);
          currentY += 8;

          // Table Rows
          itemStats.forEach((item, idx) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
            }

            if (idx % 2 === 0) {
              doc.setFillColor(white.r, white.g, white.b);
            } else {
              doc.setFillColor(245, 245, 245);
            }
            doc.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            const itemName = item.item?.name || 'Unknown';
            doc.text(itemName.length > 25 ? itemName.substring(0, 22) + '...' : itemName, margin + 5, currentY + 4.5);
            
            const category = item.item?.category || 'N/A';
            doc.text(category.toString(), margin + 70, currentY + 4.5);
            
            const quantity = parseFloat(item.totalQuantity || 0);
            doc.text(quantity.toFixed(2), margin + 110, currentY + 4.5);
            
            const totalSpent = parseFloat(item.totalSpent || 0);
            doc.text(`$${totalSpent.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, margin + 140, currentY + 4.5);
            
            const avgPrice = quantity > 0 ? totalSpent / quantity : 0;
            doc.text(`$${avgPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, pageWidth - margin - 50, currentY + 4.5);
            currentY += 7;
          });
        } else {
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('No item statistics available', margin + 5, currentY);
          currentY += 7;
        }

        currentY += 10;
      };

      // Supplier Performance Table
      const drawSupplierPerformance = () => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Supplier Performance Analysis', margin, currentY);
        currentY += 8;

        const supplierPerformance = statsData?.supplierPerformance || [];
        if (supplierPerformance.length > 0) {
          // Table Header
          doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
          doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Supplier', margin + 5, currentY + 5.5);
          doc.text('Total Orders', margin + 80, currentY + 5.5);
          doc.text('Delivered', margin + 120, currentY + 5.5);
          doc.text('Delayed', margin + 155, currentY + 5.5);
          doc.text('Rate', pageWidth - margin - 40, currentY + 5.5);
          currentY += 8;

          // Table Rows
          supplierPerformance.forEach((supplier, idx) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
            }

            if (idx % 2 === 0) {
              doc.setFillColor(white.r, white.g, white.b);
            } else {
              doc.setFillColor(245, 245, 245);
            }
            doc.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            const supplierName = supplier.suppliers?.name || 'Unknown';
            doc.text(supplierName.length > 30 ? supplierName.substring(0, 27) + '...' : supplierName, margin + 5, currentY + 4.5);
            
            const totalOrders = parseInt(supplier.totalOrders || 0);
            doc.text(totalOrders.toString(), margin + 80, currentY + 4.5);
            
            const delivered = parseInt(supplier.deliveredOrders || 0);
            doc.text(delivered.toString(), margin + 120, currentY + 4.5);
            
            const delayed = parseInt(supplier.delayedOrders || 0);
            doc.text(delayed.toString(), margin + 155, currentY + 4.5);
            
            const rate = totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : '0.0';
            doc.text(`${rate}%`, pageWidth - margin - 40, currentY + 4.5);
            currentY += 7;
          });
        } else {
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('No supplier performance data available', margin + 5, currentY);
          currentY += 7;
        }

        currentY += 10;
      };

      // Attachment Stats
      const drawAttachmentStats = () => {
        if (currentY > pageHeight - 40) {
          doc.addPage();
          currentY = margin;
        }

        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Attachment Statistics', margin, currentY);
        currentY += 8;

        const attachmentStats = statsData?.attachmentStats || {};
        const ordersWithAttachments = parseInt(attachmentStats.ordersWithAttachments || 0);
        const missingAttachments = parseInt(attachmentStats.missingAttachments || 0);
        const total = ordersWithAttachments + missingAttachments;
        const coverage = total > 0 ? ((ordersWithAttachments / total) * 100).toFixed(1) : 0;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Orders with Attachments: ${ordersWithAttachments}`, margin + 5, currentY);
        currentY += 6;
        doc.text(`Missing Attachments: ${missingAttachments}`, margin + 5, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'bold');
        doc.text(`Attachment Coverage: ${coverage}%`, margin + 5, currentY);
        currentY += 10;
      };

      // Footer
      const drawFooter = (pageNum) => {
        doc.setFontSize(8);
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${pageNum} - Purchasing Analysis Report`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      };

      // Generate PDF
      const generate = async () => {
        drawHeader();
        await addLogo();
        drawSummarySection();
        drawStatusTable();
        drawTopSuppliers();
        drawProjectSpend();
        drawMonthlyTrend();
        drawTopItems();
        drawSupplierPerformance();
        drawAttachmentStats();

        // Add footer to all pages
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          drawFooter(i);
        }

        // Save PDF
        const fileName = `Purchasing_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      };

      generate().catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please check the console for details.');
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  return generatePDF;
};
