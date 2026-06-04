import * as LocalAuthentication from 'expo-local-authentication';
import type { BiometricService } from './types';

export const biometricService: BiometricService = {
  async isAvailable() {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return has && enrolled;
  },
  async authenticate(reason: string) {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      disableDeviceFallback: false,
    });
    return res.success;
  },
};
