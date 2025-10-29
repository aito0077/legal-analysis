'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { User, Lock, FileText, AlertCircle, Loader2, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

type TabType = 'profile' | 'security' | 'data';

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  profileType: 'PROFESSIONAL' | 'BUSINESS' | null;
  createdAt: string;
  professionalProfile?: {
    profession: string;
    specialty?: string;
    jurisdiction: string;
    yearsExperience?: number;
  };
  businessProfile?: {
    businessType: string;
    jurisdiction: string;
    companySize: string;
    employeeCount?: number;
  };
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Error al actualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Error al cambiar contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
    { id: 'security' as TabType, label: 'Seguridad', icon: Lock },
    { id: 'data' as TabType, label: 'Datos', icon: FileText },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Administra tu cuenta y preferencias</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Información Personal</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </form>
                </div>

                {/* Profile Type Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Perfil</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Tipo:</span>{' '}
                      {profile?.profileType === 'PROFESSIONAL' ? 'Profesional' : profile?.profileType === 'BUSINESS' ? 'Empresa' : 'No definido'}
                    </p>

                    {profile?.professionalProfile && (
                      <>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Profesión:</span> {profile.professionalProfile.profession}
                        </p>
                        {profile.professionalProfile.specialty && (
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Especialidad:</span> {profile.professionalProfile.specialty}
                          </p>
                        )}
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Jurisdicción:</span> {profile.professionalProfile.jurisdiction}
                        </p>
                      </>
                    )}

                    {profile?.businessProfile && (
                      <>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Tipo de Negocio:</span> {profile.businessProfile.businessType}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Tamaño:</span> {profile.businessProfile.companySize}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Jurisdicción:</span> {profile.businessProfile.jurisdiction}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Para cambiar tu tipo de perfil, contacta con soporte
                  </p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Cambiar Contraseña</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        'Cambiar Contraseña'
                      )}
                    </button>
                  </form>
                </div>

                {/* Account Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cuenta</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Cuenta creada:</span>{' '}
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-AR') : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Plan:</span> Gratuito (Sin límites)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Datos</h2>
                  <p className="text-gray-600 mb-6">
                    Administra tus datos personales y ejercita tus derechos según la Ley de Protección de Datos Personales.
                  </p>

                  <div className="space-y-4">
                    {/* Export Data */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Exportar Datos</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Descarga una copia de todos tus datos en formato JSON.
                      </p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Descargar Mis Datos
                      </button>
                    </div>

                    {/* Delete Account */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h3 className="font-semibold text-red-900 mb-2">Eliminar Cuenta</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Esta acción es irreversible. Se eliminarán todos tus datos, evaluaciones de riesgo y protocolos.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Eliminar Mi Cuenta
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacidad y Seguridad</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm text-blue-900">
                    <p>✓ Tus datos están protegidos con encriptación</p>
                    <p>✓ No compartimos tu información con terceros</p>
                    <p>✓ Cumplimos con la Ley 25.326 de Protección de Datos Personales</p>
                    <p>✓ Puedes exportar o eliminar tus datos en cualquier momento</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
