# ARQUITECTURA DE RISK MANAGEMENT - Legal Risk Platform

## METODOLOGÍA: ISO 31000 / Carl Pritchard

### Proceso de Risk Management (Ciclo Completo)

```
1. ESTABLISH CONTEXT (Contexto)
   → Define scope, objectives, criteria

2. RISK IDENTIFICATION (Identificación)
   → Identify sources, events, causes, consequences
   → Output: Risk Register

3. RISK ANALYSIS (Análisis)
   → Assess likelihood (probability)
   → Assess impact (consequence/severity)
   → Calculate risk rating (likelihood × impact)
   → Output: Risk Matrix 5x5

4. RISK EVALUATION (Evaluación)
   → Compare against risk criteria
   → Prioritize risks
   → Determine acceptable vs unacceptable risks

5. RISK TREATMENT (Tratamiento)
   → Select treatment options:
     • AVOID (Evitar)
     • REDUCE/MITIGATE (Reducir/Mitigar) ← Controls
     • TRANSFER (Transferir)
     • ACCEPT (Aceptar)
   → Develop treatment plans
   → Assign controls

6. MONITORING & REVIEW (Monitoreo y Revisión)
   → Track control implementation
   → Measure effectiveness
   → Review and update risk register
   → Continuous improvement

7. COMMUNICATION & CONSULTATION (Comunicación)
   → Stakeholder engagement
   → Reporting
   → Documentation
```

---

## ARQUITECTURA DE DATOS (REDISEÑADA)

### Cambios Principales vs Schema Actual

**ANTES (Schema actual):**
- RiskScenario (catálogo estático)
- Protocol (controles genéricos)
- Assessment (cuestionario básico)

**DESPUÉS (Risk Management completo):**
- **Risk Register** (registro vivo de riesgos del usuario)
- **Risk Events** (eventos identificados)
- **Controls** (controles específicos)
- **Treatment Plans** (planes de tratamiento)
- **Risk Reviews** (monitoreo continuo)

---

## NUEVO SCHEMA PRISMA

```prisma
// ============================================================================
// RISK MANAGEMENT CORE
// ============================================================================

// 1. RISK REGISTER (Central hub)
model RiskRegister {
  id              String   @id @default(cuid())
  userId          String
  profileId       String   // ProfessionalProfile o BusinessProfile
  profileType     ProfileType

  // Metadata
  title           String   // "Registro de Riesgos - Mi Consultorio"
  description     String?
  jurisdiction    String

  // Status
  status          RegisterStatus @default(ACTIVE)
  lastReviewedAt  DateTime?
  nextReviewDate  DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User @relation(...)
  riskEvents      RiskEvent[]
  riskReviews     RiskReview[]

  @@index([userId, status])
}

enum RegisterStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

// 2. RISK EVENT (Riesgo identificado específico)
model RiskEvent {
  id                String   @id @default(cuid())
  registerId        String

  // Identificación
  title             String   // "Demanda por mala praxis"
  description       String
  category          String   // Laboral, Contractual, Regulatorio, etc.

  // Source
  sourceType        RiskSourceType
  scenarioId        String?  // Si proviene de RiskScenario del catálogo
  identifiedBy      String   // User name or "System"

  // Analysis (Likelihood × Impact)
  likelihood        RiskLikelihood
  impact            RiskImpact
  inherentRisk      Int      // likelihood × impact (1-25)

  // Treatment
  treatmentStrategy RiskTreatmentStrategy
  residualLikelihood RiskLikelihood?
  residualImpact     RiskImpact?
  residualRisk       Int?    // After controls

  // Context
  triggers          String[] // Eventos que disparan el riesgo
  consequences      String[] // Consecuencias potenciales
  affectedAssets    String[] // Qué está en riesgo

  // Status
  status            RiskEventStatus @default(IDENTIFIED)
  priority          RiskPriority
  owner             String?  // Responsable del riesgo

  // Dates
  identifiedAt      DateTime @default(now())
  targetResolutionDate DateTime?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  register          RiskRegister @relation(...)
  scenario          RiskScenario? @relation(...)
  controls          RiskControl[]
  treatmentPlan     TreatmentPlan?

  @@index([registerId, status])
  @@index([priority])
}

enum RiskSourceType {
  WIZARD_ASSESSMENT  // Del wizard inicial
  SCENARIO_LIBRARY   // Del catálogo de escenarios
  USER_IDENTIFIED    // Agregado manualmente
  AI_SUGGESTED       // Sugerido por DeepSeek
}

enum RiskLikelihood {
  RARE           // 1 - < 5% probability
  UNLIKELY       // 2 - 5-25%
  POSSIBLE       // 3 - 25-50%
  LIKELY         // 4 - 50-75%
  ALMOST_CERTAIN // 5 - > 75%
}

enum RiskImpact {
  INSIGNIFICANT  // 1
  MINOR          // 2
  MODERATE       // 3
  MAJOR          // 4
  CATASTROPHIC   // 5
}

enum RiskTreatmentStrategy {
  AVOID      // Evitar la actividad que genera el riesgo
  REDUCE     // Mitigar con controles
  TRANSFER   // Transferir (seguros, outsourcing)
  ACCEPT     // Aceptar el riesgo
}

enum RiskEventStatus {
  IDENTIFIED     // Identificado, no analizado
  ANALYZED       // Analizado (likelihood/impact)
  EVALUATED      // Evaluado y priorizado
  TREATING       // En tratamiento
  MONITORING     // Bajo monitoreo
  CLOSED         // Cerrado/mitigado
}

enum RiskPriority {
  CRITICAL   // Inherent risk 15-25
  HIGH       // Inherent risk 10-14
  MEDIUM     // Inherent risk 5-9
  LOW        // Inherent risk 1-4
}

// 3. RISK CONTROLS (Controles específicos)
model RiskControl {
  id              String   @id @default(cuid())
  riskEventId     String

  // Control details
  title           String
  description     String
  type            ControlType
  category        ControlCategory

  // Source
  protocolId      String?  // Si proviene de un Protocol del catálogo
  isCustom        Boolean  @default(false)

  // Effectiveness
  controlStrength ControlStrength

  // Implementation
  status          ControlStatus @default(PLANNED)
  owner           String?
  implementationDate DateTime?
  reviewFrequency ReviewFrequency?

  // Cost-benefit
  estimatedCost   Float?
  estimatedEffort String? // "Low", "Medium", "High"

  // Evidence
  evidence        Json?    // Documents, certifications, etc.

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  riskEvent       RiskEvent @relation(...)
  protocol        Protocol? @relation(...)
  reviews         ControlReview[]

  @@index([riskEventId, status])
}

enum ControlType {
  PREVENTIVE    // Previene que ocurra
  DETECTIVE     // Detecta cuando ocurre
  CORRECTIVE    // Corrige después de que ocurre
  DIRECTIVE     // Dirige comportamiento
}

enum ControlCategory {
  ADMINISTRATIVE  // Políticas, procedimientos
  TECHNICAL       // Software, sistemas
  PHYSICAL        // Infraestructura física
  LEGAL           // Contratos, seguros
}

enum ControlStrength {
  WEAK      // Reduce riesgo 1 nivel
  MODERATE  // Reduce riesgo 2 niveles
  STRONG    // Reduce riesgo 3+ niveles
}

enum ControlStatus {
  PLANNED       // Planificado
  IN_PROGRESS   // En implementación
  IMPLEMENTED   // Implementado
  OPERATIONAL   // Operacional y efectivo
  INEFFECTIVE   // No está funcionando
  DEACTIVATED   // Desactivado
}

enum ReviewFrequency {
  WEEKLY
  MONTHLY
  QUARTERLY
  SEMIANNUALLY
  ANNUALLY
}

// 4. TREATMENT PLAN (Plan de tratamiento)
model TreatmentPlan {
  id              String   @id @default(cuid())
  riskEventId     String   @unique

  // Strategy
  strategy        RiskTreatmentStrategy
  justification   String?

  // Implementation
  actions         Json     // Array of actions with deadlines
  totalBudget     Float?
  timeline        String?  // "3 months", "6 months"

  // Targets
  targetLikelihood RiskLikelihood?
  targetImpact     RiskImpact?
  targetRisk       Int?

  // Tracking
  status          TreatmentStatus @default(DRAFT)
  progress        Int      @default(0) // 0-100

  approvedBy      String?
  approvedAt      DateTime?
  startedAt       DateTime?
  completedAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  riskEvent       RiskEvent @relation(...)

  @@index([status])
}

enum TreatmentStatus {
  DRAFT
  APPROVED
  IN_PROGRESS
  COMPLETED
  ON_HOLD
  CANCELLED
}

// 5. CONTROL REVIEW (Revisión de controles)
model ControlReview {
  id              String   @id @default(cuid())
  controlId       String

  // Review details
  reviewDate      DateTime
  reviewer        String

  // Assessment
  isEffective     Boolean
  effectiveness   Int?     // 0-100 score
  findings        String?
  recommendations String?

  // Evidence
  evidence        Json?

  // Next review
  nextReviewDate  DateTime?

  createdAt       DateTime @default(now())

  control         RiskControl @relation(...)

  @@index([controlId, reviewDate])
}

// 6. RISK REVIEW (Revisión del registro)
model RiskReview {
  id              String   @id @default(cuid())
  registerId      String

  reviewDate      DateTime
  reviewer        String

  // Summary
  totalRisks      Int
  criticalRisks   Int
  highRisks       Int
  averageRisk     Float

  // Changes
  newRisks        Int      // Riesgos nuevos desde última revisión
  closedRisks     Int

  // Findings
  findings        String?
  actionItems     Json?

  // Next review
  nextReviewDate  DateTime

  createdAt       DateTime @default(now())

  register        RiskRegister @relation(...)

  @@index([registerId, reviewDate])
}

// ============================================================================
// ACTUALIZACIONES A MODELOS EXISTENTES
// ============================================================================

// User: Agregar profileType
model User {
  // ... campos existentes
  profileType         ProfileType?
  professionalProfile ProfessionalProfile?
  businessProfile     BusinessProfile?
  riskRegisters       RiskRegister[]
}

enum ProfileType {
  PROFESSIONAL
  BUSINESS
}

// ProfessionalProfile: Nuevo modelo
model ProfessionalProfile {
  id              String   @id @default(cuid())
  userId          String   @unique

  // Professional info
  profession      Profession
  specialty       String?
  licenseNumber   String?
  yearsExperience Int?
  jurisdiction    String

  // Practice details
  practiceAreas   String[] // "Derecho Civil", "Derecho Laboral"
  clientTypes     String[] // "Individuos", "PyMEs", "Corporaciones"
  workEnvironment WorkEnvironment

  // Risk context
  professionalInsurance Boolean @default(false)
  insuranceCoverage     Float?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User @relation(...)
  riskAssessments RiskAssessment[]
}

enum Profession {
  LAWYER
  DOCTOR
  DENTIST
  ARCHITECT
  ENGINEER
  ACCOUNTANT
  CONSULTANT
  NOTARY
  PSYCHOLOGIST
  OTHER
}

enum WorkEnvironment {
  SOLO_PRACTICE      // Consultorio/estudio unipersonal
  SHARED_OFFICE      // Oficina compartida
  SMALL_PARTNERSHIP  // Sociedad pequeña (2-5)
  MEDIUM_FIRM        // Estudio mediano (6-20)
  LARGE_FIRM         // Estudio grande (20+)
}

// BusinessProfile: Actualizar
model BusinessProfile {
  // ... campos existentes
  profileType     ProfileType @default(BUSINESS)
}

// RiskScenario: Actualizar (se mantiene como catálogo)
model RiskScenario {
  // ... campos existentes
  riskEvents      RiskEvent[] // Link a eventos creados desde este escenario
}

// Protocol: Actualizar (se mantiene como catálogo de controles)
model Protocol {
  // ... campos existentes
  riskControls    RiskControl[] // Link a controles implementados
}
```

---

## FLUJO COMPLETO DE LA PLATAFORMA

### FASE 1: ONBOARDING (Wizard)

**Step 0: Profile Selection (NUEVO)**
```
"¿Qué describe mejor tu situación?"

○ Soy un profesional independiente
  (Abogado, médico, arquitecto, consultor, etc.)

○ Represento una empresa u organización
  (Estudio, clínica, constructora, consultora, etc.)
```

**Step 1: Profile Info**
- Si PROFESSIONAL → ProfessionalProfile
- Si BUSINESS → BusinessProfile

**Step 2-4: Assessment** (mantener actual)

**Output del Wizard:**
- Crear `RiskRegister` (registro inicial)
- Crear `RiskEvent[]` basado en assessment
- Calcular inherent risk para cada evento
- Sugerir controles desde catálogo
- Redirigir a dashboard

---

### FASE 2: DASHBOARD (Risk Overview)

**Vista Principal:**
```
+------------------------------------------+
| Risk Register: Mi Consultorio Jurídico  |
| Status: ACTIVE | Last Review: 2025-10-20|
+------------------------------------------+

RISK SUMMARY
┌────────────────────────────────────────┐
│ Total Risks: 12                        │
│ • Critical: 2  • High: 4               │
│ • Medium: 5    • Low: 1                │
│                                        │
│ Average Inherent Risk: 15.3            │
│ Average Residual Risk: 8.2             │
│ Risk Reduction: 46%                    │
└────────────────────────────────────────┘

RISK MATRIX (Likelihood × Impact)
[Matriz 5x5 visual con posiciones]

TOP PRIORITY RISKS
1. [CRITICAL] Demanda por mala praxis
   Inherent: 20 | Residual: 12
   Treatment: 3/5 controls implemented

2. [HIGH] Violación confidencialidad
   Inherent: 16 | Residual: 8
   Treatment: Plan approved, pending
```

---

### FASE 3: MÓDULOS INTERNOS

#### MÓDULO 1: RISK IDENTIFICATION
```
/dashboard/risks/identify

- Agregar riesgo manual
- Sugerir desde biblioteca de escenarios
- AI-assisted identification (DeepSeek)
- Import from template
```

#### MÓDULO 2: RISK ANALYSIS
```
/dashboard/risks/[id]/analyze

- Assess Likelihood (slider 1-5)
- Assess Impact (slider 1-5)
- Calculate Inherent Risk (auto)
- Define triggers & consequences
- Assign risk owner
- Set priority
```

#### MÓDULO 3: RISK TREATMENT
```
/dashboard/risks/[id]/treatment

- Select strategy: Avoid/Reduce/Transfer/Accept
- Add controls:
  • From protocol library
  • Create custom control
  • AI-suggested controls
- Define treatment plan
- Set timeline & budget
- Assign responsibilities
```

#### MÓDULO 4: CONTROLS MANAGEMENT
```
/dashboard/controls

- List all controls
- Filter: by risk, status, type, owner
- Control details:
  • Implementation status
  • Effectiveness score
  • Last review date
  • Evidence attached
- Review control (mark as reviewed)
```

#### MÓDULO 5: RISK MONITORING
```
/dashboard/monitoring

- Active risk events list
- Control effectiveness dashboard
- Treatment plan progress
- Upcoming reviews calendar
- Alerts & notifications
```

#### MÓDULO 6: REPORTING
```
/dashboard/reports

- Risk Register Report (PDF)
- Treatment Plan Report
- Control Effectiveness Report
- Executive Summary
- Compliance Report
- Timeline visualization
```

---

## INTEGRACIÓN CON DEEPSEEK AI

### Actualizar Legal Data Generator

**Nuevo output structure:**
```json
{
  "riskScenarios": [
    {
      "title": "...",
      "category": "...",
      "likelihood": "POSSIBLE",
      "impact": "MAJOR",
      "triggers": [...],
      "consequences": [...],
      "recommendedControls": [
        {
          "title": "...",
          "type": "PREVENTIVE",
          "category": "ADMINISTRATIVE",
          "strength": "MODERATE"
        }
      ]
    }
  ],
  "controlLibrary": [...],
  "treatmentTemplates": [...]
}
```

---

## ROADMAP ACTUALIZADO

### SPRINT 1: DUAL PERSONA + RISK REGISTER FOUNDATION (3-4 días)
- [ ] Actualizar schema Prisma con nuevos modelos
- [ ] Migrar datos existentes
- [ ] Wizard Step 0: Profile selection
- [ ] Crear ProfessionalProfile form
- [ ] API: crear RiskRegister al completar wizard
- [ ] Dashboard: mostrar risk summary básico

### SPRINT 2: RISK IDENTIFICATION & ANALYSIS (3-4 días)
- [ ] Módulo: Identificar riesgos
- [ ] Módulo: Analizar riesgos (likelihood/impact)
- [ ] Matriz 5x5 interactiva
- [ ] APIs: CRUD RiskEvent
- [ ] UI: forms y visualizaciones

### SPRINT 3: RISK TREATMENT & CONTROLS (4-5 días)
- [ ] Módulo: Treatment planning
- [ ] Control library browser
- [ ] Add controls to risk events
- [ ] Calculate residual risk
- [ ] APIs: CRUD RiskControl, TreatmentPlan

### SPRINT 4: MONITORING & REVIEW (3-4 días)
- [ ] Control review workflow
- [ ] Risk register review
- [ ] Effectiveness tracking
- [ ] Calendar de revisiones
- [ ] Notifications system

### SPRINT 5: REPORTING & ANALYTICS (3-4 días)
- [ ] PDF generation
- [ ] Risk dashboards
- [ ] Charts y visualizaciones
- [ ] Export functionality

### SPRINT 6: AI ENHANCEMENTS (3-4 días)
- [ ] Actualizar DeepSeek generator
- [ ] AI-suggested risks
- [ ] AI-recommended controls
- [ ] Custom protocol generation

### SPRINT 7: INTEGRATION & POLISH (2-3 días)
- [ ] Link to laws-crm
- [ ] Link to legal-marketplace
- [ ] SEO y landing page
- [ ] Onboarding flows refinement

---

## NOTAS IMPORTANTES

### Plataforma Gratuita
- Remover todas las referencias a suscripciones
- Focus en tráfico y efectos de red
- Monetización vía ecosystem (CRM, Marketplace)

### Integration Strategy
- **laws-crm**: Exportar contactos de clientes identificados en riesgos
- **legal-marketplace**: Conectar con abogados/expertos para implementar controles
- **risk-analysis**: Hub central, referrer principal

### Network Effects
- Protocolos públicos verificados
- Community contributions
- Best practices sharing
- Casos de éxito documentados

---

**PRÓXIMO PASO:**
¿Aprobamos esta arquitectura y comenzamos con Sprint 1?
