'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  Archive,
  Loader2,
  AlertCircle
} from 'lucide-react';

type Protocol = {
  id: string;
  protocolId: string;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  progress: number;
  assignedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  type: string;
};

type Stats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  archived: number;
  averageProgress: number;
};

export default function ProtocolsPage() {
  const router = useRouter();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchProtocols();
  }, [filterStatus]);

  const fetchProtocols = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/protocols?${params}`);

      if (!response.ok) {
        throw new Error('Error al cargar protocolos');
      }

      const data = await response.json();
      setProtocols(data.protocols);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProtocols();
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-primary/10 text-primary', icon: PlayCircle },
      COMPLETED: { label: 'Completado', color: 'bg-green-500/10 text-green-600', icon: CheckCircle2 },
      ARCHIVED: { label: 'Archivado', color: 'bg-secondary text-muted-foreground', icon: Archive },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando protocolos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold mb-2">Error al cargar protocolos</p>
            <p className="text-destructive/80">{error}</p>
            <button
              onClick={fetchProtocols}
              className="mt-4 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Protocolos y Controles</h1>
          <p className="text-muted-foreground">Implementa y monitorea controles para mitigar riesgos</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow p-4">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg shadow p-4">
              <p className="text-sm text-yellow-600 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-primary/10 rounded-lg shadow p-4">
              <p className="text-sm text-primary mb-1">En Progreso</p>
              <p className="text-2xl font-bold text-primary/90">{stats.inProgress}</p>
            </div>
            <div className="bg-green-500/10 rounded-lg shadow p-4">
              <p className="text-sm text-green-600 mb-1">Completados</p>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="bg-indigo-500/10 rounded-lg shadow p-4">
              <p className="text-sm text-indigo-600 mb-1">Progreso Promedio</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.averageProgress}%</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar protocolos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completados</option>
            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>

        {/* Protocols List */}
        {protocols.length === 0 ? (
          <div className="bg-card rounded-xl shadow-md p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No hay protocolos asignados</h2>
            <p className="text-muted-foreground mb-6">
              Los protocolos recomendados se asignarán automáticamente cuando completes el wizard.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {protocols.map((protocol) => {
              const statusConfig = getStatusConfig(protocol.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={protocol.id}
                  onClick={() => router.push(`/dashboard/protocols/${protocol.id}`)}
                  className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border hover:border-primary/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{protocol.title}</h3>
                      <p className="text-sm text-muted-foreground">{protocol.description}</p>
                    </div>
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {protocol.category}
                    </span>
                    <span>
                      Asignado: {new Date(protocol.assignedAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-semibold text-foreground">{protocol.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${protocol.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}