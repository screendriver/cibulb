import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export interface State {
  errorMessage?: string;
  deviceId?: string;
}

export enum Mutations {
  ERROR = 'error',
  CONNECTED = 'connected',
}

export default new Vuex.Store<State>({
  state: {
    errorMessage: undefined,
    deviceId: undefined,
  },
  mutations: {
    [Mutations.ERROR]: (state: State, message: string) => {
      state.errorMessage = message;
    },
    [Mutations.CONNECTED]: (state: State, deviceId: string) => {
      state.deviceId = deviceId;
    },
  },
  actions: {},
});
