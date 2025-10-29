'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';

type NewRiskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function NewRiskModal({ isOpen, onClose, onSuccess }: NewRiskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    likelihood: 'POSSIBLE',
    impact: 'MODERATE',
    status: 'IDENTIFIED',
    sourceType: 'INTERNAL_AUDIT',
    identifiedBy: '',
    triggers: [] as string[],
    consequences: [] as string[],
    affectedAssets: [] as string[],
  });

  const [newTrigger, setNewTrigger] = useState('');
  const [newConsequence, setNewConsequence] = useState('');
  const [newAsset, setNewAsset] = useState('');

  const likelihoodOptions = [
    { value: 'RARE', label: 'Raro (1)' },
    { value: 'UNLIKELY', label: 'Improbable (2)' },
    { value: 'POSSIBLE', label: 'Posible (3)' },
    { value: 'LIKELY', label: 'Probable (4)' },
    { value: 'ALMOST_CERTAIN', label: 'Casi Seguro (5)' },
  ];

  const impactOptions = [
    { value: 'INSIGNIFICANT', label: 'Insignificante (1)' },
    { value: 'MINOR', label: 'Menor (2)' },
    { value: 'MODERATE', label: 'Moderado (3)' },
    { value: 'MAJOR', label: 'Mayor (4)' },
    { value: 'CATASTROPHIC', label: 'Catastrófico (5)' },
  ];

  const statusOptions = [
    { value: 'IDENTIFIED', label: 'Identificado' },
    { value: 'ANALYZING', label: 'En Análisis' },
    { value: 'MITIGATING', label: 'Mitigando' },
    { value: 'MONITORING', label: 'Monitoreando' },
    { value: 'CLOSED', label: 'Cerrado' },
  ];

  const sourceTypeOptions = [
    { value: 'INTERNAL_AUDIT', label: 'Auditoría Interna' },
    { value: 'EXTERNAL_AUDIT', label: 'Auditoría Externa' },
    { value: 'REGULATORY_CHANGE', label: 'Cambio Regulatorio' },
    { value: 'INCIDENT', label: 'Incidente' },
    { value: 'MARKET_INTELLIGENCE', label: 'Inteligencia de Mercado' },
    { value: 'STAKEHOLDER_FEEDBACK', label: 'Feedback de Stakeholders' },
  ];

  const categories = [
    'Laboral',
    'Privacy y Datos',
    'Contractual',
    'Propiedad Intelectual',
    'Fiscal y Tributario',
    'Corporativo',
    'Regulatorio',
    'Ambiental',
    'Competencia',
    'Otro',
  ];

  const addTrigger = () => {
    if (newTrigger.trim()) {
      setFormData({
        ...formData,
        triggers: [...formData.triggers, newTrigger.trim()],
      });
      setNewTrigger('');
    }
  };

  const removeTrigger = (index: number) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.filter((_, i) => i !== index),
    });
  };

  const addConsequence = () => {
    if (newConsequence.trim()) {
      setFormData({
        ...formData,
        consequences: [...formData.consequences, newConsequence.trim()],
      });
      setNewConsequence('');
    }
  };

  const removeConsequence = (index: number) => {
    setFormData({
      ...formData,
      consequences: formData.consequences.filter((_, i) => i !== index),
    });
  };

  const addAsset = () => {
    if (newAsset.trim()) {
      setFormData({
        ...formData,
        affectedAssets: [...formData.affectedAssets, newAsset.trim()],
      });
      setNewAsset('');
    }
  };

  const removeAsset = (index: number) => {
    setFormData({
      ...formData,
      affectedAssets: formData.affectedAssets.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear riesgo');
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        likelihood: 'POSSIBLE',
        impact: 'MODERATE',
        status: 'IDENTIFIED',
        sourceType: 'INTERNAL_AUDIT',
        identifiedBy: '',
        triggers: [],
        consequences: [],
        affectedAssets: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-bold text-foreground">Registrar Nuevo Riesgo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Título del Riesgo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Incumplimiento de normativas laborales"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe el riesgo en detalle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Categoría *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Identificado por
                </label>
                <input
                  type="text"
                  value={formData.identifiedBy}
                  onChange={(e) => setFormData({ ...formData, identifiedBy: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre o área"
                />
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold text-foreground mb-4">Evaluación de Riesgo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Probabilidad *
                </label>
                <select
                  required
                  value={formData.likelihood}
                  onChange={(e) => setFormData({ ...formData, likelihood: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {likelihoodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Impacto *
                </label>
                <select
                  required
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {impactOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Estado *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Fuente de Identificación *
                </label>
                <select
                  required
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sourceTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Triggers */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold text-foreground mb-4">Detonantes</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                className="flex-1 px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: Cambios en la legislación"
              />
              <button
                type="button"
                onClick={addTrigger}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
            {formData.triggers.length > 0 && (
              <div className="space-y-2">
                {formData.triggers.map((trigger, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="text-secondary-foreground">{trigger}</span>
                    <button
                      type="button"
                      onClick={() => removeTrigger(index)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consequences */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold text-foreground mb-4">Consecuencias</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newConsequence}
                onChange={(e) => setNewConsequence(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConsequence())}
                className="flex-1 px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: Multas y sanciones"
              />
              <button
                type="button"
                onClick={addConsequence}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
            {formData.consequences.length > 0 && (
              <div className="space-y-2">
                {formData.consequences.map((consequence, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="text-secondary-foreground">{consequence}</span>
                    <button
                      type="button"
                      onClick={() => removeConsequence(index)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Affected Assets */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Activos Afectados</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAsset())}
                className="flex-1 px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: Recursos Humanos"
              />
              <button
                type="button"
                onClick={addAsset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
            {formData.affectedAssets.length > 0 && (
              <div className="space-y-2">
                {formData.affectedAssets.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="text-secondary-foreground">{asset}</span>
                    <button
                      type="button"
                      onClick={() => removeAsset(index)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Riesgo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}