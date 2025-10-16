import { prisma } from './packages/db/src/index';

async function main() {
  const entities = await prisma.entity.findMany();
  console.log('\nEntity IDs:');
  entities.forEach(e => console.log(`  ${e.id} - ${e.name} (${e.code})`));

  const books = await prisma.ledgerBook.findMany();
  console.log('\nBook IDs:');
  books.forEach(b => console.log(`  ${b.id} - ${b.name} (${b.code})`));

  const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
  console.log('\nAccount IDs:');
  accounts.forEach(a => console.log(`  ${a.id} - ${a.code} ${a.name}`));
}

main().finally(() => prisma.$disconnect());
