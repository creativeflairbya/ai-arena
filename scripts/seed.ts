import 'dotenv/config';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  try {
    // Master account credentials
    const masterEmail = 'master@aistudio.com';
    const masterPassword = 'Master@123456';

    // Check if master account exists
    const existingMaster = await db.select().from(users).where(eq(users.email, masterEmail)).limit(1);

    if (existingMaster.length > 0) {
      console.log('Master account already exists!');
      console.log('Email:', masterEmail);
      console.log('Password:', masterPassword);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(masterPassword, 10);

    // Create master account
    await db.insert(users).values({
      email: masterEmail,
      password: hashedPassword,
      name: 'Master Admin',
      role: 'master',
      credits: 999999999, // Effectively unlimited
      subscriptionTier: 'unlimited',
      subscriptionStatus: 'active',
    });

    console.log('✅ Master account created successfully!');
    console.log('');
    console.log('='.repeat(50));
    console.log('MASTER ACCOUNT CREDENTIALS');
    console.log('='.repeat(50));
    console.log('Email:', masterEmail);
    console.log('Password:', masterPassword);
    console.log('Role: master');
    console.log('Credits: Unlimited');
    console.log('='.repeat(50));
    console.log('');
    console.log('⚠️  IMPORTANT: Please save these credentials securely!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
