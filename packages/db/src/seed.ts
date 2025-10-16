import { prisma } from './index';

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (in dev only)
  console.log('🧹 Cleaning existing data...');
  await prisma.journalLine.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.ledgerBook.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.role.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.workspaceUser.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.fxRate.deleteMany();
  await prisma.currency.deleteMany();

  // 1. Create Currencies
  console.log('💵 Creating currencies...');
  const usd = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimals: 2,
      isActive: true,
    },
  });

  const eur = await prisma.currency.upsert({
    where: { code: 'EUR' },
    update: {},
    create: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      decimals: 2,
      isActive: true,
    },
  });

  const gbp = await prisma.currency.upsert({
    where: { code: 'GBP' },
    update: {},
    create: {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      decimals: 2,
      isActive: true,
    },
  });

  console.log('✓ Currencies created');

  // 2. Create Workspace
  console.log('🏢 Creating demo workspace...');
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      planTier: 'PLUS',
    },
  });

  console.log(`✓ Workspace created: ${workspace.name} (${workspace.slug})`);

  // 3. Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.workspaceUser.create({
    data: {
      workspaceId: workspace.id,
      userId: 'user_demo_admin',
      email: 'admin@acme.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log(`✓ Admin user created: ${adminUser.email}`);

  // 4. Create Entity
  console.log('🏛️ Creating entity...');
  const entity = await prisma.entity.create({
    data: {
      workspaceId: workspace.id,
      code: 'US01',
      name: 'Acme USA',
      legalName: 'Acme Corporation USA Inc.',
      taxId: '12-3456789',
      baseCurrencyCode: 'USD',
      isActive: true,
    },
  });

  console.log(`✓ Entity created: ${entity.name} (${entity.code})`);

  // 5. Create Ledger Books
  console.log('📚 Creating ledger books...');
  const localBook = await prisma.ledgerBook.create({
    data: {
      entityId: entity.id,
      code: 'LOCAL',
      name: 'Local GAAP',
      description: 'Local statutory reporting book',
      isActive: true,
    },
  });

  const groupBook = await prisma.ledgerBook.create({
    data: {
      entityId: entity.id,
      code: 'GROUP',
      name: 'Group Consolidation',
      description: 'Group reporting book (IFRS)',
      isActive: true,
    },
  });

  console.log('✓ Ledger books created: LOCAL, GROUP');

  // 6. Create Chart of Accounts
  console.log('🗂️ Creating chart of accounts...');

  // Assets
  const assets = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '1000',
      name: 'Assets',
      type: 'ASSET',
      isActive: true,
    },
  });

  const currentAssets = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '1100',
      name: 'Current Assets',
      type: 'ASSET',
      parentId: assets.id,
      isActive: true,
    },
  });

  const cash = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '1110',
      name: 'Cash and Cash Equivalents',
      type: 'ASSET',
      subtype: 'CASH',
      parentId: currentAssets.id,
      isActive: true,
    },
  });

  const ar = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '1120',
      name: 'Accounts Receivable',
      type: 'ASSET',
      subtype: 'AR',
      parentId: currentAssets.id,
      isActive: true,
    },
  });

  // Liabilities
  const liabilities = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '2000',
      name: 'Liabilities',
      type: 'LIABILITY',
      isActive: true,
    },
  });

  const currentLiabilities = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '2100',
      name: 'Current Liabilities',
      type: 'LIABILITY',
      parentId: liabilities.id,
      isActive: true,
    },
  });

  const ap = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '2110',
      name: 'Accounts Payable',
      type: 'LIABILITY',
      subtype: 'AP',
      parentId: currentLiabilities.id,
      isActive: true,
    },
  });

  // Equity
  const equity = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '3000',
      name: 'Equity',
      type: 'EQUITY',
      isActive: true,
    },
  });

  const retainedEarnings = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '3100',
      name: 'Retained Earnings',
      type: 'EQUITY',
      parentId: equity.id,
      isActive: true,
    },
  });

  // Revenue
  const revenue = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '4000',
      name: 'Revenue',
      type: 'REVENUE',
      isActive: true,
    },
  });

  const productRevenue = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '4100',
      name: 'Product Revenue',
      type: 'REVENUE',
      parentId: revenue.id,
      isActive: true,
    },
  });

  // Expenses
  const expenses = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '5000',
      name: 'Operating Expenses',
      type: 'EXPENSE',
      isActive: true,
    },
  });

  const salaries = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '5100',
      name: 'Salaries and Wages',
      type: 'EXPENSE',
      parentId: expenses.id,
      isActive: true,
    },
  });

  const rent = await prisma.account.create({
    data: {
      entityId: entity.id,
      code: '5200',
      name: 'Rent Expense',
      type: 'EXPENSE',
      parentId: expenses.id,
      isActive: true,
    },
  });

  console.log('✓ Chart of accounts created (15 accounts)');

  // 7. Dimensions removed for SQLite version
  console.log('✓ Skipping dimensions (not in SQLite schema)');

  // 8. Create Sample Journal Entry
  console.log('📝 Creating sample journal entry...');
  const journal = await prisma.journal.create({
    data: {
      entityId: entity.id,
      journalNumber: 'JNL-2025-0001',
      journalDate: new Date('2025-01-15'),
      period: '2025-01',
      journalType: 'STANDARD',
      description: 'Initial capital contribution',
      source: 'MANUAL',
      status: 'POSTED',
      postedAt: new Date(),
      postedBy: adminUser.userId,
      createdBy: adminUser.userId,
      lines: {
        create: [
          {
            lineNumber: 1,
            bookId: localBook.id,
            accountId: cash.id,
            debit: 100000,
            credit: 0,
            currencyCode: 'USD',
            amountOriginal: 100000,
            description: 'Capital contribution - cash',
          },
          {
            lineNumber: 2,
            bookId: localBook.id,
            accountId: retainedEarnings.id,
            debit: 0,
            credit: 100000,
            currencyCode: 'USD',
            amountOriginal: 100000,
            description: 'Capital contribution - equity',
          },
        ],
      },
    },
  });

  console.log(`✓ Sample journal created: ${journal.journalNumber}`);

  // 9. Create Vendor & Customer
  console.log('🤝 Creating vendors and customers...');
  const vendor = await prisma.vendor.create({
    data: {
      workspaceId: workspace.id,
      code: 'V001',
      name: 'AWS',
      email: 'billing@aws.amazon.com',
      isActive: true,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      workspaceId: workspace.id,
      code: 'C001',
      name: 'Beta Corp',
      email: 'ap@betacorp.com',
      isActive: true,
    },
  });

  console.log('✓ Vendor and customer created');

  // 10. Create Roles
  console.log('🔐 Creating roles...');
  await prisma.role.createMany({
    data: [
      {
        workspaceId: workspace.id,
        name: 'Admin',
        description: 'Full system access',
        permissions: '["*"]',
        isSystem: true,
      },
      {
        workspaceId: workspace.id,
        name: 'Accountant',
        description: 'Can create and post journals',
        permissions: '["journal.create", "journal.post", "account.read"]',
        isSystem: true,
      },
      {
        workspaceId: workspace.id,
        name: 'Viewer',
        description: 'Read-only access',
        permissions: '["*.read"]',
        isSystem: true,
      },
    ],
  });

  console.log('✓ Roles created: Admin, Accountant, Viewer');

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Workspace: ${workspace.name}`);
  console.log(`   Entity: ${entity.name} (${entity.code})`);
  console.log(`   Books: 2 (LOCAL, GROUP)`);
  console.log(`   Accounts: 15`);
  console.log(`   Sample Journal: ${journal.journalNumber}`);
  console.log(`   Vendor: ${vendor.name}`);
  console.log(`   Customer: ${customer.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
