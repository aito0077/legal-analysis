'use client';

import { useState } from 'react';
import {
  Target,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2,
  Play,
  Pause,
  CheckSquare,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type Action = {
  id: string;
  title: string;
  description?: string;
  responsible?: string;
  deadline?: string;
  completed: boolean;
};

type TreatmentPlan = {
  id: string;
  strategy: string;
  justification?: string;
  actions: Action[];
  totalBudget?: number;
  timeline?: string;
  targetLikelihood?: string;
  targetImpact?: string;
  targetRisk?: number;
  status: string;
  progress: number;
  approvedBy?: string;
  approvedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type TreatmentPlanCardProps = {
  plan: TreatmentPlan;
  riskId: string;
  onUpdate: () => void;
};

const strategyLabels: Record<string, { label: string; color: string }> = {
  AVOID: { label: 'Evitar', color: 'text-red-700 bg-red-100' },
  REDUCE: { label: 'Reducir', color: 'text-blue-700 bg-blue-100' },
  TRANSFER: { label: 'Transferir', color: 'text-purple-700 bg-purple-100' },
  ACCEPT: { label: 'Aceptar', color: 'text-gray-700 bg-gray-100' },
};

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Borrador', color: 'text-gray-700 bg-gray-100', icon: AlertCircle },
  APPROVED: { label: 'Aprobado', color: 'text-green-700 bg-green-100', icon: CheckCircle },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-blue-700 bg-blue-100', icon: Clock },
  COMPLETED: { label: 'Completado', color: 'text-green-700 bg-green-100', icon: CheckSquare },
  ON_HOLD: { label: 'En Espera', color: 'text-yellow-700 bg-yellow-100', icon: Pause },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700 bg-red-100', icon: XCircle },
};

export default function TreatmentPlanCard({ plan, riskId, onUpdate }: TreatmentPlanCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const strategyInfo = strategyLabels[plan.strategy] || {
    label: plan.strategy,
    color: 'text-gray-700 bg-gray-100',
  };
  const statusInfo = statusLabels[plan.status] || {
    label: plan.status,
    color: 'text-gray-700 bg-gray-100',
    icon: AlertCircle,
  };
  const StatusIcon = statusInfo.icon;

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/risks/${riskId}/treatment/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de eliminar este plan de tratamiento?')) return;

    try {
      const response = await fetch(`/api/risks/${riskId}/treatment/${plan.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const completedActions = plan.actions.filter((a) => a.completed).length;
  const totalActions = plan.actions.length;
  const actionsProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${strategyInfo.color}`}>
              Estrategia: {strategyInfo.label}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}
            >
              <StatusIcon size={14} />
              {statusInfo.label}
            </span>
          </div>
          {plan.justification && (
            <p className="text-sm text-gray-600 italic">{plan.justification}</p>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {plan.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus('APPROVED')}
                    disabled={updatingStatus}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Aprobar
                  </button>
                )}
                {plan.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Play size={16} />
                    Iniciar
                  </button>
                )}
                {plan.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('ON_HOLD')}
                      disabled={updatingStatus}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Pause size={16} />
                      Pausar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      disabled={updatingStatus}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <CheckSquare size={16} />
                      Completar
                    </button>
                  </>
                )}
                {plan.status === 'ON_HOLD' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Play size={16} />
                    Reanudar
                  </button>
                )}
                <hr className="my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso General</span>
          <span className="text-sm text-gray-600">{plan.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${plan.progress}%` }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {plan.totalBudget && (
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-600">Presupuesto</div>
              <div className="text-sm font-medium text-gray-900">
                ${plan.totalBudget.toLocaleString()}
              </div>
            </div>
          </div>
        )}
        {plan.timeline && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-600">Timeline</div>
              <div className="text-sm font-medium text-gray-900">{plan.timeline}</div>
            </div>
          </div>
        )}
        {plan.targetRisk && (
          <div className="flex items-center gap-2">
            <Target size={16} className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-600">Riesgo Objetivo</div>
              <div className="text-sm font-medium text-gray-900">{plan.targetRisk}</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-gray-500" />
          <div>
            <div className="text-xs text-gray-600">Acciones</div>
            <div className="text-sm font-medium text-gray-900">
              {completedActions}/{totalActions}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <button
          onClick={() => setShowActions(!showActions)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          {showActions ? 'Ocultar' : 'Ver'} Acciones ({totalActions})
        </button>
        {showActions && (
          <div className="mt-3 space-y-2">
            {plan.actions.map((action, index) => (
              <div
                key={action.id}
                className={`border rounded-lg p-3 ${
                  action.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      action.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {action.completed && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        action.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {index + 1}. {action.title}
                    </div>
                    {action.description && (
                      <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {action.responsible && (
                        <span>Responsable: {action.responsible}</span>
                      )}
                      {action.deadline && (
                        <span>Fecha: {new Date(action.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
          <div>
            <div className="font-medium">Creado</div>
            <div>{new Date(plan.createdAt).toLocaleDateString()}</div>
          </div>
          {plan.approvedAt && (
            <div>
              <div className="font-medium">Aprobado</div>
              <div>{new Date(plan.approvedAt).toLocaleDateString()}</div>
            </div>
          )}
          {plan.startedAt && (
            <div>
              <div className="font-medium">Iniciado</div>
              <div>{new Date(plan.startedAt).toLocaleDateString()}</div>
            </div>
          )}
          {plan.completedAt && (
            <div>
              <div className="font-medium">Completado</div>
              <div>{new Date(plan.completedAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
