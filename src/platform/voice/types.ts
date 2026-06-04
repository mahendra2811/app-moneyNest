export type VoiceResult = {
  transcript: string;
  confidence: number;
  isFinal: boolean;
};

export type VoiceEvent =
  | { type: 'start' }
  | { type: 'partial'; result: VoiceResult }
  | { type: 'final'; result: VoiceResult }
  | { type: 'end' }
  | { type: 'error'; message: string };

export type VoiceListener = (e: VoiceEvent) => void;

export interface VoiceService {
  isAvailable(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  start(opts?: { locale?: string; preferOffline?: boolean }): Promise<void>;
  stop(): Promise<void>;
  cancel(): Promise<void>;
  subscribe(listener: VoiceListener): () => void;
}
