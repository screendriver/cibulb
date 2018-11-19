export interface Config {
  socketUrl: string;
}

export function getConfig(): Config {
  return {
    socketUrl: 'https://cibulb-service.now.sh',
  };
}
