export interface Config {
  githubSecret: string;
  iftttBaseUrl: string;
  iftttKey: string;
}

export function getConfig(): Config {
  return {
    githubSecret: process.env.GITHUB_SECRET || '',
    iftttBaseUrl: process.env.IFTTT_BASE_URL || '',
    iftttKey: process.env.IFTTT_KEY || '',
  };
}
