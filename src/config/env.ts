import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_APP_NAME: z.string().min(1),
  EXPO_PUBLIC_APP_SLUG: z.string().min(1),
  EXPO_PUBLIC_PACKAGE_ID: z.string().regex(/^[a-z][a-z0-9_.]+$/),
  EXPO_PUBLIC_SCHEME: z.string().min(1),
  EXPO_PUBLIC_TAGLINE: z.string().min(1),
  EXPO_PUBLIC_SUPPORT_EMAIL: z.string().email(),
  EXPO_PUBLIC_PRIVACY_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid env. Check .env.local:\n${issues}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
