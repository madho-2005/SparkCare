import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@sparkcare.com';
const NEW_PASSWORD = process.argv[3] || process.env.ADMIN_INITIAL_PASSWORD || 'Admin@1234';

async function resetAdminPassword() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);

    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, lowercase: true, trim: true },
      password: String,
      role: String,
      phoneNumber: String,
      isVerified: Boolean
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    let user = await User.findOne({ email: EMAIL.toLowerCase() });

    if (user) {
      user.password = hashedPassword;
      user.role = 'admin';
      user.isVerified = true;
      await user.save();
      console.log(`\n✅ SUCCESS: Password updated and admin role assigned for existing account:`);
      console.log(`   Email:    ${EMAIL}`);
      console.log(`   Password: ${NEW_PASSWORD}`);
      console.log(`   Role:     admin\n`);
    } else {
      user = await User.create({
        name: 'Admin User',
        email: EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '9999999999',
        isVerified: true
      });
      console.log(`\n✅ SUCCESS: Created new Admin account:`);
      console.log(`   Email:    ${EMAIL}`);
      console.log(`   Password: ${NEW_PASSWORD}`);
      console.log(`   Role:     admin\n`);
    }

  } catch (error) {
    console.error(`❌ ERROR: Failed to reset admin password:`, error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetAdminPassword();
