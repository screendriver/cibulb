export interface FirebaseConfig {
  apiKey: string;
}

export interface Config {
  socketUrl: string;
  firebase: FirebaseConfig;
}

export function getConfig(env: NodeJS.ProcessEnv): Config {
  return {
    socketUrl: 'https://cibulb-service.now.sh',
    firebase: {
      apiKey: env.VUE_APP_FIREBASE_API_KEY || '',
    },
  };
}
