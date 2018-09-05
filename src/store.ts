import Vue from 'vue';
import Vuex from 'vuex';
import {
  connect,
  disconnect,
  fetchBuildStatus,
  changeColor,
  BulbColor,
  getColorFromStatus,
} from '@/light-bulb';
import { showNotification, NotificationTitle } from '@/notification';

Vue.use(Vuex);

export interface State {
  connection: 'connecting' | 'connected' | 'disconnected';
  writeValueInProgress: boolean;
  errorMessage: string;
  deviceId: string | null;
  gattServer: BluetoothRemoteGATTServer | null;
  buildStatus: BuildStatus | null;
  color: BulbColor;
}

export interface BuildStatus {
  id: string;
  state: 'pending' | 'failure' | 'error' | 'success';
}

export enum Mutations {
  ERROR = 'error',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  COLOR_CHANGED = 'color-changed',
  BUILD_STATUS = 'build-status',
  VALUE_WRITING = 'value-writing',
  VALUE_WRITTEN = 'value-written',
}

export enum Actions {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CHANGE_COLOR = 'change-color',
  FETCH_BUILD_STATUS = 'fetch-build-status',
}

export default new Vuex.Store<State>({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    connection: 'disconnected',
    writeValueInProgress: false,
    errorMessage: '',
    deviceId: null,
    gattServer: null,
    buildStatus: null,
    color: BulbColor.OFF,
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
      state.connection = 'connected';
      state.deviceId = deviceId;
      state.gattServer = gattServer;
    },
    [Mutations.DISCONNECTED](state: State) {
      state.deviceId = null;
      state.gattServer = null;
      state.connection = 'disconnected';
      state.buildStatus = null;
    },
    [Mutations.ERROR](state: State, message: string) {
      state.errorMessage = message;
    },
    [Mutations.COLOR_CHANGED](state: State, color: BulbColor) {
      state.color = color;
    },
    [Mutations.BUILD_STATUS](state: State, buildStatus: BuildStatus) {
      state.buildStatus = buildStatus;
    },
    [Mutations.VALUE_WRITING](state: State) {
      state.writeValueInProgress = true;
    },
    [Mutations.VALUE_WRITTEN](state: State) {
      state.writeValueInProgress = false;
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
        commit(Mutations.ERROR, message);
        return;
      }
      disconnect(state.gattServer);
      await showNotification(NotificationTitle.INFO, 'Disconnected');
      commit(Mutations.DISCONNECTED);
    },
    async [Actions.CHANGE_COLOR]({ commit, state }, color: BulbColor) {
      if (!state.gattServer) {
        const message = "Can't change color because bulb is not connected";
        commit(Mutations.ERROR, message);
        return;
      }
      if (state.writeValueInProgress) {
        return;
      }
      commit(Mutations.VALUE_WRITING);
      await changeColor(color, state.gattServer);
      commit(Mutations.COLOR_CHANGED, color);
      commit(Mutations.VALUE_WRITTEN);
    },
    async [Actions.FETCH_BUILD_STATUS]({ commit, dispatch }) {
      const {
        VUE_APP_GITHUB_API_URL,
        VUE_APP_GITHUP_API_TOKEN,
        VUE_APP_GITHUB_OWNER,
        VUE_APP_GITHUB_REPO,
      } = process.env;
      if (
        !VUE_APP_GITHUB_API_URL ||
        !VUE_APP_GITHUP_API_TOKEN ||
        !VUE_APP_GITHUB_OWNER ||
        !VUE_APP_GITHUB_REPO
      ) {
        commit(Mutations.ERROR, 'Environment variables are missing');
        return;
      }
      try {
      const status = await fetchBuildStatus(
        VUE_APP_GITHUB_API_URL,
        VUE_APP_GITHUP_API_TOKEN,
        VUE_APP_GITHUB_OWNER,
        VUE_APP_GITHUB_REPO,
      );
      commit(Mutations.BUILD_STATUS, status);
      dispatch(Actions.CHANGE_COLOR, getColorFromStatus(status));
    } catch (error) {
      commit(Mutations.ERROR, error.toString());
      dispatch(Actions.CHANGE_COLOR, BulbColor.PINK);
    }
    },
  },
});
