export interface Config {
  socketUrl: string;
}

export function getConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const { VUE_APP_SOCKET_URL } = env;
  if (!VUE_APP_SOCKET_URL) {
    throw new Error('Environment variables are missing');
  }
  return {
    socketUrl: VUE_APP_SOCKET_URL,
  };
}
