'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NewControlModal from '@/components/controls/NewControlModal';
import ControlsList from '@/components/controls/ControlsList';
import {
  AlertTriangle,
  ArrowLeft,
  Plus,
  Shield,
  TrendingDown,
  Loader2,
  Calendar,
  User,
  Tag,
} from 'lucide-react';

type RiskDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  likelihood: string;
  impact: string;
  inherentRisk: number;
  residualRisk: number | null;
  treatmentStrategy: string | null;
  triggers: string[];
  consequences: string[];
  affectedAssets: string[];
  identifiedBy: string;
  identifiedAt: Date;
  owner: string | null;
  controls: any[];
  controlsCount: number;
  controlsImplemented: number;
  controlsEffectiveness: number;
  register: {
    id: string;
    title: string;
  };
};

export default function RiskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const riskId = params.id as string;

  const [risk, setRisk] = useState<RiskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewControlModal, setShowNewControlModal] = useState(false);

  useEffect(() => {
    fetchRisk();
  }, [riskId]);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/risks/${riskId}`);

      if (!response.ok) {
        throw new Error('Error al cargar riesgo');
      }

      const data = await response.json();
      setRisk(data.risk);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, any> = {
      CRITICAL: { label: 'Crítico', color: 'bg-red-100 text-red-700 border-red-200' },
      HIGH: { label: 'Alto', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      MEDIUM: { label: 'Medio', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      LOW: { label: 'Bajo', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    };
    return configs[priority] || configs.MEDIUM;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      IDENTIFIED: 'Identificado',
      ANALYZED: 'Analizado',
      EVALUATED: 'Evaluado',
      TREATING: 'En Tratamiento',
      MONITORING: 'Monitoreando',
      CLOSED: 'Cerrado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando detalle del riesgo...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !risk) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-semibold mb-2">Error al cargar riesgo</p>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Volver
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const priorityConfig = getPriorityConfig(risk.priority);
  const riskReduction = risk.residualRisk
    ? Math.round(((risk.inherentRisk - risk.residualRisk) / risk.inherentRisk) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a Riesgos
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{risk.title}</h1>
              <p className="text-gray-600">Registro: {risk.register.title}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Riesgo Inherente</p>
            <p className="text-3xl font-bold text-red-600">{risk.inherentRisk}/25</p>
          </div>

          {risk.residualRisk && (
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Riesgo Residual</p>
              <p className="text-3xl font-bold text-green-600">{risk.residualRisk}/25</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Controles</p>
            <p className="text-3xl font-bold text-blue-600">{risk.controlsImplemented}/{risk.controlsCount}</p>
          </div>

          {riskReduction > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Reducción
              </p>
              <p className="text-3xl font-bold text-green-600">{riskReduction}%</p>
            </div>
          )}
        </div>

        {/* Risk Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700">{risk.description}</p>
            </div>

            {/* Triggers */}
            {risk.triggers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Disparadores</h2>
                <ul className="space-y-2">
                  {risk.triggers.map((trigger, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Consequences */}
            {risk.consequences.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Consecuencias</h2>
                <ul className="space-y-2">
                  {risk.consequences.map((consequence, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">•</span>
                      {consequence}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Categoría:</span>
                  {risk.category}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Estado:</span>
                  {getStatusLabel(risk.status)}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Identificado por:</span>
                  {risk.identifiedBy}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Fecha:</span>
                  {new Date(risk.identifiedAt).toLocaleDateString('es-AR')}
                </div>
              </div>
            </div>

            {/* Affected Assets */}
            {risk.affectedAssets.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Activos Afectados</h3>
                <div className="flex flex-wrap gap-2">
                  {risk.affectedAssets.map((asset, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Controles de Mitigación</h2>
              <p className="text-gray-600 mt-1">
                {risk.controlsImplemented} de {risk.controlsCount} controles implementados
                {risk.controlsCount > 0 && ` (${risk.controlsEffectiveness}% efectividad)`}
              </p>
            </div>
            <button
              onClick={() => setShowNewControlModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Nuevo Control
            </button>
          </div>

          <ControlsList controls={risk.controls} onRefresh={fetchRisk} riskId={riskId} />
        </div>
      </div>

      {/* New Control Modal */}
      <NewControlModal
        isOpen={showNewControlModal}
        onClose={() => setShowNewControlModal(false)}
        onSuccess={fetchRisk}
        riskId={riskId}
      />
    </DashboardLayout>
  );
}
