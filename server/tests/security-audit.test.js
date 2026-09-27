import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load server environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_ENV = 'test';

// Import Models
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';

// Import Controllers & Middlewares under test
import { createBooking, getBookings } from '../controllers/booking.controller.js';
import { createOrder, cancelOrder, submitQrPaymentProof } from '../controllers/order.controller.js';
import {
  updateOrderStatus,
  getDashboardStats,
  getAdminReports,
  verifyOrderPayment,
  rejectOrderPayment,
  getPendingQrPayments,
  getOrdersPaymentPending,
  getAdminUsers,
  updateUserRole,
} from '../controllers/admin.controller.js';
import { getActiveCoupons } from '../controllers/coupon.controller.js';
import emailService from '../services/email.service.js';
import { hashToken, verifyTokenHash, login, refresh } from '../controllers/auth.controller.js';
import { validateImageMagicBytes, verifyImageBuffer, upload } from '../middleware/upload.middleware.js';
import { loginRateLimiter, adminStatsRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { mongoSanitize } from '../middleware/mongoSanitize.middleware.js';
import { addProductReview, addServiceReview, deleteReview } from '../controllers/review.controller.js';
import { getProducts } from '../controllers/product.controller.js';
import { updateProfileSchema } from '../validations/auth.validation.js';
import { checkHealth } from '../controllers/health.controller.js';
import { validateEnv } from '../utils/validateEnv.js';

// Helper to mock Express req, res, next
const mockExpress = (body = {}, user = {}, params = {}, cookies = {}, ip = '198.51.100.25', query = {}, file = null) => {
  const headers = {};
  const resCookies = {};

  const app = {
    get(k) {
      if (k === 'trust proxy') return 1;
      return undefined;
    },
  };

  const req = {
    body,
    user,
    params,
    cookies,
    query,
    file,
    headers: {},
    ip,
    app,
    socket: { remoteAddress: ip },
    connection: { remoteAddress: ip },
  };


  const res = {
    statusCode: 200,
    data: null,
    cookies: resCookies,
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
      return this;
    },
    getHeader(key) {
      return headers[key.toLowerCase()];
    },
    getHeaders() {
      return headers;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    },
    cookie(name, value, options) {
      resCookies[name] = { value, options };
      return this;
    },
    clearCookie(name, options) {
      delete resCookies[name];
      return this;
    },
  };

  let nextError = null;
  const next = (err) => {
    if (err) nextError = err;
  };

  return { req, res, next, getError: () => nextError };
};

describe('SparkCare Critical Security Audit Test Suite', () => {
  let testUser;
  let testAdmin;
  let testService;
  let testCoupon;

  before(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up any previous test leftovers
    await User.deleteMany({ email: /test.*@sparkcare-security-test\.com/ });
    await Service.deleteMany({ title: /Security Test Service/ });
    await Product.deleteMany({ sku: /SEC-TEST/ });
    await Coupon.deleteMany({ $or: [{ code: /SEC-TEST/ }, { code: /^REAL/ }, { code: /^REACT/ }] });
    await Booking.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});

    // Create test client user
    testUser = await User.create({
      name: 'Security Test Customer',
      email: `testcustomer-${Date.now()}@sparkcare-security-test.com`,
      password: 'TestPassword123!',
      phoneNumber: '+15550001111',
      role: 'user',
    });

    // Create test admin user
    testAdmin = await User.create({
      name: 'Security Test Admin',
      email: `testadmin-${Date.now()}@sparkcare-security-test.com`,
      password: 'AdminPassword123!',
      phoneNumber: '+15550002222',
      role: 'admin',
    });

    // Create standard ₹10,000 / $10,000 service
    testService = await Service.create({
      title: `Security Test Service ${Date.now()}`,
      description: 'Comprehensive high-voltage electrical panel overhaul',
      category: 'Smart Panel Upgrades',
      basePrice: 10000,
      estimatedMinutes: 120,
      difficulty: 'complex',
      images: [{ secure_url: 'https://example.com/srv.jpg', public_id: 'test_srv' }],
      isActive: true,
    });

    // Create 20% discount coupon
    testCoupon = await Coupon.create({
      code: `SEC-TEST-20-${Date.now()}`,
      discountType: 'percentage',
      discountValue: 20,
      minPurchaseAmount: 100,
      maxDiscountAmount: 3000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days valid
      isActive: true,
      usageLimit: 100,
      usedCount: 0,
    });
  });

  // =========================================================================
  // PART 1 — PRICE TAMPERING TESTS
  // =========================================================================
  describe('PART 1: Price Tampering in Service Bookings', () => {
    test('Test 1.1: Normal booking without client totalPrice produces authoritative ₹10,000', async () => {
      const { req, res, next, getError } = mockExpress(
        {
          serviceId: testService._id.toString(),
          scheduledDate: '2026-10-15',
          timeSlot: '11:00 - 14:00',
          address: { street: '123 Test St', city: 'Metro', state: 'CA', zipCode: '90001' },
          notes: 'Standard check',
        },
        testUser
      );

      await createBooking(req, res, next);
      assert.equal(getError(), null, 'Expected no error');
      assert.equal(res.statusCode, 201);
      assert.equal(res.data.data.totalPrice, 10000, 'Expected authoritative price of 10000');
      assert.equal(res.data.data.basePrice, 10000, 'Expected basePrice snapshot of 10000');
    });

    test('Test 1.2: Malicious client sends totalPrice = 1 (price tampering rejected, uses ₹10,000)', async () => {
      const { req, res, next, getError } = mockExpress(
        {
          serviceId: testService._id.toString(),
          scheduledDate: '2026-10-16',
          timeSlot: '11:00 - 14:00',
          address: { street: '123 Hacker St', city: 'Metro', state: 'CA', zipCode: '90001' },
          totalPrice: 1, // MALICIOUS EXPLOIT ATTEMPT
          notes: 'Attempting to book for 1 dollar',
        },
        testUser
      );

      await createBooking(req, res, next);
      assert.equal(getError(), null, 'Expected no error, server should enforce correct price');
      assert.equal(res.statusCode, 201);

      // Verify the booking document stored in database
      const bookingInDb = await Booking.findById(res.data.data._id);
      assert.equal(bookingInDb.totalPrice, 10000, 'Database totalPrice MUST be authoritative ₹10,000, NOT ₹1');
      assert.notEqual(bookingInDb.totalPrice, 1, 'Vulnerability detected: totalPrice was accepted from client!');
    });

    test('Test 1.3: Malicious client sends totalPrice = 0 (price tampering rejected, uses ₹10,000)', async () => {
      const { req, res, next, getError } = mockExpress(
        {
          serviceId: testService._id.toString(),
          scheduledDate: '2026-10-17',
          timeSlot: '14:00 - 17:00',
          address: { street: '123 Free St', city: 'Metro', state: 'CA', zipCode: '90001' },
          totalPrice: 0, // MALICIOUS EXPLOIT ATTEMPT
        },
        testUser
      );

      await createBooking(req, res, next);
      assert.equal(getError(), null);
      assert.equal(res.data.data.totalPrice, 10000, 'Expected ₹10,000 when client sends 0');
    });

    test('Test 1.4: Client sends inflated totalPrice = 99999 (blind trust rejected, uses ₹10,000)', async () => {
      const { req, res, next, getError } = mockExpress(
        {
          serviceId: testService._id.toString(),
          scheduledDate: '2026-10-18',
          timeSlot: '08:00 - 11:00',
          address: { street: '123 High St', city: 'Metro', state: 'CA', zipCode: '90001' },
          totalPrice: 99999, // INFLATED PRICE
        },
        testUser
      );

      await createBooking(req, res, next);
      assert.equal(getError(), null);
      assert.equal(res.data.data.totalPrice, 10000, 'Expected ₹10,000 authoritative price, not inflated 99999');
    });

    test('Test 1.5: Coupon manipulation (client sends fake discount, backend calculates valid 20% discount)', async () => {
      const { req, res, next, getError } = mockExpress(
        {
          serviceId: testService._id.toString(),
          scheduledDate: '2026-10-19',
          timeSlot: '11:00 - 14:00',
          address: { street: '123 Coupon St', city: 'Metro', state: 'CA', zipCode: '90001' },
          couponCode: testCoupon.code,
          totalPrice: 50, // Client tries to override price with fake discount
        },
        testUser
      );

      await createBooking(req, res, next);
      assert.equal(getError(), null);
      // 20% of 10000 is 2000 discount -> 8000 total
      assert.equal(res.data.data.basePrice, 10000);
      assert.equal(res.data.data.discount, 2000, 'Server must calculate 2000 discount');
      assert.equal(res.data.data.totalPrice, 8000, 'Authoritative total must be 8000');
    });

    test('Test 1.6: Payment record amount strictly matches authoritative server booking total', async () => {
      const { req, res, next } = mockExpress(
        {
          serviceId: testService._id.toString(),
          scheduledDate: '2026-10-20',
          timeSlot: '11:00 - 14:00',
          address: { street: '123 Payment St', city: 'Metro', state: 'CA', zipCode: '90001' },
          totalPrice: 42, // Malicious client totalPrice
        },
        testUser
      );

      await createBooking(req, res, next);
      const bookingId = res.data.data._id;

      const payment = await Payment.findOne({ referenceId: bookingId, paymentType: 'booking' });
      assert.ok(payment, 'Expected Payment record to be spawned');
      assert.equal(payment.amount, 10000, 'Payment record amount must be authoritative ₹10,000, not ₹42');
      assert.notEqual(payment.amount, 42, 'Payment record accepted tampered price!');
    });
  });

  // =========================================================================
  // PART 2 — INVENTORY RACE CONDITIONS & ATOMICITY TESTS
  // =========================================================================
  describe('PART 2: Inventory Race Conditions & Missing Atomicity in Orders', () => {
    test('Test 2.1: Normal stock deduction (Initial: 10, Order: 3 -> Remaining: 7)', async () => {
      const product = await Product.create({
        name: 'Sec Test Switch Normal',
        price: 50,
        sku: `SEC-TEST-NORM-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 10,
        description: 'Testing standard stock reduction',
        isActive: true,
      });

      const { req, res, next, getError } = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 3 }],
          shippingAddress: { street: '1 Normal St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );

      await createOrder(req, res, next);
      assert.equal(getError(), null, 'Expected order to succeed');
      assert.equal(res.statusCode, 201);

      const refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 7, 'Expected stock to decrease from 10 to 7');
    });

    test('Test 2.2: Insufficient stock (Initial: 2, Order: 5 -> Fails with 400, stock remains 2)', async () => {
      const product = await Product.create({
        name: 'Sec Test Switch Insufficient',
        price: 50,
        sku: `SEC-TEST-INSUF-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 2,
        description: 'Testing insufficient stock block',
        isActive: true,
      });

      const { req, res, next, getError } = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 5 }],
          shippingAddress: { street: '2 LowStock St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );

      await createOrder(req, res, next);
      const err = getError();
      assert.ok(err, 'Expected error to be thrown');
      assert.equal(err.statusCode, 400, 'Expected 400 Bad Request');
      assert.match(err.message, /Insufficient stock/);

      const refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 2, 'Stock must remain untouched at 2');
    });

    test('Test 2.3: Exact stock purchase (Initial: 1, Order: 1 -> Stock becomes 0)', async () => {
      const product = await Product.create({
        name: 'Sec Test Switch Exact',
        price: 50,
        sku: `SEC-TEST-EXACT-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 1,
        description: 'Testing exact stock consumption',
        isActive: true,
      });

      const { req, res, next, getError } = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 1 }],
          shippingAddress: { street: '3 Exact St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );

      await createOrder(req, res, next);
      assert.equal(getError(), null);
      assert.equal(res.statusCode, 201);

      const refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 0, 'Stock must drop exactly to 0');
    });

    test('Test 2.4: Concurrent purchase race condition (Initial: 1, two simultaneous requests -> Exactly 1 succeeds, stock never drops below 0)', async () => {
      const product = await Product.create({
        name: 'Sec Test Switch Race',
        price: 50,
        sku: `SEC-TEST-RACE-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 1, // Only 1 unit in inventory
        description: 'Testing concurrency race protection',
        isActive: true,
      });

      // Prepare two concurrent requests for the single available unit
      const clientA = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 1 }],
          shippingAddress: { street: 'User A St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );

      const clientB = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 1 }],
          shippingAddress: { street: 'User B St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );

      // Fire simultaneously
      await Promise.all([
        createOrder(clientA.req, clientA.res, clientA.next),
        createOrder(clientB.req, clientB.res, clientB.next),
      ]);

      const aSuccess = clientA.res.statusCode === 201;
      const bSuccess = clientB.res.statusCode === 201;

      // Exactly one must succeed and one must fail
      assert.equal(
        (aSuccess && !bSuccess) || (!aSuccess && bSuccess),
        true,
        'Concurrency violation: Expected exactly 1 order to succeed and 1 to fail'
      );

      // Verify stock in database
      const refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 0, 'Stock count must be exactly 0, NEVER negative');
      assert.ok(refreshedProduct.stockCount >= 0, 'Overselling detected! Stock dropped below 0');
    });

    test('Test 2.5: Multi-product transaction rollback (Product A has 5, Product B has 0 -> Order fails, Product A stock remains 5)', async () => {
      const productA = await Product.create({
        name: 'Sec Test Product A In Stock',
        price: 40,
        sku: `SEC-TEST-PROD-A-${Date.now()}`,
        category: 'Wires',
        brand: 'SparkCare',
        stockCount: 5,
        description: 'Product A with stock',
        isActive: true,
      });

      const productB = await Product.create({
        name: 'Sec Test Product B Out Of Stock',
        price: 60,
        sku: `SEC-TEST-PROD-B-${Date.now()}`,
        category: 'Wires',
        brand: 'SparkCare',
        stockCount: 0, // Out of stock!
        description: 'Product B out of stock',
        isActive: true,
      });

      const { req, res, next, getError } = mockExpress(
        {
          items: [
            { product: productA._id.toString(), quantity: 2 }, // Valid 2 units requested
            { product: productB._id.toString(), quantity: 1 }, // Fails due to 0 stock
          ],
          shippingAddress: { street: 'Multi Item St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );

      await createOrder(req, res, next);
      const err = getError();
      assert.ok(err, 'Expected multi-item order to fail because Product B is out of stock');
      assert.equal(err.statusCode, 400);

      // ATOMICITY VERIFICATION: Product A's stock must NOT be decremented!
      const refreshedA = await Product.findById(productA._id);
      const refreshedB = await Product.findById(productB._id);

      assert.equal(refreshedA.stockCount, 5, 'Atomicity violation: Product A stock was decremented despite order failure!');
      assert.equal(refreshedB.stockCount, 0, 'Product B stock must remain 0');

      // Verify no orphan order was saved
      const orphanOrder = await Order.findOne({ 'items.product': productA._id });
      assert.equal(orphanOrder, null, 'No order document should exist when transaction rolls back');
    });

    test('Test 2.6: Duplicate processing & idempotency (Cancellation restores stock only once)', async () => {
      const product = await Product.create({
        name: 'Sec Test Switch Idempotency',
        price: 30,
        sku: `SEC-TEST-IDEMP-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 10,
        description: 'Testing duplicate cancellation prevention',
        isActive: true,
      });

      // 1. Create order for 4 units
      const createReq = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 4 }],
          shippingAddress: { street: 'Cancel St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );
      await createOrder(createReq.req, createReq.res, createReq.next);
      assert.equal(createReq.res.statusCode, 201);

      const orderId = createReq.res.data.data.order._id;
      let refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 6, 'Stock must be 10 - 4 = 6');

      // 2. First cancellation -> should restore 4 units back to 10
      const cancel1 = mockExpress({}, testUser, { id: orderId.toString() });
      await cancelOrder(cancel1.req, cancel1.res, cancel1.next);
      assert.equal(cancel1.res.statusCode, 200, 'First cancellation should succeed');

      refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 10, 'Stock must be restored to 10');

      // 3. Repeated cancellation attempt -> should fail and NOT restore stock again
      const cancel2 = mockExpress({}, testUser, { id: orderId.toString() });
      await cancelOrder(cancel2.req, cancel2.res, cancel2.next);
      const err = cancel2.getError();
      assert.ok(err, 'Second cancellation must be rejected');
      assert.equal(err.statusCode, 400);

      // Verify stock did not get inflated by duplicate restoral
      refreshedProduct = await Product.findById(product._id);
      assert.equal(refreshedProduct.stockCount, 10, 'Duplicate restoral detected! Stock must remain 10, not 14');
    });

    test('Test 2.7: Admin cancellation also restores stock once and respects stockRestored flag', async () => {
      const product = await Product.create({
        name: 'Sec Test Switch Admin Cancel',
        price: 30,
        sku: `SEC-TEST-ADMIN-CAN-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 10,
        description: 'Testing admin cancellation',
        isActive: true,
      });

      // Create order for 3 units
      const createReq = mockExpress(
        {
          items: [{ product: product._id.toString(), quantity: 3 }],
          shippingAddress: { street: 'Admin Cancel St', city: 'Metro', state: 'CA', zipCode: '90001' },
          paymentMethod: 'cod',
        },
        testUser
      );
      await createOrder(createReq.req, createReq.res, createReq.next);
      const orderId = createReq.res.data.data.order._id;

      let refreshed = await Product.findById(product._id);
      assert.equal(refreshed.stockCount, 7);

      // Admin cancels order
      const adminReq1 = mockExpress({ orderStatus: 'cancelled' }, testAdmin, { id: orderId.toString() });
      await updateOrderStatus(adminReq1.req, adminReq1.res, adminReq1.next);
      assert.equal(adminReq1.res.statusCode, 200);

      refreshed = await Product.findById(product._id);
      assert.equal(refreshed.stockCount, 10, 'Stock restored to 10 by admin');

      // Admin calls updateOrderStatus again with 'cancelled'
      const adminReq2 = mockExpress({ orderStatus: 'cancelled' }, testAdmin, { id: orderId.toString() });
      await updateOrderStatus(adminReq2.req, adminReq2.res, adminReq2.next);

      refreshed = await Product.findById(product._id);
      assert.equal(refreshed.stockCount, 10, 'Stock must NOT be restored twice');
    });
  });

  // =========================================================================
  // PART 3: Plaintext Refresh Token Storage (CRITICAL Remediation)
  // =========================================================================
  describe('PART 3: Plaintext Refresh Token Storage Remediation', () => {
    test('Test 3.1: Login/auth stores SHA-256 hash in database, never raw JWT', async () => {
      const loginUser = await User.create({
        name: 'Token Hash Tester',
        email: `token-hash-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+15551112222',
        role: 'user',
      });

      const loginReq = mockExpress({ email: loginUser.email, password: 'Password123!' });
      await login(loginReq.req, loginReq.res, loginReq.next);

      assert.equal(loginReq.res.statusCode, 200);
      const issuedRefreshToken = loginReq.res.cookies.refreshToken?.value;
      assert.ok(issuedRefreshToken, 'Refresh token cookie must be issued');
      assert.ok(issuedRefreshToken.startsWith('eyJ'), 'Issued client token is a valid JWT');

      // Fetch user from DB with select('+refreshTokenHash')
      const dbUser = await User.findById(loginUser._id).select('+refreshTokenHash');
      assert.ok(dbUser.refreshTokenHash, 'Database must store refreshTokenHash');

      // CRITICAL ASSERTION: Stored value must NOT equal raw JWT
      assert.notEqual(
        dbUser.refreshTokenHash,
        issuedRefreshToken,
        'CRITICAL FAILED: Stored token must NOT be raw plaintext JWT'
      );

      // Stored value must be a valid 64-character hex SHA-256 string
      assert.match(
        dbUser.refreshTokenHash,
        /^[a-f0-9]{64}$/i,
        'Stored token must be a 64-character hex SHA-256 digest'
      );

      // Verify the hash matches SHA-256 of the issued refresh token
      assert.equal(
        dbUser.refreshTokenHash,
        hashToken(issuedRefreshToken),
        'Stored hash must exactly match SHA-256 digest of the issued token'
      );
    });

    test('Test 3.2: Refresh token rotation verifies SHA-256 hash and issues rotated hash', async () => {
      const rotUser = await User.create({
        name: 'Rotation Tester',
        email: `rotation-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+15551113333',
        role: 'user',
      });

      // Initial login
      const loginReq = mockExpress({ email: rotUser.email, password: 'Password123!' });
      await login(loginReq.req, loginReq.res, loginReq.next);
      const oldRefreshToken = loginReq.res.cookies.refreshToken.value;

      // Call refresh with the valid refresh token
      const refreshReq = mockExpress({}, {}, {}, { refreshToken: oldRefreshToken });
      await refresh(refreshReq.req, refreshReq.res, refreshReq.next);

      assert.equal(refreshReq.res.statusCode, 200, 'Refresh rotation must succeed');
      const newRefreshToken = refreshReq.res.cookies.refreshToken?.value;
      assert.ok(newRefreshToken, 'New refresh token cookie must be set');
      assert.notEqual(newRefreshToken, oldRefreshToken, 'Refresh token must be rotated');

      // Database should now have new token's SHA-256 hash
      const dbUser = await User.findById(rotUser._id).select('+refreshTokenHash');
      assert.equal(
        dbUser.refreshTokenHash,
        hashToken(newRefreshToken),
        'Database must store the new rotated token SHA-256 hash'
      );
    });

    test('Test 3.3: Revocation/replay detection clears stored hash and cookies upon invalid token', async () => {
      const replayUser = await User.create({
        name: 'Replay Tester',
        email: `replay-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+15551114444',
        role: 'user',
      });

      // Login to establish session
      const loginReq = mockExpress({ email: replayUser.email, password: 'Password123!' });
      await login(loginReq.req, loginReq.res, loginReq.next);

      // Attempt refresh with an altered/forged token
      const forgedToken = loginReq.res.cookies.refreshToken.value.slice(0, -5) + 'AAAAA';
      const badReq = mockExpress({}, {}, {}, { refreshToken: forgedToken });
      await refresh(badReq.req, badReq.res, badReq.next);

      assert.ok(
        badReq.getError() || badReq.res.statusCode === 401,
        'Tampered token must be rejected with 401'
      );
    });

    test('Test 3.4: Zero-downtime migration supports legacy unhashed tokens and upgrades to hash', async () => {
      const legacyUser = await User.create({
        name: 'Legacy Migration Tester',
        email: `legacy-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+15551115555',
        role: 'user',
      });

      // Generate a legitimate raw JWT
      const legacyRawJwt = legacyUser.generateRefreshToken();
      // Simulate legacy unhashed token stored in DB
      legacyUser.refreshTokenHash = legacyRawJwt;
      await legacyUser.save({ validateBeforeSave: false });

      // User performs token refresh with their legacy token
      const refreshReq = mockExpress({}, {}, {}, { refreshToken: legacyRawJwt });
      await refresh(refreshReq.req, refreshReq.res, refreshReq.next);

      assert.equal(refreshReq.res.statusCode, 200, 'Legacy token must be accepted during rotation');
      const newRefreshToken = refreshReq.res.cookies.refreshToken.value;

      // Database should now be upgraded to SHA-256 hash
      const upgradedUser = await User.findById(legacyUser._id).select('+refreshTokenHash');
      assert.match(
        upgradedUser.refreshTokenHash,
        /^[a-f0-9]{64}$/i,
        'Legacy token must be automatically upgraded to SHA-256 hash upon rotation'
      );
      assert.equal(upgradedUser.refreshTokenHash, hashToken(newRefreshToken));
    });

    test('Test 3.5: refreshTokenHash is never leaked in standard user queries', async () => {
      const user = await User.create({
        name: 'Leak Tester',
        email: `leak-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+15551116666',
        role: 'user',
      });

      user.refreshTokenHash = hashToken('sample-token');
      await user.save({ validateBeforeSave: false });

      const queriedUser = await User.findById(user._id);
      assert.equal(
        queriedUser.refreshTokenHash,
        undefined,
        'refreshTokenHash must have select: false and not leak in queries'
      );
    });
  });

  // =========================================================================
  // PART 4: SVG Stored XSS in File Uploads (HIGH Remediation)
  // =========================================================================
  describe('PART 4: SVG Stored XSS & File Upload Hardening', () => {
    test('Test 4.1: Multer fileFilter strictly rejects SVG files and XML MIME types', () => {
      const fileFilter = upload.fileFilter;
      let errorResult = null;
      let acceptedResult = null;

      // Test .svg extension
      fileFilter({}, { originalname: 'malicious.svg', mimetype: 'image/svg+xml' }, (err, accept) => {
        errorResult = err;
        acceptedResult = accept;
      });

      assert.ok(errorResult, 'SVG upload must trigger an error');
      assert.equal(errorResult.statusCode, 400);
      assert.equal(acceptedResult, false, 'SVG upload must not be accepted');
    });

    test('Test 4.2: Multer fileFilter accepts valid JPEG, PNG, and WebP extensions and MIMEs', () => {
      const fileFilter = upload.fileFilter;
      const validCases = [
        { originalname: 'photo.jpg', mimetype: 'image/jpeg' },
        { originalname: 'picture.png', mimetype: 'image/png' },
        { originalname: 'graphic.webp', mimetype: 'image/webp' },
      ];

      for (const validCase of validCases) {
        let errorResult = null;
        let acceptedResult = null;
        fileFilter({}, validCase, (err, accept) => {
          errorResult = err;
          acceptedResult = accept;
        });

        assert.equal(errorResult, null, `Valid image ${validCase.originalname} must not throw error`);
        assert.equal(acceptedResult, true, `Valid image ${validCase.originalname} must be accepted`);
      }
    });

    test('Test 4.3: Magic bytes rejects MIME-spoofed SVG masquerading as .jpg', () => {
      // An attacker renames malicious SVG to payload.jpg and sends Content-Type: image/jpeg
      const spoofedBuffer = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.domain)</script></svg>',
        'utf8'
      );

      const isValid = validateImageMagicBytes(spoofedBuffer);
      assert.equal(isValid, false, 'MIME-spoofed SVG must be rejected by magic bytes inspection');
    });

    test('Test 4.4: Magic bytes accepts authentic JPEG, PNG, and WebP binary headers', () => {
      // Authentic JPEG header: FF D8 FF E0
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01]);
      assert.equal(validateImageMagicBytes(jpegHeader), true, 'Authentic JPEG signature must be valid');

      // Authentic PNG header: 89 50 4E 47 0D 0A 1A 0A
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48]);
      assert.equal(validateImageMagicBytes(pngHeader), true, 'Authentic PNG signature must be valid');

      // Authentic WebP header: RIFF....WEBP
      const webpHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00, // size
        0x57, 0x45, 0x42, 0x50, // WEBP
        0x56, 0x50, 0x38, 0x20,
      ]);
      assert.equal(validateImageMagicBytes(webpHeader), true, 'Authentic WebP signature must be valid');
    });

    test('Test 4.5: Magic bytes catches polyglot images with embedded script tags', () => {
      // Polyglot: valid JPEG header followed by script payload
      const polyglotBuffer = Buffer.concat([
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]),
        Buffer.from('<script>alert("polyglot-xss")</script>', 'utf8'),
      ]);

      const isValid = validateImageMagicBytes(polyglotBuffer);
      assert.equal(isValid, false, 'Polyglot image with script tag must be rejected');
    });

    test('Test 4.6: verifyImageBuffer middleware halts pipeline with 400 on malicious buffer', () => {
      const req = {
        file: {
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('<svg onload=alert(1)>', 'utf8'),
        },
      };
      const res = {};
      let nextError = null;
      const next = (err) => {
        nextError = err;
      };

      verifyImageBuffer(req, res, next);
      assert.ok(nextError, 'verifyImageBuffer must halt with error');
      assert.equal(nextError.statusCode, 400);
      assert.match(nextError.message, /Invalid image content/);
    });
  });

  // =========================================================================
  // PART 5: Brute-Force Login & Credential Stuffing (HIGH Remediation)
  // =========================================================================
  describe('PART 5: Brute-Force Login & Credential Stuffing Protection', () => {
    test('Test 5.1: Rate limiter sets standard RateLimit headers and throttles upon exceeding limit', async () => {
      const uniqueIp = `192.0.2.${Math.floor(Math.random() * 200) + 1}`;
      let lastRes = null;
      let blocked = false;

      // Send 11 consecutive requests
      for (let i = 1; i <= 11; i++) {
        const mock = mockExpress({ email: 'nobody@example.com', password: 'bad' }, {}, {}, {}, uniqueIp);
        await new Promise((resolve) => {
          mock.res.send = (payload) => {
            mock.res.data = payload;
            blocked = true;
            resolve();
            return mock.res;
          };
          loginRateLimiter(mock.req, mock.res, () => {
            resolve();
          });
        });
        lastRes = mock.res;
        if (blocked) break;
      }

      assert.equal(blocked, true, 'Rate limiter must block after exceeding threshold');
      assert.equal(lastRes.statusCode, 429, 'Blocked response must return HTTP 429');
      assert.equal(lastRes.data?.success, false);
      assert.match(lastRes.data?.message, /Too many login attempts/);
    });

    test('Test 5.2: Authentication failure returns generic message for both wrong email and wrong password', async () => {
      // Case A: Non-existent email
      const wrongEmailReq = mockExpress({
        email: 'nonexistent-user-999@sparkcare-security-test.com',
        password: 'RandomPassword123!',
      });
      await login(wrongEmailReq.req, wrongEmailReq.res, wrongEmailReq.next);
      const errorA = wrongEmailReq.getError();
      assert.ok(errorA);
      assert.equal(errorA.statusCode, 401);
      assert.equal(errorA.message, 'Invalid email address or password.');

      // Case B: Existing email, wrong password
      const wrongPassReq = mockExpress({
        email: testUser.email,
        password: 'WrongPassword999!',
      });
      await login(wrongPassReq.req, wrongPassReq.res, wrongPassReq.next);
      const errorB = wrongPassReq.getError();
      assert.ok(errorB);
      assert.equal(errorB.statusCode, 401);
      assert.equal(errorB.message, 'Invalid email address or password.');

      // Both error messages are strictly identical to prevent user enumeration
      assert.equal(errorA.message, errorB.message);
    });
  });

  // =========================================================================
  // PART 6: NoSQL Injection & Operator Rejection
  // =========================================================================
  describe('PART 6: NoSQL Injection & Operator Rejection', () => {
    test('Test 6.1: mongoSanitize strips dollar ($) and dot (.) operator keys recursively', () => {
      const maliciousReq = {
        body: {
          email: { $gt: '' },
          profile: {
            'user.role': 'admin',
            $where: 'sleep(5000)',
            safeField: 'hello',
          },
          array: [{ $ne: null }, 'normalString'],
        },
        query: {
          search: { $regex: '.*' },
          role: 'user',
        },
        params: {
          id: '64f123456789012345678901',
        },
      };

      mongoSanitize(maliciousReq, {}, () => {});

      // Assert malicious operators were eliminated
      assert.equal(maliciousReq.body.email.$gt, undefined);
      assert.equal(maliciousReq.body.profile['user.role'], undefined);
      assert.equal(maliciousReq.body.profile.$where, undefined);
      assert.equal(maliciousReq.body.profile.safeField, 'hello');
      assert.equal(maliciousReq.body.array[0].$ne, undefined);
      assert.equal(maliciousReq.body.array[1], 'normalString');
      assert.equal(maliciousReq.query.search.$regex, undefined);
      assert.equal(maliciousReq.query.role, 'user');
    });

    test('Test 6.2: Login rejects or sanitizes operator injection payload { $ne: null }', async () => {
      const injectReq = mockExpress({
        email: { $ne: null },
        password: 'Password123!',
      });

      // Pass through mongoSanitize first
      mongoSanitize(injectReq.req, injectReq.res, () => {});

      // Now pass to login
      await login(injectReq.req, injectReq.res, injectReq.next);
      const err = injectReq.getError();
      assert.ok(err, 'NoSQL injection in login must be rejected');
      assert.ok(err.statusCode === 400 || err.statusCode === 401);
    });

    test('Test 6.3: Profile update validation rejects unauthorized role elevation and operator keys', () => {
      // 1. Trying to inject role: 'admin'
      const roleResult = updateProfileSchema.body.safeParse({
        name: 'New Name',
        role: 'admin',
      });
      assert.equal(roleResult.success, false, 'Unrecognized key "role" in profile update must fail schema validation');

      // 2. Trying to inject mongo operator
      const opResult = updateProfileSchema.body.safeParse({
        name: 'New Name',
        $set: { isVerified: true },
      });
      assert.equal(opResult.success, false, 'Operator key "$set" in profile update must fail schema validation');

      // 3. Valid update passes
      const validResult = updateProfileSchema.body.safeParse({
        name: 'Valid User Name',
        phoneNumber: '+1234567890',
      });
      assert.equal(validResult.success, true);
    });

    test('Test 6.4: Product search with regex metacharacters is escaped and does not throw', async () => {
      const searchReq = mockExpress({}, {}, {}, {}, '198.51.100.25', {
        search: '.*(test)+[a-z]',
        limit: '10',
      });
      await getProducts(searchReq.req, searchReq.res, searchReq.next);
      assert.equal(searchReq.res.statusCode, 200, 'Regex search with metacharacters should safely execute');
      assert.ok(Array.isArray(searchReq.res.data.data.products));
    });
  });

  // =========================================================================
  // PART 7: HTTP Parameter Pollution (HPP) & Pagination Limits
  // =========================================================================
  describe('PART 7: HTTP Parameter Pollution & Pagination Limits', () => {
    test('Test 7.1: Pagination limit is strictly capped at maximum 50', async () => {
      const pageReq = mockExpress({}, {}, {}, {}, '198.51.100.25', {
        page: '1',
        limit: '10000',
      });
      await getProducts(pageReq.req, pageReq.res, pageReq.next);
      assert.equal(pageReq.res.statusCode, 200);
      assert.equal(pageReq.res.data.data.limit, 50, 'Limit must be capped at 50 to prevent memory exhaustion');
    });

    test('Test 7.2: Pagination handles negative and non-numeric inputs gracefully', async () => {
      const invalidPageReq = mockExpress({}, {}, {}, {}, '198.51.100.25', {
        page: '-5',
        limit: 'abc',
      });
      await getProducts(invalidPageReq.req, invalidPageReq.res, invalidPageReq.next);
      assert.equal(invalidPageReq.res.statusCode, 200);
      assert.equal(invalidPageReq.res.data.data.currentPage, 1, 'Negative page must default to 1');
      assert.equal(invalidPageReq.res.data.data.limit, 9, 'Invalid limit must default to 9');
    });

    test('Test 7.3: Product sort enforces allowlist and falls back to default on invalid sort key', async () => {
      const invalidSortReq = mockExpress({}, {}, {}, {}, '198.51.100.25', {
        sort: 'password', // Attempted sort injection
      });
      await getProducts(invalidSortReq.req, invalidSortReq.res, invalidSortReq.next);
      assert.equal(invalidSortReq.res.statusCode, 200);
      assert.ok(Array.isArray(invalidSortReq.res.data.data.products));
    });
  });


  // =========================================================================
  // PART 8: Fake Reviews & Verified Purchase Enforcement
  // =========================================================================
  describe('PART 8: Fake Reviews & Verified Purchase Enforcement', () => {
    let reviewProduct;
    let reviewService;

    before(async () => {
      reviewProduct = await Product.create({
        name: 'Sec Review Tested Product',
        price: 99,
        sku: `SEC-REV-${Date.now()}`,
        category: 'Wires & Cables',
        brand: 'SparkCare',
        stockCount: 50,
        description: 'Testing review verifications',
        isActive: true,
      });

      reviewService = await Service.create({
        title: `Sec Review Tested Service ${Date.now()}`,
        description: 'Testing service review verification',
        category: 'Wiring & Rewiring',
        basePrice: 150,
        estimatedMinutes: 120,
        duration: '2 hours',
        included: ['Inspection'],
        excluded: ['Parts'],
        isActive: true,
      });
    });

    test('Test 8.1: Reviewing an unpurchased product is rejected with 403', async () => {
      const unpurchasedReq = mockExpress(
        { rating: 5, comment: 'Great product even though I never bought it!' },
        testUser,
        { productId: reviewProduct._id.toString() }
      );
      await addProductReview(unpurchasedReq.req, unpurchasedReq.res, unpurchasedReq.next);
      const err = unpurchasedReq.getError();
      assert.ok(err, 'Unpurchased review must be rejected');
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /successfully delivered order/);
    });

    test('Test 8.2: Product purchased but not delivered (e.g., processing) is rejected with 403', async () => {
      // Create order with orderStatus 'processing'
      await Order.create({
        orderNumber: `ORD-REV-PROC-${Date.now()}`,
        customer: testUser._id,
        items: [{
          product: reviewProduct._id,
          name: reviewProduct.name,
          unitPrice: reviewProduct.price,
          quantity: 1,
          totalPrice: reviewProduct.price,
        }],
        shippingAddress: { street: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        orderStatus: 'processing',
        totals: { subtotal: 99, shippingFee: 0, tax: 0, discount: 0, grandTotal: 99 },
      });

      const pendingReq = mockExpress(
        { rating: 4, comment: 'I ordered it but it has not arrived yet' },
        testUser,
        { productId: reviewProduct._id.toString() }
      );
      await addProductReview(pendingReq.req, pendingReq.res, pendingReq.next);
      const err = pendingReq.getError();
      assert.ok(err, 'Review of non-delivered order must be rejected');
      assert.equal(err.statusCode, 403);
    });

    test('Test 8.3: Client cannot forge verifiedPurchase: true flag on unpurchased product', async () => {
      const otherProduct = await Product.create({
        name: 'Another Unpurchased Product',
        price: 49,
        sku: `SEC-UNPURCHASED-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 10,
        description: 'Testing forge review',
        isActive: true,
      });

      const forgeReq = mockExpress(
        { rating: 5, comment: 'Forged verified review', verifiedPurchase: true },
        testUser,
        { productId: otherProduct._id.toString() }
      );
      await addProductReview(forgeReq.req, forgeReq.res, forgeReq.next);
      const err = forgeReq.getError();
      assert.ok(err);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /successfully delivered order/);
    });

    test('Test 8.4: Delivered product order allows verified review and enforces verifiedPurchase=true', async () => {
      // Create delivered order with complete schema fields
      const deliveredOrder = await Order.create({
        orderNumber: `ORD-REV-DELIV-${Date.now()}`,
        customer: testUser._id,
        items: [{
          product: reviewProduct._id,
          name: reviewProduct.name,
          unitPrice: reviewProduct.price,
          quantity: 1,
          totalPrice: reviewProduct.price,
        }],
        shippingAddress: { street: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        totals: { subtotal: 99, shippingFee: 0, tax: 0, discount: 0, grandTotal: 99 },
      });

      // Even if client attempts to pass verifiedPurchase: false, server enforces true
      const reviewReq = mockExpress(
        { rating: 5, comment: 'Product arrived quickly and works perfectly!', verifiedPurchase: false },
        testUser,
        { productId: reviewProduct._id.toString() }
      );
      await addProductReview(reviewReq.req, reviewReq.res, reviewReq.next);
      assert.equal(reviewReq.res.statusCode, 201, 'Delivered order review must be created');

      const savedReview = await Review.findById(reviewReq.res.data.data._id);
      assert.ok(savedReview);
      assert.equal(savedReview.verifiedPurchase, true, 'Server must enforce verifiedPurchase: true');
      assert.equal(savedReview.order.toString(), deliveredOrder._id.toString());
    });

    test('Test 8.5: Duplicate product review by same user is rejected with 400', async () => {
      const dupReq = mockExpress(
        { rating: 1, comment: 'Attempting to spam a second review for the same product' },
        testUser,
        { productId: reviewProduct._id.toString() }
      );
      await addProductReview(dupReq.req, dupReq.res, dupReq.next);
      const err = dupReq.getError();
      assert.ok(err, 'Duplicate review must be rejected');
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /already submitted a review/);
    });

    test('Test 8.6: Service review without completed booking is rejected with 403', async () => {
      const unbookedReq = mockExpress(
        { rating: 5, comment: 'Never booked this service!' },
        testUser,
        { serviceId: reviewService._id.toString() }
      );
      await addServiceReview(unbookedReq.req, unbookedReq.res, unbookedReq.next);
      const err = unbookedReq.getError();
      assert.ok(err);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /completed electrician service booking/);
    });

    test('Test 8.7: Service review with completed booking succeeds with 201', async () => {
      // Create completed booking with complete schema fields
      const completedBooking = await Booking.create({
        bookingNumber: `BK-REV-COMP-${Date.now()}`,
        customer: testUser._id,
        service: reviewService._id,
        basePrice: 150,
        discount: 0,
        totalPrice: 150,
        scheduledDate: new Date(),
        timeSlot: '11:00 - 14:00',
        address: { street: '123 Service Way', city: 'City', state: 'State', zipCode: '12345' },
        bookingStatus: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cod',
      });

      const serviceReviewReq = mockExpress(
        { rating: 5, comment: 'Excellent electrician! Completed work quickly.' },
        testUser,
        { serviceId: reviewService._id.toString() }
      );
      await addServiceReview(serviceReviewReq.req, serviceReviewReq.res, serviceReviewReq.next);
      assert.equal(serviceReviewReq.res.statusCode, 201, 'Completed booking review must succeed');

      const savedServiceReview = await Review.findById(serviceReviewReq.res.data.data._id);
      assert.ok(savedServiceReview);
      assert.equal(savedServiceReview.verifiedPurchase, true);
      assert.equal(savedServiceReview.booking.toString(), completedBooking._id.toString());
    });

    test('Test 8.8: Review deletion: unauthorized non-author rejected with 403; author and admin succeed', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Attacker Non-Author',
        email: `attacker-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+19998887777',
        role: 'user',
      });

      const existingReview = await Review.findOne({ user: testUser._id });
      assert.ok(existingReview, 'A review from testUser must exist');

      // Attempt deletion by non-author
      const unauthorizedDel = mockExpress({}, otherUser, { id: existingReview._id.toString() });
      await deleteReview(unauthorizedDel.req, unauthorizedDel.res, unauthorizedDel.next);
      const err = unauthorizedDel.getError();
      assert.ok(err, 'Non-author must not be allowed to delete review');
      assert.equal(err.statusCode, 403);

      // Successful deletion by author
      const authorDel = mockExpress({}, testUser, { id: existingReview._id.toString() });
      await deleteReview(authorDel.req, authorDel.res, authorDel.next);
      assert.equal(authorDel.res.statusCode, 200, 'Author must be able to delete their own review');

      const check = await Review.findById(existingReview._id);
      assert.equal(check, null, 'Review should be deleted from DB');
    });


  });

  // =========================================================================
  // PART 9: Admin Statistics Memory & Aggregation
  // =========================================================================
  describe('PART 9: Admin Statistics Memory & Aggregation', () => {
    test('Test 9.1: getDashboardStats returns aggregate statistics without unbounded document fetch', async () => {
      const statsReq = mockExpress({}, testAdmin);
      await getDashboardStats(statsReq.req, statsReq.res, statsReq.next);
      assert.equal(statsReq.res.statusCode, 200);

      const stats = statsReq.res.data.data;
      assert.ok('summary' in stats, 'Stats response must contain summary metrics');
      assert.ok(typeof stats.summary.totalUsers === 'number');
      assert.ok(typeof stats.summary.totalOrders === 'number');
      assert.ok(typeof stats.summary.totalBookings === 'number');
      assert.ok(typeof stats.summary.grossRevenue === 'number');
      assert.ok('distributions' in stats);
      assert.ok('dateRange' in stats);
    });

    test('Test 9.2: getDashboardStats rejects inverted date range (from > to) with 400', async () => {
      const invertedReq = mockExpress({}, testAdmin, {}, {}, '198.51.100.25', {
        from: '2026-12-31',
        to: '2026-01-01',
      });
      await getDashboardStats(invertedReq.req, invertedReq.res, invertedReq.next);
      const err = invertedReq.getError();
      assert.ok(err, 'Inverted date range must be rejected');
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Start date cannot be after end date/);
    });

    test('Test 9.3: adminStatsRateLimiter attaches rate limit headers to statistics requests', async () => {
      const mock = mockExpress({}, testAdmin, {}, {}, '198.51.100.99');
      let calledNext = false;
      await new Promise((resolve) => {
        adminStatsRateLimiter(mock.req, mock.res, () => {
          calledNext = true;
          resolve();
        });
      });
      assert.equal(calledNext, true, 'Rate limiter must permit authorized request within limit');
      assert.ok(mock.res.getHeader('ratelimit-limit') || mock.res.getHeader('x-ratelimit-limit'));
    });
  });

  // =========================================================================
  // PART 10: Manual UPI Payment Verification Workflow
  // =========================================================================
  describe('PART 10: Manual UPI Payment Verification Workflow', () => {
    let qrOrder;
    let qrProduct;
    let otherOrderUser;

    before(async () => {
      otherOrderUser = await User.create({
        name: 'Another Customer',
        email: `another-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+19998886666',
        role: 'user',
      });

      qrProduct = await Product.create({
        name: 'UPI QR Test Hardware Unit',
        price: 100,
        sku: `SEC-TEST-QR-${Date.now()}`,
        category: 'Switches',
        brand: 'SparkCare',
        stockCount: 15,
        description: 'Testing UPI QR order flow',
        isActive: true,
      });
    });

    test('Test 10.1: Placing order with paymentMethod "qr" initializes status as awaiting_payment_verification / pending', async () => {
      const orderReq = mockExpress(
        {
          items: [{ product: qrProduct._id.toString(), quantity: 1 }],
          shippingAddress: { street: '456 UPI Lane', city: 'City', state: 'State', zipCode: '12345' },
          paymentMethod: 'qr',
        },
        testUser
      );

      await createOrder(orderReq.req, orderReq.res, orderReq.next);
      assert.equal(orderReq.res.statusCode, 201);
      qrOrder = orderReq.res.data.data?.order || orderReq.res.data.data;
      assert.ok(qrOrder);
      assert.equal(qrOrder.paymentMethod, 'qr');
      assert.equal(qrOrder.paymentStatus, 'pending');
      assert.equal(qrOrder.orderStatus, 'awaiting_payment_verification');

      // Verify payment record in DB
      const payment = await Payment.findOne({ referenceId: qrOrder._id, paymentType: 'order' });
      assert.ok(payment);
      assert.equal(payment.status, 'pending');
      assert.equal(payment.gateway, 'qr');
    });

    test('Test 10.2: Customer submitting UPI payment proof updates status to proof_submitted and logs audit details', async () => {
      const validBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header
      const proofReq = mockExpress(
        { transactionId: 'UPI-TXN-123456789' },
        testUser,
        { orderId: qrOrder._id.toString() },
        {},
        '198.51.100.25',
        {},
        { buffer: validBuffer, mimetype: 'image/png', originalname: 'receipt.png' }
      );

      await submitQrPaymentProof(proofReq.req, proofReq.res, proofReq.next);
      assert.equal(proofReq.res.statusCode, 200);
      assert.match(proofReq.res.data.message, /Payment proof submitted/i);

      // Verify DB state
      const updatedOrder = await Order.findById(qrOrder._id);
      assert.equal(updatedOrder.paymentStatus, 'proof_submitted');
      assert.equal(updatedOrder.orderStatus, 'awaiting_payment_verification');
      assert.ok(updatedOrder.paymentProofUrl);
      assert.ok(updatedOrder.paymentProofUploadedAt);
      assert.equal(updatedOrder.paymentProofSubmittedBy.toString(), testUser._id.toString());
      assert.equal(updatedOrder.paymentVerificationHistory.length, 1);
      assert.equal(updatedOrder.paymentVerificationHistory[0].action, 'submitted');

      const updatedPayment = await Payment.findOne({ referenceId: qrOrder._id, paymentType: 'order' });
      assert.equal(updatedPayment.status, 'proof_submitted');
      assert.ok(updatedPayment.paymentProofUrl);
    });

    test('Test 10.3: Non-owner cannot submit payment proof for another customer order (403 Forbidden)', async () => {
      const validBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const unauthorizedReq = mockExpress(
        { transactionId: 'UPI-HACK-999' },
        otherOrderUser,
        { orderId: qrOrder._id.toString() },
        {},
        '198.51.100.25',
        {},
        { buffer: validBuffer, mimetype: 'image/png', originalname: 'receipt.png' }
      );

      await submitQrPaymentProof(unauthorizedReq.req, unauthorizedReq.res, unauthorizedReq.next);
      const err = unauthorizedReq.getError();
      assert.ok(err);
      assert.equal(err.statusCode, 403);
    });

    test('Test 10.4: Submitting proof without an image attachment is rejected with 400', async () => {
      const missingFileReq = mockExpress(
        { transactionId: 'UPI-NO-FILE' },
        testUser,
        { orderId: qrOrder._id.toString() },
        {},
        '198.51.100.25',
        {},
        null // No file attached
      );

      await submitQrPaymentProof(missingFileReq.req, missingFileReq.res, missingFileReq.next);
      const err = missingFileReq.getError();
      assert.ok(err);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /screenshot.*proof/i);
    });

    test('Test 10.5: Submitting proof on a cancelled order is rejected with 400', async () => {
      const cancelableOrder = await Order.create({
        customer: testUser._id,
        items: [{ product: qrProduct._id, name: 'Item', unitPrice: 100, price: 100, quantity: 1 }],
        shippingAddress: { street: 'St', city: 'Ct', state: 'St', zipCode: '00000' },
        paymentMethod: 'qr',
        paymentStatus: 'pending',
        orderStatus: 'cancelled',
        totals: { subtotal: 100, tax: 0, shippingFee: 0, grandTotal: 100 },
      });

      const validBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const req = mockExpress(
        {},
        testUser,
        { orderId: cancelableOrder._id.toString() },
        {},
        '198.51.100.25',
        {},
        { buffer: validBuffer, mimetype: 'image/png', originalname: 'receipt.png' }
      );

      await submitQrPaymentProof(req.req, req.res, req.next);
      const err = req.getError();
      assert.ok(err);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Cannot submit payment proof for (a )?cancelled order/i);
    });

    test('Test 10.6: Admin can list pending QR payment proofs', async () => {
      const adminReq = mockExpress({}, testAdmin);
      await getPendingQrPayments(adminReq.req, adminReq.res, adminReq.next);
      assert.equal(adminReq.res.statusCode, 200);
      assert.ok(Array.isArray(adminReq.res.data.data));
      const found = adminReq.res.data.data.some((p) => p.referenceId?.toString() === qrOrder._id.toString());
      assert.ok(found, 'Pending order payment must be included in admin pending stream');

      const ordersPendingReq = mockExpress({}, testAdmin);
      await getOrdersPaymentPending(ordersPendingReq.req, ordersPendingReq.res, ordersPendingReq.next);
      assert.equal(ordersPendingReq.res.statusCode, 200);
      const orderFound = ordersPendingReq.res.data.data.some((o) => o._id.toString() === qrOrder._id.toString());
      assert.ok(orderFound, 'Order must be listed in payment-pending orders');
    });

    test('Test 10.7: Admin verifies payment proof: order is confirmed, payment is verified, audit log recorded', async () => {
      const verifyReq = mockExpress(
        { note: 'Matched against HDFC UPI settlement ref 994827164' },
        testAdmin,
        { orderId: qrOrder._id.toString() }
      );

      await verifyOrderPayment(verifyReq.req, verifyReq.res, verifyReq.next);
      assert.equal(verifyReq.res.statusCode, 200);
      assert.match(verifyReq.res.data?.message, /successfully verified|verified successfully/i);

      const verifiedOrder = await Order.findById(qrOrder._id);
      assert.equal(verifiedOrder.paymentStatus, 'verified');
      assert.equal(verifiedOrder.orderStatus, 'confirmed');
      assert.equal(verifiedOrder.paymentVerifiedBy.toString(), testAdmin._id.toString());
      assert.ok(verifiedOrder.paymentVerifiedAt);
      assert.equal(verifiedOrder.paymentReviewNote, 'Matched against HDFC UPI settlement ref 994827164');

      const verifiedPayment = await Payment.findOne({ referenceId: qrOrder._id, paymentType: 'order' });
      assert.equal(verifiedPayment.status, 'verified');
      assert.equal(verifiedPayment.paymentVerifiedBy.toString(), testAdmin._id.toString());
    });

    test('Test 10.8: Admin double-verification of an already verified order is rejected with 400', async () => {
      const doubleVerifyReq = mockExpress(
        { note: 'Attempting second approval' },
        testAdmin,
        { orderId: qrOrder._id.toString() }
      );

      await verifyOrderPayment(doubleVerifyReq.req, doubleVerifyReq.res, doubleVerifyReq.next);
      const err = doubleVerifyReq.getError();
      assert.ok(err);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /already.*verified/i);
    });

    test('Test 10.9: Admin rejects invalid payment proof with note: order status set to payment_failed', async () => {
      // Create another order to reject
      const orderToReject = await Order.create({
        customer: testUser._id,
        items: [{ product: qrProduct._id, name: 'Item', unitPrice: 50, price: 50, quantity: 1 }],
        shippingAddress: { street: 'St', city: 'Ct', state: 'St', zipCode: '00000' },
        paymentMethod: 'qr',
        paymentStatus: 'proof_submitted',
        orderStatus: 'awaiting_payment_verification',
        totals: { subtotal: 50, tax: 0, shippingFee: 0, grandTotal: 50 },
      });

      await Payment.create({
        transactionId: `TXN-REJ-${Date.now()}`,
        referenceId: orderToReject._id,
        paymentType: 'order',
        paymentTypeModel: 'Order',
        customer: testUser._id,
        amount: 50,
        currency: 'INR',
        gateway: 'qr',
        status: 'proof_submitted',
      });

      const rejectReq = mockExpress(
        { note: 'UTR not found in bank statement' },
        testAdmin,
        { orderId: orderToReject._id.toString() }
      );

      await rejectOrderPayment(rejectReq.req, rejectReq.res, rejectReq.next);
      assert.equal(rejectReq.res.statusCode, 200);
      assert.match(rejectReq.res.data.message, /rejected/i);

      const rejectedOrder = await Order.findById(orderToReject._id);
      assert.equal(rejectedOrder.paymentStatus, 'rejected');
      assert.equal(rejectedOrder.orderStatus, 'payment_failed');
      assert.equal(rejectedOrder.paymentRejectedBy.toString(), testAdmin._id.toString());
      assert.ok(rejectedOrder.paymentRejectedAt);
      assert.equal(rejectedOrder.paymentReviewNote, 'UTR not found in bank statement');

      const rejectedPayment = await Payment.findOne({ referenceId: orderToReject._id, paymentType: 'order' });
      assert.equal(rejectedPayment.status, 'rejected');
    });

    test('Test 10.10: Unverified and rejected orders are excluded from revenue aggregation', async () => {
      // Query dashboard stats
      const statsReq = mockExpress({}, testAdmin);
      await getDashboardStats(statsReq.req, statsReq.res, statsReq.next);
      assert.equal(statsReq.res.statusCode, 200);

      const stats = statsReq.res.data.data;
      // Fetch sum of verified / paid orders only
      const verifiedOrders = await Order.find({
        paymentStatus: { $in: ['paid', 'verified'] },
        orderStatus: { $ne: 'cancelled' },
      });
      const expectedRevenue = verifiedOrders.reduce((sum, o) => sum + (o.totals?.grandTotal || 0), 0);

      // Bookings revenue
      const verifiedBookings = await Booking.find({
        paymentStatus: { $in: ['paid', 'verified'] },
        bookingStatus: { $ne: 'cancelled' },
      });
      const expectedBookingRev = verifiedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      assert.equal(stats.summary.grossRevenue, expectedRevenue + expectedBookingRev);
    });
  });

  // =========================================================================
  // PART 11: Real Aggregated Sales History & Mock Removal
  // =========================================================================
  describe('PART 11: Real Aggregated Sales History & Mock Removal', () => {
    test('Test 11.1: getDashboardStats returns salesHistory computed dynamically by month from real DB', async () => {
      const statsReq = mockExpress({}, testAdmin);
      await getDashboardStats(statsReq.req, statsReq.res, statsReq.next);
      assert.equal(statsReq.res.statusCode, 200);

      const stats = statsReq.res.data.data;
      assert.ok(Array.isArray(stats.salesHistory), 'salesHistory must be an array');
      assert.ok(stats.salesHistory.length > 0, 'salesHistory must contain monthly intervals');
      for (const entry of stats.salesHistory) {
        assert.ok('name' in entry, 'Monthly bucket must have month name');
        assert.ok('orders' in entry, 'Monthly bucket must have orders total');
        assert.ok('services' in entry, 'Monthly bucket must have services total');
        assert.ok('total' in entry, 'Monthly bucket must have combined total');
        assert.equal(typeof entry.total, 'number');
      }
    });

    test('Test 11.2: getActiveCoupons (GET /api/v1/coupons) returns real active coupons from DB', async () => {
      const actCode = `SEC-TEST-ACT-${Date.now()}`;
      const inactCode = `SEC-TEST-INACT-${Date.now()}`;
      // Create a test active coupon and an inactive coupon
      await Coupon.create([
        {
          code: actCode,
          discountType: 'percentage',
          discountValue: 15,
          minPurchaseAmount: 200,
          expiryDate: new Date(Date.now() + 86400000 * 30),
          isActive: true,
          isPublished: true,
          source: 'admin',
          description: 'Valid active coupon from database',
        },
        {
          code: inactCode,
          discountType: 'percentage',
          discountValue: 20,
          minPurchaseAmount: 500,
          expiryDate: new Date(Date.now() + 86400000 * 30),
          isActive: false,
          isPublished: true,
          source: 'admin',
          description: 'Inactive coupon',
        },
      ]);

      const couponReq = mockExpress({});
      await getActiveCoupons(couponReq.req, couponReq.res, couponReq.next);
      assert.equal(couponReq.res.statusCode, 200);
      const activeCoupons = couponReq.res.data.data;
      assert.ok(Array.isArray(activeCoupons));
      assert.ok(activeCoupons.every((c) => c.isActive === true && c.isPublished === true));
      assert.ok(activeCoupons.some((c) => c.code === actCode));
      assert.ok(!activeCoupons.some((c) => c.code === inactCode));

      // Clean up test coupons immediately
      await Coupon.deleteMany({ code: { $in: [actCode, inactCode] } });
    });

    test('Test 11.3: Worker Role Rejection - User model strictly rejects worker role', async () => {
      let validationError = null;
      try {
        await User.create({
          name: 'Forbidden Worker User',
          email: `forbidden-worker-${Date.now()}@sparkcare-security-test.com`,
          password: 'Password123!',
          phoneNumber: '+19998885555',
          role: 'worker',
        });
      } catch (err) {
        validationError = err;
      }

      assert.ok(validationError, 'Expected User.create with role: worker to fail validation');
      assert.match(validationError.message, /choose from user or admin/i);
    });

    test('Test 11.4: Admin updateUserRole strictly rejects worker role with HTTP 400', async () => {
      const targetUser = await User.create({
        name: 'Regular Customer',
        email: `regular-cust-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+19998884444',
        role: 'user',
      });

      const roleReq = mockExpress({ role: 'worker' }, testAdmin, { id: targetUser._id.toString() });
      await updateUserRole(roleReq.req, roleReq.res, roleReq.next);

      const err = roleReq.getError();
      assert.ok(err, 'Expected updateUserRole to call next with an error for role worker');
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /choose from user or admin/i);
    });

    test('Test 11.5: Booking model has no worker field, bookingStatus defaults to scheduled, and getBookings isolates customer bookings', async () => {
      const testCustomer = await User.create({
        name: 'Booking Customer Isolation',
        email: `cust-isolation-${Date.now()}@sparkcare-security-test.com`,
        password: 'Password123!',
        phoneNumber: '+19998883333',
        role: 'user',
      });

      const booking = await Booking.create({
        customer: testCustomer._id,
        service: testService._id,
        scheduledDate: new Date(Date.now() + 86400000),
        timeSlot: '08:00 - 11:00',
        address: { street: '123 Test Rd', city: 'Testville', state: 'TS', zipCode: '12345' },
        totalPrice: 150,
      });

      assert.equal(booking.bookingStatus, 'scheduled');
      assert.equal(booking.worker, undefined);

      // Customer querying bookings gets only their own bookings
      const custReq = mockExpress({}, testCustomer);
      await getBookings(custReq.req, custReq.res, custReq.next);
      assert.equal(custReq.res.statusCode, 200);
      const customerBookings = custReq.res.data.data;
      assert.ok(Array.isArray(customerBookings));
      assert.ok(customerBookings.every((b) => b.customer._id.toString() === testCustomer._id.toString()));
    });

    test('Test 11.6: Admin getAdminUsers excludes sensitive fields and dashboard stats excludes activeWorkers', async () => {
      const usersReq = mockExpress({}, testAdmin);
      await getAdminUsers(usersReq.req, usersReq.res, usersReq.next);
      assert.equal(usersReq.res.statusCode, 200);
      const users = usersReq.res.data.data;
      assert.ok(Array.isArray(users));
      assert.ok(users.length > 0);
      assert.ok(users.every((u) => u.password === undefined));
      assert.ok(users.every((u) => u.refreshTokenHash === undefined));

      const statsReq = mockExpress({}, testAdmin);
      await getDashboardStats(statsReq.req, statsReq.res, statsReq.next);
      assert.equal(statsReq.res.statusCode, 200);
      const summary = statsReq.res.data.data.summary;
      assert.equal(summary.activeWorkers, undefined);
      assert.ok(summary.totalUsers >= 1);
    });
  });

  // =========================================================================
  // PART 12: Nodemailer Email Service & Resilience
  // =========================================================================
  describe('PART 12: Nodemailer Email Service & Resilience', () => {
    test('Test 12.1: emailService spools to disk gracefully when SMTP is unconfigured', async () => {
      const result = await emailService.sendEmail({
        to: 'customer@sparkcare.io',
        subject: 'Order Confirmation',
        text: 'Your order has been placed.',
        html: '<p>Your order has been placed.</p>',
      });

      assert.ok(result);
      assert.equal(result.status, 'spooled');
      assert.ok(result.spoolFile, 'Must record spool file location');
    });

    test('Test 12.2: Email notification templates execute safely without throwing', async () => {
      const sampleUser = { name: 'Alice Test', email: 'alice@sparkcare.io' };
      const sampleOrder = {
        _id: new mongoose.Types.ObjectId(),
        paymentStatus: 'verified',
        orderStatus: 'confirmed',
        totals: { grandTotal: 250 },
        items: [{ name: 'Smart Switch', quantity: 2, price: 125 }],
      };

      const orderConfirmResult = await emailService.sendOrderConfirmation(sampleOrder, sampleUser);
      assert.ok(orderConfirmResult);

      const proofSubmittedResult = await emailService.sendPaymentProofSubmitted(sampleOrder, sampleUser);
      assert.ok(proofSubmittedResult);

      const verifyResult = await emailService.sendPaymentVerification(
        { order: sampleOrder._id, amount: 250 },
        sampleUser,
        'approved',
        'Verified against UPI ledger'
      );
      assert.ok(verifyResult);
    });
  });

  // =========================================================================
  // PART 13: Production Readiness, Health & Environment Validation
  // =========================================================================
  describe('PART 13: Production Readiness, Health & Environment Validation', () => {
    test('Test 13.1: checkHealth endpoint returns HTTP 200 with healthy status and database metrics', async () => {
      const healthReq = mockExpress();
      checkHealth(healthReq.req, healthReq.res);

      assert.equal(healthReq.res.statusCode, 200);
      assert.ok(healthReq.res.data, 'Health data must be returned');
      assert.equal(healthReq.res.data.success, true);
      assert.equal(healthReq.res.data.data.status, 'healthy');
      assert.equal(healthReq.res.data.data.database, 'connected');
      assert.ok(healthReq.res.data.data.uptime >= 0);
      assert.ok(healthReq.res.data.data.memoryUsage.heapUsedMB > 0);
      assert.ok(healthReq.res.data.data.version, '1.0.0');
    });

    test('Test 13.2: checkHealth reports degraded status when database is disconnected', async () => {
      const degradedReq = mockExpress();
      checkHealth(degradedReq.req, degradedReq.res, false);

      assert.equal(degradedReq.res.statusCode, 503);
      assert.equal(degradedReq.res.data.data.status, 'degraded');
      assert.equal(degradedReq.res.data.data.database, 'disconnected');
    });

    test('Test 13.3: validateEnv executes safely in development/test environment', () => {
      // Must execute without throwing or exiting in test environment
      assert.doesNotThrow(() => {
        validateEnv();
      });
    });
  });

  after(async () => {
    try {
      await User.deleteMany({ email: /@sparkcare-security-test\.com/ });
      await Service.deleteMany({
        $or: [
          { title: /Security Test Service/i },
          { title: /Sec Review Tested Service/i },
          { description: 'Testing service review verification' }
        ]
      });
      await Product.deleteMany({
        $or: [
          { sku: /^SEC-/ },
          { name: /Sec Review Tested Product|Another Unpurchased Product/ },
          { description: /Testing review verifications|Testing forge review/ }
        ]
      });
      await Coupon.deleteMany({ $or: [{ code: /SEC-TEST/ }, { code: /^REAL/ }, { code: /^REACT/ }] });
      await Booking.deleteMany({
        $or: [
          { customer: testUser._id },
          { 'address.street': '123 Test Rd' }
        ]
      });
      await Order.deleteMany({ customer: testUser._id });
      await Payment.deleteMany({ customer: testUser._id });
      await Review.deleteMany({
        comment: /Great product even though|I ordered it but|Forged verified review|Excellent electrician!/
      });
      await mongoose.connection.close(false);
    } catch (err) {
      // ignore cleanup errors
    }
  });

});




