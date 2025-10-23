'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');

  const [riskScore] = useState(45); // This would come from the database
  const [riskLevel] = useState('Medio');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">LegalRisk</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hola, {session?.user?.name || 'Usuario'}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido a tu Dashboard!</h1>
          <p className="text-blue-100">
            Has completado exitosamente tu evaluación de riesgos. Aquí encontrarás un resumen de tu
            perfil y los próximos pasos recomendados.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Risk Score */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Nivel de Riesgo</h3>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{riskLevel}</p>
            <p className="text-sm text-gray-500 mt-1">{riskScore}/100 puntos</p>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>
          </div>

          {/* Protocols */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Protocolos Activos</h3>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">6</p>
            <p className="text-sm text-gray-500 mt-1">0% completado</p>
          </div>

          {/* Scenarios */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Escenarios Identificados</h3>
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500 mt-1">3 de alta prioridad</p>
          </div>

          {/* Team */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Equipo</h3>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">1</p>
            <p className="text-sm text-gray-500 mt-1">Solo tú por ahora</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Protocols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Protocolos Pendientes</h2>
              <div className="space-y-3">
                {[
                  {
                    title: 'Contratos Modelo Personalizados',
                    priority: 'high',
                    progress: 0,
                  },
                  {
                    title: 'Política de Privacidad y GDPR',
                    priority: 'critical',
                    progress: 0,
                  },
                  { title: 'Manual del Empleado', priority: 'high', progress: 0 },
                ].map((protocol, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{protocol.title}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          protocol.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {protocol.priority === 'critical' ? 'Crítico' : 'Alta prioridad'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${protocol.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{protocol.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Ver Todos los Protocolos
              </button>
            </div>

            {/* Risk Matrix Preview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Matriz de Riesgos</h2>
              <div className="aspect-square bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600 font-medium">
                  Matriz visual próximamente disponible
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Recommendations */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Pasos</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Revisar protocolos recomendados
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Comienza con los de prioridad crítica
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Invitar a tu equipo</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Colabora con colegas en la gestión de riesgos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Configurar recordatorios
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Recibe alertas sobre vencimientos legales
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 border border-indigo-200">
              <h3 className="font-bold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Nuestros expertos legales pueden ayudarte a implementar tus protocolos
              </p>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Contactar Experto
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
