export interface Config {
  gitHub: {
    apiUrl: string;
    apiToken: string;
    repos: ReadonlyArray<string>;
  };
  socketUrl: string;
}

export function getConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const {
    VUE_APP_GITHUB_API_URL,
    VUE_APP_GITHUP_API_TOKEN,
    VUE_APP_GITHUB_REPOS,
    VUE_APP_SOCKET_URL,
  } = env;
  if (
    !VUE_APP_GITHUB_API_URL ||
    !VUE_APP_GITHUP_API_TOKEN ||
    !VUE_APP_GITHUB_REPOS ||
    !VUE_APP_SOCKET_URL
  ) {
    throw new Error('Environment variables are missing');
  }
  return {
    gitHub: {
      apiUrl: VUE_APP_GITHUB_API_URL,
      apiToken: VUE_APP_GITHUP_API_TOKEN,
      repos: VUE_APP_GITHUB_REPOS.split(','),
    },
    socketUrl: VUE_APP_SOCKET_URL,
  };
}
