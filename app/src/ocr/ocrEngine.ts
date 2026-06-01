export interface OcrEngine {
  extractText(imageUri: string): Promise<string>;
}

function flattenMlKitPayload(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => flattenMlKitPayload(item)).join('\n').trim();
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const data = payload as {
    text?: unknown;
    value?: unknown;
    lines?: unknown;
    blocks?: unknown;
  };

  const parts = [
    flattenMlKitPayload(data.text),
    flattenMlKitPayload(data.value),
    flattenMlKitPayload(data.lines),
    flattenMlKitPayload(data.blocks),
  ].filter(Boolean);

  return parts.join('\n').trim();
}

export class MlKitOcrEngine implements OcrEngine {
  async extractText(imageUri: string): Promise<string> {
    const module = await import('@react-native-ml-kit/text-recognition').catch(() => null);

    if (!module) {
      throw new Error('ML Kit OCR module not available. Build a dev client and install native modules.');
    }

    const recognize = (module as { default?: { recognize?: (uri: string) => Promise<unknown> }; recognize?: (uri: string) => Promise<unknown> }).default?.recognize
      ?? (module as { recognize?: (uri: string) => Promise<unknown> }).recognize;

    if (typeof recognize !== 'function') {
      throw new Error('ML Kit OCR module loaded but recognize() was not found.');
    }

    const result = await recognize(imageUri);
    const text = flattenMlKitPayload(result);

    if (!text) {
      throw new Error('OCR returned no text. Try a clearer screenshot.');
    }

    return text;
  }
}

export class PlaceholderOcrEngine implements OcrEngine {
  async extractText(_imageUri: string): Promise<string> {
    throw new Error('OCR engine not configured yet. Plug in Vision/ML Kit provider.');
  }
}
