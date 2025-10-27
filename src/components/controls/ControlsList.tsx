'use client';

import { useState } from 'react';
import {
  Shield,
  Eye,
  Tool,
  Lock,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  FileText,
} from 'lucide-react';

type Control = {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  controlStrength: string;
  status: string;
  owner: string | null;
  reviewFrequency: string | null;
  estimatedCost: number | null;
  estimatedEffort: string | null;
  implementationDate: Date | null;
  protocol: {
    id: string;
    title: string;
  } | null;
  reviews: any[];
  createdAt: Date;
  updatedAt: Date;
};

type ControlsListProps = {
  controls: Control[];
  onRefresh: () => void;
  riskId: string;
};

export default function ControlsList({ controls, onRefresh, riskId }: ControlsListProps) {
  const [loading, setLoading] = useState(false);
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleDeleteControl = async (controlId: string) => {
    if (!confirm('¿Estás seguro de eliminar este control?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/risks/${riskId}/controls/${controlId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar control');
      }

      onRefresh();
    } catch (error) {
      alert('Error al eliminar control');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (controlId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/risks/${riskId}/controls/${controlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      onRefresh();
    } catch (error) {
      alert('Error al actualizar estado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getControlTypeConfig = (type: string) => {
    const configs: Record<string, any> = {
      PREVENTIVE: { icon: Shield, label: 'Preventivo', color: 'text-green-600 bg-green-50 border-green-200' },
      DETECTIVE: { icon: Eye, label: 'Detectivo', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      CORRECTIVE: { icon: Tool, label: 'Correctivo', color: 'text-orange-600 bg-orange-50 border-orange-200' },
      DIRECTIVE: { icon: Lock, label: 'Directivo', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    };
    return configs[type] || configs.PREVENTIVE;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      PLANNED: { label: 'Planificado', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      IMPLEMENTED: { label: 'Implementado', color: 'bg-green-100 text-green-700 border-green-300' },
      OPERATIONAL: { label: 'Operacional', color: 'bg-green-100 text-green-700 border-green-300' },
      INEFFECTIVE: { label: 'Inefectivo', color: 'bg-red-100 text-red-700 border-red-300' },
      DEACTIVATED: { label: 'Desactivado', color: 'bg-gray-100 text-gray-500 border-gray-300' },
    };
    return configs[status] || configs.PLANNED;
  };

  const getStrengthLabel = (strength: string) => {
    const labels: Record<string, string> = {
      WEAK: 'Débil',
      MODERATE: 'Moderado',
      STRONG: 'Fuerte',
    };
    return labels[strength] || strength;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ADMINISTRATIVE: 'Administrativo',
      TECHNICAL: 'Técnico',
      PHYSICAL: 'Físico',
      LEGAL: 'Legal',
    };
    return labels[category] || category;
  };

  if (controls.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No hay controles registrados</p>
        <p className="text-sm text-gray-500 mt-1">Agrega controles para mitigar este riesgo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {controls.map((control) => {
        const typeConfig = getControlTypeConfig(control.type);
        const statusConfig = getStatusConfig(control.status);
        const TypeIcon = typeConfig.icon;
        const isExpanded = expandedControl === control.id;

        return (
          <div
            key={control.id}
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg border ${typeConfig.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{control.title}</h3>
                      {control.protocol && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FileText className="h-3 w-3" />
                          Protocolo: {control.protocol.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {typeConfig.label}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {getCategoryLabel(control.category)}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Fortaleza: {getStrengthLabel(control.controlStrength)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === control.id ? null : control.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>

                  {showMenu === control.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setExpandedControl(isExpanded ? null : control.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {isExpanded ? 'Ocultar' : 'Ver'} detalles
                      </button>

                      {control.status !== 'OPERATIONAL' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(control.id, 'OPERATIONAL');
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-gray-50 flex items-center gap-2"
                          disabled={loading}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Marcar operacional
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleDeleteControl(control.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Descripción</p>
                  <p className="text-sm text-gray-600">{control.description}</p>
                </div>

                {control.owner && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Responsable</p>
                    <p className="text-sm text-gray-600">{control.owner}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {control.reviewFrequency && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Frecuencia de Revisión</p>
                      <p className="text-sm font-medium text-gray-900">{control.reviewFrequency}</p>
                    </div>
                  )}

                  {control.estimatedCost !== null && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Costo Estimado</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${control.estimatedCost.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {control.estimatedEffort && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Esfuerzo</p>
                      <p className="text-sm font-medium text-gray-900">{control.estimatedEffort}</p>
                    </div>
                  )}
                </div>

                {control.reviews && control.reviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Última Revisión</p>
                    <div className="bg-white rounded p-3 text-sm">
                      <p className="text-gray-600">
                        {new Date(control.reviews[0].reviewDate).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Por: {control.reviews[0].reviewer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
