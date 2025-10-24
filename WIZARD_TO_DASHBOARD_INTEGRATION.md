# Wizard → Dashboard Integration - Real Data Flow

**Fecha:** 2025-10-24
**Estado:** ✅ COMPLETED
**Sprint:** Sprint 2 - Dashboard Functional with Real Data

---

## 🎯 Objetivo

Conectar el flujo del wizard al dashboard creando datos reales de RiskRegister y RiskEvents, para que el usuario vea información inmediatamente después de completar el onboarding.

---

## 📊 Flujo Implementado

### Antes (Sin datos en dashboard)
```
Wizard Step 4 → Complete
  ↓
Crear ProfessionalProfile/BusinessProfile
  ↓
Crear RiskAssessment
  ↓
Redirigir al Dashboard
  ↓
Dashboard muestra "Sin datos aún" ❌
```

### Después (Con datos reales)
```
Wizard Step 4 → Complete
  ↓
Crear ProfessionalProfile/BusinessProfile
  ↓
Crear RiskAssessment
  ↓
Crear RiskRegister ✅ (NUEVO)
  ↓
Crear RiskEvents basados en riskExposure ✅ (NUEVO)
  ↓
Redirigir al Dashboard
  ↓
Dashboard muestra datos reales ✅
```

---

## 🔧 Cambios Implementados

### 1. Modificación de `/api/wizard/complete`

**Archivo:** `src/app/api/wizard/complete/route.ts`

**Nuevas funciones helper agregadas:**

```typescript
// Mapea severity (de RiskArea) a likelihood + impact
function mapSeverityToRisk(severity: string): {
  likelihood: RiskLikelihood;
  impact: RiskImpactLevel
}

// Calcula prioridad basada en inherent risk score
function calculatePriority(inherentRisk: number): RiskPriority

// Extrae categoría desde el código de riesgo
function getCategoryFromCode(code: string): string
```

**Mapeo de Severity → Risk:**

| Severity | Likelihood | Impact | Inherent Risk | Priority |
|----------|------------|--------|---------------|----------|
| CRITICAL | LIKELY (4) | CATASTROPHIC (5) | 20 | CRITICAL |
| HIGH | POSSIBLE (3) | MAJOR (4) | 12 | HIGH |
| MEDIUM | POSSIBLE (3) | MODERATE (3) | 9 | MEDIUM |
| LOW | UNLIKELY (2) | MINOR (2) | 4 | LOW |

**Categorías de Riesgo:**

- Responsabilidad Profesional (mala_praxis_medica, mala_praxis_legal)
- Protección de Datos (privacidad_datos_salud, proteccion_datos)
- Contractual (incumplimiento_contractual, disputas_clientes)
- Laboral (riesgos_laborales, accidentes_trabajo)
- Regulatorio (incumplimiento_regulatorio)
- Seguridad de la Información (ciberseguridad)
- Propiedad Intelectual
- Financiero (fraude_financiero)
- Operacional (responsabilidad_producto)
- Responsabilidad Civil (daños_terceros)

**Nueva lógica en el POST handler:**

```typescript
// Después de crear el assessment:

// 1. Crear RiskRegister
const riskRegister = await prisma.riskRegister.create({
  data: {
    userId: session.user.id,
    profileId: profileId,
    profileType: profileType,
    title: `Registro de Riesgos - ${profession || businessType}`,
    description: 'Registro inicial de riesgos identificados durante el onboarding',
    jurisdiction: jurisdiction || 'AR',
    status: 'ACTIVE',
    lastReviewedAt: new Date(),
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
  },
});

// 2. Obtener detalles de cada RiskArea seleccionado
const riskAreas = await prisma.riskArea.findMany({
  where: {
    code: { in: riskExposure },
    isActive: true,
  },
});

// 3. Crear RiskEvent por cada área de riesgo
for (const riskArea of riskAreas) {
  const { likelihood, impact } = mapSeverityToRisk(riskArea.severity);
  const inherentRisk = likelihood * impact;
  const priority = calculatePriority(inherentRisk);

  await prisma.riskEvent.create({
    data: {
      registerId: riskRegister.id,
      title: riskArea.label,
      description: riskArea.description,
      category: getCategoryFromCode(riskArea.code),
      sourceType: 'WIZARD_ASSESSMENT',
      identifiedBy: session.user.name || session.user.email,
      likelihood,
      impact,
      inherentRisk,
      priority,
      status: 'IDENTIFIED',
      triggers: [],
      consequences: riskArea.examples || [],
      affectedAssets: [],
    },
  });
}
```

---

## 📋 Datos Creados por el Wizard

### Ejemplo: Médico Cardiólogo

**Step 0:** profileType = PROFESSIONAL
**Step 1:** profession = DOCTOR, specialty = "Cardiología"
**Step 2:** riskExposure = ["mala_praxis_medica", "privacidad_datos_salud"]
**Step 3:** assessmentAnswers = {...}
**Step 4:** selectedProtocols = [...], riskScore = 45

**Datos creados:**

1. **ProfessionalProfile**
```json
{
  "id": "prof123",
  "userId": "user456",
  "profession": "DOCTOR",
  "specialty": "Cardiología",
  "jurisdiction": "AR"
}
```

2. **RiskAssessment**
```json
{
  "id": "assess789",
  "userId": "user456",
  "professionalProfileId": "prof123",
  "profileType": "PROFESSIONAL",
  "title": "Evaluación Inicial - 24/10/2025",
  "overallRiskScore": 45,
  "recommendations": ["contratos_modelo", "politica_privacidad"]
}
```

3. **RiskRegister** ✅ NUEVO
```json
{
  "id": "reg001",
  "userId": "user456",
  "profileId": "prof123",
  "profileType": "PROFESSIONAL",
  "title": "Registro de Riesgos - DOCTOR",
  "description": "Registro inicial de riesgos identificados durante el onboarding",
  "jurisdiction": "AR",
  "status": "ACTIVE",
  "lastReviewedAt": "2025-10-24",
  "nextReviewDate": "2026-01-22"
}
```

4. **RiskEvent #1** ✅ NUEVO
```json
{
  "id": "risk001",
  "registerId": "reg001",
  "title": "Responsabilidad profesional (mala praxis médica)",
  "description": "Demandas por errores en diagnóstico, tratamiento...",
  "category": "Responsabilidad Profesional",
  "sourceType": "WIZARD_ASSESSMENT",
  "identifiedBy": "Dr. Juan Pérez",
  "likelihood": "POSSIBLE",
  "impact": "MAJOR",
  "inherentRisk": 12,
  "priority": "HIGH",
  "status": "IDENTIFIED",
  "consequences": [
    "Error de diagnóstico",
    "Complicaciones quirúrgicas",
    "Infecciones nosocomiales"
  ]
}
```

5. **RiskEvent #2** ✅ NUEVO
```json
{
  "id": "risk002",
  "registerId": "reg001",
  "title": "Privacidad de datos de salud (LGPD)",
  "description": "Violaciones de privacidad en historias clínicas...",
  "category": "Protección de Datos",
  "sourceType": "WIZARD_ASSESSMENT",
  "identifiedBy": "Dr. Juan Pérez",
  "likelihood": "POSSIBLE",
  "impact": "MAJOR",
  "inherentRisk": 12,
  "priority": "HIGH",
  "status": "IDENTIFIED",
  "consequences": [
    "Filtración de datos sensibles",
    "Multas LGPD/GDPR",
    "Pérdida de confianza"
  ]
}
```

---

## 📊 Dashboard con Datos Reales

**El Dashboard ahora muestra:**

### Stats Grid
- **Nivel de Riesgo Promedio:** ALTO (12/25)
- **Riesgos Identificados:** 2 (2 altos)
- **Controles:** 0 (0% implementados)
- **Reducción de Riesgo:** 0%

### Riesgos Prioritarios
1. Responsabilidad profesional (mala praxis médica) - ALTO
2. Privacidad de datos de salud (LGPD) - ALTO

### Resumen por Prioridad
- Críticos: 0
- Altos: 2
- Medios: 0
- Bajos: 0

### Perfil
- Tipo: Profesional
- Profesión: DOCTOR
- Especialidad: Cardiología
- Jurisdicción: AR

---

## 🧪 Testing

### Test Manual

1. **Limpiar datos de usuario existente:**
```sql
DELETE FROM "RiskEvent" WHERE "registerId" IN (
  SELECT id FROM "RiskRegister" WHERE "userId" = 'user_id_aqui'
);
DELETE FROM "RiskRegister" WHERE "userId" = 'user_id_aqui';
DELETE FROM "RiskAssessment" WHERE "userId" = 'user_id_aqui';
DELETE FROM "ProfessionalProfile" WHERE "userId" = 'user_id_aqui';
DELETE FROM "BusinessProfile" WHERE "userId" = 'user_id_aqui';
UPDATE "User" SET "profileType" = NULL WHERE id = 'user_id_aqui';
```

2. **Completar wizard como profesional:**
   - Step 0: Seleccionar "Profesional Independiente"
   - Step 1: Seleccionar "Médico" + especialidad
   - Step 2: Seleccionar al menos 2 áreas de riesgo
   - Step 3: Completar evaluación
   - Step 4: Seleccionar protocolos → **Completar**

3. **Verificar en Dashboard:**
   - ✅ Stats grid muestra números reales (no "0")
   - ✅ Riesgos prioritarios listados
   - ✅ Resumen por prioridad muestra datos
   - ✅ Perfil del usuario correcto

4. **Verificar en Base de Datos:**
```sql
-- Ver RiskRegister creado
SELECT * FROM "RiskRegister" WHERE "userId" = 'user_id';

-- Ver RiskEvents creados
SELECT
  id, title, category, priority, "inherentRisk", status
FROM "RiskEvent"
WHERE "registerId" = (
  SELECT id FROM "RiskRegister" WHERE "userId" = 'user_id'
);
```

### Test con Empresa

1. Completar wizard como empresa:
   - Step 0: Seleccionar "Empresa/Organización"
   - Step 1: Seleccionar tipo de negocio (ej: "E-Commerce")
   - Step 2: Seleccionar áreas de riesgo del negocio
   - Step 3-4: Completar

2. Verificar que se crea BusinessProfile y RiskEvents correspondientes

---

## 🔍 Validaciones

### En el endpoint `/api/wizard/complete`:

✅ Verifica que `riskExposure` sea un array válido
✅ Filtra solo RiskAreas activas de la base de datos
✅ Mapea correctamente severity → likelihood + impact
✅ Calcula inherentRisk = likelihood × impact (1-25)
✅ Asigna priority según ranges (LOW, MEDIUM, HIGH, CRITICAL)
✅ Asocia category desde el código del riesgo
✅ Guarda consequences desde examples del RiskArea

### En el Dashboard:

✅ Maneja caso sin RiskRegister (hasRegister: false)
✅ Calcula promedios de inherentRisk
✅ Cuenta riesgos por prioridad
✅ Muestra top 5 riesgos prioritarios
✅ Calcula tasa de implementación de controles

---

## 📝 Próximos Pasos

### Sprint 2 Completado:
- [x] API `/api/dashboard/overview` funcional
- [x] Dashboard consumiendo datos reales
- [x] Wizard crea RiskRegister + RiskEvents
- [x] Flujo wizard → dashboard con datos reales

### Sprint 3: Navegación (Próximo)
- [ ] DashboardLayout con sidebar
- [ ] Rutas `/dashboard/protocols`, `/dashboard/scenarios`, `/dashboard/reports`
- [ ] Vistas de listado y detalle

### Sprint 4: Controles (Futuro)
- [ ] Crear RiskControls desde protocolos
- [ ] Implementar estrategias de tratamiento
- [ ] Calcular residualRisk con controles

---

## 🐛 Troubleshooting

### Dashboard muestra "Sin datos aún"

**Causa:** El usuario no tiene RiskRegister o RiskEvents

**Solución:**
1. Verificar en DB si existe RiskRegister con status='ACTIVE'
2. Verificar si se crearon RiskEvents para ese registro
3. Re-hacer el wizard completo (borrar perfil primero)

### Error "RiskArea not found"

**Causa:** Los códigos de riskExposure no coinciden con códigos en tabla RiskArea

**Solución:**
1. Verificar que se ejecutó el seed de wizard data: `prisma/seed-wizard-data.ts`
2. Verificar que los códigos en Step2Activities coinciden con los de la DB

### Inherent Risk siempre es 9

**Causa:** Todos los RiskAreas tienen severity='MEDIUM' por defecto

**Solución:**
1. Actualizar seed para incluir severity correctos (HIGH, CRITICAL)
2. O modificar manualmente en DB:
```sql
UPDATE "RiskArea"
SET severity = 'HIGH'
WHERE code IN ('mala_praxis_medica', 'ciberseguridad');
```

---

**Última Actualización:** 2025-10-24
**Autor:** System
**Status:** ✅ PRODUCCIÓN

🎉 **Wizard → Dashboard integration completamente funcional** 🎉
