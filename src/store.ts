import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export interface State {
  errorMessage?: string;
  deviceId?: string;
  notification?: BulbNotification;
}

export interface BulbNotification {
  title: string;
  body: string;
  renotify: boolean;
  tag: string;
}

export enum Mutations {
  ERROR = 'error',
  CONNECTED = 'connected',
  SHOW_NOTIFICATION = 'show_notification',
}

export default new Vuex.Store<State>({
  state: {
    errorMessage: undefined,
    deviceId: undefined,
    notification: undefined,
  },
  mutations: {
    [Mutations.ERROR]: (state: State, message: string) => {
      state.errorMessage = message;
    },
    [Mutations.CONNECTED]: (state: State, deviceId: string) => {
      state.deviceId = deviceId;
    },
    [Mutations.SHOW_NOTIFICATION]: (
      state: State,
      notification: BulbNotification,
    ) => {
      state.notification = notification;
    },
  },
  actions: {},
});
