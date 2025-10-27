/**
 * DeepSeek API Client
 *
 * Handles all communication with DeepSeek AI API
 * Includes error handling, rate limiting, and retry logic
 */

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DeepSeekClientOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}

export class DeepSeekClient {
  private apiKey: string;
  private baseURL = 'https://api.deepseek.com/v1';
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private retries: number;

  constructor(options: DeepSeekClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.model = options.model || 'deepseek-chat';
    this.temperature = options.temperature ?? 0.7;
    this.maxTokens = options.maxTokens || 2000;
    this.retries = options.retries || 3;

    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required');
    }
  }

  /**
   * Send a chat completion request to DeepSeek
   */
  async chat(
    messages: DeepSeekMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<string> {
    const temperature = options.temperature ?? this.temperature;
    const maxTokens = options.maxTokens ?? this.maxTokens;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `DeepSeek API error: ${response.status} - ${errorData.error?.message || response.statusText}`
          );
        }

        const data: DeepSeekResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from DeepSeek API');
        }

        return data.choices[0].message.content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`DeepSeek API attempt ${attempt + 1} failed:`, lastError.message);

        // If it's a rate limit error, wait before retrying
        if (error instanceof Error && error.message.includes('429')) {
          await this.wait(Math.pow(2, attempt) * 1000); // Exponential backoff
        } else if (attempt === this.retries - 1) {
          // Last attempt, throw the error
          throw lastError;
        }
      }
    }

    throw lastError || new Error('DeepSeek API request failed after retries');
  }

  /**
   * Generate a completion with a single prompt
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: DeepSeekMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    return this.chat(messages);
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    const fullSystemPrompt = systemPrompt
      ? `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No additional text or explanation.`
      : 'Respond ONLY with valid JSON. No additional text or explanation.';

    const response = await this.complete(prompt, fullSystemPrompt);

    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
      throw new Error(`Invalid JSON response from DeepSeek: ${error}`);
    }
  }

  /**
   * Utility to wait for a specified time
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}

// Export a singleton instance
let deepseekClient: DeepSeekClient | null = null;

export function getDeepSeekClient(): DeepSeekClient {
  if (!deepseekClient) {
    deepseekClient = new DeepSeekClient();
  }
  return deepseekClient;
}

export type { DeepSeekMessage, DeepSeekResponse };
