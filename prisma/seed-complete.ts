import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete seed...\n');

  // Create a demo user
  console.log('👤 Creating demo user...');

  const hashedPassword = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@legal-analysis.com',
      name: 'Usuario Demo',
      password: hashedPassword,
      role: 'CLIENT',
      profileType: 'PROFESSIONAL',
    },
  });

  console.log(`✅ User created: ${user.email} (ID: ${user.id})`);
  console.log('   📧 Email: demo@legal-analysis.com');
  console.log('   🔑 Password: demo123\n');

  // Create professional profile
  console.log('📋 Creating professional profile...');

  const profile = await prisma.professionalProfile.create({
    data: {
      userId: user.id,
      profession: 'LAWYER',
      specialty: 'Derecho Corporativo y Compliance',
      yearsExperience: 8,
      jurisdiction: 'AR',
      practiceAreas: ['Corporativo', 'Laboral', 'Contractual', 'Compliance'],
      clientTypes: ['Corporaciones', 'PyMEs'],
      professionalInsurance: true,
      insuranceCoverage: 500000,
    },
  });

  console.log(`✅ Professional profile created\n`);

  // Create RiskRegister
  console.log('📊 Creating risk register...');

  const riskRegister = await prisma.riskRegister.create({
    data: {
      userId: user.id,
      profileId: profile.id,
      profileType: 'PROFESSIONAL',
      title: 'Registro de Riesgos - Abogado Corporativo',
      description: 'Registro principal de riesgos legales identificados',
      jurisdiction: 'AR',
      status: 'ACTIVE',
      lastReviewedAt: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Risk register created\n`);

  // Create sample risk events
  console.log('⚠️  Creating sample risk events...');

  const sampleRisks = [
    {
      title: 'Incumplimiento de Normativas Laborales',
      description:
        'Riesgo de no cumplir con las leyes laborales vigentes, incluyendo contratos, jornadas de trabajo y beneficios sociales.',
      category: 'Laboral',
      likelihood: 'POSSIBLE',
      impact: 'MAJOR',
      inherentRisk: 12,
      priority: 'HIGH' as const,
      status: 'ANALYZED',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Departamento Legal',
      triggers: [
        'Falta de actualización normativa',
        'Cambios en la legislación laboral',
        'Auditorías externas',
        'Quejas de empleados',
      ],
      consequences: [
        'Multas y sanciones económicas',
        'Demandas laborales',
        'Daño reputacional',
        'Costos de litigación',
      ],
      affectedAssets: ['Recursos Humanos', 'Finanzas', 'Reputación Corporativa'],
    },
    {
      title: 'Protección de Datos Personales (GDPR/LGPD)',
      description:
        'Riesgo de incumplir con normativas de protección de datos personales en el tratamiento de información de clientes y empleados.',
      category: 'Privacy y Datos',
      likelihood: 'LIKELY',
      impact: 'CATASTROPHIC',
      inherentRisk: 20,
      priority: 'CRITICAL' as const,
      status: 'TREATING',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Oficial de Privacidad',
      triggers: [
        'Brechas de seguridad',
        'Cambios normativos internacionales',
        'Denuncias de usuarios',
        'Auditorías de autoridades',
      ],
      consequences: [
        'Multas millonarias (hasta 4% facturación)',
        'Pérdida de confianza de clientes',
        'Prohibición de operaciones',
        'Demandas colectivas',
      ],
      affectedAssets: ['Datos de clientes', 'Sistemas IT', 'Operaciones comerciales', 'Marca'],
    },
    {
      title: 'Incumplimiento Contractual con Proveedores Clave',
      description:
        'Riesgo de no cumplir con las obligaciones contractuales establecidas con proveedores estratégicos.',
      category: 'Contractual',
      likelihood: 'UNLIKELY',
      impact: 'MODERATE',
      inherentRisk: 6,
      priority: 'MEDIUM' as const,
      status: 'MONITORING',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Gerencia de Compras',
      triggers: [
        'Problemas de liquidez',
        'Cambios en la cadena de suministro',
        'Fuerza mayor',
        'Disputas comerciales',
      ],
      consequences: [
        'Penalidades contractuales',
        'Interrupción de servicios',
        'Litigios comerciales',
        'Pérdida de proveedores',
      ],
      affectedAssets: ['Finanzas', 'Operaciones', 'Relaciones comerciales'],
    },
    {
      title: 'Infracción de Propiedad Intelectual',
      description:
        'Riesgo de infringir derechos de propiedad intelectual de terceros o no proteger adecuadamente los activos propios.',
      category: 'Propiedad Intelectual',
      likelihood: 'POSSIBLE',
      impact: 'MAJOR',
      inherentRisk: 12,
      priority: 'HIGH' as const,
      status: 'IDENTIFIED',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Departamento Legal',
      triggers: [
        'Lanzamiento de nuevos productos',
        'Competidores agresivos',
        'Falta de registros de marca',
        'Uso inadecuado de licencias',
      ],
      consequences: [
        'Demandas por infracción',
        'Pérdida de activos intangibles',
        'Costos legales elevados',
        'Retiro de productos del mercado',
      ],
      affectedAssets: ['Marca', 'Productos', 'Innovación', 'I+D'],
    },
    {
      title: 'Incumplimiento Tributario y Fiscal',
      description:
        'Riesgo de no cumplir correctamente con las obligaciones fiscales y tributarias aplicables.',
      category: 'Fiscal y Tributario',
      likelihood: 'POSSIBLE',
      impact: 'MODERATE',
      inherentRisk: 9,
      priority: 'MEDIUM' as const,
      status: 'MONITORING',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Controller Financiero',
      triggers: [
        'Cambios en normativa fiscal',
        'Auditorías tributarias',
        'Errores en declaraciones',
        'Interpretaciones ambiguas',
      ],
      consequences: [
        'Multas fiscales',
        'Intereses moratorios',
        'Auditorías exhaustivas',
        'Restricciones operativas',
      ],
      affectedAssets: ['Finanzas', 'Contabilidad', 'Reputación'],
    },
    {
      title: 'Conflictos Societarios y Governance',
      description:
        'Riesgo de disputas entre accionistas o incumplimiento de normas de gobierno corporativo.',
      category: 'Corporativo',
      likelihood: 'RARE',
      impact: 'MAJOR',
      inherentRisk: 4,
      priority: 'LOW' as const,
      status: 'MONITORING',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Directorio',
      triggers: [
        'Desacuerdos estratégicos',
        'Distribución de dividendos',
        'Cambios de control',
        'Falta de transparencia',
      ],
      consequences: [
        'Parálisis de decisiones',
        'Litigios societarios',
        'Fuga de inversores',
        'Daño reputacional',
      ],
      affectedAssets: ['Estructura societaria', 'Inversores', 'Dirección'],
    },
    {
      title: 'Competencia Desleal y Prácticas Anticompetitivas',
      description:
        'Riesgo de incurrir en prácticas que violen las leyes de defensa de la competencia.',
      category: 'Competencia',
      likelihood: 'UNLIKELY',
      impact: 'CATASTROPHIC',
      inherentRisk: 10,
      priority: 'HIGH' as const,
      status: 'IDENTIFIED',
      sourceType: 'USER_IDENTIFIED',
      identifiedBy: 'Asesoría Legal Externa',
      triggers: [
        'Acuerdos con competidores',
        'Abuso de posición dominante',
        'Precios predatorios',
        'Investigaciones regulatorias',
      ],
      consequences: [
        'Multas masivas',
        'Prohibición de operaciones',
        'Responsabilidad penal',
        'Pérdida de licencias',
      ],
      affectedAssets: ['Operaciones comerciales', 'Directivos', 'Finanzas', 'Reputación'],
    },
  ];

  for (const risk of sampleRisks) {
    const created = await prisma.riskEvent.create({
      data: {
        ...risk,
        registerId: riskRegister.id,
      },
    });
    console.log(`   ✅ ${created.title} (${created.priority})`);
  }

  console.log(`\n✅ ${sampleRisks.length} risk events created\n`);

  console.log('\n✅ Risk events completed\n');

  // Assign protocols to user
  console.log('📝 Assigning protocols to user...');

  const protocols = await prisma.protocol.findMany({
    take: 4,
  });

  for (const protocol of protocols) {
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
    console.log(`   ✅ ${protocol.title}`);
  }

  // Mark one as in progress
  if (protocols.length > 0) {
    await prisma.userProtocol.update({
      where: {
        userId_protocolId: {
          userId: user.id,
          protocolId: protocols[0].id,
        },
      },
      data: {
        status: 'IN_PROGRESS',
        progress: 35,
        startedAt: new Date(),
      },
    });
  }

  console.log(`\n✅ ${protocols.length} protocols assigned\n`);

  console.log('🎉 Seed completed successfully!\n');
  console.log('━'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('━'.repeat(60));
  console.log(`👤 User: demo@legal-analysis.com`);
  console.log(`🔑 Password: demo123`);
  console.log(`📋 Profile: Professional - Lawyer`);
  console.log(`⚠️  Risk Events: 7`);
  console.log(`📝 Protocols: ${protocols.length}`);
  console.log('━'.repeat(60));
  console.log('\n✨ You can now login at http://localhost:3001\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
