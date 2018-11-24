import firebaseLib from 'firebase/app';
import { FirebaseConfig } from './config';

export function initializeApp(
  firebase: typeof firebaseLib,
  config: FirebaseConfig,
) {
  const app = firebase.initializeApp(config);
  const messaging = firebase.messaging();
  messaging.usePublicVapidKey(config.publicVapidKey);
  return app;
}

export function requestMessagingPermission(firebase: firebaseLib.app.App) {
  const messaging = firebase.messaging();
  return messaging.requestPermission();
}
