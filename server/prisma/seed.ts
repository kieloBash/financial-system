import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

// Create Prisma Client instance for seeding
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.quickPrice.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  console.log('👤 Creating test user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      googleId: null,
    },
  });
  console.log(`✅ Created user: ${user.email} (${user.id})`);

  // Create default categories
  console.log('📁 Creating default categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Food & Dining',
        color: '#FF6B6B',
        icon: 'food',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Transportation',
        color: '#4ECDC4',
        icon: 'car',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Shopping',
        color: '#FFE66D',
        icon: 'shopping',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Bills & Utilities',
        color: '#95E1D3',
        icon: 'bills',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Entertainment',
        color: '#F38181',
        icon: 'entertainment',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Healthcare',
        color: '#AA96DA',
        icon: 'healthcare',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Education',
        color: '#FCBAD3',
        icon: 'education',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Other',
        color: '#C7CEEA',
        icon: 'other',
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Create some sample expenses
  console.log('💰 Creating sample expenses...');
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: categories[0].id, // Food & Dining
        amount: 45.50,
        description: 'Lunch at restaurant',
        date: new Date(),
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: categories[1].id, // Transportation
        amount: 25.00,
        description: 'Uber ride',
        date: new Date(Date.now() - 86400000), // Yesterday
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: categories[2].id, // Shopping
        amount: 89.99,
        description: 'New clothes',
        date: new Date(Date.now() - 172800000), // 2 days ago
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: categories[0].id, // Food & Dining
        amount: 12.75,
        description: 'Coffee and snacks',
        date: new Date(Date.now() - 259200000), // 3 days ago
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: categories[3].id, // Bills & Utilities
        amount: 120.00,
        description: 'Electricity bill',
        date: new Date(Date.now() - 345600000), // 4 days ago
      },
    }),
  ]);
  console.log(`✅ Created ${expenses.length} sample expenses`);

  // Create some quick prices (price templates)
  console.log('⚡ Creating quick prices...');
  const quickPrices = await Promise.all([
    prisma.quickPrice.create({
      data: {
        userId: user.id,
        categoryId: categories[0].id, // Food & Dining
        name: 'Regular Lunch',
        amount: 25.00,
        description: 'Standard lunch meal',
      },
    }),
    prisma.quickPrice.create({
      data: {
        userId: user.id,
        categoryId: categories[1].id, // Transportation
        name: 'Daily Commute',
        amount: 15.00,
        description: 'Morning and evening commute',
      },
    }),
    prisma.quickPrice.create({
      data: {
        userId: user.id,
        categoryId: categories[2].id, // Shopping
        name: 'Weekly Groceries',
        amount: 80.00,
        description: 'Regular weekly grocery shopping',
      },
    }),
  ]);
  console.log(`✅ Created ${quickPrices.length} quick prices`);

  console.log('✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 1`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Expenses: ${expenses.length}`);
  console.log(`   - Quick Prices: ${quickPrices.length}`);
  console.log('\n🔑 Test Credentials:');
  console.log(`   Email: test@example.com`);
  console.log(`   Password: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
