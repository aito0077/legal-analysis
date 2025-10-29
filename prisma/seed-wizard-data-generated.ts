/**
 * Seed Script - Load Wizard Data from Generated JSON
 *
 * This script reads the wizard-data.json file and loads Activities and RiskAreas into the database.
 * Run with: npx tsx prisma/seed-wizard-data-generated.ts
 */

import { PrismaClient, Profession, BusinessType } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface GeneratedActivity {
  code: string;
  label: string;
  description: string;
  professions?: string[];
  businessTypes?: string[];
  category: string;
  order: number;
}

interface GeneratedRiskArea {
  code: string;
  label: string;
  description: string;
  professions?: string[];
  businessTypes?: string[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  examples: string[];
  order: number;
}

interface WizardData {
  activities: GeneratedActivity[];
  riskAreas: GeneratedRiskArea[];
}

async function seedWizardData() {
  console.log('🚀 Starting wizard data seeding...\n');

  try {
    // Read the generated wizard data JSON
    const jsonPath = join(__dirname, 'seeds/wizard-data.json');
    const jsonContent = readFileSync(jsonPath, 'utf-8');
    const data: WizardData = JSON.parse(jsonContent);

    console.log(`📦 Found ${data.activities.length} activities and ${data.riskAreas.length} risk areas to seed\n`);

    let activitiesCreated = 0;
    let activitiesSkipped = 0;
    let riskAreasCreated = 0;
    let riskAreasSkipped = 0;

    // Seed Activities
    console.log('📋 Seeding Activities...\n');
    for (const activity of data.activities) {
      try {
        // Check if activity already exists
        const existing = await prisma.activity.findUnique({
          where: { code: activity.code },
        });

        if (existing) {
          console.log(`   ⏭️  Skipping "${activity.label}" (already exists)`);
          activitiesSkipped++;
          continue;
        }

        await prisma.activity.create({
          data: {
            code: activity.code,
            label: activity.label,
            description: activity.description,
            professions: (activity.professions || []) as Profession[],
            businessTypes: (activity.businessTypes || []) as BusinessType[],
            category: activity.category,
            order: activity.order,
            isActive: true,
          },
        });

        activitiesCreated++;
        console.log(`   ✅ Created "${activity.label}"`);
      } catch (error) {
        console.error(`   ❌ Error creating activity "${activity.label}":`, error);
      }
    }

    // Seed Risk Areas
    console.log('\n⚠️  Seeding Risk Areas...\n');
    for (const riskArea of data.riskAreas) {
      try {
        // Check if risk area already exists
        const existing = await prisma.riskArea.findUnique({
          where: { code: riskArea.code },
        });

        if (existing) {
          console.log(`   ⏭️  Skipping "${riskArea.label}" (already exists)`);
          riskAreasSkipped++;
          continue;
        }

        await prisma.riskArea.create({
          data: {
            code: riskArea.code,
            label: riskArea.label,
            description: riskArea.description,
            professions: (riskArea.professions || []) as Profession[],
            businessTypes: (riskArea.businessTypes || []) as BusinessType[],
            severity: riskArea.severity,
            examples: riskArea.examples,
            order: riskArea.order,
            isActive: true,
          },
        });

        riskAreasCreated++;
        console.log(`   ✅ Created "${riskArea.label}"`);
      } catch (error) {
        console.error(`   ❌ Error creating risk area "${riskArea.label}":`, error);
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✨ Seeding complete!');
    console.log(`📊 Activities created: ${activitiesCreated} (skipped: ${activitiesSkipped})`);
    console.log(`📊 Risk areas created: ${riskAreasCreated} (skipped: ${riskAreasSkipped})`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding wizard data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedWizardData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
