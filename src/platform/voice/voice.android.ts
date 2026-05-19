import Voice from '@react-native-voice/voice';
import { PermissionsAndroid } from 'react-native';
import type { VoiceListener, VoiceService } from './types';

const listeners = new Set<VoiceListener>();

function emit(e: Parameters<VoiceListener>[0]) {
  for (const l of listeners) l(e);
}

Voice.onSpeechStart = () => emit({ type: 'start' });
Voice.onSpeechEnd = () => emit({ type: 'end' });
Voice.onSpeechPartialResults = (ev) => {
  const text = ev.value?.[0] ?? '';
  emit({ type: 'partial', result: { transcript: text, confidence: 0.5, isFinal: false } });
};
Voice.onSpeechResults = (ev) => {
  const text = ev.value?.[0] ?? '';
  emit({ type: 'final', result: { transcript: text, confidence: 0.9, isFinal: true } });
};
Voice.onSpeechError = (ev) => {
  emit({ type: 'error', message: ev.error?.message ?? 'voice error' });
};

export const voiceService: VoiceService = {
  async isAvailable() {
    try {
      const available = await Voice.isAvailable();
      return Boolean(available);
    } catch {
      return false;
    }
  },
  async requestPermission() {
    const perm = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
    if (!perm) return false;
    const granted = await PermissionsAndroid.request(perm, {
      title: 'Microphone',
      message: 'moneyNest needs the mic for on-device voice input.',
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  },
  async start(opts) {
    const locale = opts?.locale ?? 'en-IN';
    await Voice.start(locale, {
      EXTRA_PARTIAL_RESULTS: true,
      EXTRA_PREFER_OFFLINE: opts?.preferOffline ?? true,
    });
  },
  async stop() {
    await Voice.stop();
  },
  async cancel() {
    await Voice.cancel();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
