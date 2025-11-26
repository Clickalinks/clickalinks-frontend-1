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

  // Option 2: SMTP (Gmail, Outlook, custom)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
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
    transactionId,
    logoData
  } = purchaseData;

  if (!contactEmail) {
    console.warn('⚠️ No email address provided - skipping email');
    return { success: false, message: 'No email address provided' };
  }

  // Calculate end date
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);

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
            <a href="${process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app'}/page${pageNumber}" class="button">View Your Live Ad</a>
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

View your live ad: ${process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app'}/page${pageNumber}

Need help? Contact us at ${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}

© ${new Date().getFullYear()} ClickaLinks. All rights reserved.
  `;

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`,
      to: contactEmail,
      subject: `🎉 Your ClickaLinks Ad is Live! - Square #${squareNumber}`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email'
    };
  }
}

