#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { LegalDataGenerator } from './legal_data_generator';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();
const generator = new LegalDataGenerator();

async function seedLegalData() {
  console.log('🚀 Iniciando generación de datos legales con DeepSeek AI...\n');

  const sectors = [
    { name: 'salud', businessType: 'HEALTHCARE' },
    { name: 'construcción', businessType: 'CONSTRUCTION' },
    { name: 'consultoría/servicios', businessType: 'CONSULTING' },
  ];

  const jurisdiction = 'Argentina';

  for (const sector of sectors) {
    console.log(`\n📋 Generando datos para sector: ${sector.name.toUpperCase()}`);
    console.log('⏳ Consultando a DeepSeek AI...');

    try {
      const data = await generator.generateLegalData(sector.name, jurisdiction);

      if (!data) {
        console.error(`❌ No se pudo generar datos para ${sector.name}`);
        continue;
      }

      console.log(`✅ Datos recibidos de DeepSeek AI`);
      console.log(`   - Categorías: ${data.riskCategories?.length || 0}`);
      console.log(`   - Escenarios: ${data.riskScenarios?.length || 0}`);
      console.log(`   - Protocolos: ${data.protocols?.length || 0}`);
      console.log(`   - Preguntas: ${data.assessmentQuestions?.length || 0}`);

      // Guardar en base de datos
      console.log('💾 Guardando en base de datos...');

      // 1. Crear categorías de riesgo (usar upsert para evitar duplicados)
      const categoryMap = new Map();
      if (data.riskCategories) {
        for (const cat of data.riskCategories) {
          const category = await prisma.riskCategory.upsert({
            where: { name: cat.name },
            update: {
              description: cat.description,
              icon: cat.icon || 'AlertTriangle',
              isActive: true,
            },
            create: {
              name: cat.name,
              description: cat.description,
              icon: cat.icon || 'AlertTriangle',
              isActive: true,
            },
          });
          categoryMap.set(cat.name, category.id);
          console.log(`   ✓ Categoría: ${cat.name}`);
        }
      }

      // 2. Crear escenarios de riesgo
      if (data.riskScenarios) {
        for (const scenario of data.riskScenarios) {
          const categoryId = categoryMap.get(scenario.categoryName);
          if (!categoryId) {
            console.warn(`   ⚠ Categoría no encontrada: ${scenario.categoryName}`);
            continue;
          }

          const probability = scenario.probability as any;
          const impact = scenario.impact as any;
          const riskScore = getProbabilityValue(probability) * getImpactValue(impact);

          await prisma.riskScenario.create({
            data: {
              title: scenario.title,
              description: scenario.description,
              categoryId,
              probability,
              impact,
              riskScore,
              triggers: scenario.triggers || [],
              consequences: scenario.consequences || [],
              businessTypes: [sector.businessType as any],
              jurisdictions: [jurisdiction],
              isActive: true,
            },
          });
          console.log(`   ✓ Escenario: ${scenario.title}`);
        }
      }

      // 3. Crear protocolos
      if (data.protocols) {
        for (const protocol of data.protocols) {
          const categoryId = categoryMap.get(protocol.categoryName);

          await prisma.protocol.create({
            data: {
              title: protocol.title,
              description: protocol.description,
              content: protocol.content || { steps: [] },
              type: 'SYSTEM',
              categoryId,
              businessTypes: [sector.businessType as any],
              jurisdictions: [jurisdiction],
              isVerified: true,
              isPublic: true,
            },
          });
          console.log(`   ✓ Protocolo: ${protocol.title}`);
        }
      }

      // 4. Crear preguntas de evaluación
      if (data.assessmentQuestions) {
        for (const question of data.assessmentQuestions) {
          await prisma.assessmentQuestion.create({
            data: {
              category: question.category,
              question: question.question,
              type: question.type as any,
              options: question.options ? JSON.parse(JSON.stringify(question.options)) : null,
              weight: question.weight || 1,
              businessTypes: [sector.businessType as any],
              isActive: true,
            },
          });
          console.log(`   ✓ Pregunta: ${question.question.substring(0, 50)}...`);
        }
      }

      console.log(`\n✅ Sector ${sector.name} completado exitosamente!`);
    } catch (error) {
      console.error(`\n❌ Error procesando sector ${sector.name}:`, error);
      if (error instanceof Error) {
        console.error('   Mensaje:', error.message);
      }
    }
  }

  console.log('\n🎉 Proceso de generación completado!');
}

function getProbabilityValue(prob: string): number {
  const values = {
    VERY_LOW: 1,
    LOW: 2,
    MEDIUM: 3,
    HIGH: 4,
    VERY_HIGH: 5,
  };
  return values[prob as keyof typeof values] || 3;
}

function getImpactValue(impact: string): number {
  const values = {
    NEGLIGIBLE: 1,
    LOW: 2,
    MODERATE: 3,
    HIGH: 4,
    CATASTROPHIC: 5,
  };
  return values[impact as keyof typeof values] || 3;
}

// Ejecutar
seedLegalData()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
