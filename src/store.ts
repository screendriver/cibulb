import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export interface State {
  connection: 'connecting' | 'connected' | 'disconnected';
  writeValueInProgress: boolean;
  errorMessage?: string;
  deviceId?: string;
}

export enum Mutations {
  ERROR = 'error',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  VALUE_WRITTEN = 'value-written',
}

export default new Vuex.Store<State>({
  state: {
    connection: 'disconnected',
    errorMessage: undefined,
    deviceId: undefined,
    writeValueInProgress: false,
  },
  mutations: {
    [Mutations.ERROR](state: State, message: string) {
      state.errorMessage = message;
    },
    [Mutations.CONNECTED](state: State, deviceId: string) {
      state.deviceId = deviceId;
      state.connection = 'connected';
    },
    [Mutations.VALUE_WRITTEN](state: State) {
      state.writeValueInProgress = false;
      // if value == getRgb Off {
      // Bluetooth.disconnect ()
      // }
    },
  },
  actions: {},
});
