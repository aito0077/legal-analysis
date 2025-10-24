# ROADMAP DE DESARROLLO - Legal Risk Management Platform

## ESTADO ACTUAL

### Completado ✅
- Autenticación (NextAuth v5)
- Wizard de onboarding (4 pasos)
- Base de datos con 16 modelos Prisma
- Generación de data legal con DeepSeek AI
- Data real: 15 categorías, 16 escenarios, 9 protocolos, 19 preguntas

### Problemas Identificados ❌
1. Dashboard es solo mockup (datos hardcodeados)
2. No hay navegación funcional después del wizard
3. Falta soporte para profesionales independientes (solo empresas)
4. No hay conexión entre wizard → dashboard → datos reales

---

## ARQUITECTURA: DUAL PERSONA

### Segmento 1: PROFESIONALES INDEPENDIENTES
**Target:** Abogados, médicos, arquitectos, consultores freelance

**Necesidades específicas:**
- Perfil profesional (matrícula, especialidad, años de experiencia)
- Gestión de riesgos de práctica individual
- Protocolos adaptados a práctica unipersonal
- Seguros profesionales y compliance personal

### Segmento 2: EMPRESAS/ORGANIZACIONES
**Target:** Estudios, clínicas, constructoras, consultoras

**Necesidades específicas:**
- Perfil empresarial (tamaño, facturación, jurisdicción)
- Gestión de riesgos organizacionales
- Protocolos para equipos
- Compliance corporativo

---

## SPRINT 1: DUAL PERSONA ARCHITECTURE (PRIORITARIO)

**Objetivo:** Adaptar el modelo de datos para soportar ambos segmentos

### Tasks:

#### 1.1 Actualizar Prisma Schema
```prisma
enum ProfileType {
  PROFESSIONAL  // Profesional independiente
  BUSINESS      // Empresa/Organización
}

model User {
  profileType ProfileType // Determina el flujo
  professionalProfile ProfessionalProfile?
  businessProfile     BusinessProfile?
}

model ProfessionalProfile {
  id              String   @id @default(cuid())
  userId          String   @unique

  // Información profesional
  profession      Profession
  specialty       String?
  licenseNumber   String?
  yearsExperience Int?
  jurisdiction    String

  // Práctica
  practiceAreas   String[]
  clientTypes     String[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User @relation(...)
  riskAssessments RiskAssessment[]
}

enum Profession {
  LAWYER
  DOCTOR
  ARCHITECT
  ENGINEER
  ACCOUNTANT
  CONSULTANT
  OTHER
}

// Mantener BusinessProfile actual pero agregar profileType
```

#### 1.2 Modificar Wizard Step 1
- Agregar selector inicial: "¿Eres profesional independiente o representas una empresa?"
- Crear `Step1ProfessionalInfo.tsx` (paralelo a `Step1BusinessInfo.tsx`)
- Enrutar según selección

#### 1.3 Actualizar APIs
- `/api/wizard/complete` → detectar profileType y crear el perfil correspondiente
- `/api/wizard/complete-after-signup` → mismo ajuste

**Entregables:**
- [ ] Schema actualizado con `ProfessionalProfile`
- [ ] Migración de Prisma
- [ ] Wizard adaptado con dual path
- [ ] APIs actualizadas

**Estimación:** 1-2 días

---

## SPRINT 2: DASHBOARD FUNCIONAL CON DATOS REALES

**Objetivo:** Conectar dashboard a datos reales del usuario

### Tasks:

#### 2.1 API para Dashboard Data
```typescript
// /api/dashboard/overview
GET → Retorna:
{
  user: { name, email, profileType },
  profile: ProfessionalProfile | BusinessProfile,
  assessment: {
    overallRiskScore,
    riskLevel: "Bajo" | "Medio" | "Alto",
    completedAt
  },
  protocols: {
    total: number,
    byStatus: { pending, inProgress, completed },
    topPriority: Protocol[]
  },
  scenarios: {
    total: number,
    byRiskLevel: { low, medium, high, critical }
  }
}
```

#### 2.2 Actualizar Dashboard Page
- Reemplazar datos hardcodeados con fetch a API
- Agregar loading states
- Error handling
- Mostrar datos reales del assessment

#### 2.3 Dashboard Components
Crear componentes reutilizables:
- `<RiskScoreCard />` - muestra score con barra de progreso
- `<ProtocolsList />` - lista de protocolos activos
- `<RiskMatrix />` - matriz visual 5x5
- `<NextSteps />` - recomendaciones personalizadas

**Entregables:**
- [ ] API `/api/dashboard/overview` completa
- [ ] Dashboard consumiendo datos reales
- [ ] Componentes reutilizables creados
- [ ] Loading/error states implementados

**Estimación:** 2-3 días

---

## SPRINT 3: NAVEGACIÓN Y VISTAS DE DETALLE

**Objetivo:** Permitir al usuario navegar y gestionar protocolos/riesgos

### Tasks:

#### 3.1 Layouts y Navegación
```
/dashboard
  /overview (página actual)
  /risk-assessment
  /protocols
    /[id]
  /scenarios
  /reports
  /settings
```

Crear:
- `<DashboardLayout />` con sidebar/navbar
- Menú de navegación
- Breadcrumbs

#### 3.2 Vista de Protocolos (/dashboard/protocols)
- Listar todos los protocolos asignados al usuario
- Filtros: status, priority, category
- Search bar
- Botón "Iniciar Protocolo"

#### 3.3 Vista Individual de Protocolo (/dashboard/protocols/[id])
- Mostrar contenido completo del protocolo
- Pasos con checkboxes
- Progress tracking
- Notas personales
- Botones: "Marcar como completado", "Archivar"

#### 3.4 Vista de Escenarios de Riesgo (/dashboard/scenarios)
- Matriz 5x5 interactiva
- Lista de escenarios filtrable
- Detalles: triggers, consecuencias, protocolos asociados

**Entregables:**
- [ ] Layout con navegación completa
- [ ] Vista de listado de protocolos
- [ ] Vista individual de protocolo
- [ ] Vista de escenarios de riesgo
- [ ] APIs necesarias para cada vista

**Estimación:** 3-4 días

---

## SPRINT 4: SISTEMA DE PROTOCOLOS INTERACTIVO

**Objetivo:** Permitir completar y trackear protocolos

### Tasks:

#### 4.1 APIs de Protocolos
```typescript
POST /api/protocols/[id]/start
  → Crea UserProtocol, cambia status a IN_PROGRESS

PATCH /api/protocols/[id]/progress
  → Actualiza progress (0-100)

POST /api/protocols/[id]/complete
  → Marca como completado, registra completedAt

PATCH /api/protocols/[id]/customize
  → Guarda customizations (JSON)
```

#### 4.2 UI de Implementación de Protocolos
- Wizard interno por cada protocolo
- Checklists interactivos
- Upload de documentos (opcional para v2)
- Recordatorios/deadlines

#### 4.3 Progress Tracking
- Barra de progreso por protocolo
- Dashboard overview actualizado en tiempo real
- Notificaciones de completitud

**Entregables:**
- [ ] APIs CRUD completas para UserProtocol
- [ ] UI interactiva de protocolos
- [ ] Sistema de tracking funcional

**Estimación:** 3-4 días

---

## SPRINT 5: GENERACIÓN DINÁMICA DE RECOMENDACIONES

**Objetivo:** Conectar assessment → protocolos recomendados

### Tasks:

#### 5.1 Algoritmo de Recomendación
```typescript
// Basado en:
- Respuestas del assessment
- Escenarios de riesgo aplicables
- businessType/profession
- jurisdiction

→ Retorna: Protocolos priorizados (crítico, alto, medio, bajo)
```

#### 5.2 Integración con DeepSeek AI
- Prompt para generar protocolos personalizados
- Guardar en base de datos como CUSTOM
- Asociar al usuario

#### 5.3 Dashboard: Sección "Recomendaciones"
- Mostrar protocolos sugeridos
- Botón "Agregar a Mi Plan"
- Explicación del por qué fue recomendado

**Entregables:**
- [ ] Motor de recomendaciones implementado
- [ ] Generación AI de protocolos custom
- [ ] UI de recomendaciones en dashboard

**Estimación:** 3-4 días

---

## SPRINT 6: REPORTS Y ANALYTICS

**Objetivo:** Permitir generar reportes de compliance

### Tasks:

#### 6.1 Generación de Reportes
- Reporte PDF de assessment completo
- Reporte de protocolos implementados
- Timeline de compliance
- Export a Excel/PDF

#### 6.2 Analytics Dashboard
- Gráficos de evolución de riesgo
- Protocolos completados vs pendientes
- Áreas de mayor exposición

#### 6.3 Comparativas (opcional)
- Benchmark con sector
- Indicadores de compliance

**Entregables:**
- [ ] Generación de PDFs
- [ ] Dashboard de analytics
- [ ] Exports funcionales

**Estimación:** 3-4 días

---

## SPRINT 7: COMMUNITY & SHARING

**Objetivo:** Sistema comunitario de protocolos

### Tasks:

#### 7.1 Marketplace de Protocolos
- Listar protocolos públicos
- Filtros por categoría, sector, jurisdicción
- Sistema de ratings (upvotes/downvotes)
- Botón "Usar este Protocolo"

#### 7.2 Compartir Protocolos
- Usuario puede hacer públicos sus protocolos custom
- Verificación por admins/expertos
- Badge "Verificado"

#### 7.3 Forks y Customización
- Hacer fork de protocolo público
- Personalizar y guardar como propio

**Entregables:**
- [ ] Marketplace UI completo
- [ ] Sistema de ratings
- [ ] Sistema de forks

**Estimación:** 4-5 días

---

## PRIORIZACIÓN INMEDIATA

### NEXT 7 DAYS (Critical Path)

**DÍA 1-2: SPRINT 1 - Dual Persona**
- Actualizar schema con `ProfessionalProfile`
- Modificar wizard con selector inicial
- Actualizar APIs de wizard

**DÍA 3-5: SPRINT 2 - Dashboard Funcional**
- API `/api/dashboard/overview`
- Conectar dashboard a datos reales
- Crear componentes core

**DÍA 6-7: SPRINT 3 (Inicio)**
- Layout con navegación
- Vista de protocolos (listado)

---

## TECH DEBT Y MEJORAS

### Corto Plazo
- [ ] Error boundaries en todas las páginas
- [ ] Loading skeletons consistentes
- [ ] Toast notifications system
- [ ] Formularios con validación Zod

### Medio Plazo
- [ ] Testing (Jest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Optimización de queries (React Query)
- [ ] Caching strategy

### Largo Plazo
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] API pública
- [ ] Integraciones (Zapier, Slack, etc.)

---

## STACK TÉCNICO

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons
- React Hook Form + Zod

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth v5

**AI:**
- DeepSeek Chat API
- Prompts estructurados

**Infrastructure:**
- Local dev: PostgreSQL
- Production: Vercel + Neon/Supabase

---

## MÉTRICAS DE ÉXITO

### MVP (Sprint 1-3)
- [ ] Usuario puede completar wizard (ambos perfiles)
- [ ] Dashboard muestra datos reales del assessment
- [ ] Usuario puede ver y navegar sus protocolos

### V1.0 (Sprint 1-5)
- [ ] Usuario puede implementar y completar protocolos
- [ ] Sistema de recomendaciones funcional
- [ ] Tracking de progreso en tiempo real

### V1.5 (Sprint 1-7)
- [ ] Reportes PDF generables
- [ ] Marketplace comunitario activo
- [ ] 100+ protocolos verificados en sistema

---

## PREGUNTAS ABIERTAS

1. **Prioridad:** ¿Comenzar con profesionales o empresas primero?
2. **Monetización:** ¿Freemium, suscripción, pago por reporte?
3. **Alcance geográfico:** ¿Solo Argentina o multi-país desde v1?
4. **Integraciones:** ¿Priorizar integraciones con software legal/contable?

---

**PRÓXIMO PASO INMEDIATO:**
Comenzar con Sprint 1 - actualizar schema para dual persona y modificar wizard.

¿Aprobamos este roadmap y comenzamos con Sprint 1?
