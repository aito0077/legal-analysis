'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  FileText,
  CheckCircle2,
  Clock,
  PlayCircle,
  Archive,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Tag,
  Edit3,
  Save,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';

type ProtocolStep = {
  title: string;
  description: string;
  estimatedTime: string;
  recurring?: boolean;
};

type Protocol = {
  id: string;
  protocolId: string;
  title: string;
  description: string;
  content: {
    steps: ProtocolStep[];
  };
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  progress: number;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  customizations: any;
  type: string;
};

export default function ProtocolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const protocolId = params?.id as string;

  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (protocolId) {
      fetchProtocol();
    }
  }, [protocolId]);

  useEffect(() => {
    if (protocol) {
      // Initialize completed steps from customizations
      if (protocol.customizations?.completedSteps) {
        setCompletedSteps(new Set(protocol.customizations.completedSteps));
      }
      setNotes(protocol.notes || '');
    }
  }, [protocol]);

  const fetchProtocol = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/protocols/${protocolId}`);

      if (!response.ok) {
        throw new Error('Error al cargar el protocolo');
      }

      const data = await response.json();
      setProtocol(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updateProtocol = async (updates: any) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el protocolo');
      }

      // Refresh protocol data
      await fetchProtocol();
    } catch (err) {
      console.error('Error updating protocol:', err);
      alert('Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStep = async (stepIndex: number) => {
    if (!protocol) return;

    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }

    setCompletedSteps(newCompletedSteps);

    // Calculate new progress
    const totalSteps = protocol.content.steps.length;
    const newProgress = Math.round((newCompletedSteps.size / totalSteps) * 100);

    // Update in database
    await updateProtocol({
      progress: newProgress,
      customizations: {
        ...protocol.customizations,
        completedSteps: Array.from(newCompletedSteps),
      },
    });
  };

  const handleStartProtocol = async () => {
    await updateProtocol({ status: 'IN_PROGRESS' });
  };

  const handleCompleteProtocol = async () => {
    await updateProtocol({ status: 'COMPLETED', progress: 100 });
  };

  const handleArchiveProtocol = async () => {
    if (confirm('¿Estás seguro de que quieres archivar este protocolo?')) {
      await updateProtocol({ status: 'ARCHIVED' });
    }
  };

  const handleSaveNotes = async () => {
    await updateProtocol({ notes });
    setIsEditingNotes(false);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: PlayCircle },
      COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      ARCHIVED: { label: 'Archivado', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Archive },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando protocolo...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !protocol) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-semibold mb-2">Error al cargar el protocolo</p>
            <p className="text-red-700">{error || 'Protocolo no encontrado'}</p>
            <button
              onClick={() => router.push('/dashboard/protocols')}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Volver a Protocolos
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(protocol.status);
  const StatusIcon = statusConfig.icon;
  const totalSteps = protocol.content.steps.length;
  const completedCount = completedSteps.size;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/protocols')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Volver a Protocolos</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{protocol.title}</h1>
              <p className="text-gray-600 mb-4">{protocol.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {protocol.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Asignado: {new Date(protocol.assignedAt).toLocaleDateString('es-AR')}
                </span>
                {protocol.startedAt && (
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-4 w-4" />
                    Iniciado: {new Date(protocol.startedAt).toLocaleDateString('es-AR')}
                  </span>
                )}
                {protocol.completedAt && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Completado: {new Date(protocol.completedAt).toLocaleDateString('es-AR')}
                  </span>
                )}
              </div>
            </div>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">
                Progreso: {completedCount} de {totalSteps} pasos completados
              </span>
              <span className="font-bold text-gray-900">{protocol.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${protocol.progress}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {protocol.status === 'PENDING' && (
              <button
                onClick={handleStartProtocol}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <PlayCircle className="h-5 w-5" />
                Iniciar Protocolo
              </button>
            )}
            {protocol.status === 'IN_PROGRESS' && protocol.progress === 100 && (
              <button
                onClick={handleCompleteProtocol}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                Marcar como Completado
              </button>
            )}
            {protocol.status !== 'ARCHIVED' && (
              <button
                onClick={handleArchiveProtocol}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <Archive className="h-5 w-5" />
                Archivar
              </button>
            )}
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Pasos de Implementación
          </h2>
          <div className="space-y-3">
            {protocol.content.steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);

              return (
                <div
                  key={index}
                  onClick={() => handleToggleStep(index)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      isCompleted
                        ? 'bg-green-50 border-green-300 hover:border-green-400'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckSquare className="h-6 w-6 text-green-600" />
                      ) : (
                        <Square className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`font-semibold ${
                            isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                          }`}
                        >
                          {index + 1}. {step.title}
                        </h3>
                        <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {step.estimatedTime}
                        </span>
                      </div>
                      <p className={`text-sm ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                        {step.description}
                      </p>
                      {step.recurring && (
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Recurrente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit3 className="h-6 w-6 text-blue-600" />
              Notas y Observaciones
            </h2>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditingNotes(false);
                    setNotes(protocol.notes || '');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas sobre la implementación de este protocolo..."
              className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="min-h-[100px] p-3 bg-gray-50 rounded-lg">
              {protocol.notes ? (
                <p className="text-gray-700 whitespace-pre-wrap">{protocol.notes}</p>
              ) : (
                <p className="text-gray-400 italic">No hay notas agregadas aún.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
