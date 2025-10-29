'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

type Step1ProfessionalData = {
  profession?: string;
  specialty?: string;
  yearsExperience?: number;
  jurisdiction?: string;
  practiceAreas?: string[];
  workEnvironment?: string;
  professionalInsurance?: boolean;
};

type Props = {
  data: Step1ProfessionalData;
  onNext: (data: Step1ProfessionalData) => void;
  onBack: () => void;
};

const professions = [
  { value: 'LAWYER', label: 'Abogado/a' },
  { value: 'DOCTOR', label: 'Médico/a' },
  { value: 'DENTIST', label: 'Odontólogo/a' },
  { value: 'ARCHITECT', label: 'Arquitecto/a' },
  { value: 'ENGINEER', label: 'Ingeniero/a' },
  { value: 'CIVIL_ENGINEER', label: 'Ingeniero/a Civil' },
  { value: 'ACCOUNTANT', label: 'Contador/a' },
  { value: 'CONSULTANT', label: 'Consultor/a' },
  { value: 'NOTARY', label: 'Escribano/a' },
  { value: 'PSYCHOLOGIST', label: 'Psicólogo/a' },
  { value: 'PHARMACIST', label: 'Farmacéutico/a' },
  { value: 'VETERINARIAN', label: 'Veterinario/a' },
  { value: 'OTHER', label: 'Otra Profesión' },
];

const jurisdictions = [
  { code: 'AR', name: 'Argentina' },
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Perú' },
  { code: 'UY', name: 'Uruguay' },
];

const workEnvironments = [
  { value: 'SOLO_PRACTICE', label: 'Consultorio/Estudio Unipersonal' },
  { value: 'SHARED_OFFICE', label: 'Oficina Compartida' },
  { value: 'SMALL_PARTNERSHIP', label: 'Sociedad Pequeña (2-5 personas)' },
  { value: 'MEDIUM_FIRM', label: 'Estudio Mediano (6-20 personas)' },
  { value: 'LARGE_FIRM', label: 'Estudio Grande (20+ personas)' },
];

// Practice areas por profesión
const practiceAreasByProfession: Record<string, string[]> = {
  LAWYER: [
    'Derecho Civil',
    'Derecho Penal',
    'Derecho Laboral',
    'Derecho Comercial',
    'Derecho Tributario',
    'Derecho de Familia',
    'Derecho Administrativo',
    'Propiedad Intelectual',
  ],
  DOCTOR: [
    'Medicina General',
    'Cardiología',
    'Pediatría',
    'Ginecología',
    'Traumatología',
    'Dermatología',
    'Psiquiatría',
    'Cirugía',
  ],
  ARCHITECT: [
    'Diseño Residencial',
    'Diseño Comercial',
    'Diseño Industrial',
    'Urbanismo',
    'Restauración',
    'Interiorismo',
  ],
  ENGINEER: [
    'Estructuras',
    'Electrónica',
    'Mecánica',
    'Sistemas',
    'Industrial',
    'Ambiental',
  ],
  ACCOUNTANT: [
    'Auditoría',
    'Impuestos',
    'Asesoramiento Financiero',
    'Contabilidad',
    'Liquidación de Sueldos',
  ],
  CONSULTANT: [
    'Estrategia',
    'Gestión',
    'Tecnología',
    'RR.HH.',
    'Marketing',
    'Finanzas',
  ],
};

export default function Step1ProfessionalInfo({ data, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<Step1ProfessionalData>({
    profession: data.profession || '',
    specialty: data.specialty || '',
    yearsExperience: data.yearsExperience || undefined,
    jurisdiction: data.jurisdiction || '',
    practiceAreas: data.practiceAreas || [],
    workEnvironment: data.workEnvironment || '',
    professionalInsurance: data.professionalInsurance || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const togglePracticeArea = (area: string) => {
    const current = formData.practiceAreas || [];
    if (current.includes(area)) {
      setFormData({
        ...formData,
        practiceAreas: current.filter((a) => a !== area),
      });
    } else {
      setFormData({
        ...formData,
        practiceAreas: [...current, area],
      });
    }
  };

  const availablePracticeAreas =
    practiceAreasByProfession[formData.profession || ''] || [];

  const isValid =
    formData.profession &&
    formData.jurisdiction &&
    formData.yearsExperience !== undefined &&
    formData.workEnvironment;
    //&& (formData.practiceAreas?.length || 0) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tu Perfil Profesional
        </h2>
        <p className="text-gray-600">
          Esta información nos ayuda a identificar los riesgos específicos de tu práctica profesional
        </p>
      </div>

      {/* Profesión */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profesión <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.profession}
          onChange={(e) =>
            setFormData({ ...formData, profession: e.target.value, practiceAreas: [] })
          }
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value="">Selecciona tu profesión</option>
          {professions.map((prof) => (
            <option key={prof.value} value={prof.value}>
              {prof.label}
            </option>
          ))}
        </select>
      </div>

      {/* Specialty (opcional) */}
      {formData.profession && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidad (opcional)
          </label>
          <input
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder="Ej: Derecho Laboral, Cirugía General, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      )}

      {/* Years of Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Años de Experiencia <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          max="60"
          value={formData.yearsExperience || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              yearsExperience: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          required
          placeholder="Ej: 5"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Jurisdiction */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jurisdicción Principal <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.jurisdiction}
          onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value="">Selecciona un país</option>
          {jurisdictions.map((jurisdiction) => (
            <option key={jurisdiction.code} value={jurisdiction.code}>
              {jurisdiction.name}
            </option>
          ))}
        </select>
      </div>

      {/* Practice Areas (solo si hay disponibles) */}
      {availablePracticeAreas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Áreas de Práctica <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">Selecciona todas las que apliquen</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availablePracticeAreas.map((area) => (
              <label
                key={area}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.practiceAreas?.includes(area)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.practiceAreas?.includes(area)}
                  onChange={() => togglePracticeArea(area)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">{area}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Work Environment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entorno de Trabajo <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {workEnvironments.map((env) => (
            <label
              key={env.value}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.workEnvironment === env.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="workEnvironment"
                value={env.value}
                checked={formData.workEnvironment === env.value}
                onChange={(e) =>
                  setFormData({ ...formData, workEnvironment: e.target.value })
                }
                className="mr-3 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-900">{env.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Professional Insurance */}
      <div>
        <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
          <input
            type="checkbox"
            checked={formData.professionalInsurance}
            onChange={(e) =>
              setFormData({ ...formData, professionalInsurance: e.target.checked })
            }
            className="mt-1 mr-3 text-blue-600"
          />
          <div>
            <span className="text-sm font-medium text-gray-900 block">
              Cuento con Seguro de Responsabilidad Profesional
            </span>
            <span className="text-xs text-gray-500">
              Importante para la evaluación de tu exposición al riesgo
            </span>
          </div>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
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
