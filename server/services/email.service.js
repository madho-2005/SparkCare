import { emailService as coreEmailService } from './emailService.js';
import { notificationService } from './notificationService.js';

/**
 * Unified EmailService adapter.
 * Re-exports core transporter and notification methods for backwards compatibility
 * while implementing production-grade dynamic database rendering.
 */
class EmailServiceAdapter {
  constructor() {
    this.emailService = coreEmailService;
    this.notificationService = notificationService;
  }

  get transporter() {
    return this.emailService.transporter;
  }

  set transporter(val) {
    this.emailService.transporter = val;
  }

  get isSmtpConfigured() {
    return this.emailService.isSmtpConfigured;
  }

  set isSmtpConfigured(val) {
    this.emailService.isSmtpConfigured = val;
  }

  initTransporter() {
    return this.emailService.initTransporter();
  }

  async verifyConnection() {
    return this.emailService.verifyConnection();
  }

  async sendMail(options) {
    return this.emailService.sendEmail(options);
  }

  async sendEmail(options) {
    return this.emailService.sendEmail(options);
  }

  async sendOrderConfirmation(order, user) {
    return this.notificationService.sendOrderConfirmation(order, user);
  }

  async sendPaymentProofSubmitted(order, user) {
    return this.notificationService.sendPaymentProofSubmitted(order, user);
  }

  async sendPaymentVerification(payment, user, status, note = '') {
    return this.notificationService.sendPaymentVerification(payment, user, status, note);
  }

  async sendOrderStatusUpdate(order, newStatus, previousStatus = '') {
    return this.notificationService.sendOrderStatusUpdate(order, newStatus, previousStatus);
  }

  async sendBookingConfirmation(booking, user) {
    return this.notificationService.sendBookingConfirmation(booking, user);
  }

  async sendBookingStatusUpdate(booking, user, status, previousStatus = '') {
    return this.notificationService.sendBookingStatusUpdate(booking, status, previousStatus || '');
  }

  async sendLowStockAlert(product, previousStock = null, currentStock = null, threshold = 5) {
    return this.notificationService.sendLowStockAlert(product, previousStock, currentStock, threshold);
  }

  async sendOutOfStockAlert(product) {
    return this.notificationService.sendOutOfStockAlert(product);
  }
}

export const emailServiceAdapter = new EmailServiceAdapter();
export const emailService = emailServiceAdapter;
export { notificationService };
export default emailServiceAdapter;
