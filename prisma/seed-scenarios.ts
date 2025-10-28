/**
 * Seed Script - Load Risk Scenarios from Generated JSON
 *
 * This script reads the scenarios.json file and loads them into the database.
 * Run with: npx tsx prisma/seed-scenarios.ts
 */

import { PrismaClient, RiskProbability, RiskImpact, BusinessType } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface GeneratedScenario {
  title: string;
  description: string;
  category: string;
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number;
  triggers: string[];
  consequences: string[];
  businessTypes: string[];
  jurisdictions: string[];
  mitigationStrategies?: string[];
}

// Map business type strings to enum values
const BUSINESS_TYPE_MAP: Record<string, BusinessType> = {
  'CONSULTORIA': BusinessType.CONSULTING,
  'DESARROLLO_SOFTWARE': BusinessType.TECHNOLOGY,
  'ECOMMERCE': BusinessType.E_COMMERCE,
  'SERVICIOS_PROFESIONALES': BusinessType.CONSULTING,
  'MANUFACTURA': BusinessType.MANUFACTURING,
  'RETAIL': BusinessType.RETAIL,
  'FINTECH': BusinessType.FINANCE,
  'SALUD': BusinessType.HEALTHCARE,
  'EDUCACION': BusinessType.EDUCATION,
};

// Category names to find or create
const CATEGORY_MAP: Record<string, { name: string; description: string; color: string; icon: string }> = {
  'Contractual': {
    name: 'Contractual',
    description: 'Riesgos relacionados con contratos y acuerdos comerciales',
    color: '#3B82F6',
    icon: 'FileText',
  },
  'Laboral': {
    name: 'Laboral',
    description: 'Riesgos relacionados con relaciones laborales y empleados',
    color: '#EF4444',
    icon: 'Users',
  },
  'Regulatorio': {
    name: 'Regulatorio',
    description: 'Riesgos de cumplimiento regulatorio y legal',
    color: '#F59E0B',
    icon: 'Scale',
  },
  'Datos': {
    name: 'Protección de Datos',
    description: 'Riesgos relacionados con privacidad y protección de datos',
    color: '#8B5CF6',
    icon: 'Shield',
  },
  'Propiedad Intelectual': {
    name: 'Propiedad Intelectual',
    description: 'Riesgos relacionados con propiedad intelectual y confidencialidad',
    color: '#10B981',
    icon: 'Lock',
  },
  'Fiscal': {
    name: 'Fiscal',
    description: 'Riesgos fiscales y de facturación',
    color: '#EC4899',
    icon: 'DollarSign',
  },
};

async function seedScenarios() {
  console.log('🚀 Starting risk scenario seeding...\n');

  try {
    // Read the generated scenarios JSON
    const jsonPath = join(__dirname, 'seeds/scenarios.json');
    const jsonContent = readFileSync(jsonPath, 'utf-8');
    const scenarios: GeneratedScenario[] = JSON.parse(jsonContent);

    console.log(`📦 Found ${scenarios.length} scenarios to seed\n`);

    let categoriesCreated = 0;
    let scenariosCreated = 0;

    for (const scenario of scenarios) {
      console.log(`📝 Processing: ${scenario.title}...`);

      // 1. Find or create the category
      const categoryData = CATEGORY_MAP[scenario.category];
      if (!categoryData) {
        console.log(`   ⚠️  Category "${scenario.category}" not found in map, skipping...`);
        continue;
      }

      let category = await prisma.riskCategory.findUnique({
        where: { name: categoryData.name },
      });

      if (!category) {
        category = await prisma.riskCategory.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            color: categoryData.color,
            icon: categoryData.icon,
            isActive: true,
          },
        });
        categoriesCreated++;
        console.log(`   ✅ Created category: ${categoryData.name}`);
      }

      // 2. Map business types
      const businessTypes: BusinessType[] = scenario.businessTypes
        .map((bt) => BUSINESS_TYPE_MAP[bt])
        .filter(Boolean);

      // 3. Create risk scenario
      await prisma.riskScenario.create({
        data: {
          title: scenario.title,
          description: scenario.description,
          categoryId: category.id,
          probability: scenario.probability,
          impact: scenario.impact,
          riskScore: scenario.riskScore,
          triggers: scenario.triggers,
          consequences: scenario.consequences,
          businessTypes: businessTypes,
          jurisdictions: scenario.jurisdictions,
          isActive: true,
        },
      });

      scenariosCreated++;
      console.log(`   ✅ Created scenario successfully (Risk Score: ${scenario.riskScore})\n`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✨ Seeding complete!');
    console.log(`📊 Categories created: ${categoriesCreated}`);
    console.log(`📊 Scenarios created: ${scenariosCreated}`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding scenarios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedScenarios()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
