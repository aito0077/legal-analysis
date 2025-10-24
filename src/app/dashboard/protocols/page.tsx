'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText } from 'lucide-react';

export default function ProtocolsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Protocolos y Controles</h1>
          <p className="text-gray-600">Implementa y monitorea controles para mitigar riesgos</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sprint 4: Planificado</h2>
          <p className="text-gray-600 mb-6">
            El módulo de protocolos se implementará próximamente.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Funcionalidades Planificadas:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Catálogo de protocolos recomendados por sector</li>
              <li>• Seguimiento de implementación paso a paso</li>
              <li>• Generación de protocolos personalizados con AI</li>
              <li>• Marketplace comunitario de protocolos</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
