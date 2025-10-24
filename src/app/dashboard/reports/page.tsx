'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Análisis</h1>
          <p className="text-gray-600">Visualiza métricas y genera reportes de compliance</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sprint 6: Planificado</h2>
          <p className="text-gray-600 mb-6">
            El módulo de reportes se implementará en futuras iteraciones.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Funcionalidades Planificadas:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Reportes PDF personalizables de riesgos</li>
              <li>• Gráficos de evolución temporal</li>
              <li>• Dashboard de analytics avanzados</li>
              <li>• Exportación a Excel y formatos estándar</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
