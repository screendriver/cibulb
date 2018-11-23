import firebaseLib from 'firebase/app';
import { FirebaseConfig } from './config';

export function initializeApp(
  firebase: typeof firebaseLib,
  config: FirebaseConfig,
) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();
  messaging.usePublicVapidKey(config.publicVapidKey);
}
