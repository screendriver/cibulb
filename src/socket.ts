import socketIo from 'socket.io-client';
import { Commit } from 'vuex';
import { Mutations } from '@/store';

let socket: SocketIOClient.Socket | undefined;

export function connect(url: string, commit: Commit, io = socketIo) {
  return new Promise((resolve, reject) => {
    socket = io(url);
    socket.on('connect', () => {
      resolve();
      socket!.on('github', (json: unknown) => {
        commit(Mutations.GITHUB_HOOK_RECEIVED, json);
      });
    });
    socket.on('connect_error', reject);
  });
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
  }
}
