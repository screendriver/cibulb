export interface Config {
  readonly gitlabSecretToken: string;
  readonly iftttBaseUrl: string;
  readonly iftttKey: string;
  readonly mongoDbUri: string;
  readonly sentryDSN: string;
}

export function getConfig(): Config {
  return {
    gitlabSecretToken: process.env.GITLAB_SECRET_TOKEN || '',
    iftttBaseUrl: process.env.IFTTT_BASE_URL || 'https://maker.ifttt.com',
    iftttKey: process.env.IFTTT_KEY || '',
    mongoDbUri: process.env.MONGO_URI || '',
    sentryDSN: process.env.SENTRY_DSN || '',
  };
}
