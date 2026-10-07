import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/**
 * Safely masks an email address for compliance and production logs.
 * Masks characters in the mailbox username while preserving the domain.
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return 'unknown';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
};

/**
 * Validates email address format.
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

class EmailService {
  constructor() {
    this.transporter = null;
    this.isSmtpConfigured = false;
    this.initTransporter();
  }

  /**
   * Initializes a single, reusable Nodemailer SMTP transporter.
   * Reads credentials strictly from backend environment variables.
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
          pool: true, // Reuse persistent SMTP connections
          maxConnections: 5,
          maxMessages: 100,
        });
        this.isSmtpConfigured = true;
        logger.info(`[Email Service] SMTP transporter configured for host: ${host}:${port}`);
      } catch (err) {
        logger.error(`[Email Service] Transporter initialization failed: ${err.message}`);
        this.transporter = null;
        this.isSmtpConfigured = false;
      }
    } else {
      logger.warn('[Email Service] SMTP credentials not set in environment. Using graceful fallback.');
      this.transporter = null;
      this.isSmtpConfigured = false;
    }
  }

  /**
   * Diagnostic verification method for backend startup or health diagnostics.
   * Verifies the SMTP transporter connection without exposing secrets.
   */
  async verifyConnection() {
    if (!this.isSmtpConfigured || !this.transporter) {
      return {
        configured: false,
        verified: false,
        message: 'SMTP is not configured in environment variables',
      };
    }

    try {
      await this.transporter.verify();
      logger.info('[Email Service] SMTP connection verified successfully with mail server.');
      return {
        configured: true,
        verified: true,
        message: 'SMTP transporter verified successfully',
      };
    } catch (err) {
      logger.warn(`[Email Service] SMTP connection verification failed: ${err.message}`);
      return {
        configured: true,
        verified: false,
        error: err.message,
      };
    }
  }

  /**
   * Constructs the authoritative FROM header string.
   */
  getFromAddress() {
    if (process.env.SMTP_FROM && process.env.SMTP_FROM.trim()) {
      return process.env.SMTP_FROM.trim();
    }
    const fromName = process.env.SMTP_FROM_NAME || 'SparkCare';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '';
    return fromEmail ? `"${fromName}" <${fromEmail}>` : fromName;
  }

  /**
   * Central dispatcher: sends an email dynamically in memory.
   * Never stores generated HTML bodies in MongoDB.
   * Returns a safe status object and never throws uncaught exceptions.
   */
  async sendEmail({ to, subject, html, text }) {
    // 1. Validation
    if (!to || !isValidEmail(to)) {
      logger.warn(`[Email Service] Rejected send attempt: invalid or missing recipient (${maskEmail(to)})`);
      return {
        success: false,
        error: 'Invalid or missing recipient email address',
      };
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      logger.warn('[Email Service] Rejected send attempt: subject is missing or empty');
      return {
        success: false,
        error: 'Email subject cannot be empty',
      };
    }

    if (!html && !text) {
      logger.warn('[Email Service] Rejected send attempt: empty email content');
      return {
        success: false,
        error: 'Email body content cannot be empty',
      };
    }

    const from = this.getFromAddress();

    // 2. Dispatch via SMTP if configured and not test mode
    if (this.isSmtpConfigured && this.transporter && process.env.NODE_ENV !== 'test') {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: to.trim(),
          subject: subject.trim(),
          text: text || subject,
          html: html || undefined,
        });

        logger.info(
          `[Email Service] Email dispatched successfully to ${maskEmail(to)}. MessageId: ${info.messageId}`
        );

        return {
          success: true,
          messageId: info.messageId,
          html,
          text,
        };
      } catch (err) {
        logger.error(
          `[Email Service] SMTP delivery failed to ${maskEmail(to)}: ${err.message}.`
        );
        return {
          success: false,
          error: err.message,
          html,
          text,
        };
      }
    }

    // 3. Test or unconfigured environment: purely in-memory execution, no local file storage
    logger.debug(`[Email Service] In-memory notification generated for ${maskEmail(to)}: "${subject}"`);
    return {
      success: true,
      status: 'rendered',
      html,
      text,
    };
  }

  /**
   * Alias for sendEmail
   */
  async sendMail(options) {
    return this.sendEmail(options);
  }
}

export const emailService = new EmailService();
export default emailService;
