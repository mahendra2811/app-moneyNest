import type { VoiceService } from './types';

export const voiceService: VoiceService = {
  async isAvailable() {
    return false;
  },
  async requestPermission() {
    throw new Error('voiceService not implemented on iOS yet');
  },
  async start() {
    throw new Error('voiceService not implemented on iOS yet');
  },
  async stop() {},
  async cancel() {},
  subscribe() {
    return () => undefined;
  },
};
