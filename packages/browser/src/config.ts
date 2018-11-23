export interface FirebaseConfig {
  apiKey: string;
  messagingSenderId: string;
  publicVapidKey: string;
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
      messagingSenderId: env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || '',
      publicVapidKey: env.VUE_APP_FIREBASE_PUBLIC_VAPID_KEY || '',
    },
  };
}
