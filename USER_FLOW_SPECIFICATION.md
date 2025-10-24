# User Flow Specification - Legal Risk Management Platform

**Fecha:** 2025-10-24
**Estado:** ✅ DOCUMENTACIÓN OFICIAL
**Propósito:** Definir el flujo de usuario desde onboarding hasta uso regular

---

## 🎯 Flujos de Usuario

### 1. **Primera Visita - Usuario NO Registrado**

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario visita la aplicación por primera vez              │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
         ┌──────────────┐
         │   Landing    │
         │     Page     │
         └──────┬───────┘
                │
                │ Click "Comenzar Evaluación"
                ▼
         ┌──────────────┐
         │   Wizard     │ ← ONBOARDING (Sin autenticación)
         │   Steps 0-4  │
         └──────┬───────┘
                │
                │ Completar Wizard
                ▼
       ┌─────────────────┐
       │ POST /api/wizard│
       │    /complete    │
       └────────┬────────┘
                │
                │ No hay session.user.id
                ▼
       ┌─────────────────┐
       │ Guardar en      │
       │ localStorage    │
       │ wizardData      │
       └────────┬────────┘
                │
                │ Redirigir a /auth/signup
                ▼
         ┌──────────────┐
         │   Signup     │
         │   Page       │
         └──────┬───────┘
                │
                │ Crear cuenta
                ▼
       ┌─────────────────┐
       │ User creado     │
       │ + Session activa│
       └────────┬────────┘
                │
                │ Recuperar wizardData de localStorage
                │ POST /api/wizard/complete con session
                ▼
       ┌─────────────────┐
       │ Crear:          │
       │ - Profile       │
       │ - RiskAssessment│
       │ - Update User   │
       └────────┬────────┘
                │
                │ Redirigir a /dashboard
                ▼
         ┌──────────────┐
         │  Dashboard   │ ← Usuario listo para usar la app
         └──────────────┘
```

---

### 2. **Usuario Registrado - Wizard Ya Completado**

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario ya tiene cuenta y completó el wizard              │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
         ┌──────────────┐
         │   Login      │
         │   Page       │
         └──────┬───────┘
                │
                │ Autenticarse
                ▼
       ┌─────────────────┐
       │ Session activa  │
       │ User.profileType│
       │ existe          │
       └────────┬────────┘
                │
                │ Redirigir a /dashboard directamente
                ▼
         ┌──────────────┐
         │  Dashboard   │ ← Acceso directo sin wizard
         └──────┬───────┘
                │
                │ Usuario puede:
                ▼
       ┌─────────────────┐
       │ - Ver riesgos   │
       │ - Gestionar     │
       │ - Editar perfil │ ← Puede modificar datos más tarde
       └─────────────────┘
```

---

### 3. **Usuario Intenta Re-Hacer el Wizard**

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario autenticado intenta acceder a /wizard             │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
       ┌─────────────────┐
       │ Verificar si    │
       │ tiene Profile   │
       └────────┬────────┘
                │
         ┌──────┴──────┐
         │             │
    ✅ Tiene      ❌ No tiene
    Profile       Profile
         │             │
         ▼             ▼
  ┌──────────┐   ┌──────────┐
  │ Redirect │   │ Permitir │
  │ Dashboard│   │  Wizard  │
  └──────────┘   └──────────┘
         │             │
         │ Ya completó │ Primera vez
         ▼             ▼
  Mensaje:        Completar
  "Ya has         normalmente
  completado
  el wizard"
```

---

## 📋 Reglas de Negocio

### ✅ Perfil Único por Usuario

```typescript
// Schema constraint
model ProfessionalProfile {
  userId String @unique  // ← Solo UN perfil profesional por usuario
}

model BusinessProfile {
  userId String @unique  // ← Solo UN perfil de negocio por usuario
}
```

**Implicación:**
- Un usuario NO puede tener ambos tipos de perfil
- Un usuario NO puede crear múltiples perfiles del mismo tipo
- Si intenta re-hacer el wizard estando autenticado → Detectar perfil existente → Redirigir al dashboard

---

### ✅ Edición de Perfil Post-Wizard

**Ubicación:** `/dashboard/settings` o `/dashboard/profile/edit`

El usuario **PUEDE** editar su perfil más adelante:

```typescript
// API Endpoint: PUT /api/profile
// Permite actualizar:
// - ProfessionalProfile: specialty, yearsExperience, workEnvironment, etc.
// - BusinessProfile: companySize, revenueRange, businessActivities, etc.

// NO permite cambiar:
// - userId (inmutable)
// - profileType (requiere crear nuevo usuario)
```

**Funcionalidades de Edición:**
1. ✅ Actualizar especialidad / industria
2. ✅ Cambiar años de experiencia / tamaño de empresa
3. ✅ Modificar actividades y áreas de riesgo
4. ✅ Actualizar jurisdicción
5. ❌ NO cambiar de Professional a Business (requiere nuevo usuario)

---

## 🔐 Middleware de Protección

### Dashboard Access

```typescript
// middleware.ts o layout guard

if (pathname.startsWith('/dashboard')) {
  if (!session) {
    redirect('/auth/login');
  }

  if (!user.profileType) {
    // Usuario autenticado pero sin perfil
    redirect('/wizard');
  }

  // ✅ Usuario autenticado + con perfil → Permitir acceso
}
```

### Wizard Access

```typescript
if (pathname === '/wizard') {
  if (session && user.profileType) {
    // Usuario ya completó wizard
    redirect('/dashboard');
  }

  // ✅ Permitir acceso si:
  // - No autenticado (primera visita)
  // - Autenticado pero sin perfil (edge case)
}
```

---

## 🗄️ Estado de Datos del Wizard

### Antes de Autenticación

```javascript
// localStorage
{
  "wizardData": {
    "profileType": "PROFESSIONAL",
    "profession": "DOCTOR",
    "specialty": "Cardiología",
    "jurisdiction": "AR",
    "businessActivities": ["atencion_pacientes", "cirugias_procedimientos"],
    "riskExposure": ["mala_praxis_medica", "privacidad_datos_salud"],
    "assessmentAnswers": { /* ... */ },
    "selectedProtocols": ["contratos_modelo", "politica_privacidad"],
    "riskScore": 45
  }
}
```

### Después de Autenticación

```sql
-- Base de Datos

-- User
id: "user123"
email: "medico@example.com"
profileType: "PROFESSIONAL"

-- ProfessionalProfile
id: "prof456"
userId: "user123"
profession: "DOCTOR"
specialty: "Cardiología"
jurisdiction: "AR"

-- RiskAssessment
id: "assess789"
userId: "user123"
professionalProfileId: "prof456"
profileType: "PROFESSIONAL"
overallRiskScore: 45
recommendations: ["contratos_modelo", "politica_privacidad"]
```

**Limpieza:**
```javascript
// Después de crear el perfil exitosamente
localStorage.removeItem('wizardData');
```

---

## 🔄 Ciclo de Vida del Usuario

```
1️⃣ ONBOARDING (Primera vez)
   └─ Wizard (sin auth) → Signup → Crear Profile → Dashboard

2️⃣ USO REGULAR (Logins subsecuentes)
   └─ Login → Dashboard (directo)

3️⃣ EDICIÓN DE PERFIL (Opcional)
   └─ Dashboard → Settings → Edit Profile → Save

4️⃣ RE-EVALUACIÓN (Futuro - Sprint 2)
   └─ Dashboard → "Nueva Evaluación" → Crear RiskAssessment adicional
   └─ NO crea nuevo perfil, solo nueva evaluación sobre perfil existente
```

---

## 🎨 UX Considerations

### Mensajes al Usuario

#### Si intenta re-hacer wizard con perfil existente:
```
┌────────────────────────────────────────────┐
│  ℹ️  Ya has completado tu perfil          │
│                                            │
│  Ya tienes un perfil creado como:         │
│  👨‍⚕️ Médico - Cardiología                  │
│                                            │
│  [Ir al Dashboard]  [Editar Perfil]       │
└────────────────────────────────────────────┘
```

#### En el Dashboard - Link a edición de perfil:
```
Navbar/Sidebar:
  📊 Dashboard
  🔍 Análisis de Riesgos
  📋 Protocolos
  ⚙️ Configuración
     └─ 👤 Mi Perfil  ← Editar datos del wizard
     └─ 🔐 Seguridad
     └─ 🔔 Notificaciones
```

---

## 📊 Validaciones en `/api/wizard/complete`

```typescript
export async function POST(req: NextRequest) {
  const session = await auth();
  const data = await req.json();

  // 1️⃣ Sin autenticación → Guardar en localStorage
  if (!session?.user?.id) {
    return NextResponse.json({
      success: true,
      requiresAuth: true,
      wizardData: data,
    });
  }

  // 2️⃣ Verificar perfil existente
  const existingProfile = await checkExistingProfile(session.user.id);

  if (existingProfile) {
    return NextResponse.json({
      success: true,
      alreadyCompleted: true,
      profileId: existingProfile.id,
      profileType: existingProfile.type,
      message: 'Ya has completado el wizard',
    });
  }

  // 3️⃣ Crear perfil nuevo
  const profile = await createProfile(data, session.user.id);

  // 4️⃣ Crear RiskAssessment
  const assessment = await createAssessment(profile, data);

  // 5️⃣ Update User.profileType
  await updateUserProfileType(session.user.id, data.profileType);

  return NextResponse.json({
    success: true,
    profileId: profile.id,
    assessmentId: assessment.id,
  });
}
```

---

## ✅ Checklist de Implementación

### Actual (Implementado)
- [x] Wizard funciona sin autenticación
- [x] Guardar datos en localStorage si no hay sesión
- [x] Crear perfil al registrarse con datos del wizard
- [x] Detectar perfil existente y prevenir duplicados
- [x] Redirigir al dashboard si usuario ya completó wizard
- [x] Dual Persona (Professional + Business) funcionando

### Pendiente (Próximos Sprints)
- [ ] Middleware para proteger /dashboard y /wizard
- [ ] Página de edición de perfil `/dashboard/settings/profile`
- [ ] API `PUT /api/profile` para editar perfil
- [ ] Botón "Editar Perfil" en dashboard
- [ ] Nueva evaluación de riesgo (sin crear nuevo perfil)
- [ ] Historial de evaluaciones en dashboard

---

## 📝 Notas de Implementación

### Estado Actual (2025-10-24)

✅ **Funcionando:**
- Wizard completo (Steps 0-4)
- Actividades y riesgos dinámicos por profesión/negocio
- Detección de perfil duplicado
- Creación de ProfessionalProfile y BusinessProfile
- RiskAssessment con campos separados (professionalProfileId/businessProfileId)

⚠️ **Pendiente:**
- Página de edición de perfil
- Middleware de protección de rutas
- Re-evaluaciones de riesgo sin duplicar perfil

---

**Última Actualización:** 2025-10-24
**Autor:** System
**Revisión:** Product Owner

🎉 **Flujo de onboarding completamente definido y funcional** 🎉
