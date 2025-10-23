// scripts/validate-import.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateImport() {
  console.log('=== VALIDACIÓN DE DATA IMPORTADA ===');
  
  const sectors = ['HEALTHCARE', 'CONSTRUCTION', 'LEGAL_FIRM'];
  
  for (const sector of sectors) {
    const categories = await prisma.riskCategory.count();
    const scenarios = await prisma.riskScenario.count();
    const protocols = await prisma.protocol.count({
      where: { businessTypes: { has: sector } }
    });
    
    console.log(`
    ${sector}:
    - Categorías: ${categories}
    - Escenarios: ${scenarios} 
    - Protocolos: ${protocols}
    `);
  }
  
  await prisma.$disconnect();
}

validateImport();