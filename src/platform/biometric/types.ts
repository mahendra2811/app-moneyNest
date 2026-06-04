export interface BiometricService {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
}
