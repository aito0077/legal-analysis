'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AlertTriangle, Plus, Filter, Search } from 'lucide-react';

export default function RisksPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Riesgos</h1>
          <p className="text-gray-600">Identifica, analiza y monitorea los riesgos de tu negocio</p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar riesgos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Nuevo Riesgo
          </button>
        </div>

        {/* Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sprint 3: En Desarrollo</h2>
          <p className="text-gray-600 mb-6">
            La página de gestión de riesgos se implementará en las próximas iteraciones.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Funcionalidades Planificadas:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Listado completo de riesgos con filtros por prioridad, categoría y estado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Matriz de riesgos 5×5 interactiva (probabilidad × impacto)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Formulario para agregar y editar riesgos manualmente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Vista detallada de cada riesgo con triggers, consecuencias y controles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Sugerencias de riesgos basadas en tu perfil (powered by AI)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
