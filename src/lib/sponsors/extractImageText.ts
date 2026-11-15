/**
 * Server-only OCR helper using Tesseract.js (no paid AI API keys).
 * Dynamically imported so client bundles stay lean.
 */

export async function extractTextFromImageBytes(
  bytes: Buffer | Uint8Array,
  label = 'sponsor-image',
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(bytes);
    const text = (data?.text || '').replace(/\s+/g, ' ').trim();
    console.log(`[SponsorOCR] Extracted ${text.length} chars from ${label}`);
    return text;
  } finally {
    await worker.terminate();
  }
}

export async function extractTextFromFile(file: File, label?: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  return extractTextFromImageBytes(bytes, label || file.name || 'upload');
}
