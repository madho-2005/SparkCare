/**
 * SparkCare Email Layout & Sanitization Utility
 * Production-ready HTML email wrapper with XSS escaping.
 */

export const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const wrapEmailTemplate = ({ title, preheader = '', contentHtml }) => {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      color: #ffffff;
    }
    .tagline {
      font-size: 13px;
      color: #bfdbfe;
      margin: 6px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .body-content {
      padding: 32px 28px;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .badge-info { background: #eff6ff; color: #1d4ed8; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin: 20px 0;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      padding: 10px 12px;
      font-weight: 600;
    }
    .table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .price-total {
      font-size: 20px;
      font-weight: 800;
      color: #2563eb;
    }
  </style>
</head>
<body>
  ${safePreheader ? `<div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${safePreheader}</div>` : ''}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo">⚡ SparkCare</h1>
        <p class="tagline">Electrical Products &amp; Certified Home Services</p>
      </div>
      <div class="body-content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px 0;"><strong>SparkCare Support:</strong> 1800-SPARKCARE | support@sparkcare.com</p>
        <p style="margin: 0 0 6px 0;">SparkCare will never ask for your account password or UPI PIN via email.</p>
        <p style="margin: 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} SparkCare Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
