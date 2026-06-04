/**
 * Receipt OCR scaffold — A2.
 *
 * The contract here lets the UI invoke OCR before the native module is
 * wired. Today the implementation is a stub that returns a low-confidence
 * result; swap with ML Kit / Tesseract once integrated via a config plugin.
 */
export type OcrResult = {
  rawText: string;
  amountPaise: number | null;
  merchant: string | null;
  date: string | null;
  confidence: number;
};

export async function extractFromImage(_imageUri: string): Promise<OcrResult> {
  // Implementation parked. To enable real OCR:
  //   1) pnpm add @react-native-ml-kit/text-recognition
  //   2) prebuild
  //   3) replace this body with: const text = await TextRecognition.recognize(imageUri);
  //   4) reuse `parseSms`-style regexes against `text`
  return {
    rawText: '',
    amountPaise: null,
    merchant: null,
    date: null,
    confidence: 0,
  };
}
