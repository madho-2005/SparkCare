import mongoose from 'mongoose';
import { emailService } from './emailService.js';
import { Order } from '../models/Order.js';
import { Booking } from '../models/Booking.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { logger } from '../utils/logger.js';

// Template builders
import { buildOrderConfirmationTemplate } from '../templates/orderConfirmation.js';
import { buildOrderStatusTemplate } from '../templates/orderStatus.js';
import { buildPaymentProofSubmittedTemplate } from '../templates/paymentProofSubmitted.js';
import { buildPaymentStatusTemplate } from '../templates/paymentStatus.js';
import { buildBookingConfirmationTemplate } from '../templates/bookingConfirmation.js';
import { buildBookingStatusTemplate } from '../templates/bookingStatus.js';
import { buildLowStockTemplate } from '../templates/lowStock.js';
import { buildOutOfStockTemplate } from '../templates/outOfStock.js';

class NotificationService {
  constructor() {
    // In-memory registry to prevent spamming duplicate low stock alerts
    // Key: productId string, Value: timestamp of last alert sent
    this.lowStockAlertHistory = new Map();
    this.outOfStockAlertHistory = new Map();
  }

  /**
   * Resolves authoritative administrator email for operational alerts.
   */
  async getAdminEmail() {
    if (process.env.ADMIN_NOTIFICATION_EMAIL && process.env.ADMIN_NOTIFICATION_EMAIL.trim()) {
      return process.env.ADMIN_NOTIFICATION_EMAIL.trim();
    }
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim()) {
      return process.env.ADMIN_EMAIL.trim();
    }

    try {
      const adminUser = await User.findOne({ role: 'admin' }).select('email');
      if (adminUser?.email) {
        return adminUser.email;
      }
    } catch (err) {
      logger.warn(`[Notification] Failed to query admin user: ${err.message}`);
    }

    return null;
  }

  /**
   * Clears in-memory alert history for testing or when inventory is restocked.
   */
  resetAlertHistory(productId = null) {
    if (productId) {
      const idStr = productId.toString();
      this.lowStockAlertHistory.delete(idStr);
      this.outOfStockAlertHistory.delete(idStr);
    } else {
      this.lowStockAlertHistory.clear();
      this.outOfStockAlertHistory.clear();
    }
  }

  /**
   * Sends order placement confirmation email dynamically from database.
   * Never stores generated HTML bodies in MongoDB.
   */
  async sendOrderConfirmation(orderOrId, userOptional = null) {
    try {
      let order = orderOrId;
      if (!order || typeof order === 'string' || order instanceof mongoose.Types.ObjectId) {
        order = await Order.findById(orderOrId).populate('customer').populate('items.product');
      } else if (!order.customer || typeof order.customer === 'string' || order.customer instanceof mongoose.Types.ObjectId) {
        order = await Order.findById(order._id).populate('customer').populate('items.product');
      }

      if (!order) {
        logger.warn(`[Notification] Cannot send order confirmation: Order not found.`);
        return { success: false, reason: 'Order not found' };
      }

      const user = userOptional || order.customer;
      if (!user || !user.email) {
        logger.warn(`[Notification] Order #${order._id} customer has no valid email. Notification skipped.`);
        return { success: false, reason: 'Customer email missing' };
      }

      const template = buildOrderConfirmationTemplate(order, user);
      return await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send order confirmation: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends order status update email dynamically from database.
   * Suppresses duplicate notifications if status hasn't changed.
   */
  async sendOrderStatusUpdate(orderOrId, newStatus, previousStatus = '') {
    try {
      if (previousStatus && newStatus && previousStatus === newStatus) {
        logger.debug(`[Notification] Suppressed duplicate status email for Order: status ${newStatus} unchanged.`);
        return { skipped: true, reason: 'Duplicate status' };
      }

      let order = orderOrId;
      if (!order || typeof order === 'string' || order instanceof mongoose.Types.ObjectId) {
        order = await Order.findById(orderOrId).populate('customer').populate('items.product');
      } else if (!order.customer || typeof order.customer === 'string' || order.customer instanceof mongoose.Types.ObjectId) {
        order = await Order.findById(order._id).populate('customer').populate('items.product');
      }

      if (!order) {
        logger.warn(`[Notification] Cannot send order status update: Order not found.`);
        return { success: false, reason: 'Order not found' };
      }

      const user = order.customer;
      if (!user || !user.email) {
        logger.warn(`[Notification] Order #${order._id} customer has no email. Status email skipped.`);
        return { success: false, reason: 'Customer email missing' };
      }

      const template = buildOrderStatusTemplate(order, user, newStatus, previousStatus);
      return await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send order status update: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Notifies user that their UPI payment screenshot has been uploaded and queued.
   */
  async sendPaymentProofSubmitted(orderOrId, userOptional = null) {
    try {
      let order = orderOrId;
      if (!order || typeof order === 'string' || order instanceof mongoose.Types.ObjectId) {
        order = await Order.findById(orderOrId).populate('customer');
      } else if (!order.customer || typeof order.customer === 'string' || order.customer instanceof mongoose.Types.ObjectId) {
        order = await Order.findById(order._id).populate('customer');
      }

      if (!order) {
        logger.warn(`[Notification] Cannot send payment proof notice: Order not found.`);
        return { success: false, reason: 'Order not found' };
      }

      const user = userOptional || order.customer;
      if (!user || !user.email) {
        return { success: false, reason: 'Customer email missing' };
      }

      const template = buildPaymentProofSubmittedTemplate(order, user);
      return await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send payment proof notice: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends payment verification outcome email (approved or rejected) with admin review note.
   */
  async sendPaymentVerification(paymentOrId, userOptional = null, status = 'verified', note = '') {
    try {
      let payment = paymentOrId;
      if (typeof paymentOrId === 'string' || paymentOrId instanceof mongoose.Types.ObjectId) {
        payment = await Payment.findById(paymentOrId).populate('customer');
      }

      const user = userOptional || payment?.customer;
      if (!user || !user.email) {
        return { success: false, reason: 'Recipient email missing' };
      }

      const template = buildPaymentStatusTemplate(payment, user, status, note);
      return await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send payment verification outcome: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends service booking creation confirmation email dynamically.
   */
  async sendBookingConfirmation(bookingOrId, userOptional = null) {
    try {
      let booking = bookingOrId;
      if (!booking || typeof booking === 'string' || booking instanceof mongoose.Types.ObjectId) {
        booking = await Booking.findById(bookingOrId).populate('customer').populate('service');
      } else if (!booking.customer || typeof booking.customer === 'string' || booking.customer instanceof mongoose.Types.ObjectId) {
        booking = await Booking.findById(booking._id).populate('customer').populate('service');
      }

      if (!booking) {
        logger.warn(`[Notification] Cannot send booking confirmation: Booking not found.`);
        return { success: false, reason: 'Booking not found' };
      }

      const user = userOptional || booking.customer;
      if (!user || !user.email) {
        return { success: false, reason: 'Customer email missing' };
      }

      const template = buildBookingConfirmationTemplate(booking, user);
      return await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send booking confirmation: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends service booking status update email dynamically from database.
   * Suppresses duplicate notifications if status hasn't changed.
   */
  async sendBookingStatusUpdate(bookingOrId, newStatus, previousStatus = '') {
    try {
      if (previousStatus && newStatus && previousStatus === newStatus) {
        logger.debug(`[Notification] Suppressed duplicate booking email: status ${newStatus} unchanged.`);
        return { skipped: true, reason: 'Duplicate status' };
      }

      let booking = bookingOrId;
      if (!booking || typeof booking === 'string' || booking instanceof mongoose.Types.ObjectId) {
        booking = await Booking.findById(bookingOrId).populate('customer').populate('service');
      } else if (!booking.customer || typeof booking.customer === 'string' || booking.customer instanceof mongoose.Types.ObjectId) {
        booking = await Booking.findById(booking._id).populate('customer').populate('service');
      }

      if (!booking) {
        logger.warn(`[Notification] Cannot send booking status update: Booking not found.`);
        return { success: false, reason: 'Booking not found' };
      }

      const user = booking.customer;
      if (!user || !user.email) {
        return { success: false, reason: 'Customer email missing' };
      }

      const template = buildBookingStatusTemplate(booking, user, newStatus, previousStatus);
      return await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send booking status update: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends low stock alert email to administrators.
   * Designed to alert when crossing into the low-stock condition without spamming.
   */
  async sendLowStockAlert(productOrId, previousStock = null, currentStock = null, threshold = 5) {
    try {
      let product = productOrId;
      if (!product || typeof product === 'string' || product instanceof mongoose.Types.ObjectId) {
        product = await Product.findById(productOrId);
      }

      if (!product) {
        return { success: false, reason: 'Product not found' };
      }

      const stock = currentStock !== null ? currentStock : product.stockCount;
      const productIdStr = product._id ? product._id.toString() : (product.sku || 'prod');

      // If previousStock is supplied: only send when crossing from above threshold into <= threshold
      if (previousStock !== null && previousStock !== undefined) {
        if (previousStock <= threshold) {
          logger.debug(`[Notification] Low-stock alert suppressed for "${product.name}": already low previously (${previousStock} -> ${stock}).`);
          return { skipped: true, reason: 'Already in low-stock condition' };
        }
      }

      // In-memory anti-spam check: prevent multiple alerts within cooldown window (e.g. 1 hour)
      const lastAlertTime = this.lowStockAlertHistory.get(productIdStr);
      const now = Date.now();
      const cooldownMs = 60 * 60 * 1000; // 1 hour

      if (lastAlertTime && now - lastAlertTime < cooldownMs && previousStock === null) {
        logger.debug(`[Notification] Low-stock alert throttled for "${product.name}" (alerted ${Math.round((now - lastAlertTime)/1000)}s ago).`);
        return { skipped: true, reason: 'Alert cooldown active' };
      }

      const adminEmail = await this.getAdminEmail();
      if (!adminEmail) {
        logger.debug(`[Notification] Admin email not configured; skipping low-stock alert.`);
        return { skipped: true, reason: 'Admin email not configured' };
      }
      const template = buildLowStockTemplate(product, threshold, stock);

      this.lowStockAlertHistory.set(productIdStr, now);

      return await emailService.sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send low-stock alert: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends out of stock alert email to administrators when stock reaches 0.
   */
  async sendOutOfStockAlert(productOrId) {
    try {
      let product = productOrId;
      if (!product || typeof product === 'string' || product instanceof mongoose.Types.ObjectId) {
        product = await Product.findById(productOrId);
      }

      if (!product) {
        return { success: false, reason: 'Product not found' };
      }

      const productIdStr = product._id ? product._id.toString() : (product.sku || 'prod');
      const lastAlertTime = this.outOfStockAlertHistory.get(productIdStr);
      const now = Date.now();
      const cooldownMs = 60 * 60 * 1000; // 1 hour cooldown

      if (lastAlertTime && now - lastAlertTime < cooldownMs) {
        logger.debug(`[Notification] Out-of-stock alert throttled for "${product.name}".`);
        return { skipped: true, reason: 'Alert cooldown active' };
      }

      const adminEmail = await this.getAdminEmail();
      if (!adminEmail) {
        logger.debug(`[Notification] Admin email not configured; skipping out-of-stock alert.`);
        return { skipped: true, reason: 'Admin email not configured' };
      }
      const template = buildOutOfStockTemplate(product);

      this.outOfStockAlertHistory.set(productIdStr, now);

      return await emailService.sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      logger.error(`[Notification] Failed to send out-of-stock alert: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
