import { PrismaClient, Profession, BusinessType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// ACTIVITIES - Actividades por Profesión
// ============================================================================

const professionalActivities = [
  // MÉDICO / DOCTOR
  {
    code: 'atencion_pacientes',
    label: 'Atención directa de pacientes',
    description: 'Consultas, diagnósticos, tratamientos',
    professions: [Profession.DOCTOR],
    category: 'Operaciones',
    order: 1,
  },
  {
    code: 'cirugias_procedimientos',
    label: 'Cirugías y procedimientos médicos',
    description: 'Intervenciones quirúrgicas y procedimientos invasivos',
    professions: [Profession.DOCTOR],
    category: 'Operaciones',
    order: 2,
  },
  {
    code: 'prescripcion_medicamentos',
    label: 'Prescripción de medicamentos',
    description: 'Recetas y gestión de tratamientos farmacológicos',
    professions: [Profession.DOCTOR, Profession.DENTIST],
    category: 'Operaciones',
    order: 3,
  },
  {
    code: 'manejo_historias_clinicas',
    label: 'Manejo de historias clínicas',
    description: 'Gestión de datos sensibles de pacientes',
    professions: [Profession.DOCTOR, Profession.DENTIST, Profession.PSYCHOLOGIST],
    category: 'Legal',
    order: 4,
  },
  {
    code: 'derivaciones_interconsultas',
    label: 'Derivaciones e interconsultas',
    description: 'Coordinación con otros profesionales médicos',
    professions: [Profession.DOCTOR, Profession.DENTIST],
    category: 'Operaciones',
    order: 5,
  },

  // ABOGADO / LAWYER
  {
    code: 'asesoramiento_legal',
    label: 'Asesoramiento legal a clientes',
    description: 'Consultas y consejos jurídicos',
    professions: [Profession.LAWYER, Profession.NOTARY],
    category: 'Operaciones',
    order: 1,
  },
  {
    code: 'redaccion_contratos',
    label: 'Redacción de contratos',
    description: 'Elaboración de acuerdos y documentos legales',
    professions: [Profession.LAWYER, Profession.NOTARY],
    category: 'Operaciones',
    order: 2,
  },
  {
    code: 'representacion_judicial',
    label: 'Representación judicial',
    description: 'Litigios y audiencias en tribunales',
    professions: [Profession.LAWYER],
    category: 'Operaciones',
    order: 3,
  },
  {
    code: 'manejo_fondos_clientes',
    label: 'Manejo de fondos de clientes',
    description: 'Administración de cuentas de fideicomiso',
    professions: [Profession.LAWYER],
    category: 'Financiero',
    order: 4,
  },
  {
    code: 'due_diligence',
    label: 'Due diligence legal',
    description: 'Auditorías legales y revisión de documentación',
    professions: [Profession.LAWYER],
    category: 'Operaciones',
    order: 5,
  },

  // ARQUITECTO / ARCHITECT
  {
    code: 'diseno_proyectos',
    label: 'Diseño de proyectos arquitectónicos',
    description: 'Planos, renders y documentación técnica',
    professions: [Profession.ARCHITECT, Profession.ENGINEER, Profession.CIVIL_ENGINEER],
    category: 'Operaciones',
    order: 1,
  },
  {
    code: 'direccion_obra',
    label: 'Dirección de obra',
    description: 'Supervisión de construcciones y proyectos',
    professions: [Profession.ARCHITECT, Profession.CIVIL_ENGINEER],
    category: 'Operaciones',
    order: 2,
  },
  {
    code: 'gestion_permisos',
    label: 'Gestión de permisos y habilitaciones',
    description: 'Trámites municipales y regulatorios',
    professions: [Profession.ARCHITECT, Profession.ENGINEER, Profession.CIVIL_ENGINEER],
    category: 'Legal',
    order: 3,
  },
  {
    code: 'certificaciones_tecnicas',
    label: 'Certificaciones técnicas',
    description: 'Final de obra, planos conforme a obra',
    professions: [Profession.ARCHITECT, Profession.ENGINEER],
    category: 'Legal',
    order: 4,
  },

  // CONTADOR / ACCOUNTANT
  {
    code: 'contabilidad_empresas',
    label: 'Contabilidad de empresas',
    description: 'Registración contable y estados financieros',
    professions: [Profession.ACCOUNTANT],
    category: 'Operaciones',
    order: 1,
  },
  {
    code: 'liquidacion_impuestos',
    label: 'Liquidación de impuestos',
    description: 'DDJJ, pagos y asesoramiento fiscal',
    professions: [Profession.ACCOUNTANT],
    category: 'Legal',
    order: 2,
  },
  {
    code: 'auditoria_contable',
    label: 'Auditoría contable',
    description: 'Revisión de estados contables',
    professions: [Profession.ACCOUNTANT],
    category: 'Operaciones',
    order: 3,
  },
  {
    code: 'liquidacion_sueldos',
    label: 'Liquidación de sueldos',
    description: 'Nómina y aportes de personal',
    professions: [Profession.ACCOUNTANT],
    category: 'Operaciones',
    order: 4,
  },

  // CONSULTOR / CONSULTANT
  {
    code: 'diagnostico_empresarial',
    label: 'Diagnóstico y análisis empresarial',
    description: 'Evaluación de procesos y estrategias',
    professions: [Profession.CONSULTANT],
    category: 'Operaciones',
    order: 1,
  },
  {
    code: 'implementacion_proyectos',
    label: 'Implementación de proyectos',
    description: 'Gestión de cambio y mejoras',
    professions: [Profession.CONSULTANT],
    category: 'Operaciones',
    order: 2,
  },
  {
    code: 'capacitacion_equipos',
    label: 'Capacitación de equipos',
    description: 'Formación y coaching',
    professions: [Profession.CONSULTANT],
    category: 'Operaciones',
    order: 3,
  },

  // PSICÓLOGO / PSYCHOLOGIST
  {
    code: 'atencion_psicoterapeutica',
    label: 'Atención psicoterapéutica',
    description: 'Sesiones individuales o grupales',
    professions: [Profession.PSYCHOLOGIST],
    category: 'Operaciones',
    order: 1,
  },
  {
    code: 'evaluaciones_psicodiagnostico',
    label: 'Evaluaciones y psicodiagnóstico',
    description: 'Tests y evaluaciones psicológicas',
    professions: [Profession.PSYCHOLOGIST],
    category: 'Operaciones',
    order: 2,
  },
  {
    code: 'informes_profesionales',
    label: 'Informes profesionales',
    description: 'Informes para terceros (judiciales, educativos)',
    professions: [Profession.PSYCHOLOGIST],
    category: 'Legal',
    order: 3,
  },

  // ACTIVIDADES COMUNES
  {
    code: 'contratacion_personal',
    label: 'Contratación de personal',
    description: 'Empleados, asociados, becarios',
    professions: Object.values(Profession),
    category: 'Legal',
    order: 10,
  },
  {
    code: 'manejo_datos_clientes',
    label: 'Manejo de datos personales de clientes',
    description: 'Protección de datos y privacidad',
    professions: Object.values(Profession),
    category: 'Legal',
    order: 11,
  },
  {
    code: 'seguros_profesionales',
    label: 'Gestión de seguros profesionales',
    description: 'Seguros de responsabilidad civil',
    professions: Object.values(Profession),
    category: 'Financiero',
    order: 12,
  },
];

// ============================================================================
// ACTIVITIES - Actividades por Tipo de Negocio
// ============================================================================

const businessActivities = [
  // GENERAL BUSINESS
  {
    code: 'contratos_proveedores',
    label: 'Contratos con proveedores',
    description: 'Acuerdos de suministro y servicios',
    businessTypes: Object.values(BusinessType),
    category: 'Legal',
    order: 1,
  },
  {
    code: 'contratos_clientes',
    label: 'Contratos con clientes',
    description: 'Términos y condiciones de venta/servicio',
    businessTypes: Object.values(BusinessType),
    category: 'Legal',
    order: 2,
  },
  {
    code: 'gestion_empleados',
    label: 'Gestión de empleados',
    description: 'Contratación, nómina, despidos',
    businessTypes: Object.values(BusinessType),
    category: 'Legal',
    order: 3,
  },
  {
    code: 'proteccion_datos',
    label: 'Protección de datos personales',
    description: 'GDPR, LOPD, compliance de privacidad',
    businessTypes: Object.values(BusinessType),
    category: 'Legal',
    order: 4,
  },

  // E-COMMERCE / TECHNOLOGY
  {
    code: 'ventas_online',
    label: 'Ventas online',
    description: 'E-commerce, marketplace, plataformas',
    businessTypes: [BusinessType.E_COMMERCE, BusinessType.TECHNOLOGY, BusinessType.RETAIL],
    category: 'Operaciones',
    order: 5,
  },
  {
    code: 'terminos_condiciones',
    label: 'Términos y condiciones web',
    description: 'Políticas de uso, privacidad, cookies',
    businessTypes: [BusinessType.E_COMMERCE, BusinessType.TECHNOLOGY],
    category: 'Legal',
    order: 6,
  },
  {
    code: 'propiedad_intelectual',
    label: 'Propiedad intelectual',
    description: 'Marcas, patentes, software',
    businessTypes: [BusinessType.TECHNOLOGY, BusinessType.MEDIA, BusinessType.E_COMMERCE],
    category: 'Legal',
    order: 7,
  },

  // FINANCE / REAL_ESTATE
  {
    code: 'servicios_financieros',
    label: 'Servicios financieros',
    description: 'Préstamos, inversiones, asesoramiento',
    businessTypes: [BusinessType.FINANCE],
    category: 'Operaciones',
    order: 8,
  },
  {
    code: 'compraventa_inmuebles',
    label: 'Compra/venta de inmuebles',
    description: 'Transacciones inmobiliarias',
    businessTypes: [BusinessType.REAL_ESTATE],
    category: 'Operaciones',
    order: 9,
  },
  {
    code: 'alquileres',
    label: 'Gestión de alquileres',
    description: 'Contratos de locación y administración',
    businessTypes: [BusinessType.REAL_ESTATE],
    category: 'Operaciones',
    order: 10,
  },

  // HEALTHCARE
  {
    code: 'servicios_salud',
    label: 'Prestación de servicios de salud',
    description: 'Atención médica, clínicas, consultorios',
    businessTypes: [BusinessType.HEALTHCARE],
    category: 'Operaciones',
    order: 11,
  },
  {
    code: 'historias_clinicas_empresa',
    label: 'Gestión de historias clínicas',
    description: 'Manejo de datos sensibles de pacientes',
    businessTypes: [BusinessType.HEALTHCARE],
    category: 'Legal',
    order: 12,
  },

  // CONSTRUCTION
  {
    code: 'ejecucion_obras',
    label: 'Ejecución de obras',
    description: 'Construcción, refacción, instalaciones',
    businessTypes: [BusinessType.CONSTRUCTION],
    category: 'Operaciones',
    order: 13,
  },
  {
    code: 'certificaciones_obra',
    label: 'Certificaciones de obra',
    description: 'Avances, finales de obra, garantías',
    businessTypes: [BusinessType.CONSTRUCTION],
    category: 'Legal',
    order: 14,
  },

  // MANUFACTURING
  {
    code: 'fabricacion_productos',
    label: 'Fabricación de productos',
    description: 'Producción industrial',
    businessTypes: [BusinessType.MANUFACTURING],
    category: 'Operaciones',
    order: 15,
  },
  {
    code: 'control_calidad',
    label: 'Control de calidad',
    description: 'Inspecciones y certificaciones',
    businessTypes: [BusinessType.MANUFACTURING],
    category: 'Operaciones',
    order: 16,
  },
];

// ============================================================================
// RISK AREAS - Áreas de Riesgo por Profesión
// ============================================================================

const professionalRiskAreas = [
  // MÉDICO / DOCTOR
  {
    code: 'mala_praxis_medica',
    label: 'Responsabilidad profesional (mala praxis médica)',
    description:
      'Demandas por errores en diagnóstico, tratamiento, cirugías o procedimientos que causan daño al paciente',
    professions: [Profession.DOCTOR, Profession.DENTIST],
    severity: 'HIGH',
    examples: [
      'Error de diagnóstico',
      'Complicaciones quirúrgicas',
      'Infecciones nosocomiales',
      'Reacciones adversas a medicamentos',
    ],
    order: 1,
  },
  {
    code: 'privacidad_datos_salud',
    label: 'Privacidad y protección de datos de salud',
    description: 'Filtración o mal manejo de historias clínicas y datos sensibles de pacientes',
    professions: [Profession.DOCTOR, Profession.DENTIST, Profession.PSYCHOLOGIST],
    severity: 'HIGH',
    examples: [
      'Acceso no autorizado a historias clínicas',
      'Pérdida de datos por hackeo',
      'Compartir datos sin consentimiento',
    ],
    order: 2,
  },
  {
    code: 'consentimiento_informado',
    label: 'Falta de consentimiento informado',
    description: 'Procedimientos realizados sin autorización adecuada del paciente',
    professions: [Profession.DOCTOR, Profession.DENTIST],
    severity: 'HIGH',
    examples: ['Cirugía sin firma', 'Tratamiento experimental sin explicación', 'Cambio de procedimiento sin avisar'],
    order: 3,
  },

  // ABOGADO / LAWYER
  {
    code: 'mala_praxis_legal',
    label: 'Mala praxis legal y negligencia profesional',
    description: 'Errores en asesoramiento, pérdida de plazos, conflictos de interés',
    professions: [Profession.LAWYER, Profession.NOTARY],
    severity: 'HIGH',
    examples: [
      'Pérdida de un juicio por negligencia',
      'Vencimiento de plazos procesales',
      'Mal asesoramiento que causa perjuicio',
    ],
    order: 1,
  },
  {
    code: 'confidencialidad_legal',
    label: 'Violación de confidencialidad cliente-abogado',
    description: 'Filtración de información privilegiada o secreto profesional',
    professions: [Profession.LAWYER, Profession.NOTARY],
    severity: 'HIGH',
    examples: ['Divulgación de estrategia legal', 'Compartir documentos con terceros', 'Hackeo de correspondencia'],
    order: 2,
  },
  {
    code: 'conflicto_interes',
    label: 'Conflictos de interés',
    description: 'Representar clientes con intereses opuestos',
    professions: [Profession.LAWYER],
    severity: 'MEDIUM',
    examples: ['Representar ambas partes', 'Intereses personales vs cliente', 'Relaciones familiares no declaradas'],
    order: 3,
  },
  {
    code: 'manejo_fondos',
    label: 'Mal manejo de fondos de clientes',
    description: 'Apropiación indebida o errores en cuentas de fideicomiso',
    professions: [Profession.LAWYER],
    severity: 'HIGH',
    examples: ['Uso personal de fondos', 'Mezcla de cuentas', 'Falta de registros'],
    order: 4,
  },

  // ARQUITECTO / INGENIERO
  {
    code: 'defectos_construccion',
    label: 'Defectos de construcción y vicios ocultos',
    description: 'Fallas estructurales, humedades, problemas de diseño',
    professions: [Profession.ARCHITECT, Profession.ENGINEER, Profession.CIVIL_ENGINEER],
    severity: 'HIGH',
    examples: ['Grietas estructurales', 'Infiltraciones', 'Colapso parcial', 'Diseño no cumple códigos'],
    order: 1,
  },
  {
    code: 'incumplimiento_normativa',
    label: 'Incumplimiento de normativa urbanística',
    description: 'Obras sin permisos, violación de códigos de edificación',
    professions: [Profession.ARCHITECT, Profession.CIVIL_ENGINEER],
    severity: 'MEDIUM',
    examples: ['Obra sin permiso', 'Exceso de altura', 'Violación de retiros', 'Uso no permitido'],
    order: 2,
  },
  {
    code: 'responsabilidad_decenaria',
    label: 'Responsabilidad decenal',
    description: 'Responsabilidad por 10 años sobre vicios estructurales graves',
    professions: [Profession.ARCHITECT, Profession.ENGINEER, Profession.CIVIL_ENGINEER],
    severity: 'HIGH',
    examples: ['Fallas estructurales graves', 'Colapso edificio', 'Vicios de suelo'],
    order: 3,
  },

  // CONTADOR / ACCOUNTANT
  {
    code: 'errores_contables',
    label: 'Errores contables y fiscales',
    description: 'Liquidaciones incorrectas, errores en balances',
    professions: [Profession.ACCOUNTANT],
    severity: 'HIGH',
    examples: ['DDJJ incorrectas', 'Sanciones AFIP/SUNAT', 'Balances con errores', 'Auditoría observada'],
    order: 1,
  },
  {
    code: 'responsabilidad_tributaria',
    label: 'Responsabilidad solidaria tributaria',
    description: 'Contador puede ser responsable solidario por deudas fiscales',
    professions: [Profession.ACCOUNTANT],
    severity: 'HIGH',
    examples: ['Inscripción como responsable', 'Firma de DDJJ con deuda', 'Evasión fiscal del cliente'],
    order: 2,
  },

  // PSICÓLOGO / PSYCHOLOGIST
  {
    code: 'violacion_secreto_profesional',
    label: 'Violación de secreto profesional',
    description: 'Divulgación de información confidencial de pacientes',
    professions: [Profession.PSYCHOLOGIST],
    severity: 'HIGH',
    examples: ['Comentarios sobre paciente', 'Historias clínicas filtradas', 'Declaraciones sin autorización'],
    order: 1,
  },
  {
    code: 'mala_praxis_psicologica',
    label: 'Mala praxis psicológica',
    description: 'Tratamientos inadecuados, relaciones duales, abuso',
    professions: [Profession.PSYCHOLOGIST],
    severity: 'HIGH',
    examples: ['Relación sentimental con paciente', 'Técnicas no validadas', 'Abandono de tratamiento'],
    order: 2,
  },

  // ÁREAS COMUNES
  {
    code: 'riesgos_laborales',
    label: 'Riesgos laborales',
    description: 'Despidos, discriminación, accidentes de trabajo',
    professions: Object.values(Profession),
    severity: 'MEDIUM',
    examples: ['Despido improcedente', 'Discriminación', 'Accidente laboral', 'Mobbing'],
    order: 10,
  },
  {
    code: 'incumplimiento_contractual',
    label: 'Incumplimiento contractual',
    description: 'Incumplimientos en contratos con clientes o proveedores',
    professions: Object.values(Profession),
    severity: 'MEDIUM',
    examples: ['No entrega en plazo', 'Servicio deficiente', 'Cláusulas incumplidas'],
    order: 11,
  },
  {
    code: 'riesgos_fiscales',
    label: 'Riesgos fiscales y tributarios',
    description: 'Inspecciones, sanciones, impuestos impagos',
    professions: Object.values(Profession),
    severity: 'MEDIUM',
    examples: ['Inspección AFIP/SUNAT', 'Multas tributarias', 'Retenciones incorrectas'],
    order: 12,
  },
];

// ============================================================================
// RISK AREAS - Áreas de Riesgo por Tipo de Negocio
// ============================================================================

const businessRiskAreas = [
  {
    code: 'riesgos_laborales_empresa',
    label: 'Riesgos laborales',
    description: 'Despidos, discriminación, accidentes de trabajo, demandas de empleados',
    businessTypes: Object.values(BusinessType),
    severity: 'HIGH',
    examples: ['Despido improcedente', 'Discriminación', 'Accidente laboral', 'Mobbing', 'Horas extra no pagadas'],
    order: 1,
  },
  {
    code: 'incumplimiento_contractual_empresa',
    label: 'Incumplimiento contractual',
    description: 'Incumplimientos con clientes, proveedores, socios',
    businessTypes: Object.values(BusinessType),
    severity: 'HIGH',
    examples: ['No entrega en plazo', 'Producto defectuoso', 'Servicios no prestados', 'Cláusulas incumplidas'],
    order: 2,
  },
  {
    code: 'proteccion_datos_empresa',
    label: 'Protección de datos (GDPR/LOPD)',
    description: 'Filtraciones, hackeos, mal uso de datos personales',
    businessTypes: Object.values(BusinessType),
    severity: 'HIGH',
    examples: ['Filtración de base de datos', 'Hackeo', 'Falta de consentimiento', 'Transferencia ilegal de datos'],
    order: 3,
  },
  {
    code: 'responsabilidad_producto',
    label: 'Responsabilidad por producto defectuoso',
    description: 'Daños causados por productos o servicios',
    businessTypes: [BusinessType.MANUFACTURING, BusinessType.RETAIL, BusinessType.E_COMMERCE],
    severity: 'HIGH',
    examples: ['Producto dañino', 'Falla de seguridad', 'Etiquetado incorrecto', 'Retiro de mercado'],
    order: 4,
  },
  {
    code: 'propiedad_intelectual_empresa',
    label: 'Propiedad intelectual',
    description: 'Infracciones de marcas, patentes, derechos de autor',
    businessTypes: [BusinessType.TECHNOLOGY, BusinessType.E_COMMERCE, BusinessType.MEDIA, BusinessType.MANUFACTURING],
    severity: 'MEDIUM',
    examples: ['Uso de marca ajena', 'Copia de software', 'Plagio de contenido', 'Patente infringida'],
    order: 5,
  },
  {
    code: 'riesgos_fiscales_empresa',
    label: 'Riesgos fiscales y tributarios',
    description: 'Inspecciones, sanciones, deudas tributarias',
    businessTypes: Object.values(BusinessType),
    severity: 'HIGH',
    examples: ['Inspección AFIP/SUNAT', 'Multas tributarias', 'IVA observado', 'Ganancias ajustadas'],
    order: 6,
  },
  {
    code: 'cumplimiento_regulatorio',
    label: 'Cumplimiento regulatorio',
    description: 'Licencias, permisos, habilitaciones, normativa sectorial',
    businessTypes: Object.values(BusinessType),
    severity: 'MEDIUM',
    examples: ['Habilitación vencida', 'Falta de licencia', 'Normativa sectorial incumplida', 'Multas municipales'],
    order: 7,
  },
  {
    code: 'responsabilidad_civil_empresa',
    label: 'Responsabilidad civil',
    description: 'Daños a terceros (clientes, proveedores, público)',
    businessTypes: Object.values(BusinessType),
    severity: 'HIGH',
    examples: ['Daño a cliente en local', 'Daño por servicio', 'Accidente en instalaciones', 'Caída de objeto'],
    order: 8,
  },
  {
    code: 'ciberseguridad',
    label: 'Ciberseguridad y ataques informáticos',
    description: 'Hackeos, ransomware, fraudes digitales',
    businessTypes: [BusinessType.TECHNOLOGY, BusinessType.E_COMMERCE, BusinessType.FINANCE],
    severity: 'HIGH',
    examples: ['Ransomware', 'Phishing a clientes', 'Robo de credenciales', 'DDoS attack'],
    order: 9,
  },
  {
    code: 'fraude_corrupcion',
    label: 'Fraude y corrupción',
    description: 'Malversación, sobornos, conflictos de interés',
    businessTypes: Object.values(BusinessType),
    severity: 'MEDIUM',
    examples: ['Soborno a funcionario', 'Fraude interno', 'Facturación falsa', 'Conflicto de interés no declarado'],
    order: 10,
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Seeding wizard configuration data...\n');

  // Limpiar datos existentes
  console.log('🗑️  Cleaning existing data...');
  await prisma.activity.deleteMany({});
  await prisma.riskArea.deleteMany({});
  console.log('✅ Cleaned\n');

  // Seed Activities - Profesionales
  console.log('📋 Seeding professional activities...');
  for (const activity of professionalActivities) {
    await prisma.activity.create({
      data: activity,
    });
  }
  console.log(`✅ Created ${professionalActivities.length} professional activities\n`);

  // Seed Activities - Negocios
  console.log('📋 Seeding business activities...');
  for (const activity of businessActivities) {
    await prisma.activity.create({
      data: activity,
    });
  }
  console.log(`✅ Created ${businessActivities.length} business activities\n`);

  // Seed Risk Areas - Profesionales
  console.log('⚠️  Seeding professional risk areas...');
  for (const riskArea of professionalRiskAreas) {
    await prisma.riskArea.create({
      data: riskArea,
    });
  }
  console.log(`✅ Created ${professionalRiskAreas.length} professional risk areas\n`);

  // Seed Risk Areas - Negocios
  console.log('⚠️  Seeding business risk areas...');
  for (const riskArea of businessRiskAreas) {
    await prisma.riskArea.create({
      data: riskArea,
    });
  }
  console.log(`✅ Created ${businessRiskAreas.length} business risk areas\n`);

  console.log('🎉 Seed completed successfully!\n');

  // Summary
  const totalActivities = await prisma.activity.count();
  const totalRiskAreas = await prisma.riskArea.count();

  console.log('📊 Summary:');
  console.log(`   - Total Activities: ${totalActivities}`);
  console.log(`   - Total Risk Areas: ${totalRiskAreas}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
