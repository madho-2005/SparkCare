import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkcare');

const users = await mongoose.connection.db.collection('users')
  .find({}, { projection: { name: 1, email: 1, role: 1, createdAt: 1 } })
  .toArray();

console.log('Total users in DB:', users.length);
console.log('');
users.forEach(u => {
  const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A';
  console.log(`  [${(u.role || 'user').padEnd(5)}] ${(u.name || '').padEnd(30)} ${u.email}  (created: ${date})`);
});

const testUsers = users.filter(u =>
  u.email && (
    /security-test/i.test(u.email) ||
    /@sparkcare-security-test/.test(u.email) ||
    /testcustomer|testadmin/.test(u.email)
  )
);
console.log('\nTest-looking users found:', testUsers.length);
if (testUsers.length > 0) {
  testUsers.forEach(u => console.log('  -> ', u.email));
}

await mongoose.disconnect();
