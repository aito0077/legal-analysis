/**
 * Check wizard data in database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWizardData() {
  console.log('🔍 Checking wizard data in database...\n');

  const activities = await prisma.activity.findMany();
  console.log(`📋 Activities: ${activities.length}`);
  if (activities.length > 0) {
    console.log('   Sample activities:');
    activities.slice(0, 5).forEach(a => {
      console.log(`   - ${a.label} (${a.professions.join(', ')} | ${a.businessTypes.join(', ')})`);
    });
  } else {
    console.log('   ❌ No activities found in database');
  }

  const riskAreas = await prisma.riskArea.findMany();
  console.log(`\n⚠️  Risk Areas: ${riskAreas.length}`);
  if (riskAreas.length > 0) {
    console.log('   Sample risk areas:');
    riskAreas.slice(0, 5).forEach(r => {
      console.log(`   - ${r.label} (${r.professions.join(', ')} | ${r.businessTypes.join(', ')})`);
    });
  } else {
    console.log('   ❌ No risk areas found in database');
  }

  await prisma.$disconnect();
}

checkWizardData();
