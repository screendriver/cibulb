import Vue from 'vue';
import Vuex from 'vuex';
import { connect, disconnect } from '@/light-bulb';
import { showNotification, NotificationTitle } from '@/notification';

Vue.use(Vuex);

export interface State {
  connection: 'connecting' | 'connected' | 'disconnected';
  writeValueInProgress: boolean;
  errorMessage: string;
  deviceId: string | null;
  gattServer: BluetoothRemoteGATTServer | null;
}

export enum Mutations {
  ERROR = 'error',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  VALUE_WRITING = 'value-writing',
  VALUE_WRITTEN = 'value-written',
}

export enum Actions {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}

export default new Vuex.Store<State>({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    connection: 'disconnected',
    writeValueInProgress: false,
    errorMessage: '',
    deviceId: null,
    gattServer: null,
  },
  mutations: {
    [Mutations.CONNECTING](state: State) {
      state.connection = 'connecting';
    },
    [Mutations.CONNECTED](
      state: State,
      {
        deviceId,
        gattServer,
      }: { deviceId: string; gattServer: BluetoothRemoteGATTServer },
    ) {
      state.deviceId = deviceId;
      state.gattServer = gattServer;
      state.connection = 'connected';
    },
    [Mutations.DISCONNECTED](state: State) {
      state.deviceId = null;
      state.gattServer = null;
      state.connection = 'disconnected';
    },
    [Mutations.ERROR](state: State, message: string) {
      state.errorMessage = message;
    },
    [Mutations.VALUE_WRITING](state: State) {
      state.writeValueInProgress = true;
    },
    [Mutations.VALUE_WRITTEN](state: State) {
      state.writeValueInProgress = false;
      // if value == getRgb Off {
      // Bluetooth.disconnect ()
      // }
    },
  },
  actions: {
    async [Actions.CONNECT]({ commit }) {
      try {
        commit(Mutations.CONNECTING);
        const [gattServer, deviceId] = await connect();
        await showNotification(NotificationTitle.INFO, 'Connected');
        commit(Mutations.CONNECTED, { deviceId, gattServer });
      } catch (error) {
        commit(Mutations.ERROR, error.toString());
      }
    },
    async [Actions.DISCONNECT]({ commit, state }) {
      if (!state.gattServer) {
        const message = "Can't disconnect because bulb is not connected";
        await showNotification(NotificationTitle.ERROR, message);
        commit(Mutations.ERROR, message);
        return;
      }
      disconnect(state.gattServer);
      await showNotification(NotificationTitle.INFO, 'Disconnected');
      commit(Mutations.DISCONNECTED);
    },
  },
});
