import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding user data...\n');

  // Find the first user (the one you created)
  const user = await prisma.user.findFirst({
    include: {
      professionalProfile: true,
      businessProfile: true,
    },
  });

  if (!user) {
    console.error('❌ No user found. Please complete the wizard first.');
    return;
  }

  console.log(`✅ Found user: ${user.email || user.id}`);

  // Check if user already has a risk register
  const existingRegister = await prisma.riskRegister.findFirst({
    where: { userId: user.id },
  });

  if (existingRegister) {
    console.log('⚠️  User already has a risk register. Skipping...');
  } else {
    // Determine profile type and data
    const profileType = user.professionalProfile ? 'PROFESSIONAL' : 'BUSINESS';
    const profileId = user.professionalProfile?.id || user.businessProfile?.id || '';

    console.log(`📋 Creating risk register for ${profileType}...`);

    // Create RiskRegister
    const riskRegister = await prisma.riskRegister.create({
      data: {
        userId: user.id,
        profileId: profileId,
        profileType: profileType as any,
        title: `Registro de Riesgos - ${
          profileType === 'PROFESSIONAL'
            ? user.professionalProfile?.profession
            : user.businessProfile?.businessType
        }`,
        description: 'Registro inicial de riesgos legales identificados',
        jurisdiction: user.professionalProfile?.jurisdiction || user.businessProfile?.jurisdiction || 'AR',
        status: 'ACTIVE',
        lastReviewedAt: new Date(),
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`✅ Risk register created: ${riskRegister.title}`);

    // Create sample risk events
    const sampleRisks = [
      {
        title: 'Incumplimiento de Normativas Laborales',
        description:
          'Riesgo de no cumplir con las leyes laborales vigentes, incluyendo contratos, jornadas de trabajo y beneficios.',
        category: 'Laboral',
        likelihood: 'POSSIBLE',
        impact: 'MAJOR',
        inherentRisk: 12,
        priority: 'HIGH' as const,
        status: 'ANALYZING',
        sourceType: 'INTERNAL_AUDIT',
        identifiedBy: 'Sistema',
        triggers: [
          'Falta de actualización normativa',
          'Cambios en la legislación laboral',
          'Auditorías externas',
        ],
        consequences: [
          'Multas y sanciones',
          'Demandas laborales',
          'Daño reputacional',
        ],
        affectedAssets: ['Recursos Humanos', 'Finanzas', 'Reputación'],
      },
      {
        title: 'Protección de Datos Personales',
        description:
          'Riesgo de incumplir con normativas de protección de datos (GDPR, LGPD) en el tratamiento de información personal.',
        category: 'Privacy y Datos',
        likelihood: 'LIKELY',
        impact: 'CATASTROPHIC',
        inherentRisk: 20,
        priority: 'CRITICAL' as const,
        status: 'MITIGATING',
        sourceType: 'REGULATORY_CHANGE',
        identifiedBy: 'Sistema',
        triggers: [
          'Brechas de seguridad',
          'Cambios normativos',
          'Denuncias de usuarios',
        ],
        consequences: [
          'Multas millonarias',
          'Pérdida de confianza',
          'Prohibición de operaciones',
        ],
        affectedAssets: ['Datos de clientes', 'Sistemas IT', 'Operaciones'],
      },
      {
        title: 'Incumplimiento Contractual con Proveedores',
        description:
          'Riesgo de no cumplir con las obligaciones contractuales establecidas con proveedores clave.',
        category: 'Contractual',
        likelihood: 'UNLIKELY',
        impact: 'MODERATE',
        inherentRisk: 6,
        priority: 'MEDIUM' as const,
        status: 'MONITORING',
        sourceType: 'INTERNAL_AUDIT',
        identifiedBy: 'Sistema',
        triggers: [
          'Problemas de liquidez',
          'Cambios en la cadena de suministro',
          'Fuerza mayor',
        ],
        consequences: [
          'Penalidades contractuales',
          'Interrupción de servicios',
          'Litigios',
        ],
        affectedAssets: ['Finanzas', 'Operaciones', 'Relaciones comerciales'],
      },
      {
        title: 'Propiedad Intelectual y Marcas',
        description:
          'Riesgo de infringir derechos de propiedad intelectual o no proteger adecuadamente los propios.',
        category: 'Propiedad Intelectual',
        likelihood: 'POSSIBLE',
        impact: 'MAJOR',
        inherentRisk: 12,
        priority: 'HIGH' as const,
        status: 'IDENTIFIED',
        sourceType: 'MARKET_INTELLIGENCE',
        identifiedBy: 'Sistema',
        triggers: [
          'Lanzamiento de nuevos productos',
          'Competidores agresivos',
          'Falta de registros',
        ],
        consequences: [
          'Demandas por infracción',
          'Pérdida de activos intangibles',
          'Costos legales elevados',
        ],
        affectedAssets: ['Marca', 'Productos', 'Innovación'],
      },
      {
        title: 'Cumplimiento Tributario',
        description:
          'Riesgo de no cumplir correctamente con las obligaciones fiscales y tributarias.',
        category: 'Fiscal y Tributario',
        likelihood: 'POSSIBLE',
        impact: 'MODERATE',
        inherentRisk: 9,
        priority: 'MEDIUM' as const,
        status: 'MONITORING',
        sourceType: 'REGULATORY_CHANGE',
        identifiedBy: 'Sistema',
        triggers: [
          'Cambios en normativa fiscal',
          'Auditorías tributarias',
          'Errores en declaraciones',
        ],
        consequences: ['Multas fiscales', 'Intereses', 'Auditorías exhaustivas'],
        affectedAssets: ['Finanzas', 'Contabilidad', 'Reputación'],
      },
    ];

    console.log(`\n📊 Creating ${sampleRisks.length} sample risk events...`);

    for (const risk of sampleRisks) {
      const created = await prisma.riskEvent.create({
        data: {
          ...risk,
          registerId: riskRegister.id,
        },
      });
      console.log(`   ✅ ${created.title} (${created.priority})`);
    }

    console.log('\n✅ Risk events created successfully!');
  }

  // Assign protocols to user
  const protocols = await prisma.protocol.findMany({
    take: 3,
  });

  console.log(`\n📝 Assigning ${protocols.length} protocols to user...`);

  for (const protocol of protocols) {
    const existing = await prisma.userProtocol.findUnique({
      where: {
        userId_protocolId: {
          userId: user.id,
          protocolId: protocol.id,
        },
      },
    });

    if (!existing) {
      const assigned = await prisma.userProtocol.create({
        data: {
          userId: user.id,
          protocolId: protocol.id,
          status: 'PENDING',
          progress: 0,
          assignedAt: new Date(),
          customizations: {},
        },
      });
      console.log(`   ✅ Assigned: ${protocol.title}`);
    } else {
      console.log(`   ⚠️  Already assigned: ${protocol.title}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - User: ${user.email || user.id}`);
  console.log(`   - Profile Type: ${user.professionalProfile ? 'PROFESSIONAL' : 'BUSINESS'}`);
  console.log(`   - Risk Register: ${existingRegister ? 'Already exists' : 'Created'}`);
  console.log(`   - Risk Events: ${existingRegister ? 'Already exists' : '5 created'}`);
  console.log(`   - Protocols Assigned: ${protocols.length}`);
  console.log('\n✨ You can now see data in the dashboard!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
