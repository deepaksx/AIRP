import { prisma } from '../packages/db/src/index';

async function getTestIds() {
  console.log('\n🔍 Fetching test IDs from database...\n');

  try {
    const entity = await prisma.entity.findFirst({
      include: { books: true },
    });

    if (!entity) {
      console.error('❌ No entity found. Run "pnpm db:seed" first.');
      process.exit(1);
    }

    const cash = await prisma.account.findFirst({
      where: { entityId: entity.id, code: '1110' },
    });

    const revenue = await prisma.account.findFirst({
      where: { entityId: entity.id, code: '4100' },
    });

    const equity = await prisma.account.findFirst({
      where: { entityId: entity.id, code: '3100' },
    });

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  AIRP Test IDs                                     ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  Entity ID:    ${entity.id.padEnd(36)} ║`);
    console.log(`║  Entity Code:  ${entity.code.padEnd(36)} ║`);
    console.log(`║  Book ID:      ${entity.books[0].id.padEnd(36)} ║`);
    console.log(`║  Book Code:    ${entity.books[0].code.padEnd(36)} ║`);
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  Cash Acct:    ${cash!.id.padEnd(36)} ║`);
    console.log(`║  Revenue Acct: ${revenue!.id.padEnd(36)} ║`);
    console.log(`║  Equity Acct:  ${equity!.id.padEnd(36)} ║`);
    console.log('╚════════════════════════════════════════════════════╝');

    console.log('\n📋 Sample cURL command (Windows):\n');
    console.log(`curl -X POST http://localhost:3001/api/ledger/journals ^`);
    console.log(`  -H "Content-Type: application/json" ^`);
    console.log(`  -H "X-User-Id: test-user" ^`);
    console.log(`  -d "{\\"entityId\\":\\"${entity.id}\\",\\"bookIds\\":[\\"${entity.books[0].id}\\"],\\"journalDate\\":\\"2025-02-01\\",\\"journalType\\":\\"STANDARD\\",\\"description\\":\\"API Test Entry\\",\\"source\\":\\"MANUAL\\",\\"lines\\":[{\\"lineNumber\\":1,\\"accountId\\":\\"${cash!.id}\\",\\"debit\\":3000,\\"credit\\":0,\\"currencyCode\\":\\"USD\\"},{\\"lineNumber\\":2,\\"accountId\\":\\"${revenue!.id}\\",\\"debit\\":0,\\"credit\\":3000,\\"currencyCode\\":\\"USD\\"}]}"`);

    console.log('\n📋 Sample PowerShell command:\n');
    console.log(`$body = @{`);
    console.log(`  entityId = "${entity.id}"`);
    console.log(`  bookIds = @("${entity.books[0].id}")`);
    console.log(`  journalDate = "2025-02-01"`);
    console.log(`  journalType = "STANDARD"`);
    console.log(`  description = "PowerShell Test Entry"`);
    console.log(`  source = "MANUAL"`);
    console.log(`  lines = @(`);
    console.log(`    @{ lineNumber=1; accountId="${cash!.id}"; debit=3000; credit=0; currencyCode="USD" },`);
    console.log(`    @{ lineNumber=2; accountId="${revenue!.id}"; debit=0; credit=3000; currencyCode="USD" }`);
    console.log(`  )`);
    console.log(`} | ConvertTo-Json -Depth 10\n`);
    console.log(`Invoke-RestMethod -Uri "http://localhost:3001/api/ledger/journals" \``);
    console.log(`  -Method Post \``);
    console.log(`  -Headers @{"Content-Type"="application/json"; "X-User-Id"="test-user"} \``);
    console.log(`  -Body $body | ConvertTo-Json -Depth 10`);

    console.log('\n📋 Trial Balance URL:\n');
    console.log(`http://localhost:3001/api/reports/trial-balance?entityId=${entity.id}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getTestIds();
