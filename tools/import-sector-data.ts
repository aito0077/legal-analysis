// scripts/import-sector-data.ts
import { LegalDataGenerator } from './legal_data_generator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const legalGenerator = new LegalDataGenerator();

async function importSectorData() {
  const sectors = [
    { name: 'salud', businessType: 'HEALTHCARE' },
    { name: 'construcción', businessType: 'CONSTRUCTION' },
    { name: 'consultoría/servicios', businessType: 'LEGAL_FIRM' }
  ];

  for (const sector of sectors) {
    console.log(`Importando data para: ${sector.name}`);
    
    try {
      // 1. Generar data con DeepSeek-R1
      const legalData = await legalGenerator.generateLegalData(sector.name, 'Argentina');
      
      if (!legalData) {
        console.error(`No se pudo generar data para ${sector.name}`);
        continue;
      }

      // 2. Guardar data cruda para revisión
      await this.saveRawData(sector.name, legalData);

      // 3. Procesar e insertar en base de datos
      await this.processAndInsertData(legalData, sector.businessType);

      console.log(`✅ ${sector.name} importado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error importando ${sector.name}:`, error);
    }
  }

  await prisma.$disconnect();
}

async function processAndInsertData(legalData: any, businessType: string) {
  // Procesar riskCategories
  for (const category of legalData.riskCategories) {
    await prisma.riskCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
  }

  // Procesar riskScenarios
  for (const scenario of legalData.riskScenarios) {
    const category = await prisma.riskCategory.findFirst({
      where: { name: scenario.categoryName }
    });

    if (category) {
      await prisma.riskScenario.upsert({
        where: { 
          title_categoryId: {
            title: scenario.title,
            categoryId: category.id
          }
        },
        update: {
          ...scenario,
          categoryId: category.id
        },
        create: {
          ...scenario,
          categoryId: category.id
        }
      });
    }
  }

  // Procesar protocols
  for (const protocol of legalData.protocols) {
    const category = await prisma.riskCategory.findFirst({
      where: { name: protocol.categoryName }
    });

    if (category) {
      await prisma.protocol.upsert({
        where: { title: protocol.title },
        update: {
          ...protocol,
          categoryId: category.id,
          type: 'SYSTEM',
          businessTypes: [businessType]
        },
        create: {
          ...protocol,
          categoryId: category.id,
          type: 'SYSTEM',
          businessTypes: [businessType]
        }
      });
    }
  }

  // Procesar assessmentQuestions
  for (const question of legalData.assessmentQuestions) {
    await prisma.assessmentQuestion.upsert({
      where: { question: question.question },
      update: {
        ...question,
        businessTypes: [businessType]
      },
      create: {
        ...question,
        businessTypes: [businessType]
      }
    });
  }
}

async function saveRawData(sector: string, data: any) {
  const fs = require('fs').promises;
  const timestamp = new Date().toISOString().split('T')[0];
  
  await fs.writeFile(
    `./data/raw/${sector}-${timestamp}.json`,
    JSON.stringify(data, null, 2)
  );
}

// Ejecutar importación
importSectorData();