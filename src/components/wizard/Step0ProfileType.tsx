'use client';

import { useState } from 'react';
import { ArrowRight, Briefcase, User } from 'lucide-react';

type ProfileType = 'PROFESSIONAL' | 'BUSINESS';

type Props = {
  data: { profileType?: ProfileType };
  onNext: (data: { profileType: ProfileType }) => void;
};

export default function Step0ProfileType({ data, onNext }: Props) {
  const [profileType, setProfileType] = useState<ProfileType | undefined>(
    data.profileType
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileType) {
      onNext({ profileType });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Bienvenido a Risk Analysis
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Vamos a crear tu perfil de riesgo personalizado. Primero, cuéntanos sobre ti.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-base font-medium text-gray-700 mb-4 text-center">
          ¿Qué describe mejor tu situación?
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Professional Option */}
          <button
            type="button"
            onClick={() => setProfileType('PROFESSIONAL')}
            className={`group relative p-8 border-2 rounded-2xl transition-all duration-200 text-left ${
              profileType === 'PROFESSIONAL'
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                  profileType === 'PROFESSIONAL'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                <User className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Soy Profesional Independiente
                </h3>
                <p className="text-sm text-gray-600">
                  Abogado, médico, arquitecto, ingeniero, contador, consultor u otro profesional
                  que ejerce de forma independiente o en un estudio pequeño.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 w-full">
                <p className="text-xs text-gray-500 italic">
                  Ejemplos: consultorio médico, estudio jurídico, oficina de arquitectura
                </p>
              </div>

              {profileType === 'PROFESSIONAL' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Business Option */}
          <button
            type="button"
            onClick={() => setProfileType('BUSINESS')}
            className={`group relative p-8 border-2 rounded-2xl transition-all duration-200 text-left ${
              profileType === 'BUSINESS'
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                  profileType === 'BUSINESS'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                <Briefcase className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Represento una Empresa u Organización
                </h3>
                <p className="text-sm text-gray-600">
                  Empresa, organización o institución de cualquier tamaño que necesita gestionar
                  riesgos legales operacionales.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 w-full">
                <p className="text-xs text-gray-500 italic">
                  Ejemplos: clínica, constructora, estudio grande, consultora, comercio
                </p>
              </div>

              {profileType === 'BUSINESS' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>¿Por qué preguntamos esto?</strong> Los riesgos legales que enfrenta un
            profesional independiente son diferentes a los de una empresa. Personalizar tu perfil
            nos permite darte recomendaciones más precisas.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          disabled={!profileType}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
