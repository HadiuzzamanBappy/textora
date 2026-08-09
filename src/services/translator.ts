export interface Translator {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;
}

export class MockTranslator implements Translator {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!text.trim()) {
      throw new Error("Text to translate cannot be empty.");
    }

    // A dictionary of mock translations for testing common greetings
    const mockDb: Record<string, Record<string, string>> = {
      es: {
        "welcome to textora.": "Bienvenido a Textora.",
        "hello": "Hola",
        "good morning": "Buenos días",
        "speech synthesis playground": "Lugar de experimentación de síntesis de voz",
      },
      fr: {
        "welcome to textora.": "Bienvenue sur Textora.",
        "hello": "Bonjour",
        "good morning": "Bonjour",
        "speech synthesis playground": "Espace d'expérimentation de synthèse vocale",
      },
      de: {
        "welcome to textora.": "Willkommen bei Textora.",
        "hello": "Hallo",
        "good morning": "Guten Morgen",
        "speech synthesis playground": "Spielplatz für Sprachsynthese",
      },
    };

    const cleanText = text.toLowerCase().trim();
    if (mockDb[targetLanguage]?.[cleanText]) {
      return mockDb[targetLanguage][cleanText];
    }

    return `[Mock ${targetLanguage.toUpperCase()}]: ${text}`;
  }
}

export function getTranslator(): Translator {
  // Extensible factory function.
  // Can instantiate and return DeepLTranslator / GoogleTranslator if API keys exist in env.
  return new MockTranslator();
}
