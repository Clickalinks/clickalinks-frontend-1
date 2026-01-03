/**
 * Email Service for ClickaLinks
 * Sends confirmation emails when ads are uploaded
 * 
 * Supports multiple email providers:
 * - SMTP (Gmail, Outlook, custom SMTP)
 * - SendGrid
 * - Resend (recommended for production)
 */

import nodemailer from 'nodemailer';
// Invoice PDF generation removed - using HTML invoice in email instead

/**
 * Create email transporter based on environment variables
 */
function createTransporter() {
  // Option 1: SendGrid (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 465,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Option 2: SMTP (Gmail, Outlook, custom - including IONOS)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '465');
    // Default to secure=true for port 465 (SSL/TLS direct connection)
    // Set SMTP_SECURE=false explicitly if you need STARTTLS instead
    const isSecure = process.env.SMTP_SECURE !== 'false'; // Default to true unless explicitly set to 'false'
    
    console.log(`📧 Creating SMTP transporter: ${process.env.SMTP_HOST}:${port} (secure: ${isSecure})`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    console.log(`📧 SMTP_SECURE env var: ${process.env.SMTP_SECURE || 'not set (defaulting to true)'}`);
    
    // secure: true = direct SSL/TLS connection (recommended for port 465)
    // secure: false = STARTTLS (upgrade connection to TLS)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure, // true for 465 (direct SSL/TLS), false for STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // rejectUnauthorized: false allows self-signed certificates
        rejectUnauthorized: false,
        // Use modern TLS (IONOS supports TLS 1.2+)
        minVersion: 'TLSv1.2'
      },
      // Connection settings
      connectionTimeout: 15000, // 15 seconds (increased for reliability)
      greetingTimeout: 10000,
      socketTimeout: 15000,
      // Require TLS for secure connections
      requireTLS: !isSecure // Only require TLS upgrade if not using direct SSL
    });
  }

  // Option 3: Gmail OAuth2 (if using Gmail)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
  }

  // Fallback: No email configured - return null (emails will be skipped)
  console.warn('⚠️ ⚠️ ⚠️ EMAIL SERVICE NOT CONFIGURED ⚠️ ⚠️ ⚠️');
  console.warn('⚠️ No email service configured. Emails will not be sent.');
  console.warn('⚠️ Checked for:');
  console.warn('   - SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.warn('   - SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
  console.warn('   - SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
  console.warn('   - SMTP_PASS:', process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');
  console.warn('   - GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? 'SET' : 'NOT SET');
  console.warn('⚠️ Please configure email service in Render environment variables.');
  return null;
}

/**
 * Send admin notification email
 * Notifies admin when purchases or promo codes are used
 */
export async function sendAdminNotificationEmail(type, data) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ Email service not configured - cannot send admin notification');
    console.error('❌ Please configure SMTP_HOST, SMTP_USER, SMTP_PASS or SENDGRID_API_KEY');
    return { success: false, message: 'Email service not configured' };
  }

  // Support both underscore and hyphen versions of the env variable name
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 
                     process.env['ADMIN-NOTIFICATION-EMAIL'] || 
                     'stentar-pants@hotmail.com';
  console.log(`📧 Admin notification email will be sent to: ${adminEmail}`);
  
  let subject = '';
  let htmlContent = '';
  let textContent = '';

  if (type === 'purchase') {
    // Extract all possible fields with fallbacks to ensure we get the data
    const businessName = data.businessName || 'Unknown Business';
    const contactEmail = data.contactEmail || 'No email provided';
    const squareNumber = data.squareNumber || data.square || 0;
    const pageNumber = data.pageNumber || 1;
    const selectedDuration = data.selectedDuration || data.duration || 30;
    const duration = data.duration || selectedDuration || 30;
    const finalAmount = data.finalAmount || data.amount || 0;
    const originalAmount = data.originalAmount !== undefined ? data.originalAmount : (finalAmount + (data.discountAmount || 0));
    const discountAmount = data.discountAmount || 0;
    const transactionId = data.transactionId || data.sessionId || 'N/A';
    const promoCode = data.promoCode || null;
    
    // Use selectedDuration or duration, whichever is available
    const campaignDuration = selectedDuration || duration || 30;
    const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount + discountAmount);
    const discountAmt = discountAmount || 0;
    const finalAmt = finalAmount || 0;
    
    console.log('📧 Admin notification - Purchase data extracted:', {
      businessName,
      contactEmail,
      squareNumber,
      pageNumber,
      campaignDuration,
      originalAmt,
      discountAmt,
      finalAmt,
      transactionId,
      promoCode
    });

    subject = `🛒 New Purchase - Square #${squareNumber}`;
    
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Purchase Notification</h1>
            <p>A new square has been purchased!</p>
          </div>
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 Purchase Details</h3>
              <div class="info-row">
                <span class="label">Business Name:</span>
                <span class="value">${businessName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Contact Email:</span>
                <span class="value">${contactEmail || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Square Number:</span>
                <span class="value">#${squareNumber} (Page ${pageNumber})</span>
              </div>
              <div class="info-row">
                <span class="label">Duration:</span>
                <span class="value">${campaignDuration} days</span>
              </div>
              <div class="info-row">
                <span class="label">Original Amount:</span>
                <span class="value">£${originalAmt.toFixed(2)}</span>
              </div>
              ${discountAmt > 0 ? `
              <div class="info-row">
                <span class="label">Discount:</span>
                <span class="value" style="color: #10b981;">-£${discountAmt.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Final Amount:</span>
                <span class="value" style="font-weight: bold; color: #667eea; font-size: 1.1em;">£${finalAmt.toFixed(2)}</span>
              </div>
              ${transactionId ? `
              <div class="info-row">
                <span class="label">Transaction ID:</span>
                <span class="value" style="font-family: monospace; font-size: 12px;">${transactionId}</span>
              </div>
              ` : ''}
              ${promoCode ? `
              <div class="info-row">
                <span class="label">Promo Code Used:</span>
                <span class="value" style="font-weight: bold; color: #28a745;">${promoCode}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Purchase Date:</span>
                <span class="value">${new Date().toLocaleString('en-GB')}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    textContent = `
New Purchase Notification

A new square has been purchased!

Purchase Details:
- Business Name: ${businessName || 'N/A'}
- Contact Email: ${contactEmail || 'N/A'}
- Square Number: #${squareNumber} (Page ${pageNumber})
- Duration: ${campaignDuration} days
- Original Amount: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `- Discount: -£${discountAmt.toFixed(2)}\n` : ''}
- Final Amount: £${finalAmt.toFixed(2)}
${transactionId ? `- Transaction ID: ${transactionId}\n` : ''}
${promoCode ? `- Promo Code Used: ${promoCode}\n` : ''}
- Purchase Date: ${new Date().toLocaleString('en-GB')}
    `;
  } else if (type === 'promo_code') {
    const {
      code,
      businessName,
      userEmail,
      discountAmount,
      originalAmount,
      finalAmount
    } = data;

    subject = `🎫 Promo Code Applied - ${code}`;
    
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Promo Code Applied</h1>
            <p>A promo code has been used!</p>
          </div>
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 Promo Code Details</h3>
              <div class="info-row">
                <span class="label">Promo Code:</span>
                <span class="value" style="font-weight: bold; color: #28a745;">${code}</span>
              </div>
              ${businessName ? `
              <div class="info-row">
                <span class="label">Business Name:</span>
                <span class="value">${businessName}</span>
              </div>
              ` : ''}
              ${userEmail ? `
              <div class="info-row">
                <span class="label">User Email:</span>
                <span class="value">${userEmail}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Original Amount:</span>
                <span class="value">£${(originalAmount || 0).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Discount:</span>
                <span class="value" style="color: #28a745;">-£${(discountAmount || 0).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Final Amount:</span>
                <span class="value" style="font-weight: bold; color: #667eea;">£${(finalAmount || 0).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Applied Date:</span>
                <span class="value">${new Date().toLocaleString('en-GB')}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    textContent = `
Promo Code Applied Notification

A promo code has been used!

Promo Code Details:
- Promo Code: ${code}
${businessName ? `- Business Name: ${businessName}\n` : ''}
${userEmail ? `- User Email: ${userEmail}\n` : ''}
- Original Amount: £${(originalAmount || 0).toFixed(2)}
- Discount: -£${(discountAmount || 0).toFixed(2)}
- Final Amount: £${(finalAmount || 0).toFixed(2)}
- Applied Date: ${new Date().toLocaleString('en-GB')}
    `;
  } else {
    // Unknown type - don't send empty email
    console.error('❌ Unknown email type:', type);
    console.error('❌ Available types: "purchase", "promo_code"');
    return {
      success: false,
      error: `Unknown email type: ${type}. Available types: "purchase", "promo_code"`,
      message: 'Cannot send email with unknown type'
    };
  }

  // Validate that email content was generated
  if (!subject || !htmlContent || !textContent) {
    console.error('❌ Email content is empty!');
    console.error(`   Type: ${type}`);
    console.error(`   Subject: "${subject}"`);
    console.error(`   HTML Content length: ${htmlContent.length}`);
    console.error(`   Text Content length: ${textContent.length}`);
    return {
      success: false,
      error: 'Email content is empty. Cannot send email.',
      message: 'Email content generation failed'
    };
  }

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    console.log(`📧 Sending admin notification email:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${adminEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Type: ${type}`);
    console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    console.log(`   SMTP Port: ${process.env.SMTP_PORT || 465}`);
    if (type === 'purchase') {
      console.log(`   Business: ${data.businessName || 'N/A'}`);
      console.log(`   Square: #${data.squareNumber || 'N/A'}`);
      console.log(`   Amount: £${(data.finalAmount || 0).toFixed(2)}`);
      console.log(`   Promo Code: ${data.promoCode || 'None'}`);
    }
    
    const mailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully:', info.messageId);
    console.log(`   Response: ${info.response}`);
    console.log(`   Accepted: ${info.accepted}`);
    console.log(`   Rejected: ${info.rejected}`);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Admin notification email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error response:', error.response);
    console.error('   Error command:', error.command);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    
    // Provide helpful error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'SMTP authentication failed (Error 535). IONOS requires SMTP sending to be enabled in the control panel.';
      console.error('🔐 SMTP AUTHENTICATION ERROR (535):');
      console.error('   This is an IONOS-specific issue. Solutions:');
      console.error('   1. Enable SMTP sending in IONOS control panel for ads@clickalinks.com');
      console.error('   2. Verify SMTP_USER is correct (e.g., ads@clickalinks.com)');
      console.error('   3. Reset email password in IONOS and update SMTP_PASS in Render.com');
      console.error('   4. Check if IONOS account supports external SMTP');
      console.error('   5. Some IONOS accounts require a separate SMTP password');
      console.error('   See IONOS_SMTP_FIX.md for detailed instructions');
      console.error('   - For IONOS, ensure SMTP is enabled for the email account');
      console.error('   - Some email providers require app-specific passwords');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection failed. Check SMTP_HOST and SMTP_PORT settings.';
      console.error('🔌 SMTP CONNECTION ERROR:');
      console.error('   - Verify SMTP_HOST is correct (e.g., smtp.ionos.co.uk)');
      console.error('   - Verify SMTP_PORT is correct (465 for TLS, 465 for SSL)');
      console.error('   - Check if SMTP_SECURE is set correctly');
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code,
      message: 'Failed to send admin notification email'
    };
  }
}

/**
 * Generate invoice HTML from purchase data
 * @param {Object} purchaseData - Purchase data including businessName, contactEmail, squareNumber, etc.
 * @param {string} invoiceNumber - Invoice number to use (will generate if not provided)
 * @returns {string} HTML string of the invoice
 */
export function generateInvoiceHTML(purchaseData, invoiceNumber = null) {
  const {
    businessName,
    contactEmail,
    squareNumber,
    pageNumber = 1,
    selectedDuration = 30,
    finalAmount = 0,
    originalAmount = finalAmount,
    discountAmount = 0,
    transactionId,
    promoCode,
    website
  } = purchaseData;

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);
  const invoiceDate = new Date();

  // Generate invoice number if not provided
  if (!invoiceNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    invoiceNumber = `INV-${dateStr}-${random}`;
  }

  // Calculate amounts correctly
  const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount || 10);
  const discountAmt = discountAmount || 0;
  const totalAmount = Math.max(0, originalAmt - discountAmt);

  // Generate downloadable HTML invoice
  const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber} - ClickaLinks</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f5f7fa;
      padding: 40px 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg,rgba(37, 100, 235, 0.54) 0%,rgba(30, 64, 175, 0.67) 100%);
      color: white;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .invoice-header-left {
      flex: 1;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: white;
    }
    .invoice-header h1 {
      font-size: 32px;
      margin: 0;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }
    .invoice-header .tagline {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 5px;
    }
    .invoice-header-right {
      text-align: right;
    }
    .invoice-header-right p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.95);
      margin: 5px 0;
    }
    .invoice-header-right a {
      color: rgba(255, 255, 255, 0.95);
      text-decoration: none;
    }
    .invoice-body {
      padding: 40px;
    }
    .invoice-meta {
      margin-bottom: 40px;
      padding: 20px 0;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .invoice-meta-left {
      flex: 1;
    }
    .invoice-meta-right {
      text-align: right;
    }
    .invoice-meta p {
      color: #4a5568;
      font-size: 14px;
      margin: 8px 0;
      line-height: 1.6;
    }
    .bill-to {
      margin-bottom: 40px;
    }
    .bill-to h3 {
      font-size: 14px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .bill-to p {
      color: #2d3748;
      font-size: 15px;
      margin: 5px 0;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .invoice-table thead {
      background: #f7fafc;
    }
    .invoice-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #2d3748;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .invoice-table td {
      padding: 20px 15px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }
    .invoice-table tbody tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .discount-row {
      background: #f0fdf4;
    }
    .discount-row td {
      color: #10b981;
      font-weight: 600;
    }
    .totals {
      margin-top: 30px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .total-row:last-child {
      border-bottom: none;
    }
    .total-label {
      font-weight: 600;
      color: #4a5568;
    }
    .total-amount {
      font-weight: 600;
      color: #2d3748;
    }
    .total-box {
      background: #f7fafc;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .total-box.free-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
    }
    .total-box .total-row {
      border-bottom: none;
    }
    .total-box .total-label {
      font-size: 18px;
      color: #2d3748;
    }
    .total-box .total-amount {
      font-size: 24px;
      color: #667eea;
      font-weight: 700;
    }
    .free-amount {
      color: #10b981 !important;
      font-size: 32px !important;
      font-weight: 700 !important;
    }
    .free-label {
      color: #10b981 !important;
      font-size: 18px !important;
    }
    .campaign-details {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }
    .campaign-details-left h3, .campaign-details-right h3 {
      font-size: 14px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .campaign-details-left p, .campaign-details-right p {
      color: #4a5568;
      font-size: 14px;
      margin: 8px 0;
    }
    .status-paid {
      color: #667eea;
      font-weight: 600;
      font-size: 16px;
    }
    .status-free {
      color: #10b981;
      font-weight: 700;
      font-size: 20px;
    }
    .promo-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 8px;
    }
    .invoice-footer {
      background: #f7fafc;
      padding: 30px 40px;
      text-align: center;
      color: #718096;
      font-size: 13px;
    }
    .invoice-footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="invoice-header-left">
        <div class="logo-container">
          <div class="logo-icon">C</div>
          <div>
            <h1>Clickalinks</h1>
            <p class="tagline">Click Shop, Repeat</p>
          </div>
        </div>
      </div>
      <div class="invoice-header-right">
        <p><strong>Clicado Media UK Ltd</strong></p>
        <p><a href="mailto:support@clickalinks.com">support@clickalinks.com</a></p>
        <p><a href="https://clickalinks.com">https://clickalinks.com</a></p>
      </div>
    </div>
    
    <div class="invoice-body">
      <div class="invoice-meta">
        <div class="invoice-meta-left">
          <p><strong>Date:</strong> ${invoiceDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
        </div>
        <div class="invoice-meta-right">
          <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
        </div>
      </div>

      <div class="bill-to">
        <h3>Bill To</h3>
        <p><strong>${businessName || 'N/A'}</strong></p>
        <p>${contactEmail || ''}</p>
        ${website ? `<p>${website}</p>` : ''}
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Duration</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Advertising Campaign - Square #${squareNumber} (Page ${pageNumber})</td>
            <td>${selectedDuration} days</td>
            <td class="text-right">£${originalAmt.toFixed(2)}</td>
          </tr>
          ${discountAmt > 0 ? `
          <tr class="discount-row">
            <td>Discount${promoCode ? ` (${promoCode})` : ''}</td>
            <td></td>
            <td class="text-right">-£${discountAmt.toFixed(2)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">£${originalAmt.toFixed(2)}</span>
        </div>
        ${discountAmt > 0 ? `
        <div class="total-row">
          <span class="total-label" style="color: #10b981;">Discount:</span>
          <span class="total-amount" style="color: #10b981;">-£${discountAmt.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-box ${totalAmount === 0 ? 'free-box' : ''}">
          <div class="total-row">
            <span class="total-label ${totalAmount === 0 ? 'free-label' : ''}">${totalAmount === 0 ? 'Final Total:' : 'Total:'}</span>
            <span class="total-amount ${totalAmount === 0 ? 'free-amount' : ''}">${totalAmount === 0 ? 'FREE' : `£${totalAmount.toFixed(2)}`}</span>
          </div>
        </div>
      </div>

      <div class="campaign-details">
        <div class="campaign-details-left">
          <h3>Campaign Details</h3>
          <p><strong>Start:</strong> ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p><strong>End:</strong> ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p><strong>Square:</strong> #${squareNumber}</p>
          <p><strong>Page:</strong> ${pageNumber}</p>
        </div>
        <div class="campaign-details-right">
          <h3>Payment Status</h3>
          <p class="${totalAmount === 0 ? 'status-free' : 'status-paid'}"><strong>${totalAmount === 0 ? 'FREE' : 'PAID'}</strong></p>
          ${totalAmount === 0 && promoCode ? `<span class="promo-badge">Promo: ${promoCode}</span>` : ''}
        </div>
      </div>
    </div>

    <div class="invoice-footer">
      <p>Thank you for choosing ClickaLinks!</p>
      <p><a href="mailto:support@clickalinks.com">support@clickalinks.com</a> | <a href="https://clickalinks.com">https://clickalinks.com</a></p>
      <p style="margin-top: 15px;"><strong>Clicado Media UK Ltd</strong></p>
      <p style="margin-top: 5px; font-size: 12px;">Registered in England & Wales, Registration Number: 16904433</p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Clicado Media UK Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  return invoiceHTML;
}

/**
 * Send welcome email (first email - no invoice)
 */
async function sendWelcomeEmail(purchaseData) {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const {
    contactEmail,
    businessName,
    squareNumber,
    pageNumber = 1,
    duration, // Check duration first (from purchases route)
    selectedDuration = duration || 30, // Fallback to duration or default to 30
    finalAmount = 0,
    transactionId
  } = purchaseData;

  if (!contactEmail) {
    return { success: false, message: 'No email address provided' };
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);
  const totalAmount = finalAmount || 0;

  // Modern Professional Welcome Email - NO INVOICE CONTENT
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a202c; 
          margin: 0; 
          padding: 0; 
          background: #f7fafc;
        }
        .email-wrapper { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          padding: 40px 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 60px 40px; 
          text-align: center; 
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="40" cy="70" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="90" cy="80" r="1.5" fill="rgba(255,255,255,0.2)"/></svg>');
          opacity: 0.3;
        }
        .header-content { position: relative; z-index: 1; }
        .success-icon { 
          font-size: 72px; 
          margin-bottom: 20px; 
          display: block;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .header h1 { 
          margin: 0 0 15px 0; 
          font-size: 36px; 
          font-weight: 800; 
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          letter-spacing: -0.5px;
        }
        .header p { 
          margin: 0; 
          font-size: 18px; 
          opacity: 0.95; 
          font-weight: 500;
        }
        .content { 
          padding: 50px 40px; 
          background: #ffffff; 
        }
        .greeting { 
          font-size: 28px; 
          font-weight: 700; 
          color: #1a202c;
          margin-bottom: 20px;
          line-height: 1.3;
        }
        .intro-text { 
          font-size: 17px; 
          color: #4a5568; 
          line-height: 1.8; 
          margin-bottom: 40px;
        }
        .intro-text strong {
          color: #667eea;
          font-weight: 700;
        }
        .info-box { 
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); 
          border: 2px solid #e2e8f0; 
          border-left: 5px solid #667eea;
          border-radius: 12px; 
          padding: 30px; 
          margin: 30px 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .info-box h3 { 
          margin: 0 0 25px 0; 
          font-size: 20px; 
          font-weight: 700; 
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 14px 0; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .info-row:last-child { 
          border-bottom: none; 
        }
        .label { 
          font-weight: 600; 
          color: #4a5568; 
          font-size: 15px;
        }
        .value { 
          color: #1a202c; 
          font-size: 15px; 
          font-weight: 600; 
          text-align: right;
        }
        .whats-next { 
          margin-top: 40px; 
          padding: 35px; 
          background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); 
          border-radius: 12px; 
          border-left: 5px solid #f56565;
        }
        .whats-next h3 { 
          font-size: 22px; 
          font-weight: 700; 
          color: #c53030; 
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .whats-next ul { 
          list-style: none; 
          padding: 0; 
          margin: 0; 
        }
        .whats-next li { 
          padding: 12px 0; 
          color: #4a5568; 
          font-size: 16px; 
          line-height: 1.7;
          padding-left: 30px;
          position: relative;
        }
        .whats-next li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #f56565;
          font-weight: bold;
          font-size: 18px;
        }
        .whats-next li strong { 
          color: #c53030; 
          font-weight: 700; 
        }
        .button-container { 
          text-align: center; 
          margin: 45px 0 30px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 18px 45px; 
          text-decoration: none; 
          border-radius: 50px; 
          font-weight: 700; 
          font-size: 17px; 
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        .button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }
        .footer { 
          background: #2d3748; 
          padding: 35px 40px; 
          text-align: center; 
        }
        .footer p { 
          margin: 8px 0; 
          color: #a0aec0; 
          font-size: 14px; 
        }
        .footer a { 
          color: #90cdf4; 
          text-decoration: none; 
          font-weight: 600;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 30px 25px; }
          .header { padding: 40px 25px; }
          .header h1 { font-size: 28px; }
          .greeting { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <div class="header-content">
              <div class="success-icon">🎉</div>
              <h1>Welcome to ClickaLinks!</h1>
              <p>Your advertising campaign is now LIVE! 🚀</p>
            </div>
          </div>
          <div class="content">
            <div class="greeting">Hello ${businessName || 'Valued Customer'}! 👋</div>
            <p class="intro-text">🎉 <strong>Congratulations!</strong> Thank you for choosing ClickaLinks! We're absolutely <strong>thrilled</strong> to have you on board! Your advertising campaign has been successfully activated and is now <strong>live on our platform</strong>, ready to attract customers and drive traffic to your business. This is going to be amazing! 🌟</p>
            
            <div class="info-box">
              <h3>📋 Your Campaign Details</h3>
              <div class="info-row">
                <span class="label">Business Name:</span>
                <span class="value">${businessName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Advertising Square:</span>
                <span class="value">#${squareNumber} (Page ${pageNumber})</span>
              </div>
              <div class="info-row">
                <span class="label">Campaign Duration:</span>
                <span class="value">${selectedDuration} days</span>
              </div>
              <div class="info-row">
                <span class="label">Start Date:</span>
                <span class="value">${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="info-row">
                <span class="label">End Date:</span>
                <span class="value">${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              ${transactionId ? `
              <div class="info-row">
                <span class="label">Transaction ID:</span>
                <span class="value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${transactionId}</span>
              </div>
              ` : ''}
            </div>

            <div class="whats-next">
              <h3>✨ What Happens Next?</h3>
              <ul>
                <li><strong>Your ad is live:</strong> Your logo is now visible on square #${squareNumber} and ready to attract customers!</li>
                <li><strong>Clickable link:</strong> Visitors can click your logo to visit your website directly.</li>
                <li><strong>Fair placement:</strong> Your position may change during regular shuffles, ensuring fair visibility for all businesses.</li>
                <li><strong>Active duration:</strong> Your ad will remain active for ${selectedDuration} days from today.</li>
              </ul>
            </div>

            <div class="button-container">
              <a href="${(process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app')}/page${pageNumber}" class="button">🚀 View Your Live Ad</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong></p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Registered in England & Wales, Registration Number: 16904433</p>
            <p style="font-size: 12px; color: #94a3b8;">Clicado Media UK Ltd is an advertisement company registered in England and Wales</p>
            <p style="margin-top: 20px;">Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}">${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}</a></p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} ClickaLinks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to ClickaLinks!

Hello ${businessName || 'Valued Customer'}!

Thank you for choosing ClickaLinks. We're thrilled to have you on board! Your advertising campaign has been successfully activated and is now live on our platform.

Campaign Details:
- Business Name: ${businessName || 'N/A'}
- Advertising Square: #${squareNumber} (Page ${pageNumber})
- Campaign Duration: ${selectedDuration} days
- Start Date: ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
- End Date: ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${transactionId ? `- Transaction ID: ${transactionId}\n` : ''}

What Happens Next?
- Your ad is live: Your logo is now visible on square #${squareNumber}
- Clickable link: Visitors can click your logo to visit your website
- Fair placement: Your position may change during shuffles
- Active duration: Your ad will remain active for ${selectedDuration} days

View your live ad: ${(process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app')}/page${pageNumber}

Need help? Contact us at ${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}

© ${new Date().getFullYear()} ClickaLinks. All rights reserved.
  `;

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    const mailOptions = {
      from: fromEmail,
      to: contactEmail,
      subject: `🎉 Welcome to ClickaLinks! Your Ad is Live - Square #${squareNumber}`,
      text: textContent,
      html: htmlContent
    };

    console.log('📧 Attempting to send welcome email...');
    console.log('📧 From:', fromEmail);
    console.log('📧 To:', contactEmail);
    console.log('📧 Subject:', `🎉 Welcome to ClickaLinks! Your Ad is Live - Square #${squareNumber}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('✅ Response:', info.response || 'N/A');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ ❌ ❌ ERROR SENDING WELCOME EMAIL ❌ ❌ ❌');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response:', error.response || 'N/A');
    console.error('❌ Error command:', error.command || 'N/A');
    console.error('❌ Full error:', error);
    return { success: false, error: error.message, code: error.code, details: error.response };
  }
}

/**
 * Send invoice email (second email - professional invoice)
 */
async function sendInvoiceEmail(purchaseData, invoiceNumber) {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const {
    contactEmail,
    businessName,
    squareNumber,
    pageNumber = 1,
    duration, // Check duration first (from purchases route)
    selectedDuration = duration || 30, // Fallback to duration or default to 30
    finalAmount,
    originalAmount,
    discountAmount = 0,
    transactionId,
    promoCode,
    website
  } = purchaseData;

  if (!contactEmail) {
    return { success: false, message: 'No email address provided' };
  }

  // Calculate amounts correctly - use passed values if available, otherwise calculate
  // When called from sendAdConfirmationEmail, these should already be calculated
  const originalAmt = originalAmount !== undefined && originalAmount !== null ? originalAmount : ((finalAmount !== undefined && finalAmount !== null ? finalAmount : 0) + (discountAmount || 0));
  const discountAmt = discountAmount !== undefined && discountAmount !== null ? discountAmount : 0;
  // Use finalAmount if provided (already calculated from sendAdConfirmationEmail), otherwise recalculate
  const totalAmount = finalAmount !== undefined && finalAmount !== null ? finalAmount : Math.max(0, originalAmt - discountAmt);
  
  console.log('📧 Invoice email - Amounts:', {
    originalAmount: originalAmt,
    discountAmount: discountAmt,
    finalAmount: finalAmount,
    calculatedTotal: totalAmount,
    promoCode: promoCode
  });

  // Modern Professional Invoice Email - Invoice Only, Clean Design
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a202c; 
          margin: 0; 
          padding: 0; 
          background: #f7fafc;
        }
        .email-wrapper { 
          background: #f7fafc; 
          padding: 40px 20px; 
        }
        .container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
          color: white; 
          padding: 45px 40px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: -0.5px; 
        }
        .header p { 
          margin: 0; 
          font-size: 16px; 
          opacity: 0.95; 
        }
        .invoice-icon { 
          font-size: 56px; 
          margin-bottom: 15px; 
          display: block;
        }
        .content { 
          padding: 45px 40px; 
        }
        .intro-text { 
          font-size: 16px; 
          color: #4a5568; 
          line-height: 1.8; 
          margin-bottom: 35px; 
        }
        .invoice-box { 
          background: #f8fafc; 
          border: 2px solid #e2e8f0; 
          border-radius: 12px; 
          padding: 35px; 
          margin: 30px 0; 
        }
        .invoice-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 30px; 
          padding-bottom: 25px; 
          border-bottom: 2px solid #e2e8f0; 
        }
        .invoice-info { flex: 1; }
        .invoice-info h3 { 
          margin: 0 0 15px 0; 
          font-size: 12px; 
          font-weight: 700; 
          color: #718096; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
        }
        .invoice-info p { 
          margin: 6px 0; 
          color: #2d3748; 
          font-size: 15px; 
          line-height: 1.6;
        }
        .invoice-info.right { text-align: right; }
        .invoice-number { 
          font-size: 24px; 
          font-weight: 700; 
          color: #2563eb; 
          margin: 5px 0;
        }
        .invoice-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
        }
        .invoice-table thead { 
          background: #f1f5f9; 
        }
        .invoice-table th { 
          padding: 16px; 
          text-align: left; 
          font-weight: 700; 
          color: #475569; 
          font-size: 12px; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          border-bottom: 2px solid #e2e8f0;
        }
        .invoice-table td { 
          padding: 18px 16px; 
          border-bottom: 1px solid #e2e8f0; 
          color: #475569; 
          font-size: 15px; 
        }
        .invoice-table tbody tr:last-child td {
          border-bottom: none;
        }
        .invoice-table .text-right { 
          text-align: right; 
        }
        .discount-row { 
          background: #f0fdf4; 
        }
        .discount-row td { 
          color: #10b981; 
          font-weight: 600; 
        }
        .totals-section { 
          margin-top: 30px; 
          padding-top: 25px; 
          border-top: 2px solid #e2e8f0; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 12px 0; 
        }
        .total-label { 
          font-weight: 600; 
          color: #475569; 
          font-size: 15px; 
        }
        .total-amount { 
          font-weight: 600; 
          color: #1e293b; 
          font-size: 15px; 
        }
        .grand-total { 
          margin-top: 20px; 
          padding: 25px; 
          background: #f8fafc; 
          border: 2px solid #2563eb; 
          border-radius: 8px; 
        }
        .grand-total .total-label { 
          font-size: 18px; 
          color: #1e293b; 
        }
        .grand-total .total-amount { 
          font-size: 26px; 
          color: #2563eb; 
          font-weight: 700; 
        }
        .free-total { 
          background: #f0fdf4; 
          border-color: #10b981; 
        }
        .free-total .total-amount { 
          color: #10b981; 
          font-size: 30px; 
        }
        .download-section { 
          margin: 35px 0; 
          padding: 30px; 
          background: #fffbeb; 
          border-left: 5px solid #f59e0b; 
          border-radius: 8px; 
        }
        .download-section h3 { 
          margin: 0 0 12px 0; 
          font-size: 18px; 
          font-weight: 700; 
          color: #92400e; 
        }
        .download-section p { 
          margin: 8px 0; 
          color: #78350f; 
          font-size: 14px; 
          line-height: 1.7; 
        }
        .download-btn { 
          display: inline-block; 
          background: #10b981; 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 700; 
          font-size: 16px; 
          margin-top: 15px; 
          transition: all 0.3s;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        .download-btn:hover { 
          background: #059669; 
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
        }
        .footer { 
          background: #2d3748; 
          padding: 35px 40px; 
          text-align: center; 
        }
        .footer p { 
          margin: 8px 0; 
          color: #a0aec0; 
          font-size: 13px; 
          line-height: 1.6;
        }
        .footer strong {
          color: #e2e8f0;
          font-weight: 600;
        }
        .footer a { 
          color: #90cdf4; 
          text-decoration: none; 
          font-weight: 600;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 30px 25px; }
          .header { padding: 35px 25px; }
          .invoice-header { flex-direction: column; gap: 20px; }
          .invoice-info.right { text-align: left; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <div class="invoice-icon">📄</div>
            <h1>Your Invoice</h1>
            <p>Invoice #${invoiceNumber}</p>
          </div>
          <div class="content">
            <p class="intro-text">Dear ${businessName || 'Valued Customer'},</p>
            <p class="intro-text">Please find your invoice details below. You can download a printable version using the button at the bottom of this email.</p>
            
            <div class="invoice-box">
              <div class="invoice-header">
                <div class="invoice-info">
                  <h3>Invoice To</h3>
                  <p><strong>${businessName || 'N/A'}</strong></p>
                  <p>${contactEmail || ''}</p>
                  ${website ? `<p style="color: #2563eb;">${website}</p>` : ''}
                </div>
                <div class="invoice-info right">
                  <h3>Invoice Details</h3>
                  <p class="invoice-number">#${invoiceNumber}</p>
                  <p>Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  ${transactionId ? `<p style="font-size: 13px; color: #64748b; margin-top: 8px;">Transaction ID:<br>${transactionId}</p>` : ''}
                </div>
              </div>

              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Duration</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Advertising Campaign</strong><br><span style="color: #64748b; font-size: 13px;">Square #${squareNumber} (Page ${pageNumber})</span></td>
                    <td>${selectedDuration} days</td>
                    <td class="text-right"><strong>£${originalAmt.toFixed(2)}</strong></td>
                  </tr>
                  ${discountAmt > 0 ? `
                  <tr class="discount-row">
                    <td><strong>Discount${promoCode ? ` (${promoCode})` : ''}</strong></td>
                    <td></td>
                    <td class="text-right"><strong>-£${discountAmt.toFixed(2)}</strong></td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>

              <div class="totals-section">
                <div class="total-row">
                  <span class="total-label">Subtotal:</span>
                  <span class="total-amount">£${originalAmt.toFixed(2)}</span>
                </div>
                ${discountAmt > 0 ? `
                <div class="total-row">
                  <span class="total-label" style="color: #10b981;">Discount:</span>
                  <span class="total-amount" style="color: #10b981;">-£${discountAmt.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="grand-total ${totalAmount === 0 ? 'free-total' : ''}">
                  <div class="total-row">
                    <span class="total-label">${totalAmount === 0 ? 'Total Amount:' : 'Total:'}</span>
                    <span class="total-amount">${totalAmount === 0 ? 'FREE' : `£${totalAmount.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="download-section">
              <h3>📥 Download Your Invoice</h3>
              <p>Click the button below to download your invoice as an HTML file. You can save it, print it, or forward it to your accounting department.</p>
              <a href="${process.env.BACKEND_URL || 'https://clickalinks-backend-2.onrender.com'}/api/invoice/download?tx=${encodeURIComponent(transactionId || '')}&inv=${encodeURIComponent(invoiceNumber)}&businessName=${encodeURIComponent(businessName || '')}&contactEmail=${encodeURIComponent(contactEmail || '')}&squareNumber=${squareNumber}&pageNumber=${pageNumber}&duration=${selectedDuration}&originalAmount=${originalAmt}&discountAmount=${discountAmt}&finalAmount=${totalAmount}${promoCode ? `&promoCode=${encodeURIComponent(promoCode)}` : ''}${website ? `&website=${encodeURIComponent(website)}` : ''}" class="download-btn" target="_blank">📥 Download Invoice</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong></p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Registered in England & Wales, Registration Number: 16904433</p>
            <p style="font-size: 12px; color: #94a3b8;">Clicado Media UK Ltd is an advertisement company registered in England and Wales</p>
            <p style="margin-top: 20px;">Thank you for your business with ClickaLinks!</p>
            <p>Questions about your invoice? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}">${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}</a></p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} ClickaLinks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Your Invoice - ${invoiceNumber}

Dear ${businessName || 'Valued Customer'},

Please find your invoice details below.

Invoice #: ${invoiceNumber}
Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${transactionId ? `Transaction ID: ${transactionId}\n` : ''}

Invoice To:
${businessName || 'N/A'}
${contactEmail || ''}
${website ? `${website}\n` : ''}

Description: Advertising Campaign - Square #${squareNumber} (Page ${pageNumber})
Duration: ${selectedDuration} days
Amount: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `Discount${promoCode ? ` (${promoCode})` : ''}: -£${discountAmt.toFixed(2)}\n` : ''}
Subtotal: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `Discount: -£${discountAmt.toFixed(2)}\n` : ''}
Total: ${totalAmount === 0 ? 'FREE' : `£${totalAmount.toFixed(2)}`}

Download your invoice: ${process.env.BACKEND_URL || 'https://clickalinks-backend-2.onrender.com'}/api/invoice/download?tx=${encodeURIComponent(transactionId || '')}&inv=${encodeURIComponent(invoiceNumber)}&businessName=${encodeURIComponent(businessName || '')}&contactEmail=${encodeURIComponent(contactEmail || '')}&squareNumber=${squareNumber}&pageNumber=${pageNumber}&duration=${selectedDuration}&originalAmount=${originalAmt}&discountAmount=${discountAmt}&finalAmount=${totalAmount}${promoCode ? `&promoCode=${encodeURIComponent(promoCode)}` : ''}${website ? `&website=${encodeURIComponent(website)}` : ''}

Questions about your invoice? Contact us at ${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}

© ${new Date().getFullYear()} ClickaLinks. All rights reserved.
  `;

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    const mailOptions = {
      from: fromEmail,
      to: contactEmail,
      subject: `📄 Your Invoice #${invoiceNumber} - ClickaLinks`,
      text: textContent,
      html: htmlContent
    };

    console.log('📧 Attempting to send invoice email...');
    console.log('📧 From:', fromEmail);
    console.log('📧 To:', contactEmail);
    console.log('📧 Subject:', `📄 Your Invoice #${invoiceNumber} - ClickaLinks`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('✅ Response:', info.response || 'N/A');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ ❌ ❌ ERROR SENDING INVOICE EMAIL ❌ ❌ ❌');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response:', error.response || 'N/A');
    console.error('❌ Error command:', error.command || 'N/A');
    console.error('❌ Full error:', error);
    return { success: false, error: error.message, code: error.code, details: error.response };
  }
}

/**
 * Send confirmation email when ad is uploaded
 * Now sends two separate emails: welcome email first, then invoice email
 */
export async function sendAdConfirmationEmail(purchaseData) {
  console.log('📧 ===== EMAIL SERVICE CALLED =====');
  console.log('📧 Attempting to send confirmation emails...');
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ ❌ ❌ EMAIL SERVICE NOT CONFIGURED ❌ ❌ ❌');
    console.error('❌ Email service not configured - skipping email');
    console.error('❌ Check Render environment variables for SMTP configuration');
    return { success: false, message: 'Email service not configured' };
  }
  
  console.log('✅ Email transporter created successfully');

  const {
    contactEmail,
    businessName,
    squareNumber,
    pageNumber = 1,
    duration, // Check duration first (from purchases route)
    selectedDuration = duration || 30, // Fallback to duration or default to 30
    finalAmount = 0,
    originalAmount = finalAmount,
    discountAmount = 0,
    transactionId,
    promoCode,
    logoData,
    paymentStatus = 'paid'
  } = purchaseData;

  if (!contactEmail) {
    console.error('❌ No email address provided - skipping email');
    console.error('❌ Purchase data:', {
      hasContactEmail: !!contactEmail,
      businessName: businessName,
      squareNumber: squareNumber
    });
    return { success: false, message: 'No email address provided' };
  }
  
  console.log('✅ Contact email found:', contactEmail);

  // Calculate amounts correctly
  const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount || 10);
  const discountAmt = discountAmount || 0;
  const totalAmount = Math.max(0, originalAmt - discountAmt);
  
  // Generate invoice number (used for both emails)
  const generateInvoiceNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INV-${dateStr}-${random}`;
  };
  
  const invoiceNumber = generateInvoiceNumber();
  
  console.log('📧 Invoice data calculation:', {
    originalAmount: originalAmt,
    discountAmount: discountAmt,
    totalAmount: totalAmount,
    invoiceNumber: invoiceNumber
  });

  // Send welcome email first (without invoice)
  console.log('📧 Sending welcome email...');
  const welcomeResult = await sendWelcomeEmail(purchaseData);
  
  if (!welcomeResult.success) {
    console.error('❌ Failed to send welcome email:', welcomeResult.error);
    // Continue anyway to try sending invoice email
  } else {
    console.log('✅ Welcome email sent successfully');
  }

  // Wait a moment before sending invoice email (professional spacing)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Send invoice email second (professional invoice)
  console.log('📧 Sending invoice email...');
  const invoiceResult = await sendInvoiceEmail({
    ...purchaseData,
    website: purchaseData.website,
    originalAmount: originalAmt,
    discountAmount: discountAmt,
    finalAmount: totalAmount
  }, invoiceNumber);

  if (!invoiceResult.success) {
    console.error('❌ Failed to send invoice email:', invoiceResult.error);
    // Return result based on which emails succeeded
    return {
      success: welcomeResult.success,
      message: welcomeResult.success ? 'Welcome email sent, but invoice email failed' : 'Both emails failed',
      welcomeEmailSent: welcomeResult.success,
      invoiceEmailSent: false,
      welcomeMessageId: welcomeResult.messageId
    };
  }

  console.log('✅ Invoice email sent successfully');

  // Both emails sent successfully
  return {
    success: true,
    message: 'Both welcome and invoice emails sent successfully',
    welcomeEmailSent: true,
    invoiceEmailSent: true,
    welcomeMessageId: welcomeResult.messageId,
    invoiceMessageId: invoiceResult.messageId,
    invoiceNumber: invoiceNumber
  };
}

/**
 * Send contact form email to admin/support
 */
export async function sendContactFormEmail({ name, email, subject, message }) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ Email service not configured - cannot send contact form email');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM || 'support@clickalinks.com';
  const emailFrom = process.env.EMAIL_FROM || 'noreply@clickalinks.com';

  try {
    const mailOptions = {
      from: emailFrom,
      to: adminEmail,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}