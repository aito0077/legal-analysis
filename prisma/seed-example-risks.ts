/**
 * Seed Script: Example Risks and Controls
 * Populates the database with example RiskRegisters, RiskEvents, and RiskControls
 * for demonstration and testing purposes.
 *
 * Usage (inside Docker):
 * docker-compose exec -T legal-analysis npx tsx prisma/seed-example-risks.ts
 */

import { PrismaClient, RiskLikelihood, RiskImpactLevel, RiskPriority } from '@prisma/client';

const prisma = new PrismaClient();

// Example user ID - Replace with actual user ID from your database
const EXAMPLE_USER_ID = 'user_example_123';
const EXAMPLE_PROFILE_ID = 'prof_example_123';

type ExampleRisk = {
  title: string;
  description: string;
  category: string;
  likelihood: RiskLikelihood;
  impact: RiskImpactLevel;
  triggers: string[];
  consequences: string[];
  affectedAssets: string[];
  controls: Array<{
    title: string;
    description: string;
    type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
    category: 'ADMINISTRATIVE' | 'TECHNICAL' | 'PHYSICAL' | 'LEGAL';
    strength: 'WEAK' | 'MODERATE' | 'STRONG';
  }>;
};

const exampleRisks: ExampleRisk[] = [
  {
    title: 'Demanda por responsabilidad profesional (mala praxis)',
    description:
      'Riesgo de demandas civiles o penales por errores u omisiones en la práctica profesional que causen daño a clientes o pacientes',
    category: 'Responsabilidad Profesional',
    likelihood: 'POSSIBLE',
    impact: 'MAJOR',
    triggers: [
      'Error en diagnóstico médico',
      'Incumplimiento de plazos legales',
      'Omisión de información crítica',
      'Negligencia en procedimientos',
    ],
    consequences: [
      'Demanda civil por daños y perjuicios',
      'Proceso penal por negligencia',
      'Pérdida de matrícula profesional',
      'Daño reputacional grave',
      'Costos legales elevados',
    ],
    affectedAssets: ['Reputación profesional', 'Patrimonio personal', 'Continuidad del negocio'],
    controls: [
      {
        title: 'Seguro de responsabilidad profesional',
        description: 'Póliza de seguro que cubra demandas por mala praxis con cobertura mínima de USD 500,000',
        type: 'CORRECTIVE',
        category: 'LEGAL',
        strength: 'STRONG',
      },
      {
        title: 'Protocolo de documentación de casos',
        description:
          'Procedimiento estandarizado para documentar todas las interacciones, decisiones y tratamientos',
        type: 'PREVENTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
      {
        title: 'Revisión por pares',
        description: 'Sistema de revisión de casos complejos por colegas antes de procedimientos críticos',
        type: 'PREVENTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
    ],
  },
  {
    title: 'Filtración de datos personales o sensibles',
    description:
      'Acceso no autorizado, pérdida o divulgación de información confidencial de clientes, pacientes o empleados',
    category: 'Protección de Datos',
    likelihood: 'LIKELY',
    impact: 'MAJOR',
    triggers: [
      'Ataque cibernético (ransomware, phishing)',
      'Pérdida o robo de dispositivos',
      'Acceso no autorizado de empleados',
      'Configuración incorrecta de sistemas',
    ],
    consequences: [
      'Multas de LGPD/GDPR hasta USD 20 millones',
      'Demandas por violación de privacidad',
      'Pérdida de confianza de clientes',
      'Obligación de notificar a autoridades',
      'Daño reputacional',
    ],
    affectedAssets: ['Datos de clientes/pacientes', 'Sistemas informáticos', 'Reputación'],
    controls: [
      {
        title: 'Política de privacidad y seguridad de datos',
        description: 'Documento formal conforme a LGPD/GDPR con procedimientos de manejo de datos',
        type: 'DIRECTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
      {
        title: 'Encriptación de datos sensibles',
        description: 'Encriptación AES-256 de bases de datos y archivos con información confidencial',
        type: 'PREVENTIVE',
        category: 'TECHNICAL',
        strength: 'STRONG',
      },
      {
        title: 'Control de acceso basado en roles',
        description: 'Sistema de permisos que limita el acceso a datos según necesidad del usuario',
        type: 'PREVENTIVE',
        category: 'TECHNICAL',
        strength: 'MODERATE',
      },
      {
        title: 'Backups encriptados diarios',
        description: 'Respaldo automático cifrado de datos con retención de 30 días',
        type: 'CORRECTIVE',
        category: 'TECHNICAL',
        strength: 'MODERATE',
      },
    ],
  },
  {
    title: 'Incumplimiento contractual con clientes',
    description:
      'Falta de cumplimiento de obligaciones acordadas en contratos de servicios, generando disputas legales',
    category: 'Contractual',
    likelihood: 'POSSIBLE',
    impact: 'MODERATE',
    triggers: [
      'Sobrecarga de trabajo',
      'Falta de claridad en alcance del servicio',
      'Cambios en legislación aplicable',
      'Expectativas no alineadas con cliente',
    ],
    consequences: [
      'Demanda por incumplimiento contractual',
      'Obligación de devolver honorarios',
      'Daños y perjuicios',
      'Pérdida de clientes',
      'Reseñas negativas',
    ],
    affectedAssets: ['Ingresos', 'Reputación', 'Relaciones con clientes'],
    controls: [
      {
        title: 'Contratos modelo personalizados',
        description: 'Plantillas de contratos con cláusulas claras sobre alcance, plazos y limitaciones',
        type: 'PREVENTIVE',
        category: 'LEGAL',
        strength: 'STRONG',
      },
      {
        title: 'Sistema de gestión de proyectos',
        description: 'Software para tracking de deadlines, entregables y comunicación con clientes',
        type: 'PREVENTIVE',
        category: 'TECHNICAL',
        strength: 'MODERATE',
      },
      {
        title: 'Proceso de onboarding de clientes',
        description: 'Procedimiento estandarizado para alinear expectativas desde el inicio',
        type: 'PREVENTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
    ],
  },
  {
    title: 'Reclamos laborales de empleados',
    description:
      'Demandas o reclamos de trabajadores por despido injustificado, acoso, discriminación o condiciones de trabajo',
    category: 'Laboral',
    likelihood: 'UNLIKELY',
    impact: 'MAJOR',
    triggers: [
      'Despido sin causa justificada',
      'Falta de contrato formal',
      'Incumplimiento de legislación laboral',
      'Ambiente de trabajo tóxico',
    ],
    consequences: [
      'Juicio laboral con indemnizaciones',
      'Multas por inspecciones laborales',
      'Daño a cultura organizacional',
      'Rotación de personal',
      'Publicidad negativa',
    ],
    affectedAssets: ['Patrimonio', 'Clima laboral', 'Productividad'],
    controls: [
      {
        title: 'Manual del empleado',
        description: 'Documento con políticas laborales, código de conducta y procedimientos disciplinarios',
        type: 'DIRECTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
      {
        title: 'Contratos de trabajo formales',
        description: 'Contratos que cumplan con legislación local y especifiquen claramente condiciones',
        type: 'PREVENTIVE',
        category: 'LEGAL',
        strength: 'STRONG',
      },
      {
        title: 'Asesoría legal laboral externa',
        description: 'Consultoría mensual con abogado laboralista para compliance',
        type: 'PREVENTIVE',
        category: 'LEGAL',
        strength: 'MODERATE',
      },
    ],
  },
  {
    title: 'Incumplimiento normativo o regulatorio',
    description:
      'Violación de regulaciones sectoriales, fiscales o administrativas por desconocimiento o falta de actualización',
    category: 'Regulatorio',
    likelihood: 'POSSIBLE',
    impact: 'MODERATE',
    triggers: [
      'Cambios en legislación sin conocimiento',
      'Falta de capacitación del equipo',
      'Ausencia de asesoría especializada',
      'Complejidad normativa del sector',
    ],
    consequences: [
      'Multas y sanciones económicas',
      'Suspensión de actividades',
      'Pérdida de licencias o habilitaciones',
      'Procesos administrativos',
    ],
    affectedAssets: ['Licencias profesionales', 'Continuidad operativa', 'Finanzas'],
    controls: [
      {
        title: 'Checklist de cumplimiento trimestral',
        description: 'Lista de verificación de obligaciones legales y regulatorias cada 3 meses',
        type: 'DETECTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
      {
        title: 'Suscripción a boletines normativos',
        description: 'Servicio de alertas sobre cambios en legislación aplicable al sector',
        type: 'PREVENTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'WEAK',
      },
      {
        title: 'Capacitación anual en compliance',
        description: 'Formación obligatoria del equipo sobre normativa vigente',
        type: 'PREVENTIVE',
        category: 'ADMINISTRATIVE',
        strength: 'MODERATE',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Starting seed: Example Risks and Controls...');

  // Note: This script expects you to provide a valid userId and profileId
  console.log('⚠️  IMPORTANT: This script uses example IDs. You must update:');
  console.log(`   - EXAMPLE_USER_ID = "${EXAMPLE_USER_ID}"`);
  console.log(`   - EXAMPLE_PROFILE_ID = "${EXAMPLE_PROFILE_ID}"`);
  console.log('   Replace these with actual user and profile IDs from your database.\n');

  // Check if user exists (optional, comment out if not needed)
  try {
    const user = await prisma.user.findUnique({
      where: { id: EXAMPLE_USER_ID },
    });

    if (!user) {
      console.log('❌ User not found. Please create a user first or update EXAMPLE_USER_ID.');
      console.log('   Skipping seed...\n');
      return;
    }

    console.log(`✅ Found user: ${user.email}\n`);
  } catch (error) {
    console.log('⚠️  Could not verify user. Proceeding anyway...\n');
  }

  // Create RiskRegister
  console.log('📋 Creating RiskRegister...');
  const riskRegister = await prisma.riskRegister.create({
    data: {
      userId: EXAMPLE_USER_ID,
      profileId: EXAMPLE_PROFILE_ID,
      profileType: 'PROFESSIONAL', // Change to BUSINESS if needed
      title: 'Registro de Riesgos - Ejemplo Completo',
      description: 'Registro de ejemplo con riesgos y controles típicos para profesionales/empresas',
      jurisdiction: 'AR',
      status: 'ACTIVE',
      lastReviewedAt: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });

  console.log(`✅ RiskRegister created: ${riskRegister.id}\n`);

  // Create RiskEvents and Controls
  let totalEvents = 0;
  let totalControls = 0;

  for (const risk of exampleRisks) {
    const inherentRisk =
      getLikelihoodValue(risk.likelihood) * getImpactValue(risk.impact);
    const priority = calculatePriority(inherentRisk);

    console.log(`📌 Creating RiskEvent: "${risk.title}"...`);

    const riskEvent = await prisma.riskEvent.create({
      data: {
        registerId: riskRegister.id,
        title: risk.title,
        description: risk.description,
        category: risk.category,
        sourceType: 'USER_IDENTIFIED',
        identifiedBy: 'System (Seed)',
        likelihood: risk.likelihood,
        impact: risk.impact,
        inherentRisk,
        priority,
        status: 'ANALYZED',
        triggers: risk.triggers,
        consequences: risk.consequences,
        affectedAssets: risk.affectedAssets,
      },
    });

    totalEvents++;
    console.log(`   ✅ Created with priority: ${priority} (inherentRisk: ${inherentRisk})`);

    // Create controls for this risk
    for (const control of risk.controls) {
      await prisma.riskControl.create({
        data: {
          riskEventId: riskEvent.id,
          title: control.title,
          description: control.description,
          type: control.type,
          category: control.category,
          controlStrength: control.strength,
          status: Math.random() > 0.3 ? 'OPERATIONAL' : 'IMPLEMENTED', // 70% operational
        },
      });

      totalControls++;
    }

    console.log(`   ✅ Created ${risk.controls.length} controls\n`);
  }

  console.log('✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 1 RiskRegister created`);
  console.log(`   - ${totalEvents} RiskEvents created`);
  console.log(`   - ${totalControls} RiskControls created`);
  console.log('\n🎉 You can now view these in the dashboard!\n');
}

// Helper functions
function getLikelihoodValue(likelihood: RiskLikelihood): number {
  const values: Record<RiskLikelihood, number> = {
    RARE: 1,
    UNLIKELY: 2,
    POSSIBLE: 3,
    LIKELY: 4,
    ALMOST_CERTAIN: 5,
  };
  return values[likelihood];
}

function getImpactValue(impact: RiskImpactLevel): number {
  const values: Record<RiskImpactLevel, number> = {
    INSIGNIFICANT: 1,
    MINOR: 2,
    MODERATE: 3,
    MAJOR: 4,
    CATASTROPHIC: 5,
  };
  return values[impact];
}

function calculatePriority(inherentRisk: number): RiskPriority {
  if (inherentRisk >= 15) return 'CRITICAL';
  if (inherentRisk >= 10) return 'HIGH';
  if (inherentRisk >= 5) return 'MEDIUM';
  return 'LOW';
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
