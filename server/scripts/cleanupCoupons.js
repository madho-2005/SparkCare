import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare';

async function runCleanup() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const couponsCollection = db.collection('coupons');

  // 1. Fetch all existing coupons
  const allCoupons = await couponsCollection.find({}).toArray();
  console.log(`Found ${allCoupons.length} total coupon records in database.`);

  // 2. Create backup directory and dump file
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `coupons_backup_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(allCoupons, null, 2), 'utf8');
  console.log(`Backup created successfully at: ${backupFile}`);

  // 3. Identify fake / demo / test / auto-generated coupons
  // Patterns: REALACT*, REALINACT*, REACT*, SEC-TEST*, TEST*, MOCK*
  const fakeRegex = /^(REALACT|REALINACT|REACT|SEC-TEST|TEST|MOCK)/i;

  const fakeCoupons = allCoupons.filter(c => fakeRegex.test(c.code));
  const genuineCoupons = allCoupons.filter(c => !fakeRegex.test(c.code));

  console.log(`\n--- COUPON AUDIT SUMMARY ---`);
  console.log(`Total Coupons: ${allCoupons.length}`);
  console.log(`Fake / Test / Auto-generated Coupons: ${fakeCoupons.length}`);
  console.log(`Genuine Admin Coupons to Preserve: ${genuineCoupons.length}`);
  if (genuineCoupons.length > 0) {
    console.log('Genuine coupons preserved:');
    genuineCoupons.forEach(c => {
      console.log(`  - Code: ${c.code}, Active: ${c.isActive}, CreatedAt: ${c.createdAt}`);
    });
  }

  // 4. Delete confirmed fake/test coupons
  if (fakeCoupons.length > 0) {
    const fakeIds = fakeCoupons.map(c => c._id);
    const deleteResult = await couponsCollection.deleteMany({ _id: { $in: fakeIds } });
    console.log(`\nSuccessfully deleted ${deleteResult.deletedCount} fake/test coupons.`);
  } else {
    console.log('\nNo fake/test coupons to delete.');
  }

  // 5. Verify remaining coupons
  const remainingCoupons = await couponsCollection.find({}).toArray();
  console.log(`\nRemaining coupons in database: ${remainingCoupons.length}`);
  console.log('Remaining codes:', remainingCoupons.map(c => c.code));

  await mongoose.disconnect();
  console.log('Database connection closed. Cleanup complete.');
}

runCleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
