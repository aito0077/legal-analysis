'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  BarChart3,
  Loader2,
  AlertTriangle,
  Download,
  FileText,
  TrendingUp,
  Shield,
  Target,
  Calendar,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import { exportReportToPDF } from '@/lib/exportPDF';
import { exportReportToExcel } from '@/lib/exportExcel';

type ReportData = {
  hasData: boolean;
  register?: {
    id: string;
    title: string;
    lastReviewedAt: Date;
    nextReviewDate: Date;
  };
  summary?: {
    totalRisks: number;
    averageInherentRisk: number;
    averageResidualRisk: number;
    riskReduction: number;
  };
  riskMatrix?: {
    data: Array<{
      likelihood: number;
      impact: number;
      count: number;
      risks: any[];
    }>;
  };
  priorityDistribution?: Record<string, number>;
  statusDistribution?: Record<string, number>;
  categoryDistribution?: Record<string, number>;
  topRisks?: any[];
  controlEffectiveness?: {
    total: number;
    implemented: number;
    percentage: number;
  };
  protocolStats?: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  generatedAt?: string;
};

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');

      if (!response.ok) {
        throw new Error('Error al cargar reporte');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return 'bg-red-500';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getRiskIntensity = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100 text-gray-400';
    const intensity = (count / maxCount) * 100;
    if (intensity === 100) return 'bg-red-600 text-white font-bold';
    if (intensity >= 75) return 'bg-red-500 text-white font-semibold';
    if (intensity >= 50) return 'bg-orange-500 text-white font-semibold';
    if (intensity >= 25) return 'bg-yellow-500 text-gray-900';
    return 'bg-blue-400 text-white';
  };

  const handleExportPDF = () => {
    if (reportData && reportData.hasData) {
      exportReportToPDF(reportData as any);
      setShowExportMenu(false);
    }
  };

  const handleExportExcel = () => {
    if (reportData && reportData.hasData) {
      exportReportToExcel(reportData as any);
      setShowExportMenu(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generando reporte...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-semibold mb-2">Error al cargar reporte</p>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchReportData}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reportData?.hasData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay datos suficientes</h2>
            <p className="text-gray-600 mb-6">
              Comienza identificando riesgos para generar reportes y análisis
            </p>
            <button
              onClick={() => router.push('/dashboard/risks')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ir a Riesgos
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, riskMatrix, priorityDistribution, statusDistribution, categoryDistribution, topRisks, controlEffectiveness, protocolStats } = reportData;

  const maxMatrixCount = riskMatrix ? Math.max(...riskMatrix.data.map(cell => cell.count), 1) : 1;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Análisis</h1>
            <p className="text-gray-600">
              Visualiza métricas y analiza el perfil de riesgo de tu organización
            </p>
            {reportData.generatedAt && (
              <p className="text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Generado: {new Date(reportData.generatedAt).toLocaleString('es-AR')}
              </p>
            )}
          </div>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="h-5 w-5" />
              Exportar Reporte
              <ChevronDown className="h-4 w-4" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Exportar PDF</p>
                    <p className="text-xs text-gray-500">Reporte completo en formato PDF</p>
                  </div>
                </button>
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-b-lg"
                >
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Exportar Excel</p>
                    <p className="text-xs text-gray-500">Datos en hojas de cálculo</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Riesgos</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalRisks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Riesgo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.averageInherentRisk}/25</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reducción</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.riskReduction}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Controles</p>
                  <p className="text-2xl font-bold text-gray-900">{controlEffectiveness?.percentage}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Matrix 5x5 */}
        {riskMatrix && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Matriz de Riesgo 5×5</h2>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-6 gap-2">
                  {/* Top left corner label */}
                  <div className="flex items-center justify-center text-sm font-semibold text-gray-700">
                    L/I
                  </div>
                  {/* Impact headers */}
                  {[1, 2, 3, 4, 5].map((impact) => (
                    <div key={`impact-${impact}`} className="flex items-center justify-center text-sm font-semibold text-gray-700">
                      {impact === 1 && 'Insignif.'}
                      {impact === 2 && 'Menor'}
                      {impact === 3 && 'Moderado'}
                      {impact === 4 && 'Mayor'}
                      {impact === 5 && 'Catastróf.'}
                    </div>
                  ))}

                  {/* Matrix rows (likelihood 5 to 1, top to bottom) */}
                  {[5, 4, 3, 2, 1].map((likelihood) => (
                    <>
                      {/* Likelihood label */}
                      <div key={`likelihood-${likelihood}`} className="flex items-center justify-end pr-2 text-sm font-semibold text-gray-700">
                        {likelihood === 5 && 'Casi Seguro'}
                        {likelihood === 4 && 'Probable'}
                        {likelihood === 3 && 'Posible'}
                        {likelihood === 2 && 'Improbable'}
                        {likelihood === 1 && 'Raro'}
                      </div>
                      {/* Matrix cells for this likelihood row */}
                      {[1, 2, 3, 4, 5].map((impact) => {
                        const cell = riskMatrix.data.find(
                          (c) => c.likelihood === likelihood && c.impact === impact
                        );
                        const score = likelihood * impact;
                        const bgColor = getRiskColor(likelihood, impact);
                        const intensityClass = getRiskIntensity(cell?.count || 0, maxMatrixCount);

                        return (
                          <div
                            key={`cell-${likelihood}-${impact}`}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 cursor-pointer transition-all hover:scale-105 ${intensityClass}`}
                            title={`L${likelihood} × I${impact} = ${score} | ${cell?.count || 0} riesgos`}
                          >
                            <span className="text-2xl font-bold">{cell?.count || 0}</span>
                            <span className="text-xs opacity-75">({score})</span>
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Crítico (15-25)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Alto (10-14)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Medio (5-9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Bajo (1-4)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Distribution */}
          {priorityDistribution && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución por Prioridad</h3>
              <div className="space-y-4">
                {Object.entries(priorityDistribution).map(([priority, count]) => {
                  const total = Object.values(priorityDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    CRITICAL: 'bg-red-600',
                    HIGH: 'bg-orange-600',
                    MEDIUM: 'bg-yellow-600',
                    LOW: 'bg-blue-600',
                  };

                  return (
                    <div key={priority}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {priority === 'CRITICAL' && 'Crítico'}
                          {priority === 'HIGH' && 'Alto'}
                          {priority === 'MEDIUM' && 'Medio'}
                          {priority === 'LOW' && 'Bajo'}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${colors[priority]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Distribution */}
          {statusDistribution && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución por Estado</h3>
              <div className="space-y-4">
                {Object.entries(statusDistribution).map(([status, count]) => {
                  const total = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{status}</span>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top Risks */}
        {topRisks && topRisks.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top 10 Riesgos Prioritarios</h3>
            <div className="space-y-3">
              {topRisks.map((risk, index) => (
                <div
                  key={risk.id}
                  onClick={() => router.push(`/dashboard/risks/${risk.id}`)}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                        <h4 className="font-semibold text-gray-900">{risk.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Categoría: {risk.category}</span>
                        <span>Riesgo: {risk.inherentRisk}/25</span>
                        <span>Controles: {risk.controlsImplemented}/{risk.controlsCount}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      risk.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      risk.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      risk.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {risk.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
