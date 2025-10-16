import { prisma } from './index';

async function testConnection() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    await prisma.$queryRaw`SELECT 1 as result`;
    console.log('   ✓ Database is connected\n');

    // Test 2: Count workspaces
    console.log('2️⃣ Counting workspaces...');
    const workspaceCount = await prisma.workspace.count();
    console.log(`   ✓ Found ${workspaceCount} workspace(s)\n`);

    // Test 3: Get workspace details
    if (workspaceCount > 0) {
      console.log('3️⃣ Fetching workspace details...');
      const workspace = await prisma.workspace.findFirst({
        include: {
          entities: {
            include: {
              accounts: {
                where: { parentId: null },
                take: 5,
              },
            },
          },
        },
      });

      if (workspace) {
        console.log(`   ✓ Workspace: ${workspace.name} (${workspace.slug})`);
        console.log(`     Plan: ${workspace.planTier}`);
        console.log(`     Entities: ${workspace.entities.length}`);

        if (workspace.entities.length > 0) {
          const entity = workspace.entities[0];
          console.log(`\n   📍 Entity: ${entity.name}`);
          console.log(`     Code: ${entity.code}`);
          console.log(`     Currency: ${entity.baseCurrencyCode}`);
          console.log(`     Top-level accounts: ${entity.accounts.length}`);
        }
      }
    }

    // Test 4: Count journals
    console.log('\n4️⃣ Counting journals...');
    const journalCount = await prisma.journal.count();
    console.log(`   ✓ Found ${journalCount} journal(s)\n`);

    // Test 5: Get sample journal with lines
    if (journalCount > 0) {
      console.log('5️⃣ Fetching sample journal...');
      const journal = await prisma.journal.findFirst({
        include: {
          lines: {
            include: {
              account: true,
            },
          },
        },
      });

      if (journal) {
        console.log(`   ✓ Journal: ${journal.journalNumber}`);
        console.log(`     Date: ${journal.journalDate.toISOString().split('T')[0]}`);
        console.log(`     Status: ${journal.status}`);
        console.log(`     Lines: ${journal.lines.length}`);

        journal.lines.forEach((line) => {
          const side = line.debit > 0 ? 'DR' : 'CR';
          const amount = line.debit > 0 ? line.debit : line.credit;
          console.log(`       ${line.lineNumber}. ${line.account.name}: ${side} ${amount}`);
        });
      }
    }

    // Test 6: Trial balance calculation
    console.log('\n6️⃣ Calculating trial balance...');
    const balances = await prisma.$queryRaw<Array<{
      account_code: string;
      account_name: string;
      total_debit: number;
      total_credit: number
    }>>`
      SELECT
        a.code as account_code,
        a.name as account_name,
        COALESCE(SUM(jl.debit), 0) as total_debit,
        COALESCE(SUM(jl.credit), 0) as total_credit
      FROM accounts a
      LEFT JOIN journal_lines jl ON jl."accountId" = a.id
      LEFT JOIN journals j ON j.id = jl."journalId"
      WHERE j.status = 'POSTED' OR j.status IS NULL
      GROUP BY a.id, a.code, a.name
      HAVING SUM(jl.debit) > 0 OR SUM(jl.credit) > 0
      ORDER BY a.code
    `;

    if (balances.length > 0) {
      console.log('   ✓ Trial Balance:');
      let totalDebit = 0;
      let totalCredit = 0;

      balances.forEach((bal) => {
        const netDebit = Number(bal.total_debit);
        const netCredit = Number(bal.total_credit);
        const balance = netDebit - netCredit;
        totalDebit += netDebit;
        totalCredit += netCredit;

        console.log(`     ${bal.account_code} ${bal.account_name.padEnd(30)} DR ${netDebit.toFixed(2).padStart(12)} CR ${netCredit.toFixed(2).padStart(12)}`);
      });

      console.log(`     ${'='.repeat(70)}`);
      console.log(`     ${'TOTALS'.padEnd(32)} DR ${totalDebit.toFixed(2).padStart(12)} CR ${totalCredit.toFixed(2).padStart(12)}`);

      const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
      console.log(`\n     Balanced: ${isBalanced ? '✓ YES' : '✗ NO'}`);
    } else {
      console.log('   ℹ️ No posted journals yet');
    }

    console.log('\n✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
