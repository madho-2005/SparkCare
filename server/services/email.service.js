import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the email spool directory exists for local testing/audit trail
const spoolDir = path.join(__dirname, '..', 'logs', 'email_spool');
if (!fs.existsSync(spoolDir)) {
  fs.mkdirSync(spoolDir, { recursive: true });
}

class EmailService {
  constructor() {
    this.transporter = null;
    this.isSmtpConfigured = false;
    this.initTransporter();
  }

  /**
   * Initializes Nodemailer SMTP transporter using environment variables.
   * Gracefully falls back to local audit spooler if credentials are not configured.
   */
  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
          },
        });
        this.isSmtpConfigured = true;
        logger.info(`[Email Service] SMTP transport configured successfully for host ${host}:${port}`);
      } catch (err) {
        logger.error(`[Email Service] Failed to initialize SMTP transport: ${err.message}`);
        this.transporter = null;
        this.isSmtpConfigured = false;
      }
    } else {
      logger.warn('[Email Service] SMTP credentials not configured in environment. Using local file spooling for notifications.');
      this.isSmtpConfigured = false;
    }
  }

  /**
   * Core dispatcher: sends via Nodemailer SMTP if configured,
   * or spools to server/logs/email_spool/ if in dev/test/unconfigured.
   * Never throws uncaught exceptions that would crash callers or abort orders.
   */
  async sendMail({ to, subject, html, text, spoolFilename }) {
    const from = process.env.SMTP_FROM || 'SparkCare Notifications <no-reply@sparkcare.com>';
    const filename = spoolFilename || `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.html`;

    // 1. Spool to local disk for audit logs
    try {
      const filePath = path.join(spoolDir, filename);
      fs.writeFileSync(filePath, html, 'utf-8');
      logger.debug(`[Email Service] Email spooled locally to ${filePath}`);
    } catch (spoolErr) {
      logger.error(`[Email Service] Failed to write email spool file: ${spoolErr.message}`);
    }

    // 2. If SMTP is active and not test environment, attempt real dispatch
    if (this.isSmtpConfigured && this.transporter && process.env.NODE_ENV !== 'test') {
      try {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          text: text || subject,
          html,
        });
        logger.info(`[Email Service] Message sent successfully to ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        logger.error(`[Email Service] SMTP delivery failed for ${to}: ${err.message}. Email preserved in spool.`);
        return { success: false, error: err.message, spooled: true };
      }
    }

    return { success: true, status: 'spooled', spooled: true, spoolFile: path.join(spoolDir, filename) };
  }

  /**
   * Sends order placement confirmation email
   */
  async sendOrderConfirmation(order, user) {
    if (!user || !user.email) return;

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.name || item.product?.name || 'SparkCare Product'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const grandTotal = order.totals?.grandTotal || 0;
    const subtotal = order.totals?.subtotal || 0;
    const tax = order.totals?.tax || 0;
    const shipping = order.totals?.shippingFee || 0;
    const discount = order.totals?.discount || 0;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation #${order._id}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); padding: 32px; margin: 0 auto; border: 1px solid #e2e8f0; }
          .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef9c3; color: #854d0e; }
          .summary-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .total-box { margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ SparkCare</div>
            <p style="font-size: 14px; color: #64748b; margin-top: 4px;">Thank you for placing your order!</p>
          </div>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your order <strong>#${order.orderNumber || order._id}</strong> has been registered on SparkCare.</p>
          
          <div style="margin: 20px 0; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'qr' ? 'Manual UPI QR Transfer' : 'Online'}</p>
            <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span class="badge ${order.paymentStatus === 'paid' || order.paymentStatus === 'verified' ? 'badge-success' : 'badge-warning'}">${(order.paymentStatus || 'pending').toUpperCase()}</span></p>
            <p style="margin: 4px 0;"><strong>Order Status:</strong> <span class="badge badge-warning">${(order.orderStatus || 'placed').toUpperCase()}</span></p>
          </div>

          <h3>Order Items</h3>
          <table class="summary-table">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="color: #64748b;">Subtotal</td><td style="text-align: right;">₹${subtotal.toFixed(2)}</td></tr>
              <tr><td style="color: #64748b;">Tax (GST)</td><td style="text-align: right;">₹${tax.toFixed(2)}</td></tr>
              <tr><td style="color: #64748b;">Delivery Fee</td><td style="text-align: right;">₹${shipping.toFixed(2)}</td></tr>
              ${discount > 0 ? `<tr><td style="color: #dc2626;">Coupon Discount</td><td style="text-align: right; color: #dc2626;">-₹${discount.toFixed(2)}</td></tr>` : ''}
              <tr style="font-size: 18px; font-weight: bold; border-top: 2px solid #e2e8f0;">
                <td style="padding-top: 12px;">Total Payable</td>
                <td style="text-align: right; padding-top: 12px; color: #2563eb;">₹${grandTotal.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            SparkCare 24/7 Support Hotline: 1800-SPARKCARE | support@sparkcare.com
          </p>
        </div>
      </body>
    </html>`;

    return await this.sendMail({
      to: user.email,
      subject: `Order Confirmation #${order.orderNumber || order._id} — SparkCare`,
      html,
      spoolFilename: `order_placed_${order._id}.html`,
    });
  }

  /**
   * Notifies user that their UPI payment proof screenshot has been received and queued for admin review.
   */
  async sendPaymentProofSubmitted(order, user) {
    if (!user || !user.email) return;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Proof Received - SparkCare</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; background: white; border-radius: 16px; padding: 32px; margin: 0 auto; border: 1px solid #e2e8f0; }
          .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #2563eb; }
          .banner { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 16px; border-radius: 12px; font-weight: 600; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ SparkCare</div>
            <p style="font-size: 14px; color: #64748b;">Payment Verification In Progress</p>
          </div>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We have successfully received your payment receipt screenshot for Order <strong>#${order.orderNumber || order._id}</strong>.</p>
          
          <div class="banner">
            Payment proof submitted. Your order will be confirmed after admin verification.
          </div>

          <p>Our finance operations team is actively auditing the transaction against bank and UPI records. Once verified, your order status will be updated to <strong>CONFIRMED</strong> and fulfillment will begin.</p>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            SparkCare 24/7 Support Hotline: 1800-SPARKCARE
          </p>
        </div>
      </body>
    </html>`;

    return await this.sendMail({
      to: user.email,
      subject: `Payment Proof Received for Order #${order.orderNumber || order._id} — SparkCare`,
      html,
      spoolFilename: `payment_proof_submitted_${order._id}.html`,
    });
  }

  /**
   * Sends payment verification outcome email (approval or rejection) with admin note.
   */
  async sendPaymentVerification(payment, user, status, note = '') {
    if (!user || !user.email) return;

    const isVerified = status === 'verified' || status === 'succeeded';
    const filename = `payment_verification_${payment._id}.html`;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Status Update - SparkCare</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; background: white; border-radius: 16px; padding: 32px; margin: 0 auto; border: 1px solid #e2e8f0; }
          .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #2563eb; }
          .status-banner { padding: 16px; border-radius: 12px; font-weight: 700; text-align: center; margin: 20px 0; }
          .status-approved { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .status-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ SparkCare</div>
            <p style="font-size: 14px; color: #64748b;">Manual UPI Payment Verification Notice</p>
          </div>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your manual UPI payment review for transaction reference <strong>#${payment.transactionId}</strong> has been completed by the administration team.</p>
          
          <div class="status-banner ${isVerified ? 'status-approved' : 'status-rejected'}">
            Payment Status: ${isVerified ? 'VERIFIED & CONFIRMED' : 'REJECTED / UNVERIFIED'}
          </div>

          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <p style="margin: 4px 0;"><strong>Target:</strong> ${(payment.paymentType || 'order').toUpperCase()} #${payment.referenceId}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${(payment.amount || 0).toFixed(2)}</p>
            ${note ? `<p style="margin: 4px 0;"><strong>Review Note:</strong> ${note}</p>` : ''}
          </div>

          ${isVerified ? 
            `<p>Your payment has been matched with bank records. Your order is now confirmed and forwarded to dispatch.</p>` :
            `<p>Unfortunately, your payment screenshot could not be matched with bank transaction records. Please re-upload a clear receipt screenshot or contact support.</p>`
          }

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            SparkCare 24/7 Support Hotline: 1800-SPARKCARE
          </p>
        </div>
      </body>
    </html>`;

    return await this.sendMail({
      to: user.email,
      subject: `Payment Verification ${isVerified ? 'Approved' : 'Rejected'} #${payment.transactionId} — SparkCare`,
      html,
      spoolFilename: filename,
    });
  }

  /**
   * Sends booking creation confirmation
   */
  async sendBookingConfirmation(booking, user) {
    if (!user || !user.email) return;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Electrician Service Booking #${booking._id}</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; background: white; border-radius: 16px; padding: 32px; margin: 0 auto; border: 1px solid #e2e8f0; }
          .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ SparkCare Electricians</div>
            <p style="font-size: 14px; color: #64748b;">Service Booking Confirmed</p>
          </div>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your electrician service booking <strong>#${booking._id}</strong> has been registered.</p>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Scheduled Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString('en-IN')}</p>
            <p style="margin: 4px 0;"><strong>Time Window:</strong> ${booking.timeSlot}</p>
            <p style="margin: 4px 0;"><strong>Total Estimate:</strong> ₹${(booking.totalPrice || 0).toFixed(2)}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${booking.bookingStatus}</p>
          </div>

          <p>A licensed certified electrician will be dispatched to your address during your scheduled timeslot.</p>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            SparkCare 24/7 Support: 1800-SPARKCARE
          </p>
        </div>
      </body>
    </html>`;

    return await this.sendMail({
      to: user.email,
      subject: `Electrician Service Scheduled #${booking._id} — SparkCare`,
      html,
      spoolFilename: `booking_created_${booking._id}.html`,
    });
  }

  /**
   * Sends booking status transition alert
   */
  async sendBookingStatusUpdate(booking, user, status) {
    if (!user || !user.email) return;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Status Update - SparkCare</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; background: white; border-radius: 16px; padding: 32px; margin: 0 auto; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>⚡ SparkCare Service Status Update</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your electrician service booking <strong>#${booking._id}</strong> status has been updated to:</p>
          <h3 style="color: #2563eb; text-transform: uppercase;">${status.replace('_', ' ')}</h3>
          <p>Scheduled Date: ${new Date(booking.scheduledDate).toLocaleDateString('en-IN')} (${booking.timeSlot})</p>
        </div>
      </body>
    </html>`;

    return await this.sendMail({
      to: user.email,
      subject: `Booking Status Update #${booking._id}: ${status} — SparkCare`,
      html,
      spoolFilename: `booking_status_${booking._id}.html`,
    });
  }

  /**
   * Sends password reset link
   */
  async sendPasswordReset(user, resetUrl) {
    if (!user || !user.email) return;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request - SparkCare</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; background: white; border-radius: 16px; padding: 32px; margin: 0 auto; border: 1px solid #e2e8f0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>⚡ SparkCare Password Reset</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You requested a password reset for your SparkCare account. Click the button below to choose a new password:</p>
          <a href="${resetUrl}" class="button" style="color: white;">Reset My Password</a>
          <p>If you did not make this request, you can safely ignore this email.</p>
        </div>
      </body>
    </html>`;

    return await this.sendMail({
      to: user.email,
      subject: `Password Reset Request — SparkCare`,
      html,
      spoolFilename: `password_reset_${user._id}.html`,
    });
  }

  /**
   * Low Stock Alert email for inventory operations
   */
  async sendLowStockAlert(product) {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@sparkcare.com';
    const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #dc2626;">⚡ CRITICAL STOCK LEVEL WARNING</h2>
        <p>Product: <strong>${product.name}</strong> (SKU: ${product.sku || product.slug})</p>
        <p>Remaining Stock: <strong style="color: #dc2626; font-size: 18px;">${product.stockCount} units</strong></p>
        <p>Please restock this item immediately to prevent order fulfillment disruption.</p>
      </body>
    </html>`;

    return await this.sendMail({
      to: adminEmail,
      subject: `[INVENTORY WARNING] Low Stock: ${product.name}`,
      html,
      spoolFilename: `low_stock_${product.sku || product._id}.html`,
    });
  }

  /**
   * Alias for sendMail
   */
  async sendEmail(options) {
    return this.sendMail(options);
  }
}

export const emailService = new EmailService();
export default emailService;
