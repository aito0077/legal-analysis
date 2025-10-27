/**
 * Seed Script: Protocol Catalog
 * Populates the database with common legal and compliance protocols
 *
 * Usage (inside Docker):
 * docker-compose exec -T legal-analysis npx tsx prisma/seed-protocols.ts
 */

import { PrismaClient, ProtocolType, Profession, BusinessType } from '@prisma/client';

const prisma = new PrismaClient();

const protocols = [
  {
    id: 'contratos_modelo',
    title: 'Contratos Modelo Personalizados',
    description:
      'Plantillas de contratos adaptadas a tu industria y jurisdicción para uso con clientes y proveedores',
    type: 'SYSTEM' as ProtocolType,
    professions: [Profession.LAWYER, Profession.ACCOUNTANT, Profession.CONSULTANT],
    businessTypes: [BusinessType.LEGAL_FIRM, BusinessType.CONSULTING, BusinessType.E_COMMERCE],
    content: {
      steps: [
        {
          title: 'Revisión de contratos actuales',
          description: 'Analizar contratos existentes para identificar cláusulas clave y áreas de mejora',
          estimatedTime: '2 horas',
        },
        {
          title: 'Identificación de tipos de contratos necesarios',
          description: 'Determinar qué tipos de contratos se utilizan regularmente en tu práctica',
          estimatedTime: '1 hora',
        },
        {
          title: 'Desarrollo de plantillas base',
          description: 'Crear plantillas estándar con cláusulas comunes y variables personalizables',
          estimatedTime: '4 horas',
        },
        {
          title: 'Revisión legal',
          description: 'Verificar conformidad con legislación aplicable y mejores prácticas',
          estimatedTime: '2 horas',
        },
        {
          title: 'Implementación y capacitación',
          description: 'Entrenar al equipo en el uso de las nuevas plantillas',
          estimatedTime: '1 hora',
        },
      ],
    },
  },
  {
    id: 'politica_privacidad',
    title: 'Política de Privacidad y LGPD/GDPR',
    description:
      'Documento completo de protección de datos conforme a regulaciones locales e internacionales (LGPD, GDPR)',
    type: 'SYSTEM' as ProtocolType,
    professions: [
      Profession.DOCTOR,
      Profession.DENTIST,
      Profession.LAWYER,
      Profession.PSYCHOLOGIST,
      Profession.ACCOUNTANT,
    ],
    businessTypes: [
      BusinessType.HEALTHCARE,
      BusinessType.LEGAL_FIRM,
      BusinessType.E_COMMERCE,
      BusinessType.TECHNOLOGY,
      BusinessType.FINANCE,
    ],
    content: {
      steps: [
        {
          title: 'Mapeo de datos personales',
          description: 'Identificar qué datos personales se recopilan, procesan y almacenan',
          estimatedTime: '3 horas',
        },
        {
          title: 'Análisis de base legal',
          description: 'Determinar la base legal para cada tipo de procesamiento de datos',
          estimatedTime: '2 horas',
        },
        {
          title: 'Redacción de política de privacidad',
          description: 'Crear documento conforme a LGPD/GDPR con lenguaje claro',
          estimatedTime: '4 horas',
        },
        {
          title: 'Implementación de mecanismos de consentimiento',
          description: 'Configurar sistemas para obtener y registrar consentimientos',
          estimatedTime: '3 horas',
        },
        {
          title: 'Capacitación del equipo',
          description: 'Entrenar al personal en protección de datos y procedimientos',
          estimatedTime: '2 horas',
        },
        {
          title: 'Publicación y comunicación',
          description: 'Publicar política en sitio web y comunicar a usuarios/clientes',
          estimatedTime: '1 hora',
        },
      ],
    },
  },
  {
    id: 'manual_empleados',
    title: 'Manual del Empleado',
    description:
      'Reglamento interno con políticas laborales, código de conducta y procedimientos disciplinarios',
    type: 'SYSTEM' as ProtocolType,
    professions: [Profession.LAWYER],
    businessTypes: [
      BusinessType.LEGAL_FIRM,
      BusinessType.HEALTHCARE,
      BusinessType.CONSULTING,
      BusinessType.TECHNOLOGY,
      BusinessType.FINANCE,
      BusinessType.REAL_ESTATE,
      BusinessType.MANUFACTURING,
      BusinessType.RETAIL,
    ],
    content: {
      steps: [
        {
          title: 'Definición de políticas laborales',
          description: 'Establecer horarios, beneficios, vacaciones, y políticas de trabajo remoto',
          estimatedTime: '3 horas',
        },
        {
          title: 'Código de conducta',
          description: 'Redactar estándares de comportamiento, ética y profesionalismo',
          estimatedTime: '2 horas',
        },
        {
          title: 'Procedimientos disciplinarios',
          description: 'Definir proceso para manejo de infracciones y sanciones',
          estimatedTime: '2 horas',
        },
        {
          title: 'Revisión legal',
          description: 'Verificar conformidad con legislación laboral vigente',
          estimatedTime: '2 horas',
        },
        {
          title: 'Distribución y firma',
          description: 'Entregar manual a empleados y obtener acuse de recibo firmado',
          estimatedTime: '1 hora',
        },
      ],
    },
  },
  {
    id: 'protocolo_crisis',
    title: 'Protocolo de Gestión de Crisis Legal',
    description:
      'Pasos a seguir ante litigios, inspecciones regulatorias o reclamaciones de terceros',
    type: 'SYSTEM' as ProtocolType,
    professions: [
      Profession.LAWYER,
      Profession.DOCTOR,
      Profession.ARCHITECT,
      Profession.ENGINEER,
      Profession.ACCOUNTANT,
    ],
    businessTypes: [
      BusinessType.LEGAL_FIRM,
      BusinessType.HEALTHCARE,
      BusinessType.CONSTRUCTION,
      BusinessType.FINANCE,
      BusinessType.MANUFACTURING,
    ],
    content: {
      steps: [
        {
          title: 'Equipo de respuesta a crisis',
          description: 'Designar responsables y definir roles ante situaciones de crisis',
          estimatedTime: '2 horas',
        },
        {
          title: 'Protocolo de comunicación',
          description: 'Establecer flujo de comunicación interna y externa ante crisis',
          estimatedTime: '2 horas',
        },
        {
          title: 'Procedimientos de documentación',
          description: 'Definir cómo registrar eventos, decisiones y comunicaciones',
          estimatedTime: '1 hora',
        },
        {
          title: 'Contactos de emergencia',
          description: 'Compilar lista de abogados, aseguradoras, autoridades relevantes',
          estimatedTime: '1 hora',
        },
        {
          title: 'Simulacros y revisión',
          description: 'Realizar ejercicios de crisis y actualizar protocolo anualmente',
          estimatedTime: '3 horas',
        },
      ],
    },
  },
  {
    id: 'checklist_compliance',
    title: 'Checklist de Cumplimiento Trimestral',
    description:
      'Lista de verificación de obligaciones legales y regulatorias a revisar cada 3 meses',
    type: 'SYSTEM' as ProtocolType,
    professions: [
      Profession.LAWYER,
      Profession.ACCOUNTANT,
      Profession.DOCTOR,
      Profession.PHARMACIST,
    ],
    businessTypes: [
      BusinessType.LEGAL_FIRM,
      BusinessType.HEALTHCARE,
      BusinessType.FINANCE,
      BusinessType.E_COMMERCE,
      BusinessType.TECHNOLOGY,
      BusinessType.MANUFACTURING,
    ],
    content: {
      steps: [
        {
          title: 'Identificación de obligaciones',
          description: 'Listar todas las obligaciones legales aplicables a tu sector',
          estimatedTime: '4 horas',
        },
        {
          title: 'Creación de checklist',
          description: 'Organizar obligaciones por frecuencia y responsable',
          estimatedTime: '2 horas',
        },
        {
          title: 'Asignación de responsables',
          description: 'Definir quién verifica cada obligación',
          estimatedTime: '1 hora',
        },
        {
          title: 'Configuración de recordatorios',
          description: 'Establecer alertas automáticas para fechas clave',
          estimatedTime: '1 hora',
        },
        {
          title: 'Revisión trimestral',
          description: 'Ejecutar checklist cada 3 meses y documentar resultados',
          estimatedTime: '2 horas',
          recurring: true,
        },
      ],
    },
  },
  {
    id: 'terminos_condiciones',
    title: 'Términos y Condiciones de Servicio',
    description:
      'Documento legal para regular la relación con clientes en ventas online y servicios',
    type: 'SYSTEM' as ProtocolType,
    professions: [Profession.LAWYER],
    businessTypes: [
      BusinessType.E_COMMERCE,
      BusinessType.TECHNOLOGY,
      BusinessType.CONSULTING,
      BusinessType.EDUCATION,
      BusinessType.MEDIA,
    ],
    content: {
      steps: [
        {
          title: 'Análisis del modelo de negocio',
          description: 'Entender servicios ofrecidos, precios, y proceso de compra/contratación',
          estimatedTime: '2 horas',
        },
        {
          title: 'Redacción de cláusulas clave',
          description: 'Incluir aceptación, pago, devoluciones, limitación de responsabilidad',
          estimatedTime: '4 horas',
        },
        {
          title: 'Revisión de legislación aplicable',
          description: 'Verificar conformidad con Código de Defensa del Consumidor y leyes locales',
          estimatedTime: '2 horas',
        },
        {
          title: 'Implementación en plataforma',
          description: 'Publicar términos en sitio web con mecanismo de aceptación',
          estimatedTime: '1 hora',
        },
        {
          title: 'Actualización periódica',
          description: 'Revisar y actualizar términos al menos una vez al año',
          estimatedTime: '2 horas',
        },
      ],
    },
  },
];

async function main() {
  console.log('🌱 Starting seed: Protocol Catalog...\n');

  // First, create/get a default category
  const defaultCategory = await prisma.riskCategory.upsert({
    where: { name: 'Compliance General' },
    update: {},
    create: {
      name: 'Compliance General',
      description: 'Protocolos generales de cumplimiento legal y regulatorio',
      color: '#3B82F6',
      icon: 'shield-check',
      order: 1,
      isActive: true,
    },
  });

  console.log(`✅ Category created/found: ${defaultCategory.name}\n`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const protocol of protocols) {
    console.log(`📄 Processing: "${protocol.title}"...`);

    const existing = await prisma.protocol.findFirst({
      where: { title: protocol.title },
    });

    if (existing) {
      console.log(`   ⚠️  Already exists, skipping...`);
      updatedCount++;
    } else {
      await prisma.protocol.create({
        data: {
          title: protocol.title,
          description: protocol.description,
          content: protocol.content,
          type: protocol.type,
          categoryId: defaultCategory.id,
          businessTypes: protocol.businessTypes || [],
          jurisdictions: ['AR', 'BR', 'UY', 'CL'], // Latin America
          isPublic: true,
          isVerified: true,
          usageCount: 0,
        },
      });

      createdCount++;
      console.log(`   ✅ Created successfully`);
    }
  }

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${createdCount} protocols created`);
  console.log(`   - ${updatedCount} protocols already existed`);
  console.log(`   - Total: ${protocols.length} protocols in catalog`);
  console.log('\n🎉 Protocols are now available for assignment!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
