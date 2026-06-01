export interface OcrEngine {
  extractText(imageUri: string): Promise<string>;
}

export class PlaceholderOcrEngine implements OcrEngine {
  async extractText(_imageUri: string): Promise<string> {
    throw new Error('OCR engine not configured yet. Plug in Vision/ML Kit provider.');
  }
}
