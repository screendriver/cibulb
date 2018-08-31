import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export interface State {
  errorMessage?: string;
  deviceId?: string;
  writeValueInProgress: boolean;
}

export enum Mutations {
  ERROR = 'error',
  CONNECTED = 'connected',
  VALUE_WRITTEN = 'value-written',
}

export default new Vuex.Store<State>({
  state: {
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
