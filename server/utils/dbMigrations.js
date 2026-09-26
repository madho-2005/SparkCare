import mongoose from 'mongoose';
import { logger } from './logger.js';

// ---------------------------------------------------------------------------
// Product Image Patches — local images stored in public/images/products/
// ---------------------------------------------------------------------------
const PRODUCT_IMAGE_FIXES = [
  { sku: 'PHILIPS-9W-LED',       name: 'Philips 9W LED Bulb',         url: '/images/products/philips-9w-led-bulb.png' },
  { sku: 'HAVELLS-LED-PANEL',    name: 'Havells LED Panel Light',      url: '/images/products/havells-led-panel-light.png' },
  { sku: 'WIPRO-SMART-LED',      name: 'Wipro Smart LED Bulb',         url: '/images/products/wipro-smart-led-bulb.png' },
  { sku: 'BAJAJ-EMER-LED',       name: 'Bajaj Emergency LED Light',    url: '/images/products/bajaj-emergency-led-light.png' },
  { sku: 'SYSKA-T5-TUBE',        name: 'Syska Tube Light',             url: '/images/products/syska-tube-light.png' },
  { sku: 'POLYCAB-CU-15',        name: 'Polycab Copper Wire',          url: '/images/products/polycab-copper-wire.png' },
  { sku: 'FINOLEX-CABLE-25',     name: 'Finolex Electrical Cable',     url: '/images/products/finolex-electrical-cable.png' },
  { sku: 'HAVELLS-WIRE-10',      name: 'Havells House Wire',           url: '/images/products/havells-house-wire.png' },
  { sku: 'ANCHOR-FLEX-3C',       name: 'Anchor Flexible Cable',        url: '/images/products/anchor-flexible-cable.png' },
  { sku: 'RRKABEL-PREM-40',      name: 'RR Kabel Premium Wire',        url: '/images/products/rr-kabel-premium-wire.png' },
  { sku: 'CROMPTON-HS-FAN',      name: 'Crompton High Speed Fan',      url: '/images/products/crompton-high-speed-fan.png' },
  { sku: 'ORIENT-AERO-FAN',      name: 'Orient Aero Fan',              url: '/images/products/orient-aero-fan.png' },
  { sku: 'HAVELLS-DECOR-FAN',    name: 'Havells Decorative Fan',       url: '/images/products/havells-decorative-fan.png' },
];

/**
 * Patches broken product image URLs directly in the database.
 * Run manually when specific products have broken image references.
 *
 * Usage: node utils/dbMigrations.js
 */
export async function fixProductImages() {
  const Product = mongoose.model(
    'Product',
    new mongoose.Schema({}, { strict: false }),
    'products'
  );

  logger.info('Running migration: fixProductImages...');

  for (const fix of PRODUCT_IMAGE_FIXES) {
    const result = await Product.updateOne(
      { sku: fix.sku },
      {
        $set: {
          'images.0.secure_url': fix.url,
          'images.0.public_id': `seed/${fix.sku.toLowerCase().replace(/-/g, '_')}`
        }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`✅ Updated image: ${fix.name} (SKU: ${fix.sku})`);
    } else {
      logger.warn(`⚠️  Not found in DB: ${fix.name} (SKU: ${fix.sku})`);
    }
  }

  logger.info('Migration fixProductImages complete.');
}

// ---------------------------------------------------------------------------
// CLI entry point — run directly: node utils/dbMigrations.js
// ---------------------------------------------------------------------------
if (process.argv[1].endsWith('dbMigrations.js')) {
  (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is missing.');
      }
      await mongoose.connect(mongoUri);
      logger.info('MongoDB connected');

      await fixProductImages();

      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      logger.error(`Migration failed: ${err.message}`);
      process.exit(1);
    }
  })();
}
