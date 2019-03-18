export interface Config {
  readonly githubSecret: string;
  readonly iftttBaseUrl: string;
  readonly iftttKey: string;
  readonly mongoDbUri: string;
  readonly sentryDSN: string;
}

export function getConfig(): Config {
  return {
    githubSecret: process.env.GITHUB_SECRET || '',
    iftttBaseUrl: process.env.IFTTT_BASE_URL || 'https://maker.ifttt.com',
    iftttKey: process.env.IFTTT_KEY || '',
    mongoDbUri: process.env.MONGO_URI || '',
    sentryDSN: process.env.SENTRY_DSN || '',
  };
}
