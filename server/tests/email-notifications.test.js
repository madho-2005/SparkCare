import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_ENV = 'test';

// Models
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Service } from '../models/Service.js';
import { Order } from '../models/Order.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';

// Services
import { emailService } from '../services/emailService.js';
import { notificationService } from '../services/notificationService.js';
import { escapeHtml } from '../templates/baseTemplate.js';

describe('SparkCare Production-Ready Nodemailer Email Notifications Test Suite', () => {
  let testUser;
  let testAdmin;
  let testProduct;
  let testService;

  before(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean previous test records
    await User.deleteMany({ email: /test-email-.*@sparkcare-email-test\.com/ });
    await Product.deleteMany({ sku: /EMAIL-TEST-SKU/ });
    await Service.deleteMany({ title: /Email Test Service/ });
    await Order.deleteMany({ 'shippingAddress.street': '777 Electric Way' });
    await Booking.deleteMany({ notes: 'Email Test Booking' });
    await Payment.deleteMany({ transactionId: /TXN-EMAIL-TEST/ });

    // Create test customer
    testUser = await User.create({
      name: 'Rohan Sharma',
      email: `test-email-cust-${Date.now()}@sparkcare-email-test.com`,
      password: 'StrongPassword123!',
      phoneNumber: '+919876543210',
      role: 'user',
    });

    // Create test admin
    testAdmin = await User.create({
      name: 'Operations Admin',
      email: `test-email-admin-${Date.now()}@sparkcare-email-test.com`,
      password: 'AdminPassword123!',
      phoneNumber: '+919876543211',
      role: 'admin',
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Schneider Smart MCB Breaker 32A',
      description: 'Heavy duty smart MCB breaker for residential electrical panels.',
      price: 1250,
      sku: `EMAIL-TEST-SKU-${Date.now()}`,
      category: 'Switchgear',
      brand: 'Schneider Electric',
      stockCount: 8,
      status: 'active',
      isActive: true,
      images: [{ secure_url: 'https://res.cloudinary.com/sparkcare/sample.jpg', public_id: 'sample' }],
    });

    // Create test service
    testService = await Service.create({
      title: `Email Test Service ${Date.now()}`,
      description: 'Comprehensive 50-point safety inspection by licensed electricians.',
      basePrice: 1500,
      estimatedMinutes: 120,
      category: 'Inspection',
      isActive: true,
      images: [{ secure_url: 'https://res.cloudinary.com/sparkcare/service.jpg', public_id: 'service' }],
    });
  });

  after(async () => {
    await User.deleteMany({ email: /test-email-.*@sparkcare-email-test\.com/ });
    await Product.deleteMany({ sku: /EMAIL-TEST-SKU/ });
    await Service.deleteMany({ title: /Email Test Service/ });
    await Order.deleteMany({ 'shippingAddress.street': '777 Electric Way' });
    await Booking.deleteMany({ notes: 'Email Test Booking' });
    await Payment.deleteMany({ transactionId: /TXN-EMAIL-TEST/ });
  });

  // =========================================================================
  // 1. Core Email Service & Input Validation
  // =========================================================================
  describe('1. Core Email Service & Input Validation', () => {
    test('1.1: Rejects missing or invalid recipient email format safely', async () => {
      const resMissing = await emailService.sendEmail({
        to: '',
        subject: 'Test Subject',
        text: 'Test Body',
      });
      assert.equal(resMissing.success, false);
      assert.match(resMissing.error, /invalid or missing recipient/i);

      const resInvalid = await emailService.sendEmail({
        to: 'not-an-email',
        subject: 'Test Subject',
        text: 'Test Body',
      });
      assert.equal(resInvalid.success, false);
      assert.match(resInvalid.error, /invalid or missing recipient/i);
    });

    test('1.2: Rejects empty subject safely', async () => {
      const res = await emailService.sendEmail({
        to: testUser.email,
        subject: '   ',
        text: 'Test Body',
      });
      assert.equal(res.success, false);
      assert.match(res.error, /subject cannot be empty/i);
    });

    test('1.3: Rejects completely empty email body content safely', async () => {
      const res = await emailService.sendEmail({
        to: testUser.email,
        subject: 'Valid Subject',
        text: '',
        html: '',
      });
      assert.equal(res.success, false);
      assert.match(res.error, /content cannot be empty/i);
    });

    test('1.4: In test/unconfigured mode, renders email dynamically in memory without saving to disk', async () => {
      const res = await emailService.sendEmail({
        to: testUser.email,
        subject: 'Order Notice',
        html: '<p>Order details</p>',
      });
      assert.equal(res.success, true);
      assert.equal(res.status, 'rendered');
      assert.ok(res.html);
      assert.equal(res.spoolFile, undefined);
    });

    test('1.5: SMTP verification diagnostic method executes safely without throwing', async () => {
      const verification = await emailService.verifyConnection();
      assert.ok(verification);
      assert.ok(typeof verification.configured === 'boolean');
      assert.ok(!verification.password);
      assert.ok(!verification.auth);
    });

    test('1.6: Simulates SMTP failure: returns safe error and does NOT throw or crash', async () => {
      const originalTransporter = emailService.transporter;
      const originalConfigured = emailService.isSmtpConfigured;
      const originalNodeEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'production';
        emailService.isSmtpConfigured = true;
        emailService.transporter = {
          sendMail: async () => {
            throw new Error('Connection timeout to SMTP host');
          },
        };

        const result = await emailService.sendEmail({
          to: testUser.email,
          subject: 'Test SMTP Error Handling',
          text: 'Body text',
        });

        assert.equal(result.success, false);
        assert.match(result.error, /Connection timeout/);
        assert.equal(result.spoolFile, undefined);
      } finally {
        emailService.transporter = originalTransporter;
        emailService.isSmtpConfigured = originalConfigured;
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  // =========================================================================
  // 2. Dynamic Order Confirmation Email
  // =========================================================================
  describe('2. Dynamic Order Confirmation Email', () => {
    test('2.1: Generates order confirmation with real database values dynamically', async () => {
      const order = await Order.create({
        customer: testUser._id,
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            sku: testProduct.sku,
            quantity: 2,
            unitPrice: 1250,
          },
        ],
        shippingAddress: {
          street: '777 Electric Way',
          city: 'Ahmedabad',
          state: 'Gujarat',
          zipCode: '380015',
        },
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        orderStatus: 'placed',
        totals: {
          subtotal: 2500,
          tax: 200,
          shippingFee: 0,
          discount: 0,
          grandTotal: 2700,
        },
      });

      const result = await notificationService.sendOrderConfirmation(order._id);
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const spooledContent = result.html;

      // Verify REAL database values are dynamically populated
      assert.ok(spooledContent.includes(testUser.name), 'Must include real customer name');
      assert.ok(spooledContent.includes(order._id.toString()), 'Must include real Order ID');
      assert.ok(spooledContent.includes('Schneider Smart MCB Breaker 32A'), 'Must include real product name');
      assert.ok(spooledContent.includes('2700.00'), 'Must include real total amount');
      assert.ok(spooledContent.includes('Ahmedabad'), 'Must include real delivery city');
      assert.ok(spooledContent.includes('380015'), 'Must include real postal code');

      // Verify no hardcoded dummy data
      assert.ok(!spooledContent.includes('ORD-12345'));
      assert.ok(!spooledContent.includes('Laptop'));
    });
  });

  // =========================================================================
  // 3. Order Status Update & Duplicate Email Suppression
  // =========================================================================
  describe('3. Order Status Update & Duplicate Suppression', () => {
    test('3.1: Sends order status update when previousStatus !== newStatus', async () => {
      const order = await Order.findOne({ customer: testUser._id });
      assert.ok(order);

      const result = await notificationService.sendOrderStatusUpdate(order._id, 'shipped', 'placed');
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const spooledContent = result.html;
      assert.ok(spooledContent.includes('SHIPPED'));
      assert.ok(spooledContent.includes(order._id.toString()));
    });

    test('3.2: Prevents duplicate status email when previousStatus === newStatus', async () => {
      const order = await Order.findOne({ customer: testUser._id });
      assert.ok(order);

      const result = await notificationService.sendOrderStatusUpdate(order._id, 'shipped', 'shipped');
      assert.equal(result.skipped, true);
      assert.equal(result.reason, 'Duplicate status');
    });
  });

  // =========================================================================
  // 4. Manual Payment Verification Emails
  // =========================================================================
  describe('4. Manual Payment Verification Emails', () => {
    let testPayment;

    before(async () => {
      const order = await Order.findOne({ customer: testUser._id });
      testPayment = await Payment.create({
        transactionId: `TXN-EMAIL-TEST-${Date.now()}`,
        amount: 2700,
        currency: 'USD',
        gateway: 'qr',
        status: 'proof_submitted',
        paymentType: 'order',
        referenceId: order._id,
        paymentTypeModel: 'Order',
        customer: testUser._id,
      });
    });

    test('4.1: Sends payment proof submitted email dynamically', async () => {
      const order = await Order.findOne({ customer: testUser._id });
      const result = await notificationService.sendPaymentProofSubmitted(order._id);
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes(testUser.name));
      assert.ok(content.includes('2700.00'));
      assert.ok(content.includes('UNDER VERIFICATION'));
    });

    test('4.2: Sends payment approved email with verified transaction ID and admin note', async () => {
      const result = await notificationService.sendPaymentVerification(
        testPayment._id,
        testUser,
        'verified',
        'Approved by Finance Desk: Matches ICICI UPI reference'
      );
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes(testPayment.transactionId));
      assert.ok(content.includes('VERIFIED &amp; CONFIRMED'));
      assert.ok(content.includes('Matches ICICI UPI reference'));
    });

    test('4.3: Sends payment rejected email with rejection reason note', async () => {
      const result = await notificationService.sendPaymentVerification(
        testPayment._id,
        testUser,
        'rejected',
        'UTR number not found in bank statement'
      );
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes(testPayment.transactionId));
      assert.ok(content.includes('PAYMENT REJECTED'));
      assert.ok(content.includes('UTR number not found in bank statement'));
    });
  });

  // =========================================================================
  // 5. Service Booking Emails & Deduplication
  // =========================================================================
  describe('5. Service Booking Emails', () => {
    let testBooking;

    test('5.1: Generates booking confirmation email from database records', async () => {
      testBooking = await Booking.create({
        customer: testUser._id,
        service: testService._id,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeSlot: '14:00 - 17:00',
        address: {
          street: '42 Subhash Chowk',
          city: 'Ahmedabad',
          state: 'Gujarat',
          zipCode: '380001',
        },
        basePrice: 1500,
        discount: 0,
        totalPrice: 1500,
        bookingStatus: 'scheduled',
        paymentStatus: 'unpaid',
        notes: 'Email Test Booking',
      });

      const result = await notificationService.sendBookingConfirmation(testBooking._id);
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes(testUser.name));
      assert.ok(content.includes(testBooking._id.toString()));
      assert.ok(content.includes(testService.title));
      assert.ok(content.includes('14:00 - 17:00'));
      assert.ok(content.includes('1500.00'));
    });

    test('5.2: Sends booking status update email on status transition', async () => {
      const result = await notificationService.sendBookingStatusUpdate(
        testBooking._id,
        'in_transit',
        'scheduled'
      );
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes('IN TRANSIT'));
    });

    test('5.3: Suppresses duplicate booking status email when status is unchanged', async () => {
      const result = await notificationService.sendBookingStatusUpdate(
        testBooking._id,
        'in_transit',
        'in_transit'
      );
      assert.equal(result.skipped, true);
      assert.equal(result.reason, 'Duplicate status');
    });
  });

  // =========================================================================
  // 6. Stock Alerts (Low Stock & Out of Stock)
  // =========================================================================
  describe('6. Stock Alerts (Low Stock & Out of Stock)', () => {
    test('6.1: Dispatches low-stock email when crossing threshold (e.g. 6 -> 4)', async () => {
      notificationService.resetAlertHistory();

      const result = await notificationService.sendLowStockAlert(testProduct._id, 6, 4, 5);
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes('Low Stock Inventory Alert'));
      assert.ok(content.includes(testProduct.name));
      assert.ok(content.includes('4 unit(s) remaining'));
      assert.ok(content.includes('5 unit(s)'));
    });

    test('6.2: Anti-spam: Suppresses duplicate low-stock email if already in low stock (e.g. 4 -> 3)', async () => {
      const result = await notificationService.sendLowStockAlert(testProduct._id, 4, 3, 5);
      assert.equal(result.skipped, true);
      assert.equal(result.reason, 'Already in low-stock condition');
    });

    test('6.3: Dispatches out-of-stock email when stock reaches 0', async () => {
      notificationService.resetAlertHistory();

      const result = await notificationService.sendOutOfStockAlert(testProduct._id);
      assert.ok(result.success);
      assert.equal(result.spoolFile, undefined);

      const content = result.html;
      assert.ok(content.includes('Product Out of Stock'));
      assert.ok(content.includes(testProduct.name));
      assert.ok(content.includes('0'));
    });
  });

  // =========================================================================
  // 7. Security & Non-Permanent Storage Audits
  // =========================================================================
  describe('7. Security & Data Storage Audits', () => {
    test('7.1: XSS HTML injection in user inputs is safely escaped', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const safeOutput = escapeHtml(maliciousInput);
      assert.equal(safeOutput, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      assert.ok(!safeOutput.includes('<script>'));
    });

    test('7.2: Sensitive credentials (passwords, tokens, OTPs) are NEVER in email templates', async () => {
      const order = await Order.findOne({ customer: testUser._id });
      assert.ok(order);

      const result = await notificationService.sendOrderConfirmation(order._id);
      const content = result.html;

      assert.ok(!content.includes('TestPassword123!'), 'User password must not appear');
      assert.ok(!content.includes('refreshToken'), 'Refresh token must not appear');
      assert.ok(!content.includes('accessToken'), 'Access token must not appear');
      assert.ok(!content.includes('refreshTokenHash'), 'Token hash must not appear');
    });

    test('7.3: Data Storage Requirement: No email content collections created in MongoDB', async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const names = collections.map((c) => c.name.toLowerCase());

      const forbiddenCollections = [
        'emailnotification',
        'emailnotifications',
        'emailhistory',
        'mailqueue',
        'sentemails',
        'notificationemails',
      ];

      for (const forbidden of forbiddenCollections) {
        assert.ok(
          !names.includes(forbidden),
          `Forbidden permanent email collection "${forbidden}" must not exist in MongoDB`
        );
      }

      // Verify that NO email-spool directory exists on disk
      const spoolPath = path.join(__dirname, '..', 'logs', 'email_spool');
      if (fs.existsSync(spoolPath)) {
        const spoolFiles = fs.readdirSync(spoolPath);
        assert.equal(spoolFiles.length, 0, 'No email HTML files should be stored in email_spool');
      }
    });

    test('7.4: Frontend directory does not contain Nodemailer or SMTP credentials', () => {
      const clientDir = path.join(__dirname, '..', '..', 'client', 'src');
      const files = fs.readdirSync(clientDir, { recursive: true });

      for (const file of files) {
        if (typeof file === 'string' && (file.endsWith('.js') || file.endsWith('.jsx'))) {
          const filePath = path.join(clientDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          assert.ok(!content.includes('nodemailer'), `client file ${file} must not import nodemailer`);
          assert.ok(!content.includes('SMTP_PASSWORD'), `client file ${file} must not contain SMTP_PASSWORD`);
        }
      }
    });
  });
});
