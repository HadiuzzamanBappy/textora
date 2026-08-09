import { NextResponse } from "next/server";
import { getTranslator } from "../../../services/translator";

export async function POST(request: Request) {
  try {
    // 1. Verify JSON body structure
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Failed to parse JSON body" },
        { status: 400 }
      );
    }

    const { text, sourceLanguage, targetLanguage } = body;
    const errors: string[] = [];

    // 2. Validate input parameters
    if (typeof text !== "string" || !text.trim()) {
      errors.push("Text is required and cannot be empty.");
    } else if (text.length > 5000) {
      errors.push("Text size exceeds the maximum limit of 5000 characters.");
    }

    const supportedLanguages = ["en", "es", "fr", "de"];

    if (typeof sourceLanguage !== "string" || !supportedLanguages.includes(sourceLanguage)) {
      errors.push(`Source language is invalid or unsupported. Must be one of: ${supportedLanguages.join(", ")}`);
    }

    if (typeof targetLanguage !== "string" || !supportedLanguages.includes(targetLanguage)) {
      errors.push(`Target language is invalid or unsupported. Must be one of: ${supportedLanguages.join(", ")}`);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation Error", details: errors },
        { status: 400 }
      );
    }

    // 3. Perform translation
    const translator = getTranslator();
    const translatedText = await translator.translate(text, sourceLanguage, targetLanguage);

    return NextResponse.json({
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Translation Failure", message: errorMessage },
      { status: 500 }
    );
  }
}
