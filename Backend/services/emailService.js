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
import { generateInvoicePDF, generateInvoiceNumber } from './invoiceService.js';

/**
 * Create email transporter based on environment variables
 */
function createTransporter() {
  // Option 1: SendGrid (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Option 2: SMTP (Gmail, Outlook, custom - including IONOS)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = process.env.SMTP_SECURE === 'true';
    
    console.log(`📧 Creating SMTP transporter: ${process.env.SMTP_HOST}:${port} (secure: ${isSecure})`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure, // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // Do not fail on invalid certificates (some SMTP servers have self-signed certs)
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      // IONOS-specific: May require explicit connection settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
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
  console.warn('⚠️ No email service configured. Emails will not be sent.');
  return null;
}

/**
 * Send confirmation email when ad is uploaded
 */
export async function sendAdConfirmationEmail(purchaseData) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email service not configured - skipping email');
    return { success: false, message: 'Email service not configured' };
  }

  const {
    contactEmail,
    businessName,
    squareNumber,
    pageNumber = 1,
    selectedDuration = 30,
    finalAmount = 0,
    originalAmount = finalAmount,
    discountAmount = 0,
    transactionId,
    promoCode,
    logoData,
    paymentStatus = 'paid'
  } = purchaseData;

  if (!contactEmail) {
    console.warn('⚠️ No email address provided - skipping email');
    return { success: false, message: 'No email address provided' };
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);
  const invoiceDate = new Date();

  // Generate invoice PDF
  let invoicePDF = null;
  let invoiceNumber = null;
  
  try {
    invoiceNumber = generateInvoiceNumber();
    console.log(`📄 Generating invoice PDF: ${invoiceNumber}`);
    
    invoicePDF = await generateInvoicePDF({
      invoiceNumber,
      businessName,
      contactEmail,
      website: purchaseData.website || '',
      squareNumber,
      pageNumber,
      duration: selectedDuration,
      originalAmount: originalAmount || finalAmount || 0,
      discountAmount: discountAmount || 0,
      finalAmount: finalAmount || 0,
      transactionId,
      promoCode,
      invoiceDate,
      startDate,
      endDate
    });
    
    console.log(`✅ Invoice PDF generated successfully (${invoicePDF.length} bytes)`);
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    // Continue without PDF attachment if generation fails
  }

  // Email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1>Welcome to ClickaLinks!</h1>
          <p>Your advertising campaign is now live!</p>
        </div>
        <div class="content">
          <h2>Hello ${businessName || 'Valued Customer'}!</h2>
          <p>Thank you for choosing ClickaLinks. Your advertising campaign has been successfully activated and is now live on our platform.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0;">📋 Campaign Details</h3>
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
            ${finalAmount > 0 ? `
            <div class="info-row">
              <span class="label">Total Paid:</span>
              <span class="value" style="font-weight: bold; color: #667eea;">£${finalAmount.toFixed(2)}</span>
            </div>
            ` : ''}
            ${transactionId ? `
            <div class="info-row">
              <span class="label">Transaction ID:</span>
              <span class="value" style="font-family: monospace; font-size: 12px;">${transactionId}</span>
            </div>
            ` : ''}
          </div>

          <h3>✨ What Happens Next?</h3>
          <ul>
            <li><strong>Your ad is live:</strong> Your logo is now visible on square #${squareNumber} and ready to attract customers!</li>
            <li><strong>Clickable link:</strong> Visitors can click your logo to visit your website.</li>
            <li><strong>Fair placement:</strong> Your position may change during shuffles, ensuring fair visibility for all businesses.</li>
            <li><strong>Active duration:</strong> Your ad will remain active for ${selectedDuration} days.</li>
          </ul>

          <div style="text-align: center;">
            <a href="${(process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app')}/page${pageNumber}" class="button">View Your Live Ad</a>
          </div>

          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}">${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}</a></p>
            <p>&copy; ${new Date().getFullYear()} ClickaLinks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version (for email clients that don't support HTML)
  const textContent = `
Welcome to ClickaLinks!

Hello ${businessName || 'Valued Customer'}!

Thank you for choosing ClickaLinks. Your advertising campaign has been successfully activated and is now live on our platform.

Campaign Details:
- Business Name: ${businessName || 'N/A'}
- Advertising Square: #${squareNumber} (Page ${pageNumber})
- Campaign Duration: ${selectedDuration} days
- Start Date: ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
- End Date: ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${finalAmount > 0 ? `- Total Paid: £${finalAmount.toFixed(2)}\n` : ''}
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
    
    console.log(`📧 Attempting to send email:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${contactEmail}`);
    console.log(`   Subject: 🎉 Your ClickaLinks Ad is Live! - Square #${squareNumber}`);
    
    const mailOptions = {
      from: fromEmail,
      to: contactEmail,
      subject: `🎉 Your ClickaLinks Ad is Live! - Square #${squareNumber}`,
      text: textContent,
      html: htmlContent,
      attachments: []
    };

    // Attach invoice PDF if generated successfully
    if (invoicePDF) {
      mailOptions.attachments.push({
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: invoicePDF,
        contentType: 'application/pdf'
      });
      console.log(`📎 Invoice PDF attached: Invoice-${invoiceNumber}.pdf`);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully:', info.messageId);
    console.log(`   Response: ${info.response}`);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    console.error('   Error code:', error.code);
    console.error('   Error command:', error.command);
    console.error('   Error response:', error.response);
    console.error('   Error responseCode:', error.responseCode);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    
    // Provide more detailed error message
    let errorMessage = error.message || 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = `Cannot connect to SMTP server ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection timeout. Check SMTP_HOST and network.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errorCode: error.code,
      message: 'Failed to send email'
    };
  }
}

