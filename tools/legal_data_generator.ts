// tools/legal_data_generator.ts

export class LegalDataGenerator {
  private apiKey: string;
  private baseURL: string = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY no está configurado en .env');
    }
  }

  async generateLegalData(sector: string, jurisdiction: string) {
    const prompt = this.buildLegalPrompt(sector, jurisdiction);

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // Modelo compatible con OpenAI
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en derecho argentino con especialización en compliance y gestión de riesgos legales. Proporciona análisis precisos y estructurados basados en legislación vigente.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.parseResponse(data.choices[0].message.content);
  }

  private buildLegalPrompt(sector: string, jurisdiction: string): string {
    return `
    # GENERACIÓN DE DATA LEGAL - PLATAFORMA RISK MANAGEMENT

    ## CONTEXTO:
    Sector: ${sector}
    Jurisdicción: ${jurisdiction} (Argentina)
    Destino: Base de datos para plataforma de gestión de riesgos legales

    ## ESTRUCTURA SOLICITADA (JSON):
    Necesito que generes un objeto JSON con la siguiente estructura:

    {
      "riskCategories": [
        {
          "name": "string",
          "description": "string", 
          "icon": "string"
        }
      ],
      "riskScenarios": [
        {
          "title": "string",
          "description": "string",
          "probability": "VERY_LOW|LOW|MEDIUM|HIGH|VERY_HIGH",
          "impact": "NEGLIGIBLE|LOW|MODERATE|HIGH|CATASTROPHIC",
          "triggers": ["string"],
          "consequences": ["string"],
          "categoryName": "string",
          "applicableLaws": ["string"]
        }
      ],
      "protocols": [
        {
          "title": "string",
          "description": "string", 
          "categoryName": "string",
          "content": {
            "steps": [
              {
                "step": 1,
                "title": "string",
                "description": "string",
                "deadline": "string|null",
                "responsible": "string"
              }
            ]
          },
          "businessTypes": ["string"]
        }
      ],
      "assessmentQuestions": [
        {
          "category": "string",
          "question": "string",
          "type": "MULTIPLE_CHOICE|SCALE|CHECKLIST",
          "options": ["string"]|null,
          "weight": number
        }
      ]
    }

    ## INSTRUCCIONES ESPECÍFICAS PARA ${sector.toUpperCase()}:

    ${this.getSectorSpecificInstructions(sector)}

    ## CRITERIOS DE CALIDAD:
    - Basarse en legislación argentina vigente
    - Incluir referencias a leyes específicas
    - Considerar riesgos reales y probables
    - Priorizar por impacto en el negocio
    - Incluir plazos y sanciones aplicables

    Genera únicamente el JSON válido, sin texto adicional.
    `;
  }

  private getSectorSpecificInstructions(sector: string): string {
    const instructions = {
      'salud': `
      ENFOQUE SECTOR SALUD:
      - Considerar Ley 26.529 de Derechos del Paciente
      - Ley 17.132 Ejercicio de la Medicina
      - Ley 26.682 de Habilitación de Establecimientos
      - Responsabilidad profesional médica
      - Protección de datos de salud (Ley 25.326)
      - Consentimiento informado
      - Historia clínica digital
      `,
      'construcción': `
      ENFOQUE SECTOR CONSTRUCCIÓN:
      - Ley 19.587 de Higiene y Seguridad en el Trabajo
      - Ley 24.557 de Riesgos del Trabajo
      - Reglamento de Obras Civiles
      - Responsabilidad por vicos de construcción
      - Contratos de locación de obra
      - Normas IRAM y ISO aplicables
      - Permisos municipales y habilitaciones
      `,
      'consultoría/servicios': `
      ENFOQUE CONSULTORÍA/SERVICIOS:
      - Ley 20.744 de Contrato de Trabajo
      - Ley 25.326 de Protección de Datos Personales
      - Facturación y responsabilidades fiscales (AFIP)
      - Contratos de servicios profesionales
      - Propiedad intelectual de desarrollos
      - Responsabilidad por asesoramiento
      - Confidencialidad y no competencia
      `
    };

    return instructions[sector] || 'Analizar riesgos legales generales del sector.';
  }

  private parseResponse(content: string): any {
    try {
      // Limpiar respuesta y extraer JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No se pudo extraer JSON de la respuesta');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return null;
    }
  }
}