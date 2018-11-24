import firebaseLib from 'firebase/app';
import { FirebaseConfig } from './config';
import { Store } from 'vuex';
import { State, Actions, Mutations } from './store';

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

export function getRegistrationToken(
  messaging: firebaseLib.messaging.Messaging,
) {
  return messaging.getToken();
}

export function listenForTokenRefresh(
  messaging: firebaseLib.messaging.Messaging,
  store: Store<State>,
) {
  messaging.onTokenRefresh(async () => {
    try {
      const refreshedToken = await messaging.getToken();
      if (refreshedToken) {
        store.dispatch(Actions.SEND_TOKEN_TO_SERVER, refreshedToken);
      }
      throw new Error('Unable to retrieve refreshed token');
    } catch (e) {
      store.commit(Mutations.ERROR, e.toString());
    }
  });
}
