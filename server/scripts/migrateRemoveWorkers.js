/**
 * SparkCare Database Migration: Complete & Permanent Worker Feature Removal
 * 
 * Safely inspects the MongoDB database, converts any legacy 'worker' roles
 * to 'user', removes obsolete 'workerProfile' subdocuments, clears 'worker' references
 * from bookings, migrates legacy 'pending_assignment' statuses to 'scheduled',
 * and drops obsolete worker compound indices.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare';

async function migrateRemoveWorkers() {
  console.log('====================================================');
  console.log(' SparkCare Migration: Permanently Remove Worker Data');
  console.log('====================================================');
  console.log(`Connecting to database at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.\n');

    const db = mongoose.connection.db;

    // 1. Inspect and migrate User collection
    console.log('1. Checking Users Collection...');
    const usersCollection = db.collection('users');

    const workerUsers = await usersCollection.find({
      $or: [
        { role: 'worker' },
        { workerProfile: { $exists: true } }
      ]
    }).toArray();

    console.log(`Found ${workerUsers.length} user account(s) with worker role or worker profile.`);

    if (workerUsers.length > 0) {
      // 1a. For accounts that were specifically role: 'worker', convert to 'user'
      const convertedWorkers = await usersCollection.updateMany(
        { role: 'worker' },
        { $set: { role: 'user' }, $unset: { workerProfile: '' } }
      );
      console.log(`Worker accounts converted to user role: ${convertedWorkers.modifiedCount}`);

      // 1b. For accounts that already had 'admin' or 'user' roles, only unset workerProfile
      const cleanedProfiles = await usersCollection.updateMany(
        { workerProfile: { $exists: true } },
        { $unset: { workerProfile: '' } }
      );
      console.log(`Accounts cleaned of obsolete workerProfile: ${cleanedProfiles.modifiedCount}\n`);
    } else {
      console.log('No worker users found in database.\n');
    }

    // 2. Inspect and migrate Bookings collection
    console.log('2. Checking Bookings Collection...');
    const bookingsCollection = db.collection('bookings');

    const affectedBookings = await bookingsCollection.find({
      $or: [
        { worker: { $exists: true } },
        { bookingStatus: 'pending_assignment' }
      ]
    }).toArray();

    console.log(`Found ${affectedBookings.length} booking record(s) with worker field or pending_assignment status.`);

    if (affectedBookings.length > 0) {
      const bookingUpdateResult = await bookingsCollection.updateMany(
        {
          $or: [
            { worker: { $exists: true } },
            { bookingStatus: 'pending_assignment' }
          ]
        },
        {
          $unset: { worker: '' },
          $set: { bookingStatus: 'scheduled' }
        }
      );

      console.log(`Bookings updated: ${bookingUpdateResult.modifiedCount} record(s) normalized to scheduled state without worker references.\n`);
    } else {
      console.log('No bookings with worker references found in database.\n');
    }

    // 3. Inspect and clean obsolete indices
    console.log('3. Checking Booking Collection Indices...');
    try {
      const indices = await bookingsCollection.indexes();
      for (const idx of indices) {
        if (idx.key && idx.key.worker) {
          console.log(` - Dropping obsolete worker index: "${idx.name}"`);
          await bookingsCollection.dropIndex(idx.name);
          console.log(`   Dropped index "${idx.name}" successfully.`);
        }
      }
    } catch (idxErr) {
      console.warn('   Note on index check:', idxErr.message);
    }

    console.log('\n====================================================');
    console.log(' Worker Migration Completed Successfully!');
    console.log(' Supported roles across SparkCare: ["user", "admin"]');
    console.log('====================================================');
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrateRemoveWorkers();
