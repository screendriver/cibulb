import Vue from 'vue';
import Vuex, { MutationTree } from 'vuex';
import {
  connect as connectBulb,
  disconnect as disconnectBulb,
  changeColor,
  BulbColor,
  BuildStatus,
  getColorFromStatuses,
} from '@/bulb';
import {
  connect as connectSocket,
  disconnect as disconnectSocket,
  GitHubHook,
} from '@/socket';
import { showNotification, NotificationTitle } from '@/notification';
import { getConfig } from '@/config';

Vue.use(Vuex);

type Connection = 'connecting' | 'connected' | 'disconnected';

export interface State {
  bulbConnection: Connection;
  socketConnection: Connection;
  writeValueInProgress: boolean;
  errorMessage: string;
  deviceId: string | null;
  gattServer: BluetoothRemoteGATTServer | null;
  buildStatuses: Map<string, BuildStatus>;
  color: BulbColor;
}

export enum Mutations {
  ERROR = 'error',
  BULB_CONNECTING = 'bulb-connecting',
  BULB_CONNECTED = 'bulb-connected',
  BULB_DISCONNECTED = 'bulb-disconnected',
  SOCKET_CONNECTING = 'socket-connecting',
  SOCKET_CONNECTED = 'socket-connected',
  SOCKET_DISCONNECTED = 'socket-disconnected',
  COLOR_CHANGED = 'color-changed',
  VALUE_WRITING = 'value-writing',
  VALUE_WRITTEN = 'value-written',
  GITHUB_HOOK_RECEIVED = 'github-hook-received',
}

export enum Actions {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CHANGE_COLOR = 'change-color',
  GITHUB_HOOK_RECEIVED = 'github-hook-received',
}

export const mutations: MutationTree<State> = {
  [Mutations.BULB_CONNECTING](state: State) {
    state.bulbConnection = 'connecting';
  },
  [Mutations.BULB_CONNECTED](
    state: State,
    {
      deviceId,
      gattServer,
    }: { deviceId: string; gattServer: BluetoothRemoteGATTServer },
  ) {
    state.bulbConnection = 'connected';
    state.deviceId = deviceId;
    state.gattServer = gattServer;
  },
  [Mutations.BULB_DISCONNECTED](state: State) {
    state.deviceId = null;
    state.gattServer = null;
    state.bulbConnection = 'disconnected';
  },
  [Mutations.SOCKET_CONNECTING](state: State) {
    state.socketConnection = 'connecting';
  },
  [Mutations.SOCKET_CONNECTED](state: State) {
    state.socketConnection = 'connected';
  },
  [Mutations.SOCKET_DISCONNECTED](state: State) {
    state.socketConnection = 'disconnected';
    state.buildStatuses.clear();
  },
  [Mutations.ERROR](state: State, message: string) {
    state.errorMessage = message;
  },
  [Mutations.COLOR_CHANGED](state: State, color: BulbColor) {
    state.color = color;
  },
  [Mutations.VALUE_WRITING](state: State) {
    state.writeValueInProgress = true;
  },
  [Mutations.VALUE_WRITTEN](state: State) {
    state.writeValueInProgress = false;
  },
  [Mutations.GITHUB_HOOK_RECEIVED](state: State, hook: GitHubHook) {
    state.buildStatuses.set(hook.name, { id: hook.id, state: hook.state });
  },
};

const store = new Vuex.Store<State>({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    bulbConnection: 'disconnected',
    socketConnection: 'disconnected',
    writeValueInProgress: false,
    errorMessage: '',
    deviceId: null,
    gattServer: null,
    buildStatuses: new Map(),
    color: BulbColor.OFF,
  },
  mutations,
  actions: {
    async [Actions.CONNECT]({ commit, dispatch }) {
      try {
        commit(Mutations.BULB_CONNECTING);
        const [gattServer, deviceId] = await connectBulb();
        commit(Mutations.BULB_CONNECTED, { deviceId, gattServer });
        await dispatch(Actions.CHANGE_COLOR, BulbColor.BLUE);
        commit(Mutations.SOCKET_CONNECTING);
        const { socketUrl } = getConfig();
        await connectSocket(socketUrl, store);
        commit(Mutations.SOCKET_CONNECTED, { deviceId, gattServer });
        await showNotification(NotificationTitle.INFO, 'Connected to service');
      } catch (e) {
        await dispatch(Actions.DISCONNECT);
        commit(Mutations.ERROR, e.toString());
        throw e;
      }
    },
    async [Actions.DISCONNECT]({ commit, dispatch, state }) {
      if (!state.gattServer) {
        commit(
          Mutations.ERROR,
          "Can't disconnect because bulb is not connected",
        );
        return;
      }
      await dispatch(Actions.CHANGE_COLOR, BulbColor.OFF);
      disconnectBulb(state.gattServer);
      commit(Mutations.BULB_DISCONNECTED);
      disconnectSocket();
      commit(Mutations.SOCKET_DISCONNECTED);
      await showNotification(NotificationTitle.INFO, 'Disconnected');
    },
    async [Actions.GITHUB_HOOK_RECEIVED](
      { commit, dispatch, state },
      hook: GitHubHook,
    ) {
      commit(Mutations.GITHUB_HOOK_RECEIVED, hook);
      dispatch(Actions.CHANGE_COLOR, getColorFromStatuses(state.buildStatuses));
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
  },
});

export default store;
