export interface Config {
  sentryDsn: string;
  firebaseFunctionsUrl: string;
}

export function getConfig(): Config {
  return {
    sentryDsn: process.env.SENTRY_DSN || '',
    firebaseFunctionsUrl: process.env.FIREBASE_FUNCTIONS_URL || '',
  };
}
