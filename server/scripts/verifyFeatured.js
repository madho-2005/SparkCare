import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare');

const { Product } = await import('../models/Product.js');

const totalProducts = await Product.countDocuments();
const featuredProducts = await Product.find({ isFeatured: true, isActive: { $ne: false }, status: { $nin: ['draft', 'inactive'] } })
  .sort({ averageRating: -1 })
  .limit(6);

console.log(`Total products in DB: ${totalProducts}`);
console.log(`Featured products (isFeatured=true, active): ${featuredProducts.length}`);
console.log('');

if (featuredProducts.length > 0) {
  console.log('Featured product list:');
  featuredProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p._id}] ${p.name} — ₹${p.price} | isFeatured: ${p.isFeatured} | status: ${p.status}`);
  });
} else {
  console.log('WARNING: No featured products found! Checking isFeatured flag on all products...');
  const sample = await Product.find({}).limit(5).select('name isFeatured status isActive');
  sample.forEach(p => console.log(`  ${p.name}: isFeatured=${p.isFeatured}, status=${p.status}, isActive=${p.isActive}`));
}

await mongoose.disconnect();
