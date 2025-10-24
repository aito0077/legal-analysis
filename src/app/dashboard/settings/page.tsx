'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Administra tu cuenta y preferencias</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Settings className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración: Próximamente</h2>
          <p className="text-gray-600 mb-6">
            La página de configuración se implementará en próximas iteraciones.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Funcionalidades Planificadas:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Edición de perfil profesional/empresarial</li>
              <li>• Cambio de contraseña y seguridad</li>
              <li>• Preferencias de notificaciones</li>
              <li>• Gestión de suscripción (si aplica)</li>
              <li>• Exportación y eliminación de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
