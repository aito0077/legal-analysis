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
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Bienvenido a Risk Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Vamos a crear tu perfil de riesgo personalizado. Primero, cuéntanos sobre ti.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-base font-medium text-muted-foreground mb-4 text-center">
          ¿Qué describe mejor tu situación?
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Professional Option */}
          <button
            type="button"
            onClick={() => setProfileType('PROFESSIONAL')}
            className={`group relative p-8 border-2 rounded-2xl transition-all duration-200 text-left ${
              profileType === 'PROFESSIONAL'
                ? 'border-primary bg-primary/10 shadow-lg scale-105'
                : 'border-border hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                  profileType === 'PROFESSIONAL'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                }`}
              >
                <User className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Soy Profesional Independiente
                </h3>
                <p className="text-sm text-muted-foreground">
                  Abogado, médico, arquitecto, ingeniero, contador, consultor u otro profesional
                  que ejerce de forma independiente o en un estudio pequeño.
                </p>
              </div>

              <div className="pt-4 border-t w-full">
                <p className="text-xs text-muted-foreground/80 italic">
                  Ejemplos: consultorio médico, estudio jurídico, oficina de arquitectura
                </p>
              </div>

              {profileType === 'PROFESSIONAL' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
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
                ? 'border-primary bg-primary/10 shadow-lg scale-105'
                : 'border-border hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                  profileType === 'BUSINESS'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                }`}
              >
                <Briefcase className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Represento una Empresa u Organización
                </h3>
                <p className="text-sm text-muted-foreground">
                  Empresa, organización o institución de cualquier tamaño que necesita gestionar
                  riesgos legales operacionales.
                </p>
              </div>

              <div className="pt-4 border-t w-full">
                <p className="text-xs text-muted-foreground/80 italic">
                  Ejemplos: clínica, constructora, estudio grande, consultora, comercio
                </p>
              </div>

              {profileType === 'BUSINESS' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
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
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-primary">
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
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}