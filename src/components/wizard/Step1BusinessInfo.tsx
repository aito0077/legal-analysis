'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

type Step1Data = {
  businessType?: string;
  jurisdiction?: string;
  companySize?: string;
  revenueRange?: string;
};

type Props = {
  data: Step1Data;
  onNext: (data: Step1Data) => void;
  onBack?: () => void;
};

const businessTypes = [
  'TECHNOLOGY',
  'HEALTHCARE',
  'FINANCE',
  'LEGAL_SERVICES',
  'CONSTRUCTION',
  'MANUFACTURING',
  'RETAIL',
  'ECOMMERCE',
  'HOSPITALITY',
  'EDUCATION',
  'REAL_ESTATE',
  'TRANSPORTATION',
  'FOOD_SERVICE',
  'CONSULTING',
  'MARKETING',
  'OTHER',
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

const companySizes = [
  { value: 'MICRO', label: 'Micro (1-10 empleados)' },
  { value: 'SMALL', label: 'Pequeña (11-50 empleados)' },
  { value: 'MEDIUM', label: 'Mediana (51-250 empleados)' },
  { value: 'LARGE', label: 'Grande (251-1000 empleados)' },
  { value: 'ENTERPRISE', label: 'Empresa (1000+ empleados)' },
];

const revenueRanges = [
  { value: 'LESS_THAN_100K', label: 'Menos de $100,000' },
  { value: 'BETWEEN_100K_500K', label: '$100,000 - $500,000' },
  { value: 'BETWEEN_500K_1M', label: '$500,000 - $1M' },
  { value: 'BETWEEN_1M_5M', label: '$1M - $5M' },
  { value: 'BETWEEN_5M_10M', label: '$5M - $10M' },
  { value: 'MORE_THAN_10M', label: 'Más de $10M' },
];

const businessTypeLabels: Record<string, string> = {
  TECHNOLOGY: 'Tecnología',
  HEALTHCARE: 'Salud',
  FINANCE: 'Finanzas',
  LEGAL_SERVICES: 'Servicios Legales',
  CONSTRUCTION: 'Construcción',
  MANUFACTURING: 'Manufactura',
  RETAIL: 'Retail',
  ECOMMERCE: 'E-Commerce',
  HOSPITALITY: 'Hospitalidad',
  EDUCATION: 'Educación',
  REAL_ESTATE: 'Bienes Raíces',
  TRANSPORTATION: 'Transporte',
  FOOD_SERVICE: 'Servicios de Alimentos',
  CONSULTING: 'Consultoría',
  MARKETING: 'Marketing',
  OTHER: 'Otro',
};

export default function Step1BusinessInfo({ data, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<Step1Data>({
    businessType: data.businessType || '',
    jurisdiction: data.jurisdiction || '',
    companySize: data.companySize || '',
    revenueRange: data.revenueRange || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const isValid =
    formData.businessType &&
    formData.jurisdiction &&
    formData.companySize &&
    formData.revenueRange;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Información Básica del Negocio</h2>
        <p className="text-muted-foreground">
          Ayúdanos a entender mejor tu negocio para personalizar tu evaluación de riesgos
        </p>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Tipo de Negocio <span className="text-destructive">*</span>
        </label>
        <select
          value={formData.businessType}
          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
          required
          className="w-full px-4 py-3 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          <option value="">Selecciona un tipo de negocio</option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {businessTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Jurisdiction */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Jurisdicción Principal <span className="text-destructive">*</span>
        </label>
        <select
          value={formData.jurisdiction}
          onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
          required
          className="w-full px-4 py-3 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          <option value="">Selecciona un país</option>
          {jurisdictions.map((jurisdiction) => (
            <option key={jurisdiction.code} value={jurisdiction.code}>
              {jurisdiction.name}
            </option>
          ))}
        </select>
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Tamaño de la Empresa <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {companySizes.map((size) => (
            <label
              key={size.value}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.companySize === size.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <input
                type="radio"
                name="companySize"
                value={size.value}
                checked={formData.companySize === size.value}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="mr-3 text-primary"
              />
              <span className="text-sm font-medium text-foreground">{size.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Revenue Range */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Rango de Ingresos Anuales <span className="text-destructive">*</span>
        </label>
        <select
          value={formData.revenueRange}
          onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
          required
          className="w-full px-4 py-3 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          <option value="">Selecciona un rango</option>
          {revenueRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border rounded-lg text-muted-foreground font-semibold hover:bg-accent transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Atrás
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}