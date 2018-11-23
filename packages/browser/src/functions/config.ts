export interface Config {
  sentryDsn: string;
}

export function getConfig(): Config {
  return {
    sentryDsn: process.env.SENTRY_DSN || '',
  };
}
