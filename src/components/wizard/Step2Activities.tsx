'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Step2Data = {
  businessActivities?: string[];
  riskExposure?: string[];
};

type Props = {
  data: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
};

const availableActivities = [
  { id: 'contratos', label: 'Contratos con clientes/proveedores' },
  { id: 'empleados', label: 'Contratación de empleados' },
  { id: 'datos_personales', label: 'Manejo de datos personales' },
  { id: 'propiedad_intelectual', label: 'Propiedad intelectual' },
  { id: 'importacion_exportacion', label: 'Importación/Exportación' },
  { id: 'servicios_financieros', label: 'Servicios financieros' },
  { id: 'publicidad', label: 'Publicidad y marketing' },
  { id: 'ventas_online', label: 'Ventas online' },
  { id: 'inmuebles', label: 'Compra/venta de inmuebles' },
  { id: 'sociedades', label: 'Constitución de sociedades' },
];

const riskAreas = [
  { id: 'laboral', label: 'Riesgos laborales', description: 'Despidos, discriminación, accidentes' },
  {
    id: 'contractual',
    label: 'Riesgos contractuales',
    description: 'Incumplimientos, cláusulas abusivas',
  },
  { id: 'datos', label: 'Protección de datos', description: 'GDPR, privacidad, filtraciones' },
  {
    id: 'propiedad',
    label: 'Propiedad intelectual',
    description: 'Marcas, patentes, derechos de autor',
  },
  { id: 'fiscal', label: 'Riesgos fiscales', description: 'Impuestos, sanciones tributarias' },
  { id: 'regulatorio', label: 'Cumplimiento regulatorio', description: 'Licencias, permisos' },
  {
    id: 'responsabilidad',
    label: 'Responsabilidad civil',
    description: 'Daños a terceros, productos defectuosos',
  },
  {
    id: 'ambiental',
    label: 'Riesgos ambientales',
    description: 'Contaminación, residuos peligrosos',
  },
];

export default function Step2Activities({ data, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<Step2Data>({
    businessActivities: data.businessActivities || [],
    riskExposure: data.riskExposure || [],
  });

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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Actividades y Riesgos</h2>
        <p className="text-gray-600">
          Selecciona las actividades que realizas y las áreas de riesgo que te preocupan
        </p>
      </div>

      {/* Business Activities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Actividades Principales <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">Selecciona al menos una actividad</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableActivities.map((activity) => (
            <label
              key={activity.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.businessActivities?.includes(activity.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.businessActivities?.includes(activity.id)}
                onChange={() => handleActivityToggle(activity.id)}
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
          Selecciona las áreas donde consideras que tu negocio tiene mayor exposición
        </p>
        <div className="space-y-3">
          {riskAreas.map((risk) => (
            <label
              key={risk.id}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.riskExposure?.includes(risk.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.riskExposure?.includes(risk.id)}
                onChange={() => handleRiskToggle(risk.id)}
                className="mr-3 mt-1 text-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{risk.label}</p>
                <p className="text-xs text-gray-600 mt-1">{risk.description}</p>
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
