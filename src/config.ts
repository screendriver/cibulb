export interface Config {
  socketUrl: string;
}

export function getConfig(): Config {
  return {
    socketUrl: 'https://api.cibulb.info',
  };
}
