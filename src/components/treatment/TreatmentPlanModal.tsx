'use client';

import { useState } from 'react';
import { X, AlertCircle, Plus, Trash2, Target, Calendar, DollarSign } from 'lucide-react';

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type Action = {
  id: string;
  title: string;
  description?: string;
  responsible?: string;
  deadline?: string;
  completed: boolean;
};

type TreatmentPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  riskId: string;
  currentRisk: {
    inherentRisk: number;
    likelihood: string;
    impact: string;
  };
};

const strategyOptions = [
  { value: 'AVOID', label: 'Evitar', description: 'Eliminar la actividad que genera el riesgo' },
  { value: 'REDUCE', label: 'Reducir', description: 'Implementar controles para mitigar el riesgo' },
  { value: 'TRANSFER', label: 'Transferir', description: 'Transferir el riesgo (seguros, outsourcing)' },
  { value: 'ACCEPT', label: 'Aceptar', description: 'Aceptar el riesgo sin acciones adicionales' },
];

const likelihoodOptions = [
  { value: 'RARE', label: 'Raro', level: 1 },
  { value: 'UNLIKELY', label: 'Improbable', level: 2 },
  { value: 'POSSIBLE', label: 'Posible', level: 3 },
  { value: 'LIKELY', label: 'Probable', level: 4 },
  { value: 'ALMOST_CERTAIN', label: 'Casi seguro', level: 5 },
];

const impactOptions = [
  { value: 'INSIGNIFICANT', label: 'Insignificante', level: 1 },
  { value: 'MINOR', label: 'Menor', level: 2 },
  { value: 'MODERATE', label: 'Moderado', level: 3 },
  { value: 'MAJOR', label: 'Mayor', level: 4 },
  { value: 'CATASTROPHIC', label: 'Catastrófico', level: 5 },
];

export default function TreatmentPlanModal({
  isOpen,
  onClose,
  onSuccess,
  riskId,
  currentRisk,
}: TreatmentPlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    strategy: 'REDUCE',
    justification: '',
    totalBudget: '',
    timeline: '',
    targetLikelihood: '',
    targetImpact: '',
  });

  const [actions, setActions] = useState<Action[]>([
    {
      id: generateId(),
      title: '',
      description: '',
      responsible: '',
      deadline: '',
      completed: false,
    },
  ]);

  const addAction = () => {
    setActions([
      ...actions,
      {
        id: generateId(),
        title: '',
        description: '',
        responsible: '',
        deadline: '',
        completed: false,
      },
    ]);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter((action) => action.id !== id));
    }
  };

  const updateAction = (id: string, field: string, value: any) => {
    setActions(
      actions.map((action) => (action.id === id ? { ...action, [field]: value } : action))
    );
  };

  const calculateTargetRisk = () => {
    if (!formData.targetLikelihood || !formData.targetImpact) return null;
    const likelihood = likelihoodOptions.find((opt) => opt.value === formData.targetLikelihood)?.level || 0;
    const impact = impactOptions.find((opt) => opt.value === formData.targetImpact)?.level || 0;
    return likelihood * impact;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validActions = actions.filter((action) => action.title.trim() !== '');
    if (validActions.length === 0) {
      setError('Debe agregar al menos una acción con título');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        strategy: formData.strategy,
        justification: formData.justification || null,
        actions: validActions,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : null,
        timeline: formData.timeline || null,
        targetLikelihood: formData.targetLikelihood || null,
        targetImpact: formData.targetImpact || null,
      };

      const response = await fetch(`/api/risks/${riskId}/treatment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear plan de tratamiento');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const targetRisk = calculateTargetRisk();

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Crear Plan de Tratamiento</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Riesgo Inherente: {currentRisk.inherentRisk} ({currentRisk.likelihood} × {currentRisk.impact})
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Estrategia */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Estrategia de Tratamiento *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strategyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    formData.strategy === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={option.value}
                    checked={formData.strategy === option.value}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    className="sr-only"
                  />
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Justificación
            </label>
            <textarea
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              rows={3}
              className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="¿Por qué se eligió esta estrategia?"
            />
          </div>

          {/* Acciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-muted-foreground">
                Acciones del Plan *
              </label>
              <button
                type="button"
                onClick={addAction}
                className="text-sm text-primary hover:text-primary/90 flex items-center gap-1"
              >
                <Plus size={16} />
                Agregar Acción
              </button>
            </div>
            <div className="space-y-4">
              {actions.map((action, index) => (
                <div key={action.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Acción {index + 1}</span>
                    {actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAction(action.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={action.title}
                      onChange={(e) => updateAction(action.id, 'title', e.target.value)}
                      placeholder="Título de la acción *"
                      className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <textarea
                      value={action.description}
                      onChange={(e) => updateAction(action.id, 'description', e.target.value)}
                      placeholder="Descripción (opcional)"
                      rows={2}
                      className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={action.responsible}
                        onChange={(e) => updateAction(action.id, 'responsible', e.target.value)}
                        placeholder="Responsable (opcional)"
                        className="border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={action.deadline}
                        onChange={(e) => updateAction(action.id, 'deadline', e.target.value)}
                        className="border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Presupuesto y Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <DollarSign size={16} />
                Presupuesto Total
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="ej: 3 meses, 6 meses"
              />
            </div>
          </div>

          {/* Objetivo de Riesgo Residual */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Target size={16} />
              Objetivo de Riesgo Residual
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Probabilidad Objetivo</label>
                <select
                  value={formData.targetLikelihood}
                  onChange={(e) =>
                    setFormData({ ...formData, targetLikelihood: e.target.value })
                  }
                  className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {likelihoodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.level})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Impacto Objetivo</label>
                <select
                  value={formData.targetImpact}
                  onChange={(e) => setFormData({ ...formData, targetImpact: e.target.value })}
                  className="w-full border bg-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {impactOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {targetRisk && (
              <div className="mt-3 bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-primary">
                  <strong>Riesgo Residual Objetivo:</strong> {targetRisk}{' '}
                  <span className="text-muted-foreground">
                    (Reducción: {currentRisk.inherentRisk - targetRisk} puntos)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-muted-foreground hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted"
            >
              {loading ? 'Creando...' : 'Crear Plan de Tratamiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}