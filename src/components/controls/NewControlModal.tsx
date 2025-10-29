'use client';

import { useState } from 'react';
import { X, AlertCircle, Shield, Lock, Eye, Tool } from 'lucide-react';

type NewControlModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  riskId: string;
};

export default function NewControlModal({ isOpen, onClose, onSuccess, riskId }: NewControlModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PREVENTIVE',
    category: 'ADMINISTRATIVE',
    controlStrength: 'MODERATE',
    status: 'PLANNED',
    owner: '',
    reviewFrequency: 'QUARTERLY',
    estimatedCost: '',
    estimatedEffort: 'Medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        owner: formData.owner || null,
      };

      const response = await fetch(`/api/risks/${riskId}/controls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear control');
      }

      setFormData({
        title: '',
        description: '',
        type: 'PREVENTIVE',
        category: 'ADMINISTRATIVE',
        controlStrength: 'MODERATE',
        status: 'PLANNED',
        owner: '',
        reviewFrequency: 'QUARTERLY',
        estimatedCost: '',
        estimatedEffort: 'Medium',
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-foreground">Nuevo Control de Mitigación</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Título del Control *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej: Implementar política de protección de datos"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              placeholder="Describe el control en detalle..."
              required
            />
          </div>

          {/* Control Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tipo de Control *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="PREVENTIVE">Preventivo</option>
                <option value="DETECTIVE">Detectivo</option>
                <option value="CORRECTIVE">Correctivo</option>
                <option value="DIRECTIVE">Directivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="ADMINISTRATIVE">Administrativo</option>
                <option value="TECHNICAL">Técnico</option>
                <option value="PHYSICAL">Físico</option>
                <option value="LEGAL">Legal</option>
              </select>
            </div>
          </div>

          {/* Control Strength & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Fortaleza del Control *
              </label>
              <select
                value={formData.controlStrength}
                onChange={(e) => setFormData({ ...formData, controlStrength: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="WEAK">Débil (Reduce 1 nivel)</option>
                <option value="MODERATE">Moderado (Reduce 2 niveles)</option>
                <option value="STRONG">Fuerte (Reduce 3+ niveles)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="PLANNED">Planificado</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="IMPLEMENTED">Implementado</option>
                <option value="OPERATIONAL">Operacional</option>
              </select>
            </div>
          </div>

          {/* Owner & Review Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Responsable
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nombre del responsable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Frecuencia de Revisión
              </label>
              <select
                value={formData.reviewFrequency}
                onChange={(e) => setFormData({ ...formData, reviewFrequency: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
                <option value="QUARTERLY">Trimestral</option>
                <option value="SEMIANNUALLY">Semestral</option>
                <option value="ANNUALLY">Anual</option>
              </select>
            </div>
          </div>

          {/* Cost & Effort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Costo Estimado (USD)
              </label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Esfuerzo Estimado
              </label>
              <select
                value={formData.estimatedEffort}
                onChange={(e) => setFormData({ ...formData, estimatedEffort: e.target.value })}
                className="w-full px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Low">Bajo</option>
                <option value="Medium">Medio</option>
                <option value="High">Alto</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg text-muted-foreground hover:bg-accent transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Control'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}