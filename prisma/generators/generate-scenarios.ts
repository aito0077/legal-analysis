/**
 * Risk Scenario Generator using DeepSeek AI
 *
 * This script generates realistic risk scenario data for different:
 * - Jurisdictions (Argentina, etc.)
 * - Business types (CONSULTORIA, DESARROLLO_SOFTWARE, etc.)
 * - Categories (Contractual, Laboral, Regulatorio, etc.)
 *
 * Usage: npx tsx prisma/generators/generate-scenarios.ts
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DeepSeekClient } from '../../src/lib/ai/deepseek-client';

type RiskProbability = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
type RiskImpact = 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CATASTROPHIC';
type ScenarioCategory = 'Contractual' | 'Laboral' | 'Regulatorio' | 'Datos' | 'Propiedad Intelectual' | 'Fiscal';

interface GeneratedScenario {
  title: string;
  description: string;
  category: ScenarioCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number;
  triggers: string[];
  consequences: string[];
  businessTypes: string[];
  jurisdictions: string[];
  mitigationStrategies?: string[];
}

const JURISDICTIONS = ['Argentina', 'Buenos Aires', 'CABA'];
const BUSINESS_TYPES = [
  'CONSULTORIA',
  'DESARROLLO_SOFTWARE',
  'ECOMMERCE',
  'SERVICIOS_PROFESIONALES',
  'MANUFACTURA',
  'RETAIL',
  'FINTECH',
  'SALUD',
  'EDUCACION',
];

// Mapping de probabilidad a número (1-5)
const PROBABILITY_MAP: Record<RiskProbability, number> = {
  'VERY_LOW': 1,
  'LOW': 2,
  'MEDIUM': 3,
  'HIGH': 4,
  'VERY_HIGH': 5,
};

// Mapping de impacto a número (1-5)
const IMPACT_MAP: Record<RiskImpact, number> = {
  'NEGLIGIBLE': 1,
  'LOW': 2,
  'MODERATE': 3,
  'HIGH': 4,
  'CATASTROPHIC': 5,
};

const SCENARIO_TEMPLATES = [
  // CONTRACTUAL
  {
    name: 'Incumplimiento de Contrato',
    category: 'Contractual' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Riesgo de incumplimiento contractual por parte de clientes o proveedores',
  },
  {
    name: 'Cláusulas Abusivas',
    category: 'Contractual' as ScenarioCategory,
    baseProbability: 'LOW' as RiskProbability,
    baseImpact: 'MODERATE' as RiskImpact,
    description: 'Contratos con cláusulas que podrían ser declaradas nulas por abusivas',
  },

  // LABORAL
  {
    name: 'Demanda Laboral',
    category: 'Laboral' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Demandas por despido, accidentes laborales o incumplimiento de derechos',
  },
  {
    name: 'Trabajo No Registrado',
    category: 'Laboral' as ScenarioCategory,
    baseProbability: 'LOW' as RiskProbability,
    baseImpact: 'CATASTROPHIC' as RiskImpact,
    description: 'Sanciones por empleo no registrado o subregistrado',
  },
  {
    name: 'Accidente Laboral',
    category: 'Laboral' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Accidentes de trabajo con lesiones o daños a empleados',
  },

  // REGULATORIO
  {
    name: 'Incumplimiento AFIP',
    category: 'Fiscal' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Multas y sanciones por incumplimiento de obligaciones fiscales',
  },
  {
    name: 'Inspección AFIP',
    category: 'Fiscal' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'MODERATE' as RiskImpact,
    description: 'Fiscalización y auditoría por parte de AFIP',
  },

  // PROTECCIÓN DE DATOS
  {
    name: 'Violación de Datos Personales',
    category: 'Datos' as ScenarioCategory,
    baseProbability: 'LOW' as RiskProbability,
    baseImpact: 'CATASTROPHIC' as RiskImpact,
    description: 'Filtración o acceso no autorizado a datos personales de clientes',
  },
  {
    name: 'Incumplimiento Ley de Datos',
    category: 'Datos' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Incumplimiento de la Ley de Protección de Datos Personales (Ley 25.326)',
  },

  // PROPIEDAD INTELECTUAL
  {
    name: 'Infracción de Propiedad Intelectual',
    category: 'Propiedad Intelectual' as ScenarioCategory,
    baseProbability: 'LOW' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Uso no autorizado de marcas, patentes o derechos de autor de terceros',
  },
  {
    name: 'Robo de Información Confidencial',
    category: 'Propiedad Intelectual' as ScenarioCategory,
    baseProbability: 'MEDIUM' as RiskProbability,
    baseImpact: 'HIGH' as RiskImpact,
    description: 'Fuga de información confidencial o secretos comerciales',
  },
];

async function generateScenarioContent(
  template: typeof SCENARIO_TEMPLATES[0],
  businessTypes: string[],
  jurisdictions: string[]
): Promise<GeneratedScenario> {
  const client = new DeepSeekClient();

  const prompt = `
Genera un escenario de riesgo legal completo para "${template.name}" con las siguientes especificaciones:

**Contexto:**
- Categoría: ${template.category}
- Descripción base: ${template.description}
- Probabilidad base: ${template.baseProbability}
- Impacto base: ${template.baseImpact}
- Jurisdicciones: ${jurisdictions.join(', ')}
- Tipos de negocio aplicables: ${businessTypes.join(', ')}

**Genera un JSON con esta estructura EXACTA:**
{
  "title": "Título descriptivo del escenario de riesgo",
  "description": "Descripción detallada de 2-3 líneas sobre el riesgo y sus implicancias",
  "triggers": [
    "Evento disparador 1",
    "Evento disparador 2",
    "Evento disparador 3",
    "Evento disparador 4"
  ],
  "consequences": [
    "Consecuencia 1",
    "Consecuencia 2",
    "Consecuencia 3",
    "Consecuencia 4"
  ],
  "mitigationStrategies": [
    "Estrategia de mitigación 1",
    "Estrategia de mitigación 2",
    "Estrategia de mitigación 3"
  ]
}

**Requisitos importantes:**
1. El título debe ser claro y específico
2. La descripción debe incluir el contexto legal argentino
3. Los triggers deben ser eventos concretos y detectables
4. Las consecuencias deben incluir impactos legales, financieros y reputacionales
5. Las estrategias de mitigación deben ser prácticas y accionables
6. Incluye referencias a leyes argentinas relevantes en la descripción
7. Considera las particularidades de los tipos de negocio mencionados
`;

  const systemPrompt = `Eres un experto en gestión de riesgos legales y compliance en Argentina con 15 años de experiencia.
Generas escenarios de riesgo detallados, realistas y adaptados a la realidad legal y empresarial argentina.
Respondes SOLO con JSON válido, sin texto adicional.`;

  try {
    const response = await client.generateJSON<Pick<GeneratedScenario, 'title' | 'description' | 'triggers' | 'consequences' | 'mitigationStrategies'>>(
      prompt,
      systemPrompt
    );

    // Calculate risk score
    const riskScore = PROBABILITY_MAP[template.baseProbability] * IMPACT_MAP[template.baseImpact];

    return {
      ...response,
      category: template.category,
      probability: template.baseProbability,
      impact: template.baseImpact,
      riskScore,
      businessTypes,
      jurisdictions,
    };
  } catch (error) {
    console.error(`Error generating scenario for ${template.name}:`, error);
    throw error;
  }
}

async function generateAllScenarios(): Promise<GeneratedScenario[]> {
  console.log('🚀 Starting risk scenario generation with DeepSeek AI...\n');

  const scenarios: GeneratedScenario[] = [];

  for (const template of SCENARIO_TEMPLATES) {
    console.log(`📝 Generating: ${template.name}...`);

    try {
      // Generate general version (all business types, all jurisdictions)
      const generalScenario = await generateScenarioContent(
        template,
        BUSINESS_TYPES,
        JURISDICTIONS
      );

      scenarios.push(generalScenario);
      console.log(`   ✅ Generated successfully (Risk Score: ${generalScenario.riskScore})\n`);

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Failed to generate ${template.name}`);
      console.error(error);
    }
  }

  return scenarios;
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   RISK SCENARIO GENERATOR WITH DEEPSEEK AI');
    console.log('═══════════════════════════════════════════════════\n');

    const scenarios = await generateAllScenarios();

    // Save to JSON file
    const outputPath = join(__dirname, '../seeds/scenarios.json');
    writeFileSync(outputPath, JSON.stringify(scenarios, null, 2), 'utf-8');

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✨ Generation complete!`);
    console.log(`📊 Total scenarios generated: ${scenarios.length}`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Summary by category
    const byCategory = scenarios.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📋 Breakdown by category:');
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}`);
    });

    // Summary by risk level
    const byRiskLevel = scenarios.reduce((acc, s) => {
      const level = s.riskScore >= 15 ? 'CRITICAL' : s.riskScore >= 10 ? 'HIGH' : s.riskScore >= 5 ? 'MEDIUM' : 'LOW';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Breakdown by risk level:');
    Object.entries(byRiskLevel).forEach(([level, count]) => {
      console.log(`   - ${level}: ${count}`);
    });

    console.log('\n✅ Next steps:');
    console.log('   1. Review the generated scenarios.json');
    console.log('   2. Run: npm run seed:scenarios');
    console.log('   3. Scenarios will be loaded into the database\n');

  } catch (error) {
    console.error('\n❌ Error during generation:', error);
    process.exit(1);
  }
}

// Run the generator
main();
