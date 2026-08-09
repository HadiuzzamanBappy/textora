export interface Translator {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;
}

// Google Translate REST Engine
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
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_TRANSLATE_API_KEY environment variable is not defined.");
  }
  return new GoogleTranslator(apiKey);
}
