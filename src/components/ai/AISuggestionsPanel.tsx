'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Plus, TrendingUp, Shield, RefreshCw } from 'lucide-react';

type SuggestedRisk = {
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  triggers: string[];
  consequences: string[];
  affectedAssets: string[];
  reasoning: string;
};

type AISuggestionsPanelProps = {
  onAddRisk?: (risk: SuggestedRisk) => void;
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-700 border-blue-300',
};

const CACHE_KEY = 'ai-risk-suggestions-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type CacheData = {
  suggestions: SuggestedRisk[];
  timestamp: number;
};

export default function AISuggestionsPanel({ onAddRisk }: AISuggestionsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedRisk[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load cached suggestions on mount
  useEffect(() => {
    const loadCachedSuggestions = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data: CacheData = JSON.parse(cached);
          const now = Date.now();
          const age = now - data.timestamp;

          // Only use cache if it's less than 24 hours old
          if (age < CACHE_DURATION) {
            setSuggestions(data.suggestions);
            setLastUpdated(new Date(data.timestamp));
          } else {
            // Cache expired, remove it
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch (err) {
        console.error('Error loading cached suggestions:', err);
        localStorage.removeItem(CACHE_KEY);
      }
    };

    loadCachedSuggestions();
  }, []);

  const calculatePriority = (likelihood: string, impact: string): string => {
    const likelihoodMap: Record<string, number> = {
      RARE: 1,
      UNLIKELY: 2,
      POSSIBLE: 3,
      LIKELY: 4,
      ALMOST_CERTAIN: 5,
    };
    const impactMap: Record<string, number> = {
      INSIGNIFICANT: 1,
      MINOR: 2,
      MODERATE: 3,
      MAJOR: 4,
      CATASTROPHIC: 5,
    };

    const score = (likelihoodMap[likelihood] || 3) * (impactMap[impact] || 3);

    if (score >= 15) return 'CRITICAL';
    if (score >= 10) return 'HIGH';
    if (score >= 5) return 'MEDIUM';
    return 'LOW';
  };

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/suggest-risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al generar sugerencias');
      }

      const data = await response.json();
      const now = Date.now();

      // Save to cache
      const cacheData: CacheData = {
        suggestions: data.suggestions,
        timestamp: now,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      // Update state
      setSuggestions(data.suggestions);
      setLastUpdated(new Date(now));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRisk = (risk: SuggestedRisk) => {
    if (onAddRisk) {
      onAddRisk(risk);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Sugerencias Inteligentes de IA
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            DeepSeek analiza tu perfil y recomienda riesgos relevantes
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Última actualización: {lastUpdated.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerateSuggestions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : suggestions.length > 0 ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerar Sugerencias
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generar Sugerencias
            </>
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2 mb-4">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error al generar sugerencias</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Cache Info */}
      {suggestions.length > 0 && lastUpdated && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm">
          <p>
            <strong>💡 Sugerencias guardadas:</strong> Estas recomendaciones están guardadas localmente.
            Puedes regenerarlas si deseas obtener nuevas sugerencias basadas en cambios en tu perfil.
          </p>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const priority = calculatePriority(suggestion.likelihood, suggestion.impact);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Suggestion Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[priority]}`}
                        >
                          {priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {suggestion.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {suggestion.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddRisk(suggestion);
                      }}
                      className="ml-4 flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>

                  {/* Risk Metrics */}
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-orange-600" />
                      <span className="text-gray-600">Probabilidad:</span>
                      <span className="font-medium text-gray-900">{suggestion.likelihood}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={14} className="text-red-600" />
                      <span className="text-gray-600">Impacto:</span>
                      <span className="font-medium text-gray-900">{suggestion.impact}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                    {/* Reasoning */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">
                        💡 Por qué es relevante:
                      </h5>
                      <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
                    </div>

                    {/* Triggers */}
                    {suggestion.triggers.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">
                          ⚡ Disparadores:
                        </h5>
                        <ul className="space-y-1">
                          {suggestion.triggers.map((trigger, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-orange-600 mt-1">•</span>
                              {trigger}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Consequences */}
                    {suggestion.consequences.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">
                          ⚠️ Consecuencias:
                        </h5>
                        <ul className="space-y-1">
                          {suggestion.consequences.map((consequence, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-red-600 mt-1">•</span>
                              {consequence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Affected Assets */}
                    {suggestion.affectedAssets.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">
                          🎯 Activos Afectados:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.affectedAssets.map((asset, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                            >
                              {asset}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Haz clic en "Generar Sugerencias" para obtener recomendaciones de riesgos
              personalizadas basadas en tu perfil.
            </p>
          </div>
        )
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Analizando tu perfil con IA...</p>
          <p className="text-sm text-gray-600 mt-1">
            DeepSeek está identificando riesgos relevantes para tu industria y contexto
          </p>
        </div>
      )}
    </div>
  );
}
