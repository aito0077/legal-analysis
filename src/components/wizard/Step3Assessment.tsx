'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Step3Data = {
  assessmentAnswers?: Record<string, any>;
};

type Props = {
  data: Step3Data;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
};

const assessmentQuestions = [
  {
    id: 'contratos_escritos',
    question: '¿Utilizas contratos escritos con todos tus clientes y proveedores?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'politica_privacidad',
    question: '¿Tienes una política de privacidad y protección de datos implementada?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'asesor_legal',
    question: '¿Con qué frecuencia consultas con un asesor legal?',
    type: 'scale',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Raramente' },
      { value: 3, label: 'Ocasionalmente' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Regularmente' },
    ],
    weight: 3,
  },
  {
    id: 'litigios_previos',
    question: '¿Has tenido litigios o disputas legales en los últimos 3 años?',
    type: 'scale',
    options: [
      { value: 1, label: 'Ninguno' },
      { value: 2, label: '1-2 casos' },
      { value: 3, label: '3-5 casos' },
      { value: 4, label: '6-10 casos' },
      { value: 5, label: 'Más de 10 casos' },
    ],
    weight: 5,
  },
  {
    id: 'capacitacion_legal',
    question: '¿Capacitas a tu equipo en temas de cumplimiento legal?',
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'seguros',
    question: '¿Qué seguros comerciales tienes actualmente?',
    type: 'checklist',
    options: [
      'Responsabilidad civil',
      'Responsabilidad profesional',
      'Ciberseguridad',
      'Propiedad',
      'Vehículos',
      'Ninguno',
    ],
    weight: 3,
  },
  {
    id: 'documentos_actualizados',
    question: '¿Tus documentos legales (contratos, políticas) están actualizados?',
    type: 'scale',
    options: [
      { value: 1, label: 'Desactualizados (>3 años)' },
      { value: 2, label: 'Algo desactualizados (1-3 años)' },
      { value: 3, label: 'Actualizados (<1 año)' },
      { value: 4, label: 'Revisados regularmente' },
      { value: 5, label: 'Revisión continua con asesor' },
    ],
    weight: 4,
  },
];

export default function Step3Assessment({ data, onNext, onBack }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>(data.assessmentAnswers || {});

  const handleBooleanChange = (questionId: string, value: boolean) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleScaleChange = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleChecklistChange = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    setAnswers({ ...answers, [questionId]: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ assessmentAnswers: answers });
  };

  const allAnswered = assessmentQuestions.every((q) => {
    const answer = answers[q.id];
    if (q.type === 'boolean') return answer !== undefined;
    if (q.type === 'scale') return answer !== undefined;
    if (q.type === 'checklist') return Array.isArray(answer) && answer.length > 0;
    return false;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluación de Riesgos</h2>
        <p className="text-gray-600">
          Responde estas preguntas para que podamos evaluar tu nivel de riesgo actual
        </p>
      </div>

      <div className="space-y-6">
        {assessmentQuestions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 p-6 rounded-xl">
            <p className="font-semibold text-gray-900 mb-4">
              {index + 1}. {question.question}
            </p>

            {question.type === 'boolean' && (
              <div className="flex gap-4">
                <label className="flex items-center px-6 py-3 bg-white border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === true}
                    onChange={() => handleBooleanChange(question.id, true)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="font-medium text-gray-900">Sí</span>
                </label>
                <label className="flex items-center px-6 py-3 bg-white border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === false}
                    onChange={() => handleBooleanChange(question.id, false)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="font-medium text-gray-900">No</span>
                </label>
              </div>
            )}

            {question.type === 'scale' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center px-4 py-3 bg-white border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option.value}
                      onChange={() => handleScaleChange(question.id, option.value)}
                      className="mr-3 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'checklist' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center px-4 py-3 bg-white border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300"
                  >
                    <input
                      type="checkbox"
                      checked={(answers[question.id] as string[])?.includes(option)}
                      onChange={() => handleChecklistChange(question.id, option)}
                      className="mr-3 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Atrás
        </button>
        <button
          type="submit"
          disabled={!allAnswered}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
