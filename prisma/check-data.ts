/**
 * Quick script to check seeded data
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking seeded data...\n');

  const categories = await prisma.riskCategory.findMany();
  console.log(`📋 Risk Categories: ${categories.length}`);
  categories.forEach(cat => {
    console.log(`   - ${cat.name} (${cat.color})`);
  });

  const protocols = await prisma.protocol.count();
  console.log(`\n📄 Protocols: ${protocols}`);

  const scenarios = await prisma.riskScenario.count();
  console.log(`⚠️  Risk Scenarios: ${scenarios}`);

  const scenariosByCategory = await prisma.riskScenario.groupBy({
    by: ['categoryId'],
    _count: true,
  });

  console.log(`\n📊 Scenarios by category:`);
  for (const group of scenariosByCategory) {
    const category = await prisma.riskCategory.findUnique({
      where: { id: group.categoryId },
    });
    console.log(`   - ${category?.name}: ${group._count}`);
  }

  await prisma.$disconnect();
}

checkData();
