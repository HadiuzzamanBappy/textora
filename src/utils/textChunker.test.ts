import assert from "node:assert";
import { chunkText } from "./textChunker";

// Simple test runner
function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name} failed`);
    console.error(error);
    process.exit(1);
  }
}

console.log("Running Text Chunker tests...\n");

runTest("Empty text", () => {
  const result = chunkText("", 100);
  assert.deepStrictEqual(result, []);
});

runTest("Whitespace text", () => {
  const result = chunkText("   \n   \t  ", 100);
  assert.deepStrictEqual(result, []);
});

runTest("Short text fits in size", () => {
  const text = "Hello world.";
  const result = chunkText(text, 50);
  assert.deepStrictEqual(result, ["Hello world."]);
});

runTest("Multiple paragraphs preservation", () => {
  const text = "Para one.\n\nPara two.";
  const result = chunkText(text, 50);
  assert.deepStrictEqual(result, ["Para one.", "Para two."]);
});

runTest("Multiple sentences fit under size limit", () => {
  const text = "Sentence one. Sentence two. Sentence three.";
  const result = chunkText(text, 50);
  assert.deepStrictEqual(result, ["Sentence one. Sentence two. Sentence three."]);
});

runTest("Multiple sentences split when exceeding limit", () => {
  const text = "Sentence one. Sentence two. Sentence three.";
  const result = chunkText(text, 30);
  assert.deepStrictEqual(result, [
    "Sentence one. Sentence two.",
    "Sentence three."
  ]);
});

runTest("Oversized sentences split by words", () => {
  const text = "This is a super long sentence with many words that must be split.";
  const result = chunkText(text, 20);
  
  result.forEach(chunk => {
    assert.ok(chunk.length <= 20, `Chunk "${chunk}" exceeds limit of 20`);
  });
  assert.strictEqual(result.join(" "), "This is a super long sentence with many words that must be split.");
});

runTest("Extremely long word splits by characters", () => {
  const text = "supercalifragilisticexpialidocious";
  const result = chunkText(text, 10);
  
  result.forEach(chunk => {
    assert.ok(chunk.length <= 10, `Chunk "${chunk}" exceeds 10`);
  });
  assert.strictEqual(result.join(""), "supercalifragilisticexpialidocious");
});

runTest("Unicode / Non-Latin / Bengali text support", () => {
  // Bengali sentence terminal "।" (danda)
  const text = "আমার নাম রাফি। আমি বাংলায় কথা বলি।";
  const result = chunkText(text, 25);
  
  result.forEach(chunk => {
    assert.ok(chunk.length <= 25, `Chunk "${chunk}" length ${chunk.length} exceeds 25`);
  });
  assert.deepStrictEqual(result, [
    "আমার নাম রাফি।",
    "আমি বাংলায় কথা বলি।"
  ]);
});

runTest("Very large text document", () => {
  const paragraphs = Array.from({ length: 100 }, (_, i) => `Paragraph ${i} containing some sample text.`).join("\n\n");
  const result = chunkText(paragraphs, 150);
  assert.strictEqual(result.length, 100);
  result.forEach((chunk, i) => {
    assert.strictEqual(chunk, `Paragraph ${i} containing some sample text.`);
  });
});

console.log("\nAll tests passed successfully!");
