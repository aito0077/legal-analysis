'use client';

import { useState } from 'react';
import { Shield, Building2, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Step1BusinessInfo from '@/components/wizard/Step1BusinessInfo';
import Step2Activities from '@/components/wizard/Step2Activities';
import Step3Assessment from '@/components/wizard/Step3Assessment';
import Step4Protocols from '@/components/wizard/Step4Protocols';

type WizardData = {
  // Step 1
  businessType?: string;
  jurisdiction?: string;
  companySize?: string;
  revenueRange?: string;

  // Step 2
  businessActivities?: string[];
  riskExposure?: string[];

  // Step 3
  assessmentAnswers?: Record<string, any>;

  // Step 4
  selectedProtocols?: string[];
};

const steps = [
  {
    id: 1,
    title: 'Información Básica',
    description: 'Cuéntanos sobre tu negocio',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Actividades y Riesgos',
    description: 'Define tus actividades y exposiciones',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Evaluación de Riesgos',
    description: 'Responde algunas preguntas clave',
    icon: AlertTriangle,
  },
  {
    id: 4,
    title: 'Protocolos Recomendados',
    description: 'Revisa y selecciona protocolos',
    icon: CheckCircle2,
  },
];

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});

  const handleNext = (data: Partial<WizardData>) => {
    setWizardData({ ...wizardData, ...data });
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BusinessInfo data={wizardData} onNext={handleNext} />;
      case 2:
        return <Step2Activities data={wizardData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Assessment data={wizardData} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4Protocols data={wizardData} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LegalRisk</span>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 hidden md:block">{step.description}</p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 transition-all ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">{renderStep()}</div>
        </div>
      </div>
    </div>
  );
}
