'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AISuggestionsPanel from '@/components/ai/AISuggestionsPanel';
import AIAssistantWidget from '@/components/ai/AIAssistantWidget';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  Loader2,
  PlayCircle,
  ArrowRight,
  Plus,
  Shield,
} from 'lucide-react';

type DashboardData = {
  user: {
    name: string | null;
    email: string | null;
    profileType: string;
  };
  profile: any;
  hasRegister?: boolean;
  register?: {
    id: string;
    title: string;
    jurisdiction: string;
    lastReviewedAt: Date | null;
    nextReviewDate: Date | null;
    status: string;
  };
  summary?: {
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    averageInherentRisk: number;
    averageResidualRisk: number;
    riskReduction: number;
    totalControls: number;
    implementedControls: number;
    controlImplementationRate: number;
  };
  topPriorityRisks?: any[];
  protocolStats?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    archived: number;
    averageProgress: number;
  };
  protocolsInProgress?: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
    startedAt: Date | null;
  }>;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/overview');

      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 20) return { label: 'Crítico', color: 'destructive' };
    if (score >= 15) return { label: 'Alto', color: 'orange' };
    if (score >= 10) return { label: 'Medio', color: 'yellow' };
    if (score >= 5) return { label: 'Bajo', color: 'primary' };
    return { label: 'Muy Bajo', color: 'green' };
  };

  const handleAddAISuggestedRisk = async (risk: any) => {
    try {
      // Create the risk using the /api/risks endpoint
      // This endpoint handles register creation automatically
      const createRiskResponse = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: risk.title,
          description: risk.description,
          category: risk.category,
          likelihood: risk.likelihood,
          impact: risk.impact,
          triggers: risk.triggers || [],
          consequences: risk.consequences || [],
          affectedAssets: risk.affectedAssets || [],
          sourceType: 'AI_SUGGESTED',
        }),
      });

      if (!createRiskResponse.ok) {
        const errorData = await createRiskResponse.json();
        throw new Error(errorData.error || 'Error al crear riesgo');
      }

      // Refresh dashboard data
      await fetchDashboardData();

      // Show success message
      alert('¡Riesgo agregado exitosamente! 🎉');
    } catch (error) {
      console.error('Error adding risk:', error);
      alert('Error al agregar el riesgo. Por favor intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-semibold mb-2">Error al cargar dashboard</p>
          <p className="text-muted-foreground">{error || 'No se pudieron cargar los datos'}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { user, profile, hasRegister, summary, topPriorityRisks, protocolStats, protocolsInProgress } = dashboardData;
  const hasData = hasRegister !== false && summary;
  const riskLevel = hasData ? getRiskLevel(summary.averageInherentRisk) : { label: 'N/A', color: 'gray' };
  const riskScorePercentage = hasData ? Math.round((summary.averageInherentRisk / 25) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-8">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {user.name}!</h1>
          <p className="text-primary-foreground/80">
            {hasData
              ? 'Aquí encontrarás un resumen de tu perfil de riesgo y los próximos pasos recomendados.'
              : 'Has completado tu evaluación inicial. En Sprint 2 comenzaremos a identificar y analizar riesgos específicos.'}
          </p>
        </div>

        {/* AI Suggestions Panel */}
        {showAISuggestions && process.env.NEXT_PUBLIC_AI_ENABLED !== 'false' && (
          <div className="mb-8">
            <AISuggestionsPanel onAddRisk={handleAddAISuggestedRisk} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Risk Score */}
          <div className="bg-card rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Nivel de Riesgo Promedio</h3>
              <AlertTriangle className={`h-5 w-5 text-${riskLevel.color}-500`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{riskLevel.label}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasData ? `${summary.averageInherentRisk.toFixed(1)}/25 puntos` : 'Sin datos aún'}
            </p>
            <div className="mt-4 bg-secondary rounded-full h-2">
              <div
                className={`bg-${riskLevel.color}-500 h-2 rounded-full transition-all`}
                style={{ width: `${riskScorePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Total Risks */}
          <div className="bg-card rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Riesgos Identificados</h3>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{hasData ? summary.totalRisks : 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasData && summary.criticalRisks > 0
                ? `${summary.criticalRisks} críticos`
                : 'Sprint 2: Identificación'}
            </p>
          </div>

          {/* Controls */}
          <div className="bg-card rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Controles</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{hasData ? summary.totalControls : 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasData
                ? `${summary.controlImplementationRate}% implementados`
                : 'Sprint 3: Controles'}
            </p>
          </div>

          {/* Risk Reduction */}
          <div className="bg-card rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Reducción de Riesgo</h3>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {hasData ? `${summary.riskReduction}%` : '0%'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasData && summary.riskReduction > 0 ? 'Con controles' : 'Sprint 3: Mitigación'}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Top Priority Risks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {hasData && topPriorityRisks && topPriorityRisks.length > 0
                  ? 'Riesgos Prioritarios'
                  : 'Identificación de Riesgos'}
              </h2>

              {hasData && topPriorityRisks && topPriorityRisks.length > 0 ? (
                <div className="space-y-3">
                  {topPriorityRisks.map((risk, index) => {
                    const priorityConfig = {
                      CRITICAL: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Crítico' },
                      HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'Alto' },
                      MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Medio' },
                      LOW: { bg: 'bg-primary/10', text: 'text-primary', label: 'Bajo' },
                    };
                    const config =
                      priorityConfig[risk.priority as keyof typeof priorityConfig] ||
                      priorityConfig.MEDIUM;
                    const controlProgress = risk.controlsCount > 0
                      ? Math.round((risk.controlsImplemented / risk.controlsCount) * 100)
                      : 0;

                    return (
                      <div
                        key={risk.id}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{risk.title}</h3>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Riesgo Inherente: {risk.inherentRisk}/25</span>
                          {risk.residualRisk && (
                            <span>Riesgo Residual: {risk.residualRisk}/25</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${controlProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {risk.controlsImplemented}/{risk.controlsCount} controles
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-2">Aún no hay riesgos identificados</p>
                  <p className="text-sm text-muted-foreground/80">
                    En Sprint 2 implementaremos el módulo de identificación de riesgos
                  </p>
                </div>
              )}

              {hasData && topPriorityRisks && topPriorityRisks.length > 0 && (
                <button className="w-full mt-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Ver Todos los Riesgos
                </button>
              )}
            </div>

            {/* Risk Summary */}
            <div className="bg-card rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Resumen por Prioridad</h2>
              {hasData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span className="font-medium text-foreground">Críticos</span>
                    <span className="text-2xl font-bold text-destructive">{summary.criticalRisks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                    <span className="font-medium text-foreground">Altos</span>
                    <span className="text-2xl font-bold text-orange-500">{summary.highRisks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                    <span className="font-medium text-foreground">Medios</span>
                    <span className="text-2xl font-bold text-yellow-500">{summary.mediumRisks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium text-foreground">Bajos</span>
                    <span className="text-2xl font-bold text-primary">{summary.lowRisks}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Sin datos aún</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">Sprint 2: Análisis de riesgos</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Actions */}
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="bg-card rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Tu Perfil</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {user.profileType === 'PROFESSIONAL' ? 'Profesional' : 'Empresa'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {profile?.profession || profile?.businessType || 'N/A'}
                    </p>
                  </div>
                </div>

                {user.profileType === 'PROFESSIONAL' && profile && (
                  <>
                    {profile.yearsExperience && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Años de experiencia</span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile.yearsExperience}
                        </span>
                      </div>
                    )}
                    {profile.specialty && (
                      <div className="py-2 border-b">
                        <span className="text-sm text-muted-foreground">Especialidad</span>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {profile.specialty}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {user.profileType === 'BUSINESS' && profile && (
                  <>
                    {profile.companySize && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Tamaño</span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile.companySize}
                        </span>
                      </div>
                    )}
                    {profile.revenueRange && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Ingresos</span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile.revenueRange}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {profile?.jurisdiction && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Jurisdicción</span>
                    <span className="text-sm font-semibold text-foreground">
                      {profile.jurisdiction}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-card rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Próximos Pasos</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sprint 2: Identificación</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Módulo para identificar y catalogar riesgos específicos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sprint 2: Análisis</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Matriz 5×5 para evaluar probabilidad e impacto
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sprint 3: Controles</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Implementar controles para mitigar riesgos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-gradient-to-br from-green-500/10 to-primary/10 rounded-xl shadow p-6 border border-green-500/20">
              <h3 className="font-bold text-foreground mb-2">🎉 Plataforma Gratuita</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Esta plataforma es 100% gratuita para impulsar el ecosistema legal
              </p>
              <p className="text-xs text-muted-foreground/80">
                Parte del ecosistema: laws-crm, legal-marketplace, risk-analysis
              </p>
            </div>
          </div>
        </div>

        {/* Protocols Section */}
        {protocolStats && protocolStats.total > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Protocolos de Cumplimiento</h2>
              <button
                onClick={() => router.push('/dashboard/protocols')}
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-secondary rounded-lg transition-colors"
              >
                Ver Todos
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Protocol Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-card rounded-lg shadow p-4">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-foreground">{protocolStats.total}</p>
              </div>
              <div className="bg-yellow-500/10 rounded-lg shadow p-4">
                <p className="text-sm text-yellow-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">{protocolStats.pending}</p>
              </div>
              <div className="bg-primary/10 rounded-lg shadow p-4">
                <p className="text-sm text-primary mb-1">En Progreso</p>
                <p className="text-2xl font-bold text-primary/90">{protocolStats.inProgress}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg shadow p-4">
                <p className="text-sm text-green-600 mb-1">Completados</p>
                <p className="text-2xl font-bold text-green-700">{protocolStats.completed}</p>
              </div>
              <div className="bg-indigo-500/10 rounded-lg shadow p-4">
                <p className="text-sm text-indigo-600 mb-1">Progreso Promedio</p>
                <p className="text-2xl font-bold text-indigo-700">{protocolStats.averageProgress}%</p>
              </div>
            </div>

            {/* Protocols in Progress */}
            {protocolsInProgress && protocolsInProgress.length > 0 && (
              <div className="bg-card rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Protocolos en Progreso
                </h3>
                <div className="space-y-4">
                  {protocolsInProgress.map((protocol) => (
                    <div
                      key={protocol.id}
                      onClick={() => router.push(`/dashboard/protocols/${protocol.id}`)}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{protocol.title}</h4>
                        <span className="text-sm font-medium text-primary">{protocol.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${protocol.progress}%` }}
                        />
                      </div>
                      {protocol.startedAt && (
                        <p className="text-xs text-muted-foreground">
                          Iniciado: {new Date(protocol.startedAt).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/dashboard/risks')}
              className="bg-card rounded-xl shadow p-6 hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary/50"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Registrar Nuevo Riesgo</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Identifica y documenta un nuevo riesgo legal para tu organización
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/protocols')}
              className="bg-card rounded-xl shadow p-6 hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary/50"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Ver Protocolos</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Revisa y completa tus protocolos de cumplimiento pendientes
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/reports')}
              className="bg-card rounded-xl shadow p-6 hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary/50"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Generar Reporte</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea reportes ejecutivos sobre tu perfil de riesgo actual
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Widget - Global floating chat */}
      {process.env.NEXT_PUBLIC_AI_ENABLED !== 'false' && <AIAssistantWidget />}
    </DashboardLayout>
  );
}