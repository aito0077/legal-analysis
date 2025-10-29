/**
 * Wizard Data Generator using DeepSeek AI
 *
 * This script generates Activities and RiskAreas for ALL professions and business types.
 * This data is used in Step 2 of the onboarding wizard.
 *
 * Usage: npx tsx prisma/generators/generate-wizard-data.ts
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DeepSeekClient } from '../../src/lib/ai/deepseek-client';

// All professions from Prisma schema
const PROFESSIONS = [
  'LAWYER',
  'DOCTOR',
  'DENTIST',
  'ARCHITECT',
  'ENGINEER',
  'CIVIL_ENGINEER',
  'ACCOUNTANT',
  'CONSULTANT',
  'NOTARY',
  'PSYCHOLOGIST',
  'PHARMACIST',
  'VETERINARIAN',
] as const;

// All business types from Prisma schema
const BUSINESS_TYPES = [
  'LEGAL_FIRM',
  'HEALTHCARE',
  'CONSTRUCTION',
  'FINANCE',
  'E_COMMERCE',
  'TECHNOLOGY',
  'REAL_ESTATE',
  'EDUCATION',
  'MANUFACTURING',
  'RETAIL',
  'HOSPITALITY',
  'TRANSPORTATION',
  'CONSULTING',
  'MEDIA',
  'AGRICULTURE',
] as const;

// Mapping de nombres en español
const PROFESSION_LABELS: Record<string, string> = {
  LAWYER: 'Abogado',
  DOCTOR: 'Médico',
  DENTIST: 'Odontólogo',
  ARCHITECT: 'Arquitecto',
  ENGINEER: 'Ingeniero',
  CIVIL_ENGINEER: 'Ingeniero Civil',
  ACCOUNTANT: 'Contador',
  CONSULTANT: 'Consultor',
  NOTARY: 'Escribano/Notario',
  PSYCHOLOGIST: 'Psicólogo',
  PHARMACIST: 'Farmacéutico',
  VETERINARIAN: 'Veterinario',
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  LEGAL_FIRM: 'Estudio Jurídico',
  HEALTHCARE: 'Salud',
  CONSTRUCTION: 'Construcción',
  FINANCE: 'Finanzas',
  E_COMMERCE: 'Comercio Electrónico',
  TECHNOLOGY: 'Tecnología',
  REAL_ESTATE: 'Bienes Raíces',
  EDUCATION: 'Educación',
  MANUFACTURING: 'Manufactura',
  RETAIL: 'Comercio Minorista',
  HOSPITALITY: 'Hotelería y Turismo',
  TRANSPORTATION: 'Transporte',
  CONSULTING: 'Consultoría',
  MEDIA: 'Medios de Comunicación',
  AGRICULTURE: 'Agricultura',
};

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

interface GeneratedData {
  activities: GeneratedActivity[];
  riskAreas: GeneratedRiskArea[];
}

async function generateForProfession(profession: string): Promise<GeneratedData> {
  const client = new DeepSeekClient();
  const professionLabel = PROFESSION_LABELS[profession];

  const prompt = `
Eres un experto en gestión de riesgos profesionales en Argentina. Genera datos para el wizard de onboarding de un ${professionLabel}.

Genera un JSON con esta estructura EXACTA:
{
  "activities": [
    {
      "code": "codigo_snake_case",
      "label": "Nombre de la actividad",
      "description": "Descripción breve",
      "category": "Operaciones|Legal|Administrativo|Técnico",
      "order": 1
    }
  ],
  "riskAreas": [
    {
      "code": "codigo_snake_case",
      "label": "Nombre del área de riesgo",
      "description": "Descripción del riesgo específico",
      "severity": "HIGH|MEDIUM|LOW",
      "examples": ["Ejemplo 1", "Ejemplo 2", "Ejemplo 3"],
      "order": 1
    }
  ]
}

**REQUISITOS IMPORTANTES:**

1. **Activities** (5-8 actividades típicas de un ${professionLabel}):
   - Actividades operacionales principales
   - Actividades administrativas relevantes
   - Actividades que impliquen riesgo legal
   - Usar códigos descriptivos en snake_case (ej: "atencion_pacientes", "redaccion_contratos")

2. **RiskAreas** (4-6 áreas de riesgo principales):
   - Áreas de mayor exposición al riesgo para un ${professionLabel} en Argentina
   - Incluir riesgos legales, operacionales y regulatorios
   - Severity: HIGH para riesgos graves, MEDIUM para moderados, LOW para menores
   - Ejemplos concretos y realistas (3-4 por área)
   - Considerar legislación argentina (mala praxis, protección de datos, normativas específicas)

3. Usar terminología legal y profesional argentina
4. Ordenar por relevancia (order: 1, 2, 3...)
`;

  const systemPrompt = `Eres un experto en derecho profesional argentino especializado en gestión de riesgos para profesionales independientes.
Generas datos precisos y prácticos basados en la realidad legal y profesional de Argentina.
Respondes SOLO con JSON válido, sin texto adicional.`;

  try {
    const response = await client.generateJSON<GeneratedData>(prompt, systemPrompt);

    // Add profession to each item
    return {
      activities: response.activities.map((a, idx) => ({
        ...a,
        professions: [profession],
        order: idx + 1,
      })),
      riskAreas: response.riskAreas.map((r, idx) => ({
        ...r,
        professions: [profession],
        order: idx + 1,
      })),
    };
  } catch (error) {
    console.error(`Error generating for profession ${profession}:`, error);
    throw error;
  }
}

async function generateForBusinessType(businessType: string): Promise<GeneratedData> {
  const client = new DeepSeekClient();
  const businessLabel = BUSINESS_TYPE_LABELS[businessType];

  const prompt = `
Eres un experto en gestión de riesgos empresariales en Argentina. Genera datos para el wizard de onboarding de una empresa de ${businessLabel}.

Genera un JSON con esta estructura EXACTA:
{
  "activities": [
    {
      "code": "codigo_snake_case",
      "label": "Nombre de la actividad",
      "description": "Descripción breve",
      "category": "Operaciones|Legal|Administrativo|Comercial|Técnico",
      "order": 1
    }
  ],
  "riskAreas": [
    {
      "code": "codigo_snake_case",
      "label": "Nombre del área de riesgo",
      "description": "Descripción del riesgo específico para este tipo de empresa",
      "severity": "HIGH|MEDIUM|LOW",
      "examples": ["Ejemplo 1", "Ejemplo 2", "Ejemplo 3"],
      "order": 1
    }
  ]
}

**REQUISITOS IMPORTANTES:**

1. **Activities** (6-10 actividades típicas de ${businessLabel}):
   - Actividades operacionales principales del negocio
   - Actividades administrativas y de gestión
   - Actividades comerciales y de ventas
   - Actividades que impliquen cumplimiento legal
   - Usar códigos descriptivos en snake_case (ej: "gestion_contratos", "ventas_online")

2. **RiskAreas** (5-7 áreas de riesgo principales):
   - Áreas de mayor exposición al riesgo para ${businessLabel} en Argentina
   - Incluir riesgos legales, operacionales, regulatorios y comerciales
   - Severity: HIGH para riesgos graves/críticos, MEDIUM para moderados, LOW para menores
   - Ejemplos concretos (3-4 por área) específicos de este tipo de negocio
   - Considerar legislación argentina (Ley de Contrato de Trabajo, defensa del consumidor, AFIP, protección de datos)

3. Usar terminología empresarial y legal argentina
4. Ordenar por relevancia/frecuencia (order: 1, 2, 3...)
`;

  const systemPrompt = `Eres un experto en derecho empresarial argentino especializado en gestión de riesgos y compliance para empresas.
Generas datos precisos y prácticos basados en la realidad legal y comercial de Argentina.
Respondes SOLO con JSON válido, sin texto adicional.`;

  try {
    const response = await client.generateJSON<GeneratedData>(prompt, systemPrompt);

    // Add businessType to each item
    return {
      activities: response.activities.map((a, idx) => ({
        ...a,
        businessTypes: [businessType],
        order: idx + 1,
      })),
      riskAreas: response.riskAreas.map((r, idx) => ({
        ...r,
        businessTypes: [businessType],
        order: idx + 1,
      })),
    };
  } catch (error) {
    console.error(`Error generating for business type ${businessType}:`, error);
    throw error;
  }
}

async function generateAllData() {
  console.log('🚀 Starting wizard data generation with DeepSeek AI...\n');
  console.log(`📋 Generating for ${PROFESSIONS.length} professions and ${BUSINESS_TYPES.length} business types\n`);

  const allActivities: GeneratedActivity[] = [];
  const allRiskAreas: GeneratedRiskArea[] = [];

  // Generate for professions
  console.log('👨‍⚕️ Generating professional data...\n');
  for (const profession of PROFESSIONS) {
    console.log(`   📝 ${PROFESSION_LABELS[profession]} (${profession})...`);
    try {
      const data = await generateForProfession(profession);
      allActivities.push(...data.activities);
      allRiskAreas.push(...data.riskAreas);
      console.log(`      ✅ ${data.activities.length} activities, ${data.riskAreas.length} risk areas\n`);

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.log(`      ❌ Failed\n`);
    }
  }

  // Generate for business types
  console.log('\n🏢 Generating business data...\n');
  for (const businessType of BUSINESS_TYPES) {
    console.log(`   📝 ${BUSINESS_TYPE_LABELS[businessType]} (${businessType})...`);
    try {
      const data = await generateForBusinessType(businessType);
      allActivities.push(...data.activities);
      allRiskAreas.push(...data.riskAreas);
      console.log(`      ✅ ${data.activities.length} activities, ${data.riskAreas.length} risk areas\n`);

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.log(`      ❌ Failed\n`);
    }
  }

  return { activities: allActivities, riskAreas: allRiskAreas };
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   WIZARD DATA GENERATOR WITH DEEPSEEK AI');
    console.log('═══════════════════════════════════════════════════\n');

    const { activities, riskAreas } = await generateAllData();

    // Save to JSON file
    const outputPath = join(__dirname, '../seeds/wizard-data.json');
    writeFileSync(outputPath, JSON.stringify({ activities, riskAreas }, null, 2), 'utf-8');

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✨ Generation complete!`);
    console.log(`📊 Total activities generated: ${activities.length}`);
    console.log(`📊 Total risk areas generated: ${riskAreas.length}`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ Next steps:');
    console.log('   1. Review the generated wizard-data.json');
    console.log('   2. Run: npm run seed:wizard-data');
    console.log('   3. Data will be loaded into the database\n');

  } catch (error) {
    console.error('\n❌ Error during generation:', error);
    process.exit(1);
  }
}

// Run the generator
main();
