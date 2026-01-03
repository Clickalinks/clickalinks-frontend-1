import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './InvoiceView.css';

const InvoiceView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invoiceHTML, setInvoiceHTML] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get parameters from URL or use defaults for preview
        const params = {
          tx: searchParams.get('tx') || '',
          inv: searchParams.get('inv') || '',
          businessName: searchParams.get('businessName') || 'Sample Business',
          contactEmail: searchParams.get('contactEmail') || 'sample@example.com',
          squareNumber: searchParams.get('squareNumber') || '1',
          pageNumber: searchParams.get('pageNumber') || '1',
          duration: searchParams.get('duration') || '30',
          originalAmount: searchParams.get('originalAmount') || '30',
          discountAmount: searchParams.get('discountAmount') || '0',
          finalAmount: searchParams.get('finalAmount') || '30',
          promoCode: searchParams.get('promoCode') || '',
          website: searchParams.get('website') || ''
        };

        // Build query string
        const queryString = new URLSearchParams(params).toString();
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
        const url = `${backendUrl}/api/invoice/view?${queryString}`;

        console.log('📄 Fetching invoice from:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/html',
          },
        });
        
        console.log('📄 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`Failed to load invoice: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        console.log('✅ Invoice HTML received, length:', html.length);
        setInvoiceHTML(html);
      } catch (err) {
        console.error('❌ Error loading invoice:', err);
        
        // If backend fails, try to generate a basic invoice client-side
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          console.log('⚠️ Backend unavailable, generating client-side invoice...');
          try {
            const clientInvoice = generateClientInvoice(params);
            setInvoiceHTML(clientInvoice);
            setError(null);
          } catch (clientErr) {
            setError(`Cannot connect to server. Please check your internet connection and try again. Error: ${err.message}`);
          }
        } else {
          setError(err.message || 'Failed to load invoice. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [searchParams]);

  // Client-side invoice generator (fallback)
  const generateClientInvoice = (params) => {
    const businessName = params.businessName || 'Sample Business';
    const contactEmail = params.contactEmail || 'sample@example.com';
    const squareNumber = parseInt(params.squareNumber) || 1;
    const pageNumber = parseInt(params.pageNumber) || 1;
    const duration = parseInt(params.duration) || 30;
    const originalAmount = parseFloat(params.originalAmount) || 30;
    const discountAmount = parseFloat(params.discountAmount) || 0;
    const finalAmount = parseFloat(params.finalAmount) || 30;
    const promoCode = params.promoCode || null;
    const website = params.website || '';
    
    const invoiceNumber = params.inv || `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    // Reference to logo in public folder - files in public/ are served at root URL
    const logoUrl = '/logo.PNG';
    
    return `
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
      background: #ffffff;
      padding: 40px 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: 600;
      color: #111827;
    }
    .logo-container {
      text-align: right;
    }
    .logo-img {
      max-width: 150px;
      height: auto;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      gap: 40px;
    }
    .invoice-details-left {
      flex: 1;
    }
    .invoice-details-right {
      flex: 1;
    }
    .invoice-number {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .invoice-number-value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }
    .date-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .date-value {
      font-size: 14px;
      color: #111827;
      margin-bottom: 16px;
    }
    .company-info {
      margin-top: 20px;
    }
    .company-info p {
      font-size: 14px;
      color: #374151;
      margin: 4px 0;
      line-height: 1.6;
    }
    .company-info a {
      color: #667eea;
      text-decoration: none;
    }
    .bill-to {
      margin-top: 20px;
    }
    .bill-to-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .bill-to-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    .bill-to-details {
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
    }
    .bill-to-details p {
      margin: 4px 0;
    }
    .payment-summary {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-due {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }
    .due-date {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    .payment-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .invoice-table thead {
      border-bottom: 2px solid #e5e7eb;
    }
    .invoice-table th {
      padding: 12px 0;
      text-align: left;
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-table th.text-right {
      text-align: right;
    }
    .invoice-table td {
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
      font-size: 14px;
    }
    .invoice-table tbody tr:last-child td {
      border-bottom: none;
    }
    .invoice-table .text-right {
      text-align: right;
    }
    .description-main {
      font-weight: 600;
      color: #111827;
    }
    .description-sub {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    .discount-row {
      background: #f0fdf4;
    }
    .discount-row td {
      color: #10b981;
      font-weight: 600;
    }
    .totals {
      margin-top: 20px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-label {
      color: #6b7280;
    }
    .total-amount {
      color: #111827;
      font-weight: 600;
    }
    .total-row.final {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #e5e7eb;
      font-size: 16px;
    }
    .total-row.final .total-label {
      color: #111827;
      font-weight: 600;
    }
    .total-row.final .total-amount {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }
    .invoice-footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .footer-message {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .footer-message a {
      color: #667eea;
      text-decoration: none;
    }
    .footer-company {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 20px;
    }
    @media only screen and (max-width: 600px) {
      body { padding: 20px 15px; }
      .invoice-header { flex-direction: column; gap: 20px; }
      .invoice-details { flex-direction: column; gap: 30px; }
      .payment-summary { flex-direction: column; align-items: flex-start; gap: 15px; }
      .totals { width: 100%; }
    }
    @media print {
      body { background: white; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="invoice-title">Invoice</div>
      <div class="logo-container">
        <img src="${logoUrl}" alt="ClickaLinks Logo" class="logo-img" onerror="this.style.display='none'" />
      </div>
    </div>
    
    <div class="invoice-details">
      <div class="invoice-details-left">
        <div class="invoice-number">Invoice number</div>
        <div class="invoice-number-value">${invoiceNumber}</div>
        <div class="date-label">Date of issue</div>
        <div class="date-value">${invoiceDate}</div>
        <div class="date-label">Date due</div>
        <div class="date-value">${invoiceDate}</div>
        
        <div class="company-info">
          <p><strong>Clicado Media UK Ltd</strong></p>
          <p>trading as clickalinks.com</p>
          <p>Registered in England & Wales</p>
          <p>Registration Number: 16904433</p>
          <p style="margin-top: 12px;"><a href="mailto:support@clickalinks.com">support@clickalinks.com</a></p>
        </div>
      </div>
      
      <div class="invoice-details-right">
        <div class="bill-to">
          <div class="bill-to-label">Bill to</div>
          <div class="bill-to-name">${businessName}</div>
          <div class="bill-to-details">
            <p>${contactEmail}</p>
            ${website ? `<p>${website}</p>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="payment-summary">
      <div>
        <div class="amount-due">${finalAmount === 0 ? 'FREE' : `£${finalAmount.toFixed(2)}`}</div>
        <div class="due-date">Due Date: ${invoiceDate}</div>
      </div>
      ${finalAmount > 0 ? `<a href="https://clickalinks.com" class="payment-link">Pay online</a>` : ''}
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Unit price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="description-main">Advertising Campaign</div>
            <div class="description-sub">Square #${squareNumber} (Page ${pageNumber})</div>
          </td>
          <td class="text-right">1</td>
          <td class="text-right">£${originalAmount.toFixed(2)}</td>
          <td class="text-right">£${originalAmount.toFixed(2)}</td>
        </tr>
        ${discountAmount > 0 ? `
        <tr class="discount-row">
          <td>
            <div class="description-main">Discount${promoCode ? ` (${promoCode})` : ''}</div>
          </td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">-£${discountAmount.toFixed(2)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span class="total-label">Subtotal</span>
        <span class="total-amount">£${originalAmount.toFixed(2)}</span>
      </div>
      ${discountAmount > 0 ? `
      <div class="total-row">
        <span class="total-label" style="color: #10b981;">Discount</span>
        <span class="total-amount" style="color: #10b981;">-£${discountAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row final">
        <span class="total-label">Total</span>
        <span class="total-amount">${finalAmount === 0 ? 'FREE' : `£${finalAmount.toFixed(2)}`}</span>
      </div>
      <div class="total-row final">
        <span class="total-label">Amount due</span>
        <span class="total-amount">${finalAmount === 0 ? 'FREE' : `£${finalAmount.toFixed(2)}`}</span>
      </div>
    </div>

    <div class="invoice-footer">
      <div class="footer-message">
        Thank you for your business, please see our terms incorporated by reference.
        <br>
        <a href="https://clickalinks.com/terms">https://clickalinks.com/terms</a>
      </div>
      <div class="footer-company">
        <p><strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong></p>
        <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} Clicado Media UK Ltd. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  if (loading) {
    return (
      <div className="invoice-view-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-view-container">
        <div className="error-message">
          <h2>Error Loading Invoice</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-view-wrapper">
      <div className="invoice-view-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <button 
          onClick={() => window.print()} 
          className="print-button"
        >
          🖨️ Print Invoice
        </button>
      </div>
      <div 
        className="invoice-html-content" 
        dangerouslySetInnerHTML={{ __html: invoiceHTML }} 
      />
    </div>
  );
};

export default InvoiceView;

