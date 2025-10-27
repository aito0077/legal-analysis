/**
 * Risk AI Service
 *
 * Specialized AI service for risk management tasks
 * Uses DeepSeek to provide intelligent risk analysis and suggestions
 */

import { getDeepSeekClient } from './deepseek-client';

export interface UserContext {
  profileType: 'PROFESSIONAL' | 'BUSINESS';
  profession?: string;
  businessType?: string;
  jurisdiction: string;
  yearsExperience?: number;
  practiceAreas?: string[];
  businessActivities?: string[];
  companySize?: string;
}

export interface SuggestedRisk {
  title: string;
  description: string;
  category: string;
  likelihood: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
  impact: 'INSIGNIFICANT' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';
  triggers: string[];
  consequences: string[];
  affectedAssets: string[];
  reasoning: string;
}

export interface RiskAnalysis {
  suggestedLikelihood: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
  suggestedImpact: 'INSIGNIFICANT' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';
  suggestedTriggers: string[];
  suggestedConsequences: string[];
  suggestedAffectedAssets: string[];
  reasoning: string;
}

export interface ControlRecommendation {
  title: string;
  description: string;
  type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
  category: 'ADMINISTRATIVE' | 'TECHNICAL' | 'PHYSICAL' | 'LEGAL';
  controlStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  estimatedCost: string;
  estimatedEffort: 'Low' | 'Medium' | 'High';
  implementationSteps: string[];
  reasoning: string;
}

export interface TreatmentPlanSuggestion {
  recommendedStrategy: 'AVOID' | 'REDUCE' | 'TRANSFER' | 'ACCEPT';
  justification: string;
  actions: {
    title: string;
    description: string;
    responsible: string;
    deadline: string;
  }[];
  estimatedBudget: number;
  timeline: string;
  targetLikelihood: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
  targetImpact: 'INSIGNIFICANT' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';
}

export class RiskAIService {
  private client = getDeepSeekClient();

  /**
   * Build context prompt from user profile
   */
  private buildContextPrompt(context: UserContext): string {
    let prompt = `Contexto del Usuario:\n`;

    if (context.profileType === 'PROFESSIONAL') {
      prompt += `- Tipo: Profesional Independiente\n`;
      if (context.profession) prompt += `- Profesión: ${context.profession}\n`;
      if (context.yearsExperience) prompt += `- Años de experiencia: ${context.yearsExperience}\n`;
      if (context.practiceAreas && context.practiceAreas.length > 0) {
        prompt += `- Áreas de práctica: ${context.practiceAreas.join(', ')}\n`;
      }
    } else {
      prompt += `- Tipo: Empresa/Negocio\n`;
      if (context.businessType) prompt += `- Tipo de negocio: ${context.businessType}\n`;
      if (context.companySize) prompt += `- Tamaño: ${context.companySize}\n`;
      if (context.businessActivities && context.businessActivities.length > 0) {
        prompt += `- Actividades: ${context.businessActivities.join(', ')}\n`;
      }
    }

    prompt += `- Jurisdicción: ${context.jurisdiction}\n`;

    return prompt;
  }

  /**
   * Suggest risks based on user profile
   */
  async suggestRisks(context: UserContext, count: number = 5): Promise<SuggestedRisk[]> {
    const systemPrompt = `Eres un experto en gestión de riesgos legales, corporativos y operacionales.
Tu tarea es identificar riesgos relevantes basados en el perfil del usuario.
Debes ser específico, práctico y considerar las regulaciones locales.`;

    const userPrompt = `${this.buildContextPrompt(context)}

Identifica los ${count} riesgos más relevantes y críticos para este perfil.

Para cada riesgo, proporciona:
- title: Título conciso del riesgo
- description: Descripción detallada (2-3 oraciones)
- category: Categoría del riesgo (Legal, Operacional, Financiero, Reputacional, Cumplimiento, Tecnológico, etc.)
- likelihood: Probabilidad (RARE, UNLIKELY, POSSIBLE, LIKELY, ALMOST_CERTAIN)
- impact: Impacto (INSIGNIFICANT, MINOR, MODERATE, MAJOR, CATASTROPHIC)
- triggers: Lista de 3-5 eventos que disparan este riesgo
- consequences: Lista de 3-5 consecuencias potenciales
- affectedAssets: Lista de 2-4 activos afectados (clientes, reputación, datos, operaciones, etc.)
- reasoning: Breve explicación de por qué este riesgo es relevante para este perfil

IMPORTANTE: Responde SOLO con un array JSON válido de riesgos. Sin texto adicional.`;

    const response = await this.client.generateJSON<SuggestedRisk[]>(userPrompt, systemPrompt);
    return response;
  }

  /**
   * Analyze an existing risk and provide suggestions
   */
  async analyzeRisk(
    riskTitle: string,
    riskDescription: string,
    context: UserContext
  ): Promise<RiskAnalysis> {
    const systemPrompt = `Eres un experto en análisis cuantitativo de riesgos según ISO 31000.
Analiza riesgos con precisión y proporciona evaluaciones realistas.`;

    const userPrompt = `${this.buildContextPrompt(context)}

Riesgo a analizar:
- Título: ${riskTitle}
- Descripción: ${riskDescription}

Proporciona un análisis completo del riesgo con:
- suggestedLikelihood: Probabilidad (RARE, UNLIKELY, POSSIBLE, LIKELY, ALMOST_CERTAIN)
- suggestedImpact: Impacto (INSIGNIFICANT, MINOR, MODERATE, MAJOR, CATASTROPHIC)
- suggestedTriggers: Lista de 4-6 eventos que disparan este riesgo
- suggestedConsequences: Lista de 4-6 consecuencias potenciales específicas
- suggestedAffectedAssets: Lista de 3-5 activos específicos que se verían afectados
- reasoning: Explicación detallada de tu análisis (3-4 oraciones)

IMPORTANTE: Responde SOLO con un objeto JSON válido. Sin texto adicional.`;

    const response = await this.client.generateJSON<RiskAnalysis>(userPrompt, systemPrompt);
    return response;
  }

  /**
   * Recommend controls for a specific risk
   */
  async recommendControls(
    riskTitle: string,
    riskDescription: string,
    inherentRisk: number,
    context: UserContext,
    count: number = 5
  ): Promise<ControlRecommendation[]> {
    const systemPrompt = `Eres un experto en controles de mitigación de riesgos y cumplimiento normativo.
Recomienda controles efectivos, prácticos y proporcionales al riesgo.`;

    const userPrompt = `${this.buildContextPrompt(context)}

Riesgo a mitigar:
- Título: ${riskTitle}
- Descripción: ${riskDescription}
- Riesgo Inherente: ${inherentRisk}/25

Recomienda los ${count} controles más efectivos y prácticos para este riesgo.

Para cada control, proporciona:
- title: Título conciso del control
- description: Descripción detallada de cómo funciona (2-3 oraciones)
- type: Tipo (PREVENTIVE, DETECTIVE, CORRECTIVE, DIRECTIVE)
- category: Categoría (ADMINISTRATIVE, TECHNICAL, PHYSICAL, LEGAL)
- controlStrength: Efectividad (WEAK, MODERATE, STRONG)
- estimatedCost: Rango de costo estimado (ej: "$500-$1000", "< $500", "> $10000")
- estimatedEffort: Esfuerzo de implementación (Low, Medium, High)
- implementationSteps: Lista de 3-5 pasos específicos para implementar
- reasoning: Por qué este control es efectivo para este riesgo específico

IMPORTANTE: Responde SOLO con un array JSON válido. Sin texto adicional.`;

    const response = await this.client.generateJSON<ControlRecommendation[]>(userPrompt, systemPrompt);
    return response;
  }

  /**
   * Generate a complete treatment plan for a risk
   */
  async generateTreatmentPlan(
    riskTitle: string,
    riskDescription: string,
    inherentRisk: number,
    existingControls: string[],
    context: UserContext
  ): Promise<TreatmentPlanSuggestion> {
    const systemPrompt = `Eres un experto en planificación estratégica de tratamiento de riesgos.
Crea planes de tratamiento realistas, accionables y cost-effective.`;

    const controlsInfo =
      existingControls.length > 0
        ? `\n- Controles existentes: ${existingControls.join(', ')}`
        : '\n- Sin controles implementados actualmente';

    const userPrompt = `${this.buildContextPrompt(context)}

Riesgo a tratar:
- Título: ${riskTitle}
- Descripción: ${riskDescription}
- Riesgo Inherente: ${inherentRisk}/25${controlsInfo}

Genera un plan de tratamiento completo con:
- recommendedStrategy: Estrategia óptima (AVOID, REDUCE, TRANSFER, ACCEPT)
- justification: Justificación detallada de la estrategia elegida (3-4 oraciones)
- actions: Lista de 4-7 acciones específicas y concretas, cada una con:
  * title: Título de la acción
  * description: Descripción detallada
  * responsible: Rol recomendado (ej: "Director Legal", "Gerente de Operaciones")
  * deadline: Plazo recomendado (ej: "30 días", "2 meses", "1 trimestre")
- estimatedBudget: Presupuesto total estimado en USD (número)
- timeline: Timeline general del plan (ej: "3 meses", "6 meses")
- targetLikelihood: Probabilidad objetivo tras implementación (RARE, UNLIKELY, POSSIBLE, LIKELY, ALMOST_CERTAIN)
- targetImpact: Impacto objetivo tras implementación (INSIGNIFICANT, MINOR, MODERATE, MAJOR, CATASTROPHIC)

IMPORTANTE: Responde SOLO con un objeto JSON válido. Sin texto adicional.`;

    const response = await this.client.generateJSON<TreatmentPlanSuggestion>(
      userPrompt,
      systemPrompt
    );
    return response;
  }

  /**
   * General chat/assistant for risk management questions
   */
  async chat(question: string, context: UserContext, conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []): Promise<string> {
    const systemPrompt = `Eres un asistente experto en gestión de riesgos legales, corporativos y operacionales.
Proporciona respuestas útiles, prácticas y específicas al contexto del usuario.
Considera siempre las regulaciones locales y las mejores prácticas internacionales.
Sé conciso pero completo. Usa formato markdown cuando sea útil.`;

    const contextInfo = this.buildContextPrompt(context);

    const messages = [
      {
        role: 'system' as const,
        content: `${systemPrompt}\n\n${contextInfo}`,
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: question,
      },
    ];

    const response = await this.client.chat(messages);
    return response;
  }
}

// Export singleton instance
let riskAIService: RiskAIService | null = null;

export function getRiskAIService(): RiskAIService {
  if (!riskAIService) {
    riskAIService = new RiskAIService();
  }
  return riskAIService;
}
