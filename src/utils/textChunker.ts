/**
 * Chunks a large text into smaller segments suitable for Text-to-Speech synthesis.
 * 
 * Heuristics used:
 * 1. Split by paragraphs, preserving full paragraphs if they fit within maxSize.
 * 2. Split oversized paragraphs by sentence boundaries (. ? ! ।).
 * 3. Split oversized sentences by word/whitespace boundaries.
 * 4. Fallback to character splitting if a single word exceeds maxSize.
 * 
 * @param text The input string to chunk.
 * @param maxSize The maximum character length of each chunk.
 * @returns An array of chunks.
 */
export function chunkText(text: string, maxSize: number = 200): string[] {
  if (maxSize <= 0) {
    throw new Error("Max size must be a positive integer.");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const chunks: string[] = [];

  // Helper to split a long string by word boundaries
  const splitSegmentByWords = (segment: string, limit: number): string[] => {
    const result: string[] = [];
    const tokens = segment.split(/(\s+)/); // Keeps whitespace tokens to rebuild structure
    let currentChunk = "";

    for (const token of tokens) {
      if (!token) continue;

      if ((currentChunk + token).length > limit) {
        if (currentChunk.trim()) {
          result.push(currentChunk.trim());
        }

        // Handle case where a single word token exceeds the size limit
        if (token.length > limit && !/\s+/.test(token)) {
          let remainder = token;
          while (remainder.length > limit) {
            result.push(remainder.slice(0, limit));
            remainder = remainder.slice(limit);
          }
          currentChunk = remainder;
        } else if (/\s+/.test(token)) {
          // Discard leading whitespace for the new chunk
          currentChunk = "";
        } else {
          currentChunk = token;
        }
      } else {
        currentChunk += token;
      }
    }

    if (currentChunk.trim()) {
      result.push(currentChunk.trim());
    }

    return result;
  };

  // 1. Split by paragraph breaks (one or more newlines)
  const paragraphs = trimmed.split(/\n+/);

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    // If paragraph fits, add it intact
    if (cleanPara.length <= maxSize) {
      chunks.push(cleanPara);
      continue;
    }

    // 2. Split oversized paragraph by sentences
    // Unicode sentence markers handled: English/European (.!?), Bengali/Hindi danda (।).
    // Using a positive lookbehind to split right after sentence terminators.
    const sentences = cleanPara.split(/(?<=[.!?।])\s+/);
    let currentSentenceGroup = "";

    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;

      if (cleanSentence.length > maxSize) {
        // Flush previous sentence group first
        if (currentSentenceGroup) {
          chunks.push(currentSentenceGroup);
          currentSentenceGroup = "";
        }
        // Split the oversized sentence by words
        const subChunks = splitSegmentByWords(cleanSentence, maxSize);
        chunks.push(...subChunks);
      } else {
        const separator = currentSentenceGroup ? " " : "";
        if ((currentSentenceGroup + separator + cleanSentence).length > maxSize) {
          chunks.push(currentSentenceGroup);
          currentSentenceGroup = cleanSentence;
        } else {
          currentSentenceGroup += separator + cleanSentence;
        }
      }
    }

    if (currentSentenceGroup) {
      chunks.push(currentSentenceGroup);
    }
  }

  return chunks;
}
