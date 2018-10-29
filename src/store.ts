import Vue from 'vue';
import Vuex, { Store, MutationTree } from 'vuex';
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

export interface State {
  connection: 'connecting' | 'connected' | 'disconnected';
  writeValueInProgress: boolean;
  errorMessage: string;
  deviceId: string | null;
  gattServer: BluetoothRemoteGATTServer | null;
  buildStatuses: Map<string, BuildStatus>;
  color: BulbColor;
}

export enum Mutations {
  ERROR = 'error',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
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
    connection: 'disconnected',
    writeValueInProgress: false,
    errorMessage: '',
    deviceId: null,
    gattServer: null,
    buildStatuses: new Map(),
    color: BulbColor.OFF,
  },
  mutations,
  actions: {
    async [Actions.CONNECT]({ commit }) {
      try {
        commit(Mutations.CONNECTING);
        const [gattServer, deviceId] = await connectBulb();
        const { socketUrl } = getConfig();
        await connectSocket(socketUrl, store);
        await showNotification(NotificationTitle.INFO, 'Connected');
        commit(Mutations.CONNECTED, { deviceId, gattServer });
      } catch (e) {
        commit(Mutations.ERROR, e.toString());
        throw e;
      }
    },
    async [Actions.DISCONNECT]({ commit, state }) {
      if (!state.gattServer) {
        const message = "Can't disconnect because bulb is not connected";
        commit(Mutations.ERROR, message);
        return;
      }
      disconnectBulb(state.gattServer);
      disconnectSocket();
      await showNotification(NotificationTitle.INFO, 'Disconnected');
      commit(Mutations.DISCONNECTED);
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
