export interface Config {
  githubSecret: string;
  iftttKey: string;
}

export function getConfig(): Config {
  return {
    githubSecret: process.env.GITHUB_SECRET || '',
    iftttKey: process.env.IFTTT_KEY || '',
  };
}
