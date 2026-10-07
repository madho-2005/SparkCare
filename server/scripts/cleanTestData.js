import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Users to preserve during test data cleanup (configurable via KEEP_EMAILS env variable)
const KEEP_EMAILS = process.env.KEEP_EMAILS
  ? process.env.KEEP_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : [];

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare');
console.log('Connected to MongoDB.\n');

const db = mongoose.connection.db;

// Find all test user IDs (everyone NOT in the keep list)
const testUsers = await db.collection('users')
  .find({ email: { $nin: KEEP_EMAILS } })
  .project({ _id: 1, name: 1, email: 1, role: 1 })
  .toArray();

if (testUsers.length === 0) {
  console.log('No test users found. Nothing to delete.');
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`Found ${testUsers.length} test user(s) to delete:`);
testUsers.forEach(u => console.log(`  [${u.role || 'user'}] ${u.name} — ${u.email}`));

const testUserIds = testUsers.map(u => u._id);

// Cascade delete all data belonging to these test users
const bookings = await db.collection('bookings').deleteMany({ user: { $in: testUserIds } });
const orders   = await db.collection('orders').deleteMany({ user: { $in: testUserIds } });
const payments = await db.collection('payments').deleteMany({ user: { $in: testUserIds } });
const reviews  = await db.collection('reviews').deleteMany({ user: { $in: testUserIds } });

// Delete the test users themselves
const users = await db.collection('users').deleteMany({ _id: { $in: testUserIds } });

// Also clean up test products and coupons from previous test runs
const products = await db.collection('products').deleteMany({ sku: /SEC-TEST/i });
const coupons  = await db.collection('coupons').deleteMany({
  $or: [
    { code: /SEC-TEST/i },
    { code: /^REAL/i },
    { code: /^REACT/i },
  ],
});
const services = await db.collection('services').deleteMany({ title: /Security Test Service/i });

console.log('\n--- Deletion Summary ---');
console.log(`Users deleted:    ${users.deletedCount}`);
console.log(`Bookings deleted: ${bookings.deletedCount}`);
console.log(`Orders deleted:   ${orders.deletedCount}`);
console.log(`Payments deleted: ${payments.deletedCount}`);
console.log(`Reviews deleted:  ${reviews.deletedCount}`);
console.log(`Products deleted: ${products.deletedCount}`);
console.log(`Coupons deleted:  ${coupons.deletedCount}`);
console.log(`Services deleted: ${services.deletedCount}`);
console.log('\nCleanup complete!');

// Verify remaining users
const remaining = await db.collection('users').find({}, { projection: { name:1, email:1, role:1 } }).toArray();
console.log(`\nRemaining users in DB (${remaining.length}):`);
remaining.forEach(u => console.log(`  [${u.role || 'user'}] ${u.name} — ${u.email}`));

await mongoose.disconnect();
