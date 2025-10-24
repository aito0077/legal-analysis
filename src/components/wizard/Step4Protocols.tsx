'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Shield, TrendingUp } from 'lucide-react';

type Step4Data = {
  businessType?: string;
  jurisdiction?: string;
  companySize?: string;
  revenueRange?: string;
  businessActivities?: string[];
  riskExposure?: string[];
  assessmentAnswers?: Record<string, any>;
};

type Props = {
  data: Step4Data;
  onBack: () => void;
};

const recommendedProtocols = [
  {
    id: 'contratos_modelo',
    title: 'Contratos Modelo Personalizados',
    description:
      'Plantillas de contratos adaptadas a tu industria y jurisdicción para uso con clientes y proveedores',
    category: 'Contractual',
    priority: 'high',
  },
  {
    id: 'politica_privacidad',
    title: 'Política de Privacidad y GDPR',
    description:
      'Documento completo de protección de datos conforme a regulaciones locales e internacionales',
    category: 'Datos',
    priority: 'critical',
  },
  {
    id: 'manual_empleados',
    title: 'Manual del Empleado',
    description:
      'Reglamento interno con políticas laborales, código de conducta y procedimientos disciplinarios',
    category: 'Laboral',
    priority: 'high',
  },
  {
    id: 'protocolo_crisis',
    title: 'Protocolo de Gestión de Crisis Legal',
    description:
      'Pasos a seguir ante litigios, inspecciones regulatorias o reclamaciones de terceros',
    category: 'Regulatorio',
    priority: 'medium',
  },
  {
    id: 'checklist_compliance',
    title: 'Checklist de Cumplimiento Trimestral',
    description:
      'Lista de verificación de obligaciones legales y regulatorias a revisar cada 3 meses',
    category: 'Regulatorio',
    priority: 'medium',
  },
  {
    id: 'terminos_condiciones',
    title: 'Términos y Condiciones de Servicio',
    description:
      'Documento legal para regular la relación con clientes en ventas online y servicios',
    category: 'Contractual',
    priority: 'high',
  },
];

export default function Step4Protocols({ data, onBack }: Props) {
  const router = useRouter();
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>(
    recommendedProtocols.map((p) => p.id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (protocolId: string) => {
    setSelectedProtocols((prev) =>
      prev.includes(protocolId) ? prev.filter((id) => id !== protocolId) : [...prev, protocolId]
    );
  };

  const calculateRiskScore = () => {
    // Simplified risk calculation based on assessment answers
    const answers = data.assessmentAnswers || {};
    let score = 0;

    // Higher score = higher risk
    if (answers.contratos_escritos === false) score += 15;
    if (answers.politica_privacidad === false) score += 20;
    if (answers.asesor_legal === 1 || answers.asesor_legal === 2) score += 10;
    if (answers.litigios_previos >= 3) score += 25;
    if (answers.capacitacion_legal === false) score += 10;
    if (!answers.seguros || answers.seguros.includes('Ninguno')) score += 20;

    return Math.min(score, 100); // Cap at 100
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const riskScore = calculateRiskScore();

      const response = await fetch('/api/wizard/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          selectedProtocols,
          riskScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }

      const result = await response.json();

      // Si requiere autenticación, guardamos en localStorage y redirigimos a signup
      if (result.requiresAuth) {
        localStorage.setItem('wizardData', JSON.stringify({
          ...data,
          selectedProtocols,
          riskScore,
        }));
        router.push('/auth/signup?from=wizard');
        return;
      }

      // Si ya está autenticado, redirigir al dashboard
      router.push(`/dashboard?profileId=${result.profileId}`);
    } catch (err) {
      setError('Error al completar el proceso. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  const riskScore = calculateRiskScore();
  const riskLevel =
    riskScore <= 20 ? 'Bajo' : riskScore <= 50 ? 'Medio' : riskScore <= 75 ? 'Alto' : 'Crítico';
  const riskColor =
    riskScore <= 20
      ? 'text-green-600 bg-green-100'
      : riskScore <= 50
      ? 'text-yellow-600 bg-yellow-100'
      : riskScore <= 75
      ? 'text-orange-600 bg-orange-100'
      : 'text-red-600 bg-red-100';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Protocolos Recomendados</h2>
        <p className="text-gray-600">
          Basándonos en tu perfil, estos son los protocolos que recomendamos para tu negocio
        </p>
      </div>

      {/* Risk Score Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Nivel de Riesgo Actual</p>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${riskColor} px-4 py-2 rounded-lg`}>
                {riskLevel}
              </span>
              <span className="text-gray-500">({riskScore}/100)</span>
            </div>
          </div>
          <TrendingUp className="h-12 w-12 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Implementando los protocolos recomendados podrías reducir tu riesgo en un 40-60%
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Protocols List */}
      <div className="space-y-3">
        {recommendedProtocols.map((protocol) => {
          const priorityColors = {
            critical: 'border-red-500 bg-red-50',
            high: 'border-orange-500 bg-orange-50',
            medium: 'border-yellow-500 bg-yellow-50',
            low: 'border-green-500 bg-green-50',
          };

          return (
            <label
              key={protocol.id}
              className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                selectedProtocols.includes(protocol.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedProtocols.includes(protocol.id)}
                onChange={() => handleToggle(protocol.id)}
                className="mr-4 mt-1 text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{protocol.title}</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      priorityColors[protocol.priority as keyof typeof priorityColors]
                    }`}
                  >
                    {protocol.priority === 'critical'
                      ? 'Crítico'
                      : protocol.priority === 'high'
                      ? 'Alta prioridad'
                      : protocol.priority === 'medium'
                      ? 'Media'
                      : 'Baja'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{protocol.description}</p>
                <p className="text-xs text-gray-500 mt-2">Categoría: {protocol.category}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <p className="text-sm text-gray-600">
          Has seleccionado <span className="font-bold text-gray-900">{selectedProtocols.length}</span>{' '}
          de {recommendedProtocols.length} protocolos recomendados. Podrás agregar o modificar
          protocolos más adelante desde el dashboard.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Atrás
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Completando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Completar y Ver Dashboard
            </>
          )}
        </button>
      </div>
    </div>
  );
}
