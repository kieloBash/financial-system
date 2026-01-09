"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../src/generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcryptjs"));
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Starting database seed...');
    console.log('🧹 Cleaning existing data...');
    await prisma.quickPrice.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
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
    console.log('💰 Creating sample expenses...');
    const expenses = await Promise.all([
        prisma.expense.create({
            data: {
                userId: user.id,
                categoryId: categories[0].id,
                amount: 45.50,
                description: 'Lunch at restaurant',
                date: new Date(),
            },
        }),
        prisma.expense.create({
            data: {
                userId: user.id,
                categoryId: categories[1].id,
                amount: 25.00,
                description: 'Uber ride',
                date: new Date(Date.now() - 86400000),
            },
        }),
        prisma.expense.create({
            data: {
                userId: user.id,
                categoryId: categories[2].id,
                amount: 89.99,
                description: 'New clothes',
                date: new Date(Date.now() - 172800000),
            },
        }),
        prisma.expense.create({
            data: {
                userId: user.id,
                categoryId: categories[0].id,
                amount: 12.75,
                description: 'Coffee and snacks',
                date: new Date(Date.now() - 259200000),
            },
        }),
        prisma.expense.create({
            data: {
                userId: user.id,
                categoryId: categories[3].id,
                amount: 120.00,
                description: 'Electricity bill',
                date: new Date(Date.now() - 345600000),
            },
        }),
    ]);
    console.log(`✅ Created ${expenses.length} sample expenses`);
    console.log('⚡ Creating quick prices...');
    const quickPrices = await Promise.all([
        prisma.quickPrice.create({
            data: {
                userId: user.id,
                categoryId: categories[0].id,
                name: 'Regular Lunch',
                amount: 25.00,
                description: 'Standard lunch meal',
            },
        }),
        prisma.quickPrice.create({
            data: {
                userId: user.id,
                categoryId: categories[1].id,
                name: 'Daily Commute',
                amount: 15.00,
                description: 'Morning and evening commute',
            },
        }),
        prisma.quickPrice.create({
            data: {
                userId: user.id,
                categoryId: categories[2].id,
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
//# sourceMappingURL=seed.js.map