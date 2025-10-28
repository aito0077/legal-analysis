/**
 * Protocol Generator using DeepSeek AI
 *
 * This script generates realistic protocol data for different:
 * - Jurisdictions (Argentina, etc.)
 * - Business types (CONSULTORIA, DESARROLLO_SOFTWARE, etc.)
 * - Categories (Contractual, Laboral, Regulatorio, etc.)
 *
 * Usage: npx tsx prisma/generators/generate-protocols.ts
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DeepSeekClient } from '../../src/lib/ai/deepseek-client';

type ProtocolPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ProtocolCategory = 'Contractual' | 'Laboral' | 'Regulatorio' | 'Datos' | 'Propiedad Intelectual' | 'Fiscal';

interface ProtocolStep {
  order: number;
  title: string;
  description: string;
  requiredDocuments?: string[];
  estimatedTime?: string;
  responsibleRole?: string;
}

interface GeneratedProtocol {
  title: string;
  description: string;
  content: {
    steps: ProtocolStep[];
    objectives: string[];
    scope: string;
    references?: string[];
  };
  type: 'OFFICIAL' | 'COMMUNITY';
  category: ProtocolCategory;
  priority: ProtocolPriority;
  businessTypes: string[];
  jurisdictions: string[];
  estimatedImplementationDays?: number;
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
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

const PROTOCOL_TEMPLATES = [
  {
    name: 'Contratos Modelo',
    category: 'Contractual' as ProtocolCategory,
    priority: 'HIGH' as ProtocolPriority,
    description: 'Plantillas de contratos adaptadas a diferentes tipos de relaciones comerciales',
  },
  {
    name: 'Política de Privacidad y Protección de Datos',
    category: 'Datos' as ProtocolCategory,
    priority: 'CRITICAL' as ProtocolPriority,
    description: 'Cumplimiento de GDPR, Ley de Protección de Datos Personales (Argentina)',
  },
  {
    name: 'Manual del Empleado',
    category: 'Laboral' as ProtocolCategory,
    priority: 'HIGH' as ProtocolPriority,
    description: 'Reglamento interno, políticas laborales y código de conducta',
  },
  {
    name: 'Términos y Condiciones de Servicio',
    category: 'Contractual' as ProtocolCategory,
    priority: 'HIGH' as ProtocolPriority,
    description: 'Documento legal para regular relaciones con clientes',
  },
  {
    name: 'Facturación y Cumplimiento Fiscal',
    category: 'Fiscal' as ProtocolCategory,
    priority: 'CRITICAL' as ProtocolPriority,
    description: 'Procedimientos de facturación conforme a AFIP',
  },
];

async function generateProtocolContent(
  template: typeof PROTOCOL_TEMPLATES[0],
  businessTypes: string[],
  jurisdictions: string[]
): Promise<GeneratedProtocol> {
  const client = new DeepSeekClient();

  const prompt = `
Genera un protocolo legal completo para ${template.name} con las siguientes especificaciones:

**Contexto:**
- Categoría: ${template.category}
- Prioridad: ${template.priority}
- Jurisdicciones: ${jurisdictions.join(', ')}
- Tipos de negocio aplicables: ${businessTypes.join(', ')}

**Genera un JSON con esta estructura EXACTA:**
{
  "title": "Nombre descriptivo del protocolo",
  "description": "Descripción detallada de 2-3 líneas",
  "content": {
    "steps": [
      {
        "order": 1,
        "title": "Título del paso",
        "description": "Descripción detallada del paso",
        "requiredDocuments": ["Doc 1", "Doc 2"],
        "estimatedTime": "1-2 semanas",
        "responsibleRole": "Legal Manager / CEO / etc"
      }
    ],
    "objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
    "scope": "Descripción del alcance del protocolo",
    "references": ["Ley X", "Decreto Y", "Resolución Z"]
  },
  "estimatedImplementationDays": 30,
  "complexity": "MEDIUM"
}

**Requisitos importantes:**
1. Genera al menos 5-8 pasos concretos y accionables
2. Incluye referencias legales específicas de Argentina
3. Los pasos deben ser prácticos y detallados
4. Incluye 3-5 objetivos claros
5. Especifica documentos requeridos realistas
6. Usa tiempos estimados realistas
7. Asigna roles responsables apropiados
`;

  const systemPrompt = `Eres un experto en derecho corporativo argentino con 15 años de experiencia.
Generas protocolos legales detallados, prácticos y adaptados a la realidad legal argentina.
Respondes SOLO con JSON válido, sin texto adicional.`;

  try {
    const response = await client.generateJSON<Omit<GeneratedProtocol, 'type' | 'category' | 'priority' | 'businessTypes' | 'jurisdictions'>>(
      prompt,
      systemPrompt
    );

    return {
      ...response,
      type: 'OFFICIAL',
      category: template.category,
      priority: template.priority,
      businessTypes,
      jurisdictions,
    };
  } catch (error) {
    console.error(`Error generating protocol for ${template.name}:`, error);
    throw error;
  }
}

async function generateAllProtocols(): Promise<GeneratedProtocol[]> {
  console.log('🚀 Starting protocol generation with DeepSeek AI...\n');

  const protocols: GeneratedProtocol[] = [];

  for (const template of PROTOCOL_TEMPLATES) {
    console.log(`📝 Generating: ${template.name}...`);

    try {
      // Generate general version (all business types, all jurisdictions)
      const generalProtocol = await generateProtocolContent(
        template,
        BUSINESS_TYPES,
        JURISDICTIONS
      );

      protocols.push(generalProtocol);
      console.log(`   ✅ Generated successfully\n`);

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Failed to generate ${template.name}`);
      console.error(error);
    }
  }

  return protocols;
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   LEGAL PROTOCOL GENERATOR WITH DEEPSEEK AI');
    console.log('═══════════════════════════════════════════════════\n');

    const protocols = await generateAllProtocols();

    // Save to JSON file
    const outputPath = join(__dirname, '../seeds/protocols.json');
    writeFileSync(outputPath, JSON.stringify(protocols, null, 2), 'utf-8');

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✨ Generation complete!`);
    console.log(`📊 Total protocols generated: ${protocols.length}`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Summary by category
    const byCategory = protocols.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📋 Breakdown by category:');
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}`);
    });

    console.log('\n✅ Next steps:');
    console.log('   1. Review the generated protocols.json');
    console.log('   2. Run: npm run seed:protocols');
    console.log('   3. Protocols will be loaded into the database\n');

  } catch (error) {
    console.error('\n❌ Error during generation:', error);
    process.exit(1);
  }
}

// Run the generator
main();
