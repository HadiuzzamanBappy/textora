export interface Translator {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;
}

// 1. Mock Translation Engine (Zero-cost, out-of-the-box fallback)
export class MockTranslator implements Translator {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!text.trim()) {
      throw new Error("Text to translate cannot be empty.");
    }

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

// 2. DeepL Translation REST Engine
export class DeepLTranslator implements Translator {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("DeepL API Key is missing.");
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    const isFreeAccount = this.apiKey.endsWith(":fx");
    const baseUrl = isFreeAccount
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLanguage.toUpperCase(),
        source_lang: sourceLanguage.toUpperCase(),
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`DeepL API failed with status ${response.status}: ${errorDetail}`);
    }

    const data = await response.json();
    if (!data.translations || !data.translations[0]?.text) {
      throw new Error("Malformed response received from DeepL API.");
    }

    return data.translations[0].text;
  }
}

// 3. Google Translate REST Engine
export class GoogleTranslator implements Translator {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Google Translate API Key is missing.");
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: [text],
        target: targetLanguage,
        source: sourceLanguage,
        format: "text",
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Google Translate API failed with status ${response.status}: ${errorDetail}`);
    }

    const data = await response.json();
    if (!data.data || !data.data.translations || !data.data.translations[0]?.translatedText) {
      throw new Error("Malformed response received from Google Translate API.");
    }

    return data.data.translations[0].translatedText;
  }
}

export function getTranslator(): Translator {
  const provider = process.env.TRANSLATION_PROVIDER || "mock";

  switch (provider.toLowerCase()) {
    case "deepl": {
      const apiKey = process.env.DEEPL_API_KEY;
      if (!apiKey) {
        console.warn("DEEPL_API_KEY environment variable is not defined. Falling back to MockTranslator.");
        return new MockTranslator();
      }
      return new DeepLTranslator(apiKey);
    }
    case "google": {
      const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) {
        console.warn("GOOGLE_TRANSLATE_API_KEY environment variable is not defined. Falling back to MockTranslator.");
        return new MockTranslator();
      }
      return new GoogleTranslator(apiKey);
    }
    case "mock":
    default:
      return new MockTranslator();
  }
}
