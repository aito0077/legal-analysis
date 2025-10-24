'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Loader2,
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
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (score >= 20) return { label: 'Crítico', color: 'red' };
    if (score >= 15) return { label: 'Alto', color: 'orange' };
    if (score >= 10) return { label: 'Medio', color: 'yellow' };
    if (score >= 5) return { label: 'Bajo', color: 'blue' };
    return { label: 'Muy Bajo', color: 'green' };
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Error al cargar dashboard</p>
          <p className="text-gray-600">{error || 'No se pudieron cargar los datos'}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { user, profile, hasRegister, summary, topPriorityRisks } = dashboardData;
  const hasData = hasRegister !== false && summary;
  const riskLevel = hasData ? getRiskLevel(summary.averageInherentRisk) : { label: 'N/A', color: 'gray' };
  const riskScorePercentage = hasData ? Math.round((summary.averageInherentRisk / 25) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">LegalRisk</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500">
                  {user.profileType === 'PROFESSIONAL' ? 'Profesional' : 'Empresa'}
                </p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {user.name}!</h1>
          <p className="text-blue-100">
            {hasData
              ? 'Aquí encontrarás un resumen de tu perfil de riesgo y los próximos pasos recomendados.'
              : 'Has completado tu evaluación inicial. En Sprint 2 comenzaremos a identificar y analizar riesgos específicos.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Risk Score */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Nivel de Riesgo Promedio</h3>
              <AlertTriangle className={`h-5 w-5 text-${riskLevel.color}-500`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{riskLevel.label}</p>
            <p className="text-sm text-gray-500 mt-1">
              {hasData ? `${summary.averageInherentRisk.toFixed(1)}/25 puntos` : 'Sin datos aún'}
            </p>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className={`bg-${riskLevel.color}-500 h-2 rounded-full transition-all`}
                style={{ width: `${riskScorePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Total Risks */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Riesgos Identificados</h3>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{hasData ? summary.totalRisks : 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {hasData && summary.criticalRisks > 0
                ? `${summary.criticalRisks} críticos`
                : 'Sprint 2: Identificación'}
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Controles</h3>
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{hasData ? summary.totalControls : 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {hasData
                ? `${summary.controlImplementationRate}% implementados`
                : 'Sprint 3: Controles'}
            </p>
          </div>

          {/* Risk Reduction */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Reducción de Riesgo</h3>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {hasData ? `${summary.riskReduction}%` : '0%'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {hasData && summary.riskReduction > 0 ? 'Con controles' : 'Sprint 3: Mitigación'}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Top Priority Risks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {hasData && topPriorityRisks && topPriorityRisks.length > 0
                  ? 'Riesgos Prioritarios'
                  : 'Identificación de Riesgos'}
              </h2>

              {hasData && topPriorityRisks && topPriorityRisks.length > 0 ? (
                <div className="space-y-3">
                  {topPriorityRisks.map((risk, index) => {
                    const priorityConfig = {
                      CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítico' },
                      HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alto' },
                      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medio' },
                      LOW: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Bajo' },
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
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{risk.title}</h3>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Riesgo Inherente: {risk.inherentRisk}/25</span>
                          {risk.residualRisk && (
                            <span>Riesgo Residual: {risk.residualRisk}/25</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${controlProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {risk.controlsImplemented}/{risk.controlsCount} controles
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Aún no hay riesgos identificados</p>
                  <p className="text-sm text-gray-500">
                    En Sprint 2 implementaremos el módulo de identificación de riesgos
                  </p>
                </div>
              )}

              {hasData && topPriorityRisks && topPriorityRisks.length > 0 && (
                <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Ver Todos los Riesgos
                </button>
              )}
            </div>

            {/* Risk Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen por Prioridad</h2>
              {hasData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-900">Críticos</span>
                    <span className="text-2xl font-bold text-red-600">{summary.criticalRisks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-900">Altos</span>
                    <span className="text-2xl font-bold text-orange-600">{summary.highRisks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium text-gray-900">Medios</span>
                    <span className="text-2xl font-bold text-yellow-600">{summary.mediumRisks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-900">Bajos</span>
                    <span className="text-2xl font-bold text-blue-600">{summary.lowRisks}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Sin datos aún</p>
                  <p className="text-sm text-gray-500 mt-1">Sprint 2: Análisis de riesgos</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Actions */}
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tu Perfil</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.profileType === 'PROFESSIONAL' ? 'Profesional' : 'Empresa'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {profile?.profession || profile?.businessType || 'N/A'}
                    </p>
                  </div>
                </div>

                {user.profileType === 'PROFESSIONAL' && profile && (
                  <>
                    {profile.yearsExperience && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Años de experiencia</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {profile.yearsExperience}
                        </span>
                      </div>
                    )}
                    {profile.specialty && (
                      <div className="py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Especialidad</span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {profile.specialty}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {user.profileType === 'BUSINESS' && profile && (
                  <>
                    {profile.companySize && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Tamaño</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {profile.companySize}
                        </span>
                      </div>
                    )}
                    {profile.revenueRange && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Ingresos</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {profile.revenueRange}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {profile?.jurisdiction && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Jurisdicción</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {profile.jurisdiction}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Pasos</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sprint 2: Identificación</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Módulo para identificar y catalogar riesgos específicos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sprint 2: Análisis</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Matriz 5×5 para evaluar probabilidad e impacto
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sprint 3: Controles</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Implementar controles para mitigar riesgos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-md p-6 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-2">🎉 Plataforma Gratuita</h3>
              <p className="text-sm text-gray-600 mb-2">
                Esta plataforma es 100% gratuita para impulsar el ecosistema legal
              </p>
              <p className="text-xs text-gray-500">
                Parte del ecosistema: laws-crm, legal-marketplace, risk-analysis
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
