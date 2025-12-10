/**
 * Invoice PDF Generation Service
 * Creates professional PDF invoices for customer purchases
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a professional PDF invoice
 * 
 * @param {Object} invoiceData - Invoice data
 * @param {string} invoiceData.invoiceNumber - Invoice number
 * @param {string} invoiceData.businessName - Customer business name
 * @param {string} invoiceData.contactEmail - Customer email
 * @param {string} invoiceData.website - Customer website
 * @param {number} invoiceData.squareNumber - Advertising square number
 * @param {number} invoiceData.pageNumber - Page number
 * @param {number} invoiceData.duration - Campaign duration in days
 * @param {number} invoiceData.originalAmount - Original amount before discount
 * @param {number} invoiceData.discountAmount - Discount amount
 * @param {number} invoiceData.finalAmount - Final amount after discount
 * @param {string} invoiceData.transactionId - Payment transaction ID
 * @param {string} invoiceData.promoCode - Promo code used (if any)
 * @param {Date} invoiceData.invoiceDate - Invoice date
 * @param {Date} invoiceData.startDate - Campaign start date
 * @param {Date} invoiceData.endDate - Campaign end date
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoiceData.invoiceNumber}`,
          Author: 'ClickaLinks',
          Subject: 'Advertising Campaign Invoice'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors
      const primaryColor = '#667eea';
      const secondaryColor = '#764ba2';
      const darkGray = '#333333';
      const lightGray = '#666666';
      const borderGray = '#e0e0e0';

      // Header with gradient effect
      doc.rect(0, 0, 595, 120)
        .fillColor(primaryColor)
        .fill();

      // Company logo/name
      doc.fillColor('white')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('ClickaLinks', 50, 30, { align: 'left' });

      doc.fontSize(10)
        .font('Helvetica')
        .text('Direct Advertising Platform', 50, 60, { align: 'left' });

      // Invoice title
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 35, { align: 'right' });

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Invoice #${invoiceData.invoiceNumber}`, 400, 65, { align: 'right' });

      // Reset color
      doc.fillColor(darkGray);

      // Invoice details section
      let yPos = 150;

      // Left column - Bill To
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50, yPos);

      doc.fontSize(10)
        .font('Helvetica')
        .text(invoiceData.businessName || 'N/A', 50, yPos + 20);

      if (invoiceData.contactEmail) {
        doc.text(invoiceData.contactEmail, 50, yPos + 35);
      }

      if (invoiceData.website) {
        doc.text(invoiceData.website, 50, yPos + 50);
      }

      // Right column - Invoice details
      const invoiceDate = invoiceData.invoiceDate || new Date();
      const invoiceDateStr = invoiceDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Invoice Date: ${invoiceDateStr}`, 400, yPos, { align: 'right' });

      if (invoiceData.transactionId) {
        doc.text(`Transaction ID: ${invoiceData.transactionId}`, 400, yPos + 15, { align: 'right' });
      }

      // Company details (bottom of header)
      doc.fontSize(8)
        .fillColor(lightGray)
        .text('ClickaLinks Ltd.', 400, yPos + 35, { align: 'right' })
        .text('support@clickalinks.com', 400, yPos + 50, { align: 'right' })
        .text('www.clickalinks.com', 400, yPos + 65, { align: 'right' });

      // Reset color
      doc.fillColor(darkGray);

      // Line items section
      yPos = 280;

      // Table header
      doc.rect(50, yPos, 495, 30)
        .fillColor('#f5f5f5')
        .fill()
        .strokeColor(borderGray)
        .stroke();

      doc.fillColor(darkGray)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', 60, yPos + 10)
        .text('Duration', 350, yPos + 10)
        .text('Amount', 480, yPos + 10, { align: 'right' });

      yPos += 40;

      // Service line item
      const serviceDescription = `Advertising Campaign - Square #${invoiceData.squareNumber} (Page ${invoiceData.pageNumber})`;
      const durationText = `${invoiceData.duration} days`;

      doc.fontSize(10)
        .font('Helvetica')
        .text(serviceDescription, 60, yPos, { width: 280 })
        .text(durationText, 350, yPos, { width: 120 })
        .text(`£${(invoiceData.originalAmount || 0).toFixed(2)}`, 480, yPos, { align: 'right', width: 65 });

      yPos += 30;

      // Discount line (if applicable)
      if (invoiceData.discountAmount > 0) {
        doc.fontSize(9)
          .fillColor('#28a745')
          .text(`Discount${invoiceData.promoCode ? ` (${invoiceData.promoCode})` : ''}`, 60, yPos, { width: 280 })
          .text(`-£${invoiceData.discountAmount.toFixed(2)}`, 480, yPos, { align: 'right', width: 65 });

        doc.fillColor(darkGray);
        yPos += 25;
      }

      // Total section
      yPos += 20;

      // Horizontal line
      doc.moveTo(50, yPos)
        .lineTo(545, yPos)
        .strokeColor(borderGray)
        .lineWidth(1)
        .stroke();

      yPos += 20;

      // Subtotal
      doc.fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 400, yPos, { align: 'right' })
        .text(`£${(invoiceData.originalAmount || 0).toFixed(2)}`, 480, yPos, { align: 'right', width: 65 });

      yPos += 20;

      if (invoiceData.discountAmount > 0) {
        doc.fontSize(10)
          .fillColor('#28a745')
          .text('Discount:', 400, yPos, { align: 'right' })
          .text(`-£${invoiceData.discountAmount.toFixed(2)}`, 480, yPos, { align: 'right', width: 65 });

        doc.fillColor(darkGray);
        yPos += 20;
      }

      // Total
      yPos += 10;

      doc.rect(400, yPos - 5, 145, 40)
        .fillColor('#f8f9fa')
        .fill()
        .strokeColor(primaryColor)
        .lineWidth(2)
        .stroke();

      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Total:', 410, yPos + 5, { align: 'right' });

      const totalAmount = invoiceData.finalAmount || 0;
      if (totalAmount === 0) {
        doc.fillColor('#28a745')
          .text('FREE', 480, yPos + 5, { align: 'right', width: 65 });
      } else {
        doc.fillColor(darkGray)
          .text(`£${totalAmount.toFixed(2)}`, 480, yPos + 5, { align: 'right', width: 65 });
      }

      // Campaign details section
      yPos += 70;

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(darkGray)
        .text('Campaign Details', 50, yPos);

      yPos += 25;

      const startDate = invoiceData.startDate || new Date();
      const endDate = invoiceData.endDate || new Date(Date.now() + (invoiceData.duration || 30) * 24 * 60 * 60 * 1000);

      const startDateStr = startDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const endDateStr = endDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Campaign Start: ${startDateStr}`, 50, yPos)
        .text(`Campaign End: ${endDateStr}`, 50, yPos + 20)
        .text(`Square Number: #${invoiceData.squareNumber}`, 50, yPos + 40)
        .text(`Page: ${invoiceData.pageNumber}`, 50, yPos + 60);

      // Payment status
      yPos += 90;

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(totalAmount === 0 ? '#28a745' : '#667eea')
        .text(`Payment Status: ${totalAmount === 0 ? 'FREE (Promo Code Applied)' : 'PAID'}`, 50, yPos);

      // Footer
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 100;

      doc.fontSize(8)
        .fillColor(lightGray)
        .text('Thank you for choosing ClickaLinks!', 50, footerY, { align: 'center', width: 495 })
        .text('For support, contact us at support@clickalinks.com', 50, footerY + 15, { align: 'center', width: 495 })
        .text(`Invoice generated on ${new Date().toLocaleString('en-GB')}`, 50, footerY + 30, { align: 'center', width: 495 })
        .text('© ' + new Date().getFullYear() + ' ClickaLinks. All rights reserved.', 50, footerY + 45, { align: 'center', width: 495 });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INV-${dateStr}-${random}`;
}

