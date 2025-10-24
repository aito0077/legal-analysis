'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

type Activity = {
  code: string;
  label: string;
  description?: string;
  category?: string;
};

type RiskArea = {
  code: string;
  label: string;
  description?: string;
  severity?: string;
  examples?: string[];
};

type Step2Data = {
  profileType?: 'PROFESSIONAL' | 'BUSINESS';
  profession?: string;
  businessType?: string;
  businessActivities?: string[];
  riskExposure?: string[];
};

type Props = {
  data: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
};

export default function Step2Activities({ data, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [riskAreas, setRiskAreas] = useState<RiskArea[]>([]);
  const [formData, setFormData] = useState<Step2Data>({
    businessActivities: data.businessActivities || [],
    riskExposure: data.riskExposure || [],
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const { profileType, profession, businessType } = data;

        if (!profileType) {
          setError('No se encontró el tipo de perfil');
          return;
        }

        // Construir query params
        const params = new URLSearchParams({
          profileType,
        });

        if (profileType === 'PROFESSIONAL' && profession) {
          params.append('profession', profession);
        } else if (profileType === 'BUSINESS' && businessType) {
          params.append('businessType', businessType);
        } else {
          setError('Faltan datos de profesión o tipo de negocio');
          return;
        }

        const response = await fetch(`/api/wizard/activities?${params}`);

        if (!response.ok) {
          throw new Error('Error al cargar actividades');
        }

        const result = await response.json();
        setActivities(result.activities);
        setRiskAreas(result.riskAreas);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [data.profileType, data.profession, data.businessType]);

  const handleActivityToggle = (activityId: string) => {
    const current = formData.businessActivities || [];
    const updated = current.includes(activityId)
      ? current.filter((id) => id !== activityId)
      : [...current, activityId];
    setFormData({ ...formData, businessActivities: updated });
  };

  const handleRiskToggle = (riskId: string) => {
    const current = formData.riskExposure || [];
    const updated = current.includes(riskId)
      ? current.filter((id) => id !== riskId)
      : [...current, riskId];
    setFormData({ ...formData, riskExposure: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const isValid =
    (formData.businessActivities?.length || 0) > 0 && (formData.riskExposure?.length || 0) > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando actividades y riesgos específicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Error al cargar datos</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Actividades y Riesgos</h2>
        <p className="text-gray-600">
          Selecciona las actividades que realizas y las áreas de riesgo específicas para tu{' '}
          {data.profileType === 'PROFESSIONAL' ? 'profesión' : 'tipo de negocio'}
        </p>
      </div>

      {/* Business Activities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Actividades Principales <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">Selecciona al menos una actividad</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activities.map((activity) => (
            <label
              key={activity.code}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.businessActivities?.includes(activity.code)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.businessActivities?.includes(activity.code)}
                onChange={() => handleActivityToggle(activity.code)}
                className="mr-3 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-900">{activity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Risk Exposure Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Áreas de Exposición al Riesgo <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Selecciona las áreas donde consideras mayor exposición al riesgo
        </p>
        <div className="space-y-3">
          {riskAreas.map((risk) => (
            <label
              key={risk.code}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.riskExposure?.includes(risk.code)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.riskExposure?.includes(risk.code)}
                onChange={() => handleRiskToggle(risk.code)}
                className="mr-3 mt-1 text-blue-600"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{risk.label}</p>
                <p className="text-xs text-gray-600 mt-1">{risk.description}</p>
                {risk.examples && risk.examples.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-medium">Ejemplos:</p>
                    <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                      {risk.examples.slice(0, 3).map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Atrás
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
