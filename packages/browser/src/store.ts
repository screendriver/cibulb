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
import { Config } from './config';

Vue.use(Vuex);

type Connection = 'connecting' | 'connected' | 'disconnected';

export interface State {
  messagingRegistrationToken: string | null;
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
  MESSAGING_REGISTRATION_TOKEN = 'messaging-registration-token',
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
  SEND_TOKEN_TO_SERVER = 'send-token-to-server',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CHANGE_COLOR = 'change-color',
  GITHUB_HOOK_RECEIVED = 'github-hook-received',
}

export const mutations: MutationTree<State> = {
  [Mutations.MESSAGING_REGISTRATION_TOKEN](state, token: string) {
    state.messagingRegistrationToken = token;
  },
  [Mutations.BULB_CONNECTING](state) {
    state.bulbConnection = 'connecting';
  },
  [Mutations.BULB_CONNECTED](
    state,
    {
      deviceId,
      gattServer,
    }: { deviceId: string; gattServer: BluetoothRemoteGATTServer },
  ) {
    state.bulbConnection = 'connected';
    state.deviceId = deviceId;
    state.gattServer = gattServer;
  },
  [Mutations.BULB_DISCONNECTED](state) {
    state.deviceId = null;
    state.gattServer = null;
    state.bulbConnection = 'disconnected';
  },
  [Mutations.SOCKET_CONNECTING](state) {
    state.socketConnection = 'connecting';
  },
  [Mutations.SOCKET_CONNECTED](state) {
    state.socketConnection = 'connected';
  },
  [Mutations.SOCKET_DISCONNECTED](state) {
    state.socketConnection = 'disconnected';
    state.buildStatuses.clear();
  },
  [Mutations.ERROR](state, message: string) {
    state.errorMessage = message;
  },
  [Mutations.COLOR_CHANGED](state, color: BulbColor) {
    state.color = color;
  },
  [Mutations.VALUE_WRITING](state) {
    state.writeValueInProgress = true;
  },
  [Mutations.VALUE_WRITTEN](state) {
    state.writeValueInProgress = false;
  },
  [Mutations.GITHUB_HOOK_RECEIVED](state, hook: GitHubHook) {
    state.buildStatuses.set(hook.name, { id: hook.id, state: hook.state });
  },
};

export function createStore(config: Config) {
  const store = new Vuex.Store<State>({
    strict: process.env.NODE_ENV !== 'production',
    state: {
      messagingRegistrationToken: null,
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
      async [Actions.SEND_TOKEN_TO_SERVER]({ commit }, token: string) {
        commit(Mutations.MESSAGING_REGISTRATION_TOKEN, token);
      },
      async [Actions.CONNECT]({ commit, dispatch }) {
        try {
          commit(Mutations.BULB_CONNECTING);
          const [gattServer, deviceId] = await connectBulb();
          commit(Mutations.BULB_CONNECTED, { deviceId, gattServer });
          await dispatch(Actions.CHANGE_COLOR, BulbColor.BLUE);
          commit(Mutations.SOCKET_CONNECTING);
          await connectSocket(config.socketUrl, store);
          commit(Mutations.SOCKET_CONNECTED, { deviceId, gattServer });
          await showNotification(
            NotificationTitle.INFO,
            'Connected to service',
          );
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
        dispatch(
          Actions.CHANGE_COLOR,
          getColorFromStatuses(state.buildStatuses),
        );
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
  return store;
}
