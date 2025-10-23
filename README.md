# Legal Risk Management Platform

> Plataforma SaaS de gestión de riesgos legales con IA - Built with Next.js 14, PostgreSQL & Prisma

## 🎯 Visión General

Plataforma completa para la identificación, evaluación y gestión de riesgos legales en negocios. Utiliza IA (DeepSeek) para generar protocolos personalizados según industria, jurisdicción y perfil de riesgo.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v5
- **UI Components**: shadcn/ui, Lucide Icons
- **Forms**: React Hook Form + Zod validation
- **IA**: DeepSeek API (próximamente)

## 📦 Instalación

```bash
# Clonar e instalar dependencias
cd legal-analysis
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Configurar base de datos
npx prisma db push
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```

## 🗄️ Modelo de Datos

### Core Models

#### User & Authentication
- **User**: Usuarios del sistema (CLIENT, ADMIN, LEGAL_EXPERT)
- **Account**: Cuentas OAuth vinculadas
- **Session**: Sesiones de usuario
- **VerificationToken**: Tokens de verificación de email

#### Business Profile
- **BusinessProfile**: Perfil del negocio
  - businessType: Rubro/industria (16 opciones)
  - companySize: MICRO, SMALL, MEDIUM, LARGE, ENTERPRISE
  - jurisdiction: País/región
  - businessActivities: JSON flexible con actividades
  - riskExposure: JSON con áreas de exposición

#### Risk Management
- **RiskCategory**: Categorías de riesgo (Laboral, Contractual, Datos, etc.)
- **RiskScenario**: Escenarios de riesgo específicos
  - probability: VERY_LOW → VERY_HIGH (1-5)
  - impact: NEGLIGIBLE → CATASTROPHIC (1-5)
  - riskScore: probability × impact (1-25)
  - triggers: Eventos que disparan el riesgo
  - consequences: Impactos potenciales

#### Protocols
- **Protocol**: Protocolos de acción
  - type: SYSTEM (IA), COMMUNITY (compartidos), CUSTOM (usuario)
  - content: JSON con pasos/controles
  - Sistema de upvotes/downvotes
  - Validación por expertos (isVerified)

- **UserProtocol**: Protocolos asignados a usuarios
  - status: PENDING → COMPLETED
  - progress: 0-100%
  - customizations: Modificaciones del usuario

#### Assessments
- **RiskAssessment**: Evaluaciones de riesgo
  - overallRiskScore: Score total calculado
  - riskMatrix: Matriz 5x5 visual
  - recommendations: JSON con recomendaciones

- **AssessmentQuestion**: Preguntas del wizard
  - type: MULTIPLE_CHOICE, SCALE, TEXT, CHECKLIST, BOOLEAN
  - weight: Peso en cálculo de riesgo
  - businessTypes: Aplicabilidad por industria

- **AssessmentAnswer**: Respuestas del usuario

## 🎨 Features Implementadas

### ✅ Fase 1 MVP (COMPLETADO - Listo para uso!)

- [x] Setup Next.js 14 con TypeScript
- [x] Base de datos PostgreSQL con Prisma
- [x] Schema completo de datos (15 modelos)
- [x] Landing page profesional
- [x] Sistema de estilos con Tailwind CSS
- [x] Utilidades base (cn, formatters, risk calculators)
- [x] **Sistema de autenticación completo (NextAuth.js v5)**
  - Login con credenciales
  - Integración con Google OAuth (opcional)
  - Páginas de sign-in y sign-up
  - Protección de rutas
- [x] **Wizard de onboarding interactivo (4 pasos completos)**
  - Paso 1: Información básica del negocio
  - Paso 2: Actividades y áreas de riesgo
  - Paso 3: Evaluación de riesgos (7 preguntas)
  - Paso 4: Protocolos recomendados
  - Cálculo automático de risk score
- [x] **Dashboard básico de gestión de riesgos**
  - Vista general de riesgos
  - Protocolos asignados
  - Métricas y estadísticas
  - Próximos pasos sugeridos

### 🚧 Fase 2 - Próximos Pasos

- [ ] Matriz de riesgos visual (heat map 5x5)
- [ ] CRUD completo de protocolos
- [ ] Sistema de notificaciones
- [ ] Integración DeepSeek API
- [ ] Sistema comunitario de protocolos
- [ ] Gestión de equipo y permisos

## 📁 Estructura del Proyecto

```
legal-analysis/
├── prisma/
│   └── schema.prisma                    # Schema completo (15 modelos)
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── layout.tsx                   # Layout principal con SessionProvider
│   │   ├── page.tsx                     # Landing page
│   │   ├── providers.tsx                # SessionProvider wrapper
│   │   ├── auth/
│   │   │   ├── signin/page.tsx          # Página de login
│   │   │   └── signup/page.tsx          # Página de registro
│   │   ├── wizard/page.tsx              # Wizard de onboarding
│   │   ├── dashboard/page.tsx           # Dashboard principal
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │       │   └── signup/route.ts         # API de registro
│   │       └── wizard/
│   │           └── complete/route.ts       # API para guardar wizard
│   ├── components/
│   │   └── wizard/                      # Componentes del wizard
│   │       ├── Step1BusinessInfo.tsx
│   │       ├── Step2Activities.tsx
│   │       ├── Step3Assessment.tsx
│   │       └── Step4Protocols.tsx
│   ├── lib/
│   │   ├── prisma.ts                    # Cliente Prisma singleton
│   │   ├── auth.ts                      # Configuración NextAuth
│   │   └── utils.ts                     # Utilidades (cn, formatDate, etc.)
│   ├── types/
│   │   └── next-auth.d.ts               # Type extensions para NextAuth
│   └── styles/
│       └── globals.css                  # Estilos + tema claro/oscuro
├── .env                                 # Variables de entorno
├── .env.example                         # Template de variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npx prisma studio    # Admin de base de datos
npx prisma db push   # Aplicar cambios al schema
npx prisma generate  # Regenerar cliente Prisma
```

## 🎯 Roadmap

### Fase 2: Dashboard & Protocolos
- Dashboard interactivo de riesgos
- CRUD completo de protocolos
- Sistema de búsqueda y filtros
- Notificaciones y alertas

### Fase 3: IA & Comunidad
- Integración DeepSeek API
- Generación automática de protocolos
- Sistema de sharing comunitario
- Ratings y reviews
- Moderación de contenido

### Fase 4: Advanced Features
- Analytics avanzados
- Reportes PDF
- Mobile optimization
- Multi-idioma
- API pública

## 🎨 Diseño y Branding

El proyecto utiliza un sistema de diseño modular con Tailwind CSS que permite:

- **Fácil cambio de colores**: Variables CSS en `globals.css`
- **Tema claro/oscuro**: Soportado nativamente
- **Componentes reutilizables**: shadcn/ui architecture
- **Responsive design**: Mobile-first approach

### Personalización de Colores

Editar `src/styles/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Cambiar color primario */
  --secondary: 210 40% 96.1%;     /* Cambiar color secundario */
  /* ... más variables */
}
```

## 🔐 Seguridad

- Row Level Security en PostgreSQL (próximamente)
- Validación con Zod en frontend y backend
- Rate limiting para llamadas a IA
- Sanitización de inputs
- CSRF protection con NextAuth

## 📊 Base de Datos

### Configuración PostgreSQL

```bash
# Opción 1: PostgreSQL local
DATABASE_URL="postgresql://user:password@localhost:5432/legal_analysis"

# Opción 2: Neon (serverless)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/legal_analysis"

# Opción 3: Supabase
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Aplicar Schema

```bash
npx prisma db push     # Desarrollo
npx prisma migrate dev # Producción con migrations
```

## 🤝 Contribución

Este proyecto sigue las especificaciones de DeepSeek para arquitectura y diseño.
Todos los cambios deben mantener compatibilidad con el schema de datos definido.

## 📝 Notas del Desarrollador

- **Puerto**: El servidor corre en puerto 3003 (3000-3002 ocupados)
  - Acceso: http://localhost:3003
- **Node Version**: Recomendado >= 20.9.0 (Next.js 14 compatibility)
- **Database**: Requiere PostgreSQL 12+
  - Configurar DATABASE_URL en .env antes de iniciar
  - Ejecutar `npx prisma db push` para crear las tablas
- **Autenticación**: NextAuth.js v5 configurado con:
  - Credentials provider (email/password)
  - Google OAuth (opcional - requiere configurar GOOGLE_CLIENT_ID y SECRET)
  - Session strategy: JWT

## 🐛 Troubleshooting

### Puerto en uso
```bash
# Cambiar puerto en package.json
"dev": "next dev -p 3002"
```

### Error de Prisma Client
```bash
npx prisma generate
```

### Error de tipos TypeScript
```bash
rm -rf .next
npm run dev
```

---

## ✅ Estado Actual

**Versión**: 0.2.0 (MVP - Fase 1 COMPLETA + Autenticación + Wizard)
**Última actualización**: Octubre 2025
**Estado**: ✅ **Sistema funcional listo para pruebas**

### Flujo de usuario implementado:
1. Usuario accede a landing page (http://localhost:3003)
2. Hace clic en "Comenzar Gratis" → Registro
3. Completa wizard de onboarding (4 pasos)
4. Accede al dashboard con su perfil de riesgo
5. Puede revisar protocolos recomendados

### Listo para:
- Pruebas de usuario con base de datos PostgreSQL
- Desarrollo de Fase 2 (matriz de riesgos, CRUD protocolos)
- Integración con DeepSeek AI para generación de contenido
