import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare';

const SEED_SERVICES = [
  {
    title: 'Ceiling Fan Installation & Setup',
    description: 'Expert assembly, mounting, wiring, and balancing of ceiling fans. Includes safe testing and switch alignment.',
    category: 'Installation',
    basePrice: 120,
    estimatedMinutes: 60,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/ceiling-fan.png',
      public_id: 'seed/ceiling-fan'
    }]
  },
  {
    title: 'Smart Panel Upgrade (200 Amp)',
    description: 'Replace obsolete or dangerous fuse boxes/panels with state-of-the-art breaker systems featuring remote mobile tracking.',
    category: 'Wiring',
    basePrice: 499,
    estimatedMinutes: 240,
    difficulty: 'complex',
    images: [{
      secure_url: '/images/services/smart-panel.png',
      public_id: 'seed/smart-panel'
    }]
  },
  {
    title: 'EV Fast Charger Installation',
    description: 'Premium circuit setup and hardware mounting of high-power Level 2 electric vehicle chargers in residential garages.',
    category: 'Installation',
    basePrice: 299,
    estimatedMinutes: 120,
    difficulty: 'complex',
    images: [{
      secure_url: '/images/services/ev-charger.png',
      public_id: 'seed/ev-charger'
    }]
  },
  {
    title: 'Faulty Wiring Diagnosis & Repair',
    description: 'Full inspection of dead outlets, burning odors, flickering bulbs, and tripping breakers to ensure home safety.',
    category: 'Repair',
    basePrice: 95,
    estimatedMinutes: 90,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/wiring-repair.png',
      public_id: 'seed/wiring-repair'
    }]
  },
  {
    title: 'LED Recessed Lighting Setup',
    description: 'Layout and installation of modern, ultra-slim recessed LED downlights with dimmable switches for a sleek environment.',
    category: 'Installation',
    basePrice: 180,
    estimatedMinutes: 150,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/led-lighting.png',
      public_id: 'seed/led-lighting'
    }]
  },
  {
    title: 'Smart Thermostat Integration',
    description: 'Secure installation and software integration of Nest, Ecobee, or Honeywell smart units with home network syncing.',
    category: 'Installation',
    basePrice: 85,
    estimatedMinutes: 45,
    difficulty: 'basic',
    images: [{
      secure_url: '/images/services/thermostat.png',
      public_id: 'seed/thermostat'
    }]
  },
  {
    title: 'Outdoor Flood & Security Lighting',
    description: 'Weatherproof LED floodlights, motion sensors, and smart dusk-to-dawn controllers for perimeter protection.',
    category: 'Installation',
    basePrice: 210,
    estimatedMinutes: 90,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/outdoor-lighting.png',
      public_id: 'seed/outdoor-lighting'
    }]
  },
  {
    title: 'Electrical Safety Inspection',
    description: 'Comprehensive NFPA-compliant home audit covering outlets, grounding, panel load analysis, and AFCI protection.',
    category: 'Inspection',
    basePrice: 75,
    estimatedMinutes: 75,
    difficulty: 'basic',
    images: [{
      secure_url: '/images/services/safety-inspection.png',
      public_id: 'seed/safety-inspection'
    }]
  },
  {
    title: 'Whole-Home Surge Protection',
    description: 'Install whole-panel surge protectors to shield appliances, electronics, and HVAC from voltage spikes.',
    category: 'Wiring',
    basePrice: 185,
    estimatedMinutes: 60,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/surge-protection.png',
      public_id: 'seed/surge-protection'
    }]
  }
];

async function cleanAndSeed() {
  console.log(`Connecting to MongoDB: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const initialProducts = await db.collection('products').countDocuments();
  const initialServices = await db.collection('services').countDocuments();
  console.log(`Initial status: ${initialProducts} products, ${initialServices} services in database.`);

  // 1. Delete test products
  const delProductsRes = await db.collection('products').deleteMany({
    $or: [
      { sku: /^SEC-/ },
      { name: /Sec Review Tested Product|Another Unpurchased Product/ }
    ]
  });
  console.log(`Deleted ${delProductsRes.deletedCount} test product records.`);

  // 2. Delete test services
  const delServicesRes = await db.collection('services').deleteMany({
    $or: [
      { title: /^Sec Review Tested Service/ },
      { description: 'Testing service review verification' }
    ]
  });
  console.log(`Deleted ${delServicesRes.deletedCount} test service records.`);

  // 3. Delete any dangling test reviews or bookings
  const delReviewsRes = await db.collection('reviews').deleteMany({
    comment: 'Excellent electrician! Completed work quickly.'
  });
  const delBookingsRes = await db.collection('bookings').deleteMany({
    'address.street': '123 Test Rd'
  });
  console.log(`Cleaned ${delReviewsRes.deletedCount} test reviews and ${delBookingsRes.deletedCount} test bookings.`);

  // 4. Ensure distinct seed services exist
  for (const s of SEED_SERVICES) {
    const existing = await db.collection('services').findOne({
      $or: [
        { title: s.title },
        // Match legacy 'EV Charging Station Setup' with 'EV Fast Charger Installation'
        ...(s.title.includes('EV') ? [{ title: /EV/i }] : [])
      ]
    });
    if (!existing) {
      await db.collection('services').insertOne({
        ...s,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Inserted missing seed service: ${s.title}`);
    } else {
      // Update images to ensure proper path
      await db.collection('services').updateOne(
        { _id: existing._id },
        { $set: { images: s.images } }
      );
    }
  }

  const finalProducts = await db.collection('products').find({}).toArray();
  const finalServices = await db.collection('services').find({}).toArray();

  console.log('\n=== FINAL CATALOG AUDIT ===');
  console.log(`Final Products Count: ${finalProducts.length}`);
  console.log(`Final Services Count: ${finalServices.length}`);

  // Confirm 0 duplicate product names or SKUs
  const pNames = new Set();
  const pSkus = new Set();
  let duplicateProductsFound = false;
  for (const p of finalProducts) {
    if (pNames.has(p.name)) {
      console.error(`ERROR: Duplicate product name remaining: ${p.name}`);
      duplicateProductsFound = true;
    }
    if (pSkus.has(p.sku)) {
      console.error(`ERROR: Duplicate product SKU remaining: ${p.sku}`);
      duplicateProductsFound = true;
    }
    pNames.add(p.name);
    pSkus.add(p.sku);
  }

  // Confirm 0 duplicate service titles
  const sTitles = new Set();
  let duplicateServicesFound = false;
  for (const s of finalServices) {
    if (sTitles.has(s.title)) {
      console.error(`ERROR: Duplicate service title remaining: ${s.title}`);
      duplicateServicesFound = true;
    }
    sTitles.add(s.title);
  }

  if (!duplicateProductsFound && !duplicateServicesFound) {
    console.log('SUCCESS: All product records and service records are 100% unique!');
  }

  await mongoose.disconnect();
  console.log('Disconnected from database.');
}

cleanAndSeed().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
