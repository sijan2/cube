export interface EnvVarInfo {
  name: string;
  source: string;
  defaultValue?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  requiredEnvVars: string[];
  envVarInfo?: EnvVarInfo[];
  config: unknown;
  required?: boolean;
  isCustom?: boolean;
  customRedirectPath?: string;
  redirectURI?: string;
}

export const authProviders = (
  env: Record<string, string>,
): ProviderConfig[] => [
  {
    id: 'google',
    name: 'Google',
    requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    envVarInfo: [
      { name: 'GOOGLE_CLIENT_ID', source: 'Google Cloud Console' },
      { name: 'GOOGLE_CLIENT_SECRET', source: 'Google Cloud Console' },
    ],
    config: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: [
        "openid",
        "email", 
        "profile",
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ],
      accessType: "offline",
      prompt: "consent",
      redirectURI: `${env.BACKEND_URL || 'http://localhost:3002'}/api/auth/callback/google`,
    },
    required: true,
  },
];

export function isProviderEnabled(
  provider: ProviderConfig,
  env: Record<string, string>,
): boolean {
  if (provider.isCustom) return true;

  const hasEnvVars = provider.requiredEnvVars.every(envVar => !!env[envVar]);

  if (provider.required && !hasEnvVars) {
    console.error(
      `Required provider "${provider.id}" is not configured properly.`,
    );
    console.error(
      `Missing environment variables: ${provider.requiredEnvVars.filter(envVar => !env[envVar]).join(', ')}`,
    );
  }

  return hasEnvVars;
}

export function getSocialProviders(
  env: Record<string, string>,
): Record<string, unknown> {
  const socialProviders = authProviders(env).reduce<Record<string, unknown>>(
    (acc, provider) => {
      if (isProviderEnabled(provider, env)) {
        acc[provider.id] = provider.config;
      } else if (provider.required) {
        throw new Error(
          `Required provider "${provider.id}" is not configured properly. Check your environment variables.`,
        );
      } else {
        console.warn(
          `Provider "${provider.id}" is not configured properly. Skipping.`,
        );
      }
      return acc;
    },
    {},
  );
  return socialProviders;
}