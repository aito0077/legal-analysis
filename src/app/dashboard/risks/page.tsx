'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NewRiskModal from '@/components/risks/NewRiskModal';
import {
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Loader2,
  X,
  ChevronDown,
  Shield,
  TrendingUp,
} from 'lucide-react';

type Risk = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  likelihood: string;
  impact: string;
  inherentRisk: number;
  residualRisk: number | null;
  controlsCount: number;
  controlsImplemented: number;
  identifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

type Stats = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
};

export default function RisksPage() {
  const router = useRouter();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRisks();
  }, [filterPriority, filterStatus, filterCategory]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPriority) params.append('priority', filterPriority);
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/risks?${params}`);

      if (!response.ok) {
        throw new Error('Error al cargar riesgos');
      }

      const data = await response.json();
      setRisks(data.risks);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRisks();
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      CRITICAL: { label: 'Crítico', color: 'bg-destructive/10 text-destructive border-destructive/20', badge: 'bg-destructive' },
      HIGH: { label: 'Alto', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', badge: 'bg-orange-500' },
      MEDIUM: { label: 'Medio', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', badge: 'bg-yellow-500' },
      LOW: { label: 'Bajo', color: 'bg-primary/10 text-primary border-primary/20', badge: 'bg-primary' },
    };
    return configs[priority as keyof typeof configs] || configs.MEDIUM;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      IDENTIFIED: 'Identificado',
      ANALYZING: 'En Análisis',
      MITIGATING: 'Mitigando',
      MONITORING: 'Monitoreando',
      CLOSED: 'Cerrado',
    };
    return labels[status] || status;
  };

  const clearFilters = () => {
    setFilterPriority('');
    setFilterStatus('');
    setFilterCategory('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando riesgos...</p>
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
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold mb-2">Error al cargar riesgos</p>
            <p className="text-destructive/80">{error}</p>
            <button
              onClick={fetchRisks}
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Riesgos</h1>
          <p className="text-muted-foreground">Identifica, analiza y monitorea los riesgos legales de tu organización</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow p-4">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-destructive/10 rounded-lg shadow p-4">
              <p className="text-sm text-destructive mb-1">Críticos</p>
              <p className="text-2xl font-bold text-destructive/90">{stats.critical}</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg shadow p-4">
              <p className="text-sm text-orange-600 mb-1">Altos</p>
              <p className="text-2xl font-bold text-orange-700">{stats.high}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg shadow p-4">
              <p className="text-sm text-yellow-600 mb-1">Medios</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.medium}</p>
            </div>
            <div className="bg-primary/10 rounded-lg shadow p-4">
              <p className="text-sm text-primary mb-1">Bajos</p>
              <p className="text-2xl font-bold text-primary/90">{stats.low}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar riesgos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg hover:bg-accent"
          >
            <Filter className="h-5 w-5" />
            Filtros
            {(filterPriority || filterStatus || filterCategory) && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {[filterPriority, filterStatus, filterCategory].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowNewRiskModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Nuevo Riesgo
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-card rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filtros</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/90"
              >
                Limpiar todo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Prioridad
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="CRITICAL">Crítico</option>
                  <option value="HIGH">Alto</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="LOW">Bajo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="IDENTIFIED">Identificado</option>
                  <option value="ANALYZING">En Análisis</option>
                  <option value="MITIGATING">Mitigando</option>
                  <option value="MONITORING">Monitoreando</option>
                  <option value="CLOSED">Cerrado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border bg-transparent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {stats && Object.keys(stats.byCategory).map((category) => (
                    <option key={category} value={category}>
                      {category} ({stats.byCategory[category]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Risks List */}
        {risks.length === 0 ? (
          <div className="bg-card rounded-xl shadow-md p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No hay riesgos registrados</h2>
            <p className="text-muted-foreground mb-6">
              Comienza identificando los riesgos legales de tu organización
            </p>
            <button
              onClick={() => setShowNewRiskModal(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Registrar Primer Riesgo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {risks.map((risk) => {
              const priorityConfig = getPriorityConfig(risk.priority);
              const controlProgress = risk.controlsCount > 0
                ? Math.round((risk.controlsImplemented / risk.controlsCount) * 100)
                : 0;

              return (
                <div
                  key={risk.id}
                  onClick={() => router.push(`/dashboard/risks/${risk.id}`)}
                  className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-transparent hover:border-primary"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{risk.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{risk.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color} border`}>
                      {priorityConfig.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Categoría:</span> {risk.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Estado:</span> {getStatusLabel(risk.status)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Riesgo Inherente:</span> {risk.inherentRisk}/25
                    </span>
                    {risk.residualRisk && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Riesgo Residual:</span> {risk.residualRisk}/25
                      </span>
                    )}
                  </div>

                  {risk.controlsCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${priorityConfig.badge}`}
                          style={{ width: `${controlProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {risk.controlsImplemented}/{risk.controlsCount} controles
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Risk Modal */}
      <NewRiskModal
        isOpen={showNewRiskModal}
        onClose={() => setShowNewRiskModal(false)}
        onSuccess={fetchRisks}
      />
    </DashboardLayout>
  );
}