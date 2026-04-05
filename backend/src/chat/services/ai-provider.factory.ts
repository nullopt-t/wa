import { IAIProvider } from './ai-provider.interface';
import { GeminiProvider } from './gemini-ai.service';
import { GroqProvider } from './groq-ai.service';

export type AIProviderType = 'gemini' | 'groq';

/**
 * Factory that returns the configured AI provider instance.
 * Reads AI_PROVIDER env var (default: 'gemini').
 * Supports fallback: if primary provider is not available, tries secondary.
 */
export class AIProviderFactory {
  private static providerMap = new Map<AIProviderType, IAIProvider>();
  private static primary: AIProviderType = 'gemini';
  private static fallback: AIProviderType | null = null;

  static register(type: AIProviderType, provider: IAIProvider): void {
    this.providerMap.set(type, provider);
  }

  static setPrimary(type: AIProviderType): void {
    this.primary = type;
  }

  static setFallback(type: AIProviderType | null): void {
    this.fallback = type;
  }

  /**
   * Get the active AI provider.
   * Returns the primary if available, otherwise falls back to secondary.
   */
  static getProvider(): IAIProvider {
    const primaryProvider = this.providerMap.get(this.primary);
    if (primaryProvider?.isAvailable()) {
      return primaryProvider;
    }

    if (this.fallback) {
      const fallbackProvider = this.providerMap.get(this.fallback);
      if (fallbackProvider?.isAvailable()) {
        return fallbackProvider;
      }
    }

    throw new Error(
      `No AI provider available. Primary: ${this.primary}, Fallback: ${this.fallback}. ` +
      'Check your API key configuration.',
    );
  }

  /**
   * Initialize providers from env configuration.
   * Call this once during app bootstrap.
   */
  static initialize(
    geminiProvider: GeminiProvider,
    groqProvider: GroqProvider,
  ): void {
    this.register('gemini', geminiProvider);
    this.register('groq', groqProvider);

    const configuredProvider = process.env.AI_PROVIDER || 'gemini';

    if (configuredProvider === 'groq') {
      this.setPrimary('groq');
      this.setFallback('gemini');
    } else {
      this.setPrimary('gemini');
      this.setFallback('groq');
    }
  }
}
